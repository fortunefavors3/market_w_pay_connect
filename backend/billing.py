"""
Billing module for platform fee collection.
Uses the platform's Stripe account to:
- Create Stripe Customers for sellers
- Save payment methods (cards) for fee collection
- Charge sellers for platform fees (daily batch or on-demand)
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import stripe
import os
import uuid
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

router = APIRouter(prefix="/api/billing", tags=["billing"])

# Initialize Stripe with platform's API key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# Platform fee percentage
PLATFORM_FEE_PERCENTAGE = 0.055  # 5.5%


# ============================================
# Request/Response Models
# ============================================

class CreateSetupIntentRequest(BaseModel):
    user_id: str


class SavePaymentMethodRequest(BaseModel):
    user_id: str
    payment_method_id: str
    set_as_default: bool = True


class UpdateAutoChargeRequest(BaseModel):
    user_id: str
    auto_charge_enabled: bool
    agreed_to_terms: bool = False


class DeletePaymentMethodRequest(BaseModel):
    user_id: str
    payment_method_id: str


class ChargeFeesRequest(BaseModel):
    user_id: str
    amount: float
    description: str = "Platform fees"


# ============================================
# Helper Functions
# ============================================

async def get_or_create_stripe_customer(user_id: str, email: str = None) -> str:
    """Get existing Stripe customer ID or create a new one for the seller."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if user and user.get("billing_stripe_customer_id"):
        return user["billing_stripe_customer_id"]
    
    # Create new Stripe customer
    customer_data = {
        "metadata": {"user_id": user_id, "type": "seller_billing"}
    }
    
    if email:
        customer_data["email"] = email
    elif user and user.get("email"):
        customer_data["email"] = user["email"]
    
    customer = stripe.Customer.create(**customer_data)
    
    # Save customer ID to user record
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "billing_stripe_customer_id": customer.id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return customer.id


async def get_user_billing_info(user_id: str) -> dict:
    """Get user's billing information including saved payment methods."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user:
        return {
            "has_billing_setup": False,
            "payment_methods": [],
            "default_payment_method_id": None,
            "auto_charge_enabled": False,
            "auto_charge_agreed_at": None
        }
    
    payment_methods = []
    customer_id = user.get("billing_stripe_customer_id")
    
    if customer_id:
        try:
            # Fetch payment methods from Stripe
            stripe_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type="card"
            )
            
            for pm in stripe_methods.data:
                payment_methods.append({
                    "id": pm.id,
                    "brand": pm.card.brand,
                    "last4": pm.card.last4,
                    "exp_month": pm.card.exp_month,
                    "exp_year": pm.card.exp_year,
                    "is_default": pm.id == user.get("billing_default_payment_method_id")
                })
        except stripe.error.StripeError as e:
            print(f"Error fetching payment methods: {e}")
    
    return {
        "has_billing_setup": len(payment_methods) > 0,
        "payment_methods": payment_methods,
        "default_payment_method_id": user.get("billing_default_payment_method_id"),
        "auto_charge_enabled": user.get("billing_auto_charge_enabled", False),
        "auto_charge_agreed_at": user.get("billing_auto_charge_agreed_at")
    }


# ============================================
# API Endpoints
# ============================================

@router.get("/info/{user_id}")
async def get_billing_info(user_id: str):
    """Get seller's billing information and saved payment methods."""
    return await get_user_billing_info(user_id)


@router.post("/setup-intent")
async def create_setup_intent(request: CreateSetupIntentRequest):
    """
    Create a Stripe Setup Intent for securely collecting card details.
    Returns client_secret for use with Stripe Elements on frontend.
    """
    try:
        # Get or create Stripe customer
        customer_id = await get_or_create_stripe_customer(request.user_id)
        
        # Create Setup Intent
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=["card"],
            metadata={"user_id": request.user_id}
        )
        
        return {
            "client_secret": setup_intent.client_secret,
            "setup_intent_id": setup_intent.id,
            "customer_id": customer_id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/save-payment-method")
async def save_payment_method(request: SavePaymentMethodRequest):
    """
    Save a payment method to the user's account after Setup Intent confirmation.
    Called after Stripe Elements confirms the Setup Intent on frontend.
    Includes fraud prevention check for blocked cards.
    """
    from fraud_prevention import create_card_fingerprint, is_identifier_blocked
    
    try:
        user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
        customer_id = user.get("billing_stripe_customer_id") if user else None
        
        if not customer_id:
            raise HTTPException(status_code=400, detail="No billing customer found. Please try again.")
        
        # Retrieve the payment method to get card details
        payment_method = stripe.PaymentMethod.retrieve(request.payment_method_id)
        
        # Check if this card is blocked (fraud prevention)
        card_fingerprint = create_card_fingerprint(
            payment_method.card.last4,
            payment_method.card.exp_month,
            payment_method.card.exp_year,
            payment_method.card.brand
        )
        
        block_check = await is_identifier_blocked("card_fingerprint", card_fingerprint)
        if block_check["blocked"]:
            # Detach the payment method since we can't use it
            try:
                stripe.PaymentMethod.detach(request.payment_method_id)
            except:
                pass
            raise HTTPException(
                status_code=403, 
                detail="This payment card is associated with an account that has unpaid platform fees. Please use a different card or resolve the outstanding balance on the original account."
            )
        
        if payment_method.customer != customer_id:
            # Attach to customer if not already attached
            stripe.PaymentMethod.attach(
                request.payment_method_id,
                customer=customer_id
            )
        
        # Update user record
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if request.set_as_default:
            update_data["billing_default_payment_method_id"] = request.payment_method_id
            
            # Also set as default in Stripe
            stripe.Customer.modify(
                customer_id,
                invoice_settings={"default_payment_method": request.payment_method_id}
            )
        
        await db.users.update_one(
            {"id": request.user_id},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "payment_method_id": request.payment_method_id,
            "message": "Payment method saved successfully"
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/set-default-payment-method")
async def set_default_payment_method(request: SavePaymentMethodRequest):
    """Set a payment method as the default for fee charges."""
    try:
        user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
        customer_id = user.get("billing_stripe_customer_id") if user else None
        
        if not customer_id:
            raise HTTPException(status_code=400, detail="No billing customer found")
        
        # Update Stripe customer default
        stripe.Customer.modify(
            customer_id,
            invoice_settings={"default_payment_method": request.payment_method_id}
        )
        
        # Update user record
        await db.users.update_one(
            {"id": request.user_id},
            {
                "$set": {
                    "billing_default_payment_method_id": request.payment_method_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"success": True, "message": "Default payment method updated"}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/delete-payment-method")
async def delete_payment_method(request: DeletePaymentMethodRequest):
    """Remove a saved payment method."""
    try:
        user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
        
        # Detach from Stripe
        stripe.PaymentMethod.detach(request.payment_method_id)
        
        # If this was the default, clear it
        if user and user.get("billing_default_payment_method_id") == request.payment_method_id:
            await db.users.update_one(
                {"id": request.user_id},
                {
                    "$set": {
                        "billing_default_payment_method_id": None,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
        
        return {"success": True, "message": "Payment method removed"}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/update-auto-charge")
async def update_auto_charge_settings(request: UpdateAutoChargeRequest):
    """Enable or disable automatic fee charging."""
    update_data = {
        "billing_auto_charge_enabled": request.auto_charge_enabled,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if request.auto_charge_enabled and request.agreed_to_terms:
        update_data["billing_auto_charge_agreed_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": request.user_id},
        {"$set": update_data},
        upsert=True
    )
    
    return {
        "success": True,
        "auto_charge_enabled": request.auto_charge_enabled,
        "message": "Auto-charge settings updated"
    }


@router.post("/charge-fees")
async def charge_fees_now(request: ChargeFeesRequest):
    """
    Immediately charge a seller's saved payment method for fees.
    Used for manual charges or when auto-charge triggers.
    """
    try:
        user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        customer_id = user.get("billing_stripe_customer_id")
        payment_method_id = user.get("billing_default_payment_method_id")
        
        if not customer_id or not payment_method_id:
            raise HTTPException(
                status_code=400, 
                detail="No payment method on file. Please add a payment method first."
            )
        
        # Create PaymentIntent and charge immediately
        amount_cents = int(request.amount * 100)  # Convert to cents
        
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            customer=customer_id,
            payment_method=payment_method_id,
            off_session=True,
            confirm=True,
            description=request.description,
            metadata={
                "user_id": request.user_id,
                "type": "platform_fee"
            }
        )
        
        # Record the charge
        charge_record = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "stripe_payment_intent_id": payment_intent.id,
            "amount": request.amount,
            "description": request.description,
            "status": payment_intent.status,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.fee_charges.insert_one(charge_record)
        
        return {
            "success": True,
            "payment_intent_id": payment_intent.id,
            "status": payment_intent.status,
            "amount": request.amount
        }
        
    except stripe.error.CardError as e:
        # Card was declined
        error_record = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "amount": request.amount,
            "error": str(e),
            "status": "failed",
            "retry_count": 0,
            "next_retry_at": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.fee_charge_failures.insert_one(error_record)
        
        raise HTTPException(status_code=400, detail=f"Card declined: {e.user_message}")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/charge-history/{user_id}")
async def get_charge_history(user_id: str, limit: int = 20):
    """Get history of fee charges for a seller."""
    charges = await db.fee_charges.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"charges": charges}


# ============================================
# Daily Batch Processing
# ============================================

@router.post("/admin/process-daily-fees")
async def process_daily_fees():
    """
    Process daily fee charges for all sellers with auto-charge enabled.
    Should be called by a cron job daily.
    """
    results = {
        "processed": 0,
        "successful": 0,
        "failed": 0,
        "skipped": 0,
        "details": []
    }
    
    # Get all users with auto-charge enabled and a payment method
    users = await db.users.find({
        "billing_auto_charge_enabled": True,
        "billing_default_payment_method_id": {"$ne": None}
    }, {"_id": 0}).to_list(1000)
    
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    
    for user in users:
        user_id = user["id"]
        results["processed"] += 1
        
        # Calculate fees from yesterday's sales
        yesterday_start = datetime.combine(yesterday, datetime.min.time()).replace(tzinfo=timezone.utc)
        yesterday_end = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
        
        # Get sales from all payment processors for this user
        sales_pipeline = [
            {
                "$match": {
                    "seller_id": user_id,
                    "status": {"$in": ["succeeded", "completed", "paid"]},
                    "created_at": {
                        "$gte": yesterday_start.isoformat(),
                        "$lt": yesterday_end.isoformat()
                    },
                    "fee_charged": {"$ne": True}  # Not already charged
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_sales": {"$sum": "$amount"},
                    "transaction_ids": {"$push": "$id"}
                }
            }
        ]
        
        sales_result = await db.payments.aggregate(sales_pipeline).to_list(1)
        
        if not sales_result or sales_result[0]["total_sales"] == 0:
            results["skipped"] += 1
            results["details"].append({
                "user_id": user_id,
                "status": "skipped",
                "reason": "No sales to charge"
            })
            continue
        
        total_sales = sales_result[0]["total_sales"]
        transaction_ids = sales_result[0]["transaction_ids"]
        fee_amount = round(total_sales * PLATFORM_FEE_PERCENTAGE, 2)
        
        if fee_amount < 0.50:  # Stripe minimum charge
            results["skipped"] += 1
            results["details"].append({
                "user_id": user_id,
                "status": "skipped",
                "reason": f"Fee amount ${fee_amount} below minimum"
            })
            continue
        
        # Attempt to charge
        try:
            charge_request = ChargeFeesRequest(
                user_id=user_id,
                amount=fee_amount,
                description=f"Platform fees for {yesterday.strftime('%Y-%m-%d')} sales (${total_sales:.2f} x 5.5%)"
            )
            
            charge_result = await charge_fees_now(charge_request)
            
            # Mark transactions as fee-charged
            await db.payments.update_many(
                {"id": {"$in": transaction_ids}},
                {"$set": {"fee_charged": True, "fee_charge_id": charge_result["payment_intent_id"]}}
            )
            
            results["successful"] += 1
            results["details"].append({
                "user_id": user_id,
                "status": "success",
                "amount": fee_amount,
                "sales_total": total_sales
            })
            
        except HTTPException as e:
            results["failed"] += 1
            results["details"].append({
                "user_id": user_id,
                "status": "failed",
                "error": e.detail,
                "amount": fee_amount
            })
    
    return results


@router.post("/admin/retry-failed-charges")
async def retry_failed_charges():
    """
    Retry failed charges that are due for retry (after 2 days).
    If retry fails again, convert to manual invoice.
    """
    results = {
        "retried": 0,
        "successful": 0,
        "converted_to_invoice": 0,
        "details": []
    }
    
    now = datetime.now(timezone.utc)
    
    # Get failed charges due for retry
    failed_charges = await db.fee_charge_failures.find({
        "status": "failed",
        "retry_count": {"$lt": 1},  # Only retry once
        "next_retry_at": {"$lte": now.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    for failure in failed_charges:
        user_id = failure["user_id"]
        amount = failure["amount"]
        results["retried"] += 1
        
        try:
            charge_request = ChargeFeesRequest(
                user_id=user_id,
                amount=amount,
                description=f"Platform fees (retry)"
            )
            
            await charge_fees_now(charge_request)
            
            # Mark original failure as resolved
            await db.fee_charge_failures.update_one(
                {"id": failure["id"]},
                {"$set": {"status": "resolved", "resolved_at": now.isoformat()}}
            )
            
            results["successful"] += 1
            results["details"].append({
                "user_id": user_id,
                "status": "success",
                "amount": amount
            })
            
        except HTTPException:
            # Retry failed, convert to manual invoice
            await db.fee_charge_failures.update_one(
                {"id": failure["id"]},
                {
                    "$set": {
                        "status": "converted_to_invoice",
                        "retry_count": failure.get("retry_count", 0) + 1
                    }
                }
            )
            
            # Create manual invoice
            invoice = {
                "id": str(uuid.uuid4()),
                "seller_id": user_id,
                "billing_period": "auto-charge-failed",
                "amount": amount,
                "due_date": (now + timedelta(days=5)).isoformat(),
                "paid": False,
                "source": "failed_auto_charge",
                "original_failure_id": failure["id"],
                "created_at": now.isoformat()
            }
            
            await db.fee_invoices.insert_one(invoice)
            
            # Disable auto-charge for this user
            await db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "billing_auto_charge_enabled": False,
                        "billing_auto_charge_disabled_reason": "Payment failed after retry",
                        "updated_at": now.isoformat()
                    }
                }
            )
            
            results["converted_to_invoice"] += 1
            results["details"].append({
                "user_id": user_id,
                "status": "converted_to_invoice",
                "amount": amount,
                "invoice_id": invoice["id"]
            })
    
    return results


@router.get("/auto-charge-terms")
async def get_auto_charge_terms():
    """Return the terms and conditions for automatic fee charging."""
    return {
        "terms": """
AUTOMATIC FEE COLLECTION AGREEMENT

By enabling automatic fee collection, you authorize CheqMart to:

1. AUTOMATIC CHARGES: Automatically charge your saved payment method daily for platform fees (5.5% of your sales from the previous day).

2. CHARGE TIMING: Fees will be processed each day for the previous day's completed sales. Charges typically occur between 12:00 AM - 6:00 AM UTC.

3. MINIMUM CHARGE: To minimize transaction fees, charges under $0.50 will be accumulated until they reach the minimum threshold.

4. FAILED PAYMENTS: If a charge fails, we will:
   - Notify you via email
   - Retry the charge after 2 days
   - If the retry fails, disable auto-charge and create a manual invoice

5. PAYMENT METHOD: You are responsible for keeping a valid payment method on file. You may update your payment method at any time.

6. CANCELLATION: You may disable automatic fee collection at any time from your Billing Settings. Any outstanding fees will be converted to manual invoices.

7. BENEFITS: By using automatic fee collection, you:
   - Never worry about overdue fees or account suspension
   - Avoid late payment penalties
   - Maintain uninterrupted selling privileges

By checking the box and saving, you agree to these terms and authorize the charges described above.
        """,
        "version": "1.0",
        "effective_date": "2025-01-01"
    }
