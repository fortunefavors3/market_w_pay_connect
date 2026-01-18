from fastapi import FastAPI, APIRouter, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Create uploads directory if it doesn't exist
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    phone: str
    stripe_account_id: str | None = None
    stripe_onboarding_complete: bool = False
    stripe_charges_enabled: bool = False
    stripe_payouts_enabled: bool = False
    square_merchant_id: str | None = None
    square_access_token: str | None = None
    square_refresh_token: str | None = None
    square_connected: bool = False
    paypal_payer_id: str | None = None
    paypal_email: str | None = None
    paypal_access_token: str | None = None
    paypal_refresh_token: str | None = None
    paypal_connected: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UpdateStripeAccount(BaseModel):
    user_id: str
    stripe_account_id: str

class UpdateSquareAccount(BaseModel):
    user_id: str
    merchant_id: str
    access_token: str
    refresh_token: str

class UpdatePayPalAccount(BaseModel):
    user_id: str
    payer_id: str
    email: str
    access_token: str
    refresh_token: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# User Endpoints
@api_router.post("/users/stripe-account")
async def update_user_stripe_account(data: UpdateStripeAccount):
    """Update user's Stripe account ID after onboarding"""
    result = await db.users.update_one(
        {"id": data.user_id},
        {
            "$set": {
                "stripe_account_id": data.stripe_account_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    return {"success": True, "modified": result.modified_count > 0}

@api_router.get("/users/{user_id}/stripe-status")
async def get_user_stripe_status(user_id: str):
    """Get user's Stripe Connect status"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "has_account": False,
            "stripe_account_id": None,
            "onboarding_complete": False,
            "charges_enabled": False,
            "payouts_enabled": False
        }
    
    return {
        "has_account": user.get("stripe_account_id") is not None,
        "stripe_account_id": user.get("stripe_account_id"),
        "onboarding_complete": user.get("stripe_onboarding_complete", False),
        "charges_enabled": user.get("stripe_charges_enabled", False),
        "payouts_enabled": user.get("stripe_payouts_enabled", False)
    }

@api_router.post("/users/{user_id}/stripe-status-update")
async def update_user_stripe_status(user_id: str):
    """Update user's Stripe status from Stripe API"""
    from stripe_connect import stripe
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user or not user.get("stripe_account_id"):
        return {"success": False, "error": "No Stripe account found"}
    
    try:
        account = stripe.Account.retrieve(user["stripe_account_id"])
        
        await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "stripe_onboarding_complete": account.details_submitted,
                    "stripe_charges_enabled": account.charges_enabled,
                    "stripe_payouts_enabled": account.payouts_enabled,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "onboarding_complete": account.details_submitted,
            "charges_enabled": account.charges_enabled,
            "payouts_enabled": account.payouts_enabled
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Square Endpoints
@api_router.post("/users/square-account")
async def update_user_square_account(data: UpdateSquareAccount):
    """Update user's Square account details after OAuth"""
    result = await db.users.update_one(
        {"id": data.user_id},
        {
            "$set": {
                "square_merchant_id": data.merchant_id,
                "square_access_token": data.access_token,
                "square_refresh_token": data.refresh_token,
                "square_connected": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    return {"success": True, "modified": result.modified_count > 0}

@api_router.get("/users/{user_id}/square-status")
async def get_user_square_status(user_id: str):
    """Get user's Square connection status"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "connected": False,
            "merchant_id": None,
            "has_access_token": False
        }
    
    return {
        "connected": user.get("square_connected", False),
        "merchant_id": user.get("square_merchant_id"),
        "has_access_token": user.get("square_access_token") is not None
    }

@api_router.get("/users/{user_id}/payment-status")
async def get_user_payment_status(user_id: str):
    """Get user's overall payment processor status (Stripe + Square + PayPal + Authorize.net + Epic Payment)"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "has_any_processor": False,
            "stripe_connected": False,
            "square_connected": False,
            "paypal_connected": False,
            "authorizenet_connected": False,
            "epicpayment_connected": False
        }
    
    stripe_ready = (
        user.get("stripe_charges_enabled", False) and 
        user.get("stripe_payouts_enabled", False)
    )
    square_ready = user.get("square_connected", False)
    paypal_ready = user.get("paypal_connected", False)
    authorizenet_ready = user.get("authorizenet_connected", False)
    epicpayment_ready = user.get("epicpayment_connected", False)
    
    return {
        "has_any_processor": stripe_ready or square_ready or paypal_ready or authorizenet_ready or epicpayment_ready,
        "stripe_connected": stripe_ready,
        "square_connected": square_ready,
        "paypal_connected": paypal_ready,
        "authorizenet_connected": authorizenet_ready,
        "epicpayment_connected": epicpayment_ready,
        "stripe_account_id": user.get("stripe_account_id"),
        "square_merchant_id": user.get("square_merchant_id"),
        "paypal_payer_id": user.get("paypal_payer_id")
    }

# PayPal Endpoints
@api_router.post("/users/paypal-account")
async def update_user_paypal_account(data: UpdatePayPalAccount):
    """Update user's PayPal account details after OAuth"""
    result = await db.users.update_one(
        {"id": data.user_id},
        {
            "$set": {
                "paypal_payer_id": data.payer_id,
                "paypal_email": data.email,
                "paypal_access_token": data.access_token,
                "paypal_refresh_token": data.refresh_token,
                "paypal_connected": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    return {"success": True, "modified": result.modified_count > 0}

@api_router.get("/users/{user_id}/paypal-status")
async def get_user_paypal_status(user_id: str):
    """Get user's PayPal connection status"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "connected": False,
            "payer_id": None,
            "email": None,
            "has_access_token": False
        }
    
    return {
        "connected": user.get("paypal_connected", False),
        "payer_id": user.get("paypal_payer_id"),
        "email": user.get("paypal_email"),
        "has_access_token": user.get("paypal_access_token") is not None
    }

@api_router.get("/users/{user_id}/authorizenet-status")
async def get_user_authorizenet_status(user_id: str):
    """Get user's Authorize.net connection status"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "connected": False,
            "verified": False,
            "lastVerified": None,
            "environment": None
        }
    
    return {
        "connected": user.get("authorizenet_connected", False),
        "verified": user.get("authorizenet_verified", False),
        "lastVerified": user.get("authorizenet_connected_at"),
        "environment": user.get("authorizenet_environment")
    }

@api_router.get("/users/{user_id}/epicpayment-status")
async def get_user_epicpayment_status(user_id: str):
    """Get user's Epic Payment Solutions connection status"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "connected": False,
            "verified": False,
            "lastVerified": None,
            "environment": None
        }
    
    return {
        "connected": user.get("epicpayment_connected", False),
        "verified": user.get("epicpayment_verified", False),
        "lastVerified": user.get("epicpayment_connected_at"),
        "environment": user.get("epicpayment_environment")
    }

# Avatar Upload Endpoint
@api_router.post("/users/avatar")
async def upload_avatar(file: UploadFile = File(...), user_id: str = Form(...)):
    """Upload and update user's avatar image"""
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        return {"success": False, "error": "Invalid file type. Allowed: JPEG, PNG, GIF, WebP"}
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"avatar_{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = UPLOADS_DIR / unique_filename
    
    try:
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create the avatar URL (served from /api/uploads/)
        avatar_url = f"/api/uploads/{unique_filename}"
        
        # Update user's avatar in database
        await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "avatar": avatar_url,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "avatar_url": avatar_url,
            "filename": unique_filename
        }
    except Exception as e:
        logger.error(f"Avatar upload error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/users/{user_id}/avatar")
async def get_user_avatar(user_id: str):
    """Get user's avatar URL"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user or not user.get("avatar"):
        # Return default avatar
        return {
            "avatar_url": f"https://ui-avatars.com/api/?name={user_id}&background=667eea&color=fff"
        }
    return {"avatar_url": user.get("avatar")}


# ============================================
# Sales Statistics Endpoints
# ============================================

@api_router.get("/users/{user_id}/sales-stats")
async def get_user_sales_stats(user_id: str):
    """
    Get user's sales statistics including all-time and last 30 days.
    Works for all users regardless of payment processor type.
    """
    from datetime import timedelta
    
    # Calculate date 30 days ago
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    
    # Get all-time sales (as seller)
    all_time_pipeline = [
        {"$match": {"seller_id": user_id, "status": {"$in": ["succeeded", "completed", "paid"]}}},
        {"$group": {
            "_id": None,
            "total_sales": {"$sum": "$amount"},
            "total_orders": {"$sum": 1},
            "total_platform_fees": {"$sum": "$platform_fee"}
        }}
    ]
    
    all_time_result = await db.payments.aggregate(all_time_pipeline).to_list(1)
    
    # Get last 30 days sales
    last_30_days_pipeline = [
        {"$match": {
            "seller_id": user_id,
            "status": {"$in": ["succeeded", "completed", "paid"]},
            "created_at": {"$gte": thirty_days_ago}
        }},
        {"$group": {
            "_id": None,
            "total_sales": {"$sum": "$amount"},
            "total_orders": {"$sum": 1},
            "total_platform_fees": {"$sum": "$platform_fee"}
        }}
    ]
    
    last_30_days_result = await db.payments.aggregate(last_30_days_pipeline).to_list(1)
    
    # Extract results with defaults
    all_time = all_time_result[0] if all_time_result else {"total_sales": 0, "total_orders": 0, "total_platform_fees": 0}
    last_30 = last_30_days_result[0] if last_30_days_result else {"total_sales": 0, "total_orders": 0, "total_platform_fees": 0}
    
    return {
        "all_time": {
            "total_sales": round(all_time.get("total_sales", 0), 2),
            "total_orders": all_time.get("total_orders", 0),
            "total_platform_fees": round(all_time.get("total_platform_fees", 0), 2)
        },
        "last_30_days": {
            "total_sales": round(last_30.get("total_sales", 0), 2),
            "total_orders": last_30.get("total_orders", 0),
            "total_platform_fees": round(last_30.get("total_platform_fees", 0), 2)
        }
    }


# ============================================
# Manual Fee Collection Endpoints
# ============================================

def get_fee_status(due_date_str: str):
    """
    Determine fee status based on due date.
    Returns: 'current', 'grace_period', or 'past_due'
    """
    from datetime import timedelta
    
    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    grace_end_date = due_date + timedelta(days=15)
    
    if now < due_date:
        return "current"
    elif now <= grace_end_date:
        return "grace_period"
    else:
        return "past_due"


def calculate_fee_due_date(year: int, month: int):
    """
    Calculate the fee due date (5th of the following month).
    Fees from January are due February 5th, etc.
    """
    # Move to next month
    if month == 12:
        next_month = 1
        next_year = year + 1
    else:
        next_month = month + 1
        next_year = year
    
    return datetime(next_year, next_month, 5, 0, 0, 0, tzinfo=timezone.utc)


@api_router.get("/users/{user_id}/pending-fees")
async def get_user_pending_fees(user_id: str):
    """
    Get pending platform fees for manual processor users (Authorize.net, Epic Payment).
    Fees are grouped by billing period with status (current, grace_period, past_due).
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user:
        return {
            "has_manual_processor": False,
            "pending_fees": [],
            "total_due": 0,
            "past_due_amount": 0,
            "is_suspended": False
        }
    
    # Check if user has any manual processor connected
    has_manual = (
        user.get("authorizenet_connected", False) or 
        user.get("epicpayment_connected", False)
    )
    
    if not has_manual:
        return {
            "has_manual_processor": False,
            "pending_fees": [],
            "total_due": 0,
            "past_due_amount": 0,
            "is_suspended": False
        }
    
    # Get unpaid fee invoices
    fee_invoices = await db.fee_invoices.find(
        {"seller_id": user_id, "paid": False},
        {"_id": 0}
    ).sort("due_date", 1).to_list(100)
    
    # Calculate totals and statuses
    total_due = 0
    past_due_amount = 0
    grace_period_amount = 0
    pending_fees = []
    
    for invoice in fee_invoices:
        status = get_fee_status(invoice["due_date"])
        amount = invoice.get("amount", 0)
        total_due += amount
        
        if status == "past_due":
            past_due_amount += amount
        elif status == "grace_period":
            grace_period_amount += amount
        
        pending_fees.append({
            **invoice,
            "status": status
        })
    
    # Check/update suspension status
    is_suspended = past_due_amount > 0
    was_suspended = user.get("is_suspended", False)
    
    if is_suspended != was_suspended:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "is_suspended": is_suspended,
                "suspension_reason": "past_due_fees" if is_suspended else None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Block/unblock identifiers based on suspension status
        if is_suspended and not was_suspended:
            # User just got suspended - block their identifiers
            await block_user_identifiers(user_id, "past_due_fees")
        elif not is_suspended and was_suspended:
            # User just got unsuspended - unblock their identifiers
            await unblock_user_identifiers(user_id)
    
    return {
        "has_manual_processor": True,
        "pending_fees": pending_fees,
        "total_due": round(total_due, 2),
        "past_due_amount": round(past_due_amount, 2),
        "grace_period_amount": round(grace_period_amount, 2),
        "is_suspended": is_suspended
    }


@api_router.get("/users/{user_id}/suspension-status")
async def get_user_suspension_status(user_id: str):
    """Get user's suspension status for fee non-payment"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user:
        return {
            "is_suspended": False,
            "suspension_reason": None,
            "can_list_items": True
        }
    
    is_suspended = user.get("is_suspended", False)
    
    return {
        "is_suspended": is_suspended,
        "suspension_reason": user.get("suspension_reason"),
        "can_list_items": not is_suspended
    }


class PayFeeRequest(BaseModel):
    user_id: str
    invoice_ids: List[str] = []  # Empty means pay all


@api_router.post("/users/pay-fees")
async def pay_fees_placeholder(request: PayFeeRequest):
    """
    Placeholder endpoint for fee payment.
    Currently returns a message to contact support.
    Will be replaced with actual payment processing later.
    """
    # Get pending fees
    fees_response = await get_user_pending_fees(request.user_id)
    
    if fees_response["total_due"] == 0:
        return {
            "success": True,
            "message": "No fees due at this time."
        }
    
    return {
        "success": False,
        "payment_pending": True,
        "amount_due": fees_response["total_due"],
        "message": "Payment processing is being set up. Please contact support@cheqmart.com to arrange payment for your platform fees.",
        "support_email": "support@cheqmart.com"
    }


@api_router.post("/admin/generate-fee-invoices")
async def generate_monthly_fee_invoices():
    """
    Admin endpoint to generate monthly fee invoices for manual processor users.
    Should be called on the 1st of each month to generate invoices for the previous month.
    """
    from datetime import timedelta
    
    # Get the previous month
    now = datetime.now(timezone.utc)
    first_of_this_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    last_month_end = first_of_this_month - timedelta(seconds=1)
    first_of_last_month = datetime(last_month_end.year, last_month_end.month, 1, tzinfo=timezone.utc)
    
    billing_period = f"{first_of_last_month.year}-{first_of_last_month.month:02d}"
    due_date = calculate_fee_due_date(last_month_end.year, last_month_end.month)
    
    # Get all users with manual processors
    manual_users = await db.users.find({
        "$or": [
            {"authorizenet_connected": True},
            {"epicpayment_connected": True}
        ]
    }, {"_id": 0, "id": 1}).to_list(1000)
    
    invoices_created = 0
    
    for user in manual_users:
        user_id = user["id"]
        
        # Check if invoice already exists for this period
        existing = await db.fee_invoices.find_one({
            "seller_id": user_id,
            "billing_period": billing_period
        })
        
        if existing:
            continue
        
        # Calculate fees from Authorize.net transactions
        authnet_fees = await db.authorizenet_transactions.aggregate([
            {
                "$match": {
                    "seller_id": user_id,
                    "invoiced": False,
                    "created_at": {
                        "$gte": first_of_last_month.isoformat(),
                        "$lt": first_of_this_month.isoformat()
                    }
                }
            },
            {"$group": {"_id": None, "total": {"$sum": "$platform_fee_due"}}}
        ]).to_list(1)
        
        # Calculate fees from Epic Payment transactions
        epic_fees = await db.epicpayment_transactions.aggregate([
            {
                "$match": {
                    "seller_id": user_id,
                    "invoiced": False,
                    "created_at": {
                        "$gte": first_of_last_month.isoformat(),
                        "$lt": first_of_this_month.isoformat()
                    }
                }
            },
            {"$group": {"_id": None, "total": {"$sum": "$platform_fee_due"}}}
        ]).to_list(1)
        
        authnet_total = authnet_fees[0]["total"] if authnet_fees else 0
        epic_total = epic_fees[0]["total"] if epic_fees else 0
        total_fees = authnet_total + epic_total
        
        if total_fees > 0:
            # Create invoice
            invoice = {
                "id": str(uuid.uuid4()),
                "seller_id": user_id,
                "billing_period": billing_period,
                "amount": round(total_fees, 2),
                "due_date": due_date.isoformat(),
                "paid": False,
                "paid_at": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.fee_invoices.insert_one(invoice)
            
            # Mark transactions as invoiced
            await db.authorizenet_transactions.update_many(
                {
                    "seller_id": user_id,
                    "invoiced": False,
                    "created_at": {
                        "$gte": first_of_last_month.isoformat(),
                        "$lt": first_of_this_month.isoformat()
                    }
                },
                {"$set": {"invoiced": True, "invoice_id": invoice["id"]}}
            )
            
            await db.epicpayment_transactions.update_many(
                {
                    "seller_id": user_id,
                    "invoiced": False,
                    "created_at": {
                        "$gte": first_of_last_month.isoformat(),
                        "$lt": first_of_this_month.isoformat()
                    }
                },
                {"$set": {"invoiced": True, "invoice_id": invoice["id"]}}
            )
            
            invoices_created += 1
    
    return {
        "success": True,
        "billing_period": billing_period,
        "due_date": due_date.isoformat(),
        "invoices_created": invoices_created
    }


# ============================================
# Products/Listings Endpoints
# ============================================

@api_router.get("/products")
async def get_products(
    category: str = None,
    limit: int = 50,
    skip: int = 0,
    exclude_suspended: bool = True
):
    """
    Get products/listings, optionally filtering out suspended sellers.
    By default, excludes listings from suspended users.
    """
    # Build query
    query = {"status": {"$in": ["active", "available"]}}
    
    if category:
        query["category"] = category
    
    # If excluding suspended sellers, we need to get suspended user IDs first
    suspended_seller_ids = []
    if exclude_suspended:
        suspended_users = await db.users.find(
            {"is_suspended": True},
            {"_id": 0, "id": 1}
        ).to_list(1000)
        suspended_seller_ids = [u["id"] for u in suspended_users]
        
        if suspended_seller_ids:
            query["seller_id"] = {"$nin": suspended_seller_ids}
    
    # Fetch products
    products = await db.products.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get total count for pagination
    total_count = await db.products.count_documents(query)
    
    return {
        "products": products,
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "suspended_sellers_filtered": len(suspended_seller_ids)
    }


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Get a single product by ID.
    Returns 404 if product not found or seller is suspended.
    """
    product = await db.products.find_one(
        {"id": product_id},
        {"_id": 0}
    )
    
    if not product:
        return {"error": "Product not found", "status": 404}
    
    # Check if seller is suspended
    seller_id = product.get("seller_id")
    if seller_id:
        seller = await db.users.find_one({"id": seller_id}, {"_id": 0})
        if seller and seller.get("is_suspended"):
            return {
                "error": "This listing is temporarily unavailable",
                "status": 403,
                "reason": "seller_suspended"
            }
    
    return {"product": product}


@api_router.get("/sellers/{seller_id}/products")
async def get_seller_products(
    seller_id: str,
    limit: int = 50,
    skip: int = 0
):
    """
    Get products from a specific seller.
    Returns empty array if seller is suspended.
    """
    # Check if seller is suspended
    seller = await db.users.find_one({"id": seller_id}, {"_id": 0})
    
    if seller and seller.get("is_suspended"):
        return {
            "products": [],
            "total": 0,
            "seller_suspended": True,
            "message": "This seller's listings are temporarily unavailable"
        }
    
    # Fetch seller's products
    products = await db.products.find(
        {"seller_id": seller_id, "status": {"$in": ["active", "available"]}},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total_count = await db.products.count_documents(
        {"seller_id": seller_id, "status": {"$in": ["active", "available"]}}
    )
    
    return {
        "products": products,
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "seller_suspended": False
    }


@api_router.get("/suspended-seller-ids")
async def get_suspended_seller_ids():
    """
    Get list of suspended seller IDs.
    Used by frontend to filter mock data until real product DB is implemented.
    """
    suspended_users = await db.users.find(
        {"is_suspended": True},
        {"_id": 0, "id": 1}
    ).to_list(1000)
    
    return {
        "suspended_seller_ids": [u["id"] for u in suspended_users]
    }


@api_router.post("/admin/mark-fees-paid/{invoice_id}")
async def mark_fees_paid(invoice_id: str):
    """
    Admin endpoint to mark a fee invoice as paid.
    Used when payment is received manually.
    Also unblocks user identifiers if all past-due fees are cleared.
    """
    invoice = await db.fee_invoices.find_one({"id": invoice_id}, {"_id": 0})
    
    if not invoice:
        return {"success": False, "error": "Invoice not found"}
    
    if invoice.get("paid"):
        return {"success": False, "error": "Invoice already marked as paid"}
    
    # Mark as paid
    await db.fee_invoices.update_one(
        {"id": invoice_id},
        {"$set": {
            "paid": True,
            "paid_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Check if user should be unsuspended
    user_id = invoice["seller_id"]
    remaining_fees = await db.fee_invoices.find({
        "seller_id": user_id,
        "paid": False
    }).to_list(100)
    
    # Check if any remaining fees are past due
    has_past_due = False
    for fee in remaining_fees:
        if get_fee_status(fee["due_date"]) == "past_due":
            has_past_due = True
            break
    
    user_unsuspended = False
    if not has_past_due:
        # Unsuspend user
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "is_suspended": False,
                "suspension_reason": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        user_unsuspended = True
        
        # Unblock user identifiers so they can use their phone/email/cards again
        await unblock_user_identifiers(user_id)
    
    return {
        "success": True,
        "invoice_id": invoice_id,
        "user_unsuspended": not has_past_due
    }


# Import routers
from stripe_connect import router as stripe_connect_router
from square_oauth import router as square_oauth_router
from paypal_oauth import router as paypal_oauth_router
from payments import router as payments_router
from authorizenet import router as authorizenet_router
from epicpayment import router as epicpayment_router
from billing import router as billing_router
from fraud_prevention import router as fraud_prevention_router
from fraud_prevention import block_user_identifiers, unblock_user_identifiers
from payment_processors import router as payment_processors_router

# Include the routers in the main app
app.include_router(api_router)
app.include_router(stripe_connect_router)
app.include_router(square_oauth_router)
app.include_router(paypal_oauth_router)
app.include_router(payments_router)
app.include_router(authorizenet_router)
app.include_router(epicpayment_router)
app.include_router(billing_router)
app.include_router(fraud_prevention_router)
app.include_router(payment_processors_router)

# Mount static files for serving uploaded avatars
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()