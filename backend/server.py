from fastapi import FastAPI, APIRouter
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
    """Get user's overall payment processor status (Stripe + Square + PayPal)"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {
            "has_any_processor": False,
            "stripe_connected": False,
            "square_connected": False,
            "paypal_connected": False
        }
    
    stripe_ready = (
        user.get("stripe_charges_enabled", False) and 
        user.get("stripe_payouts_enabled", False)
    )
    square_ready = user.get("square_connected", False)
    paypal_ready = user.get("paypal_connected", False)
    
    return {
        "has_any_processor": stripe_ready or square_ready or paypal_ready,
        "stripe_connected": stripe_ready,
        "square_connected": square_ready,
        "paypal_connected": paypal_ready,
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

# Import routers
from stripe_connect import router as stripe_connect_router
from square_oauth import router as square_oauth_router
from paypal_oauth import router as paypal_oauth_router

# Include the routers in the main app
app.include_router(api_router)
app.include_router(stripe_connect_router)
app.include_router(square_oauth_router)
app.include_router(paypal_oauth_router)

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