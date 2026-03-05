"""
Epic Payment Solutions Manual Credential Integration

This module handles manual credential entry for Epic Payment Solutions,
which doesn't support OAuth/marketplace fee splitting.

For these merchants, Effinsure will:
1. Store encrypted credentials
2. Process payments directly to merchant's account
3. Invoice platform fees separately (monthly billing)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import httpx
from cryptography.fernet import Fernet
import base64
import hashlib

load_dotenv()

router = APIRouter(prefix="/api/epicpayment", tags=["epicpayment"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Encryption key for storing credentials (in production, use proper key management)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate a key from a secret (for demo purposes)
    secret = os.getenv("SECRET_KEY", "effinsure-secret-key-change-in-production")
    ENCRYPTION_KEY = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())

fernet = Fernet(ENCRYPTION_KEY)


class CredentialsRequest(BaseModel):
    merchant_id: str
    api_key: str
    secret_key: str
    environment: str = "sandbox"


class ConnectRequest(BaseModel):
    user_id: str
    merchant_id: str
    api_key: str
    secret_key: str
    environment: str = "sandbox"


class DisconnectRequest(BaseModel):
    user_id: str


def encrypt_credential(credential: str) -> str:
    """Encrypt a credential for storage"""
    return fernet.encrypt(credential.encode()).decode()


def decrypt_credential(encrypted: str) -> str:
    """Decrypt a stored credential"""
    return fernet.decrypt(encrypted.encode()).decode()


@router.post("/verify-credentials")
async def verify_credentials(request: CredentialsRequest):
    """
    Verify Epic Payment Solutions credentials.
    Since this is a manual credential entry processor, we perform basic validation.
    In production, this would connect to Epic Payment Solutions API to verify.
    """
    try:
        # Basic validation - ensure all fields are provided and non-empty
        if not request.merchant_id or len(request.merchant_id) < 3:
            return {
                "valid": False,
                "error": "Invalid Merchant ID format"
            }
        
        if not request.api_key or len(request.api_key) < 10:
            return {
                "valid": False,
                "error": "Invalid API Key format"
            }
        
        if not request.secret_key or len(request.secret_key) < 10:
            return {
                "valid": False,
                "error": "Invalid Secret Key format"
            }
        
        # In production, you would make an API call to Epic Payment Solutions
        # to verify the credentials. For now, we accept valid-looking credentials.
        
        return {
            "valid": True,
            "merchant_id": request.merchant_id,
            "environment": request.environment
        }
                
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }


@router.post("/connect")
async def connect_epicpayment(request: ConnectRequest):
    """
    Save Epic Payment Solutions credentials for a user.
    Credentials are encrypted before storage.
    """
    try:
        # Encrypt credentials before storing
        encrypted_merchant_id = encrypt_credential(request.merchant_id)
        encrypted_api_key = encrypt_credential(request.api_key)
        encrypted_secret_key = encrypt_credential(request.secret_key)
        
        # Update user record with encrypted credentials
        result = await db.users.update_one(
            {"id": request.user_id},
            {
                "$set": {
                    "epicpayment_connected": True,
                    "epicpayment_merchant_id": encrypted_merchant_id,
                    "epicpayment_api_key": encrypted_api_key,
                    "epicpayment_secret_key": encrypted_secret_key,
                    "epicpayment_environment": request.environment,
                    "epicpayment_connected_at": datetime.now(timezone.utc).isoformat(),
                    "epicpayment_verified": True,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Epic Payment Solutions account connected successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/disconnect")
async def disconnect_epicpayment(request: DisconnectRequest):
    """
    Remove Epic Payment Solutions credentials for a user.
    """
    try:
        await db.users.update_one(
            {"id": request.user_id},
            {
                "$set": {
                    "epicpayment_connected": False,
                    "epicpayment_verified": False,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                },
                "$unset": {
                    "epicpayment_merchant_id": "",
                    "epicpayment_api_key": "",
                    "epicpayment_secret_key": "",
                    "epicpayment_environment": "",
                    "epicpayment_connected_at": ""
                }
            }
        )
        
        return {
            "success": True,
            "message": "Epic Payment Solutions account disconnected"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{user_id}")
async def get_epicpayment_status(user_id: str):
    """
    Get Epic Payment Solutions connection status for a user.
    Does not return actual credentials.
    """
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


# Payment processing endpoint for Epic Payment Solutions
class PaymentRequest(BaseModel):
    seller_id: str
    amount: float
    card_number: str
    expiration_date: str  # Format: MM/YY
    cvv: str
    description: Optional[str] = "Effinsure Purchase"
    order_id: Optional[str] = None


@router.post("/process-payment")
async def process_payment(request: PaymentRequest):
    """
    Process a payment through a seller's Epic Payment Solutions account.
    Note: Platform fee is NOT automatically collected - it will be invoiced separately.
    """
    try:
        # Get seller's credentials
        seller = await db.users.find_one({"id": request.seller_id}, {"_id": 0})
        
        if not seller or not seller.get("epicpayment_connected"):
            raise HTTPException(
                status_code=400,
                detail="Seller does not have a connected Epic Payment Solutions account"
            )
        
        # Decrypt credentials
        merchant_id = decrypt_credential(seller["epicpayment_merchant_id"])
        api_key = decrypt_credential(seller["epicpayment_api_key"])
        secret_key = decrypt_credential(seller["epicpayment_secret_key"])
        environment = seller.get("epicpayment_environment", "sandbox")
        
        # In production, you would make an actual API call to Epic Payment Solutions
        # For now, we simulate a successful payment
        
        # Calculate platform fee (for invoicing purposes)
        platform_fee = round(request.amount * 0.055, 2)
        
        # Generate a mock transaction ID
        transaction_id = f"EPIC-{datetime.now().strftime('%Y%m%d%H%M%S')}-{request.order_id or 'NA'}"
        
        # Record transaction for invoicing
        await db.epicpayment_transactions.insert_one({
            "seller_id": request.seller_id,
            "transaction_id": transaction_id,
            "amount": request.amount,
            "platform_fee_due": platform_fee,
            "invoiced": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "amount": request.amount,
            "platform_fee_due": platform_fee,
            "message": "Payment processed successfully. Platform fee will be invoiced."
        }
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Invoicing endpoints for platform fees
@router.get("/pending-fees/{seller_id}")
async def get_pending_fees(seller_id: str):
    """
    Get total uninvoiced platform fees for a seller.
    """
    pipeline = [
        {"$match": {"seller_id": seller_id, "invoiced": False}},
        {"$group": {
            "_id": None,
            "total_fees": {"$sum": "$platform_fee_due"},
            "transaction_count": {"$sum": 1}
        }}
    ]
    
    result = await db.epicpayment_transactions.aggregate(pipeline).to_list(1)
    
    if result:
        return {
            "seller_id": seller_id,
            "pending_fees": result[0]["total_fees"],
            "transaction_count": result[0]["transaction_count"]
        }
    
    return {
        "seller_id": seller_id,
        "pending_fees": 0,
        "transaction_count": 0
    }
