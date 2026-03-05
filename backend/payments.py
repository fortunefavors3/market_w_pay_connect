"""
Payment Processing Module with Platform Fee Collection (5.5%)

Supports:
- Stripe Connect (application_fee_amount)
- Square OAuth (app_fee_money)
- PayPal (partner_fee)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import os
from dotenv import load_dotenv
import stripe
from square import Square
from square.client import SquareEnvironment
import uuid
import base64
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

load_dotenv()

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Platform fee rate (5.5%)
PLATFORM_FEE_RATE = 0.055

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Square Configuration
SQUARE_ENV_STR = os.getenv("SQUARE_ENVIRONMENT", "sandbox")
SQUARE_ENV = SquareEnvironment.SANDBOX if SQUARE_ENV_STR == "sandbox" else SquareEnvironment.PRODUCTION

# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")

if PAYPAL_MODE == "live":
    PAYPAL_API_URL = "https://api-m.paypal.com"
else:
    PAYPAL_API_URL = "https://api-m.sandbox.paypal.com"


class PaymentRequest(BaseModel):
    """Request model for creating a payment"""
    seller_id: str  # The seller's user ID
    buyer_id: str   # The buyer's user ID
    amount: float   # Total amount in dollars
    currency: str = "USD"
    processor: Literal["stripe", "square", "paypal"]
    description: Optional[str] = "Effinsure Purchase"
    # For card payments (Stripe)
    payment_method_id: Optional[str] = None
    # Order details
    order_id: Optional[str] = None
    items: Optional[list] = None


class PaymentIntentRequest(BaseModel):
    """Request model for creating a payment intent (Stripe)"""
    seller_id: str
    amount: float
    currency: str = "USD"


class PaymentResponse(BaseModel):
    """Response model for payment operations"""
    success: bool
    payment_id: Optional[str] = None
    amount: float
    platform_fee: float
    seller_amount: float
    processor: str
    status: str
    error: Optional[str] = None
    client_secret: Optional[str] = None  # For Stripe PaymentIntent


def calculate_fees(amount: float) -> dict:
    """Calculate platform fee and seller amount"""
    platform_fee = round(amount * PLATFORM_FEE_RATE, 2)
    seller_amount = round(amount - platform_fee, 2)
    return {
        "total": amount,
        "platform_fee": platform_fee,
        "seller_amount": seller_amount,
        "fee_rate": PLATFORM_FEE_RATE
    }


@router.post("/calculate-fees")
async def get_fee_calculation(amount: float):
    """Calculate the platform fee for a given amount"""
    return calculate_fees(amount)


# ============================================
# STRIPE CONNECT PAYMENTS
# ============================================

@router.post("/stripe/create-payment-intent")
async def create_stripe_payment_intent(request: PaymentIntentRequest):
    """
    Create a Stripe PaymentIntent with platform fee for a connected account.
    This is the first step in accepting a payment - returns a client_secret
    for the frontend to complete the payment.
    """
    try:
        # Get seller's Stripe account ID
        seller = await db.users.find_one({"id": request.seller_id}, {"_id": 0})
        if not seller or not seller.get("stripe_account_id"):
            raise HTTPException(
                status_code=400,
                detail="Seller does not have a connected Stripe account"
            )
        
        stripe_account_id = seller["stripe_account_id"]
        
        # Calculate fees
        amount_cents = int(request.amount * 100)  # Stripe uses cents
        fees = calculate_fees(request.amount)
        platform_fee_cents = int(fees["platform_fee"] * 100)
        
        # Create PaymentIntent with application fee
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=request.currency.lower(),
            application_fee_amount=platform_fee_cents,
            transfer_data={
                "destination": stripe_account_id,
            },
            metadata={
                "seller_id": request.seller_id,
                "platform_fee": str(fees["platform_fee"]),
                "fee_rate": str(PLATFORM_FEE_RATE),
            }
        )
        
        return PaymentResponse(
            success=True,
            payment_id=payment_intent.id,
            amount=request.amount,
            platform_fee=fees["platform_fee"],
            seller_amount=fees["seller_amount"],
            processor="stripe",
            status=payment_intent.status,
            client_secret=payment_intent.client_secret
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stripe/confirm-payment")
async def confirm_stripe_payment(payment_intent_id: str):
    """
    Confirm a Stripe payment after the client completes it.
    Called by webhook or frontend after payment completion.
    """
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        return {
            "success": payment_intent.status == "succeeded",
            "payment_id": payment_intent.id,
            "status": payment_intent.status,
            "amount": payment_intent.amount / 100,
            "platform_fee": payment_intent.application_fee_amount / 100 if payment_intent.application_fee_amount else 0,
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# SQUARE PAYMENTS
# ============================================

@router.post("/square/create-payment")
async def create_square_payment(request: PaymentRequest):
    """
    Create a Square payment with app fee for a connected merchant.
    Requires the seller's access token from OAuth.
    """
    try:
        # Get seller's Square credentials
        seller = await db.users.find_one({"id": request.seller_id}, {"_id": 0})
        if not seller or not seller.get("square_access_token"):
            raise HTTPException(
                status_code=400,
                detail="Seller does not have a connected Square account"
            )
        
        # Create client with seller's access token
        merchant_client = Square(
            token=seller["square_access_token"],
            environment=SQUARE_ENV
        )
        
        # Calculate fees
        amount_cents = int(request.amount * 100)  # Square uses cents
        fees = calculate_fees(request.amount)
        platform_fee_cents = int(fees["platform_fee"] * 100)
        
        # Create payment with app fee
        result = merchant_client.payments.create_payment(
            body={
                "source_id": request.payment_method_id or "cnon:card-nonce-ok",  # Use nonce from frontend
                "idempotency_key": str(uuid.uuid4()),
                "amount_money": {
                    "amount": amount_cents,
                    "currency": request.currency
                },
                "app_fee_money": {
                    "amount": platform_fee_cents,
                    "currency": request.currency
                },
                "note": request.description,
                "reference_id": request.order_id or str(uuid.uuid4()),
            }
        )
        
        if result.is_success():
            payment = result.body.get("payment", {})
            return PaymentResponse(
                success=True,
                payment_id=payment.get("id"),
                amount=request.amount,
                platform_fee=fees["platform_fee"],
                seller_amount=fees["seller_amount"],
                processor="square",
                status=payment.get("status", "COMPLETED")
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.errors
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# PAYPAL PAYMENTS
# ============================================

async def get_paypal_access_token():
    """Get PayPal API access token"""
    import httpx
    
    credentials = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_URL}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            headers={
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        
        if response.status_code == 200:
            return response.json().get("access_token")
        raise HTTPException(status_code=400, detail="Failed to get PayPal access token")


@router.post("/paypal/create-order")
async def create_paypal_order(request: PaymentRequest):
    """
    Create a PayPal order with platform fee.
    Uses PayPal's Partner Fee feature for marketplace payments.
    """
    try:
        import httpx
        
        # Get seller's PayPal credentials
        seller = await db.users.find_one({"id": request.seller_id}, {"_id": 0})
        if not seller or not seller.get("paypal_payer_id"):
            raise HTTPException(
                status_code=400,
                detail="Seller does not have a connected PayPal account"
            )
        
        # Calculate fees
        fees = calculate_fees(request.amount)
        
        # Get platform access token
        access_token = await get_paypal_access_token()
        
        # Create order with platform fee
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": request.order_id or str(uuid.uuid4()),
                "description": request.description,
                "amount": {
                    "currency_code": request.currency,
                    "value": f"{request.amount:.2f}",
                    "breakdown": {
                        "item_total": {
                            "currency_code": request.currency,
                            "value": f"{request.amount:.2f}"
                        }
                    }
                },
                "payee": {
                    "merchant_id": seller["paypal_payer_id"]
                },
                "payment_instruction": {
                    "disbursement_mode": "INSTANT",
                    "platform_fees": [{
                        "amount": {
                            "currency_code": request.currency,
                            "value": f"{fees['platform_fee']:.2f}"
                        }
                    }]
                }
            }],
            "application_context": {
                "brand_name": "Effinsure",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "PAY_NOW"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PAYPAL_API_URL}/v2/checkout/orders",
                json=order_data,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "PayPal-Request-Id": str(uuid.uuid4())
                }
            )
            
            if response.status_code in [200, 201]:
                order = response.json()
                
                # Find approval URL
                approve_url = None
                for link in order.get("links", []):
                    if link.get("rel") == "approve":
                        approve_url = link.get("href")
                        break
                
                return {
                    "success": True,
                    "order_id": order.get("id"),
                    "amount": request.amount,
                    "platform_fee": fees["platform_fee"],
                    "seller_amount": fees["seller_amount"],
                    "processor": "paypal",
                    "status": order.get("status"),
                    "approve_url": approve_url
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json()
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/paypal/capture-order/{order_id}")
async def capture_paypal_order(order_id: str):
    """
    Capture a PayPal order after buyer approval.
    This completes the payment and transfers funds.
    """
    try:
        import httpx
        
        access_token = await get_paypal_access_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PAYPAL_API_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code in [200, 201]:
                capture = response.json()
                
                # Extract payment details
                purchase_unit = capture.get("purchase_units", [{}])[0]
                payments = purchase_unit.get("payments", {})
                captures = payments.get("captures", [{}])[0]
                
                return {
                    "success": capture.get("status") == "COMPLETED",
                    "payment_id": captures.get("id"),
                    "order_id": order_id,
                    "status": capture.get("status"),
                    "amount": float(captures.get("amount", {}).get("value", 0)),
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json()
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# UNIFIED PAYMENT ENDPOINT
# ============================================

@router.post("/process")
async def process_payment(request: PaymentRequest):
    """
    Unified payment processing endpoint.
    Routes to the appropriate processor based on the request.
    """
    if request.processor == "stripe":
        intent_request = PaymentIntentRequest(
            seller_id=request.seller_id,
            amount=request.amount,
            currency=request.currency
        )
        return await create_stripe_payment_intent(intent_request)
    
    elif request.processor == "square":
        return await create_square_payment(request)
    
    elif request.processor == "paypal":
        return await create_paypal_order(request)
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown payment processor: {request.processor}"
        )


# ============================================
# PAYMENT HISTORY & TRACKING
# ============================================

@router.get("/history/{user_id}")
async def get_payment_history(user_id: str, role: str = "buyer"):
    """Get payment history for a user (as buyer or seller)"""
    query_field = "buyer_id" if role == "buyer" else "seller_id"
    
    payments = await db.payments.find(
        {query_field: user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"payments": payments, "count": len(payments)}


@router.post("/record")
async def record_payment(
    payment_id: str,
    buyer_id: str,
    seller_id: str,
    amount: float,
    platform_fee: float,
    processor: str,
    status: str,
    order_id: Optional[str] = None
):
    """Record a completed payment in the database"""
    payment_record = {
        "id": str(uuid.uuid4()),
        "payment_id": payment_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "amount": amount,
        "platform_fee": platform_fee,
        "seller_amount": amount - platform_fee,
        "processor": processor,
        "status": status,
        "order_id": order_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payments.insert_one(payment_record)
    return {"success": True, "payment": payment_record}
