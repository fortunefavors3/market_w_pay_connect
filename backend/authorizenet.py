"""
Authorize.net Manual Credential Integration

This module handles manual credential entry for Authorize.net,
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

router = APIRouter(prefix="/api/authorizenet", tags=["authorize.net"])

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

# Authorize.net API URLs
AUTHNET_SANDBOX_URL = "https://apitest.authorize.net/xml/v1/request.api"
AUTHNET_PRODUCTION_URL = "https://api.authorize.net/xml/v1/request.api"


class CredentialsRequest(BaseModel):
    api_login_id: str
    transaction_key: str
    environment: str = "sandbox"


class ConnectRequest(BaseModel):
    user_id: str
    api_login_id: str
    transaction_key: str
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
    Verify Authorize.net credentials by making a test API call.
    Uses the getMerchantDetails API to verify credentials are valid.
    """
    try:
        api_url = AUTHNET_PRODUCTION_URL if request.environment == "production" else AUTHNET_SANDBOX_URL
        
        # Build the authentication test request
        payload = {
            "getMerchantDetailsRequest": {
                "merchantAuthentication": {
                    "name": request.api_login_id,
                    "transactionKey": request.transaction_key
                }
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                api_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            result = response.json()
            
            # Check for successful response
            messages = result.get("messages", {})
            result_code = messages.get("resultCode", "Error")
            
            if result_code == "Ok":
                merchant_details = result.get("merchantName", "Unknown")
                return {
                    "valid": True,
                    "merchant_name": merchant_details,
                    "environment": request.environment
                }
            else:
                error_message = messages.get("message", [{}])[0].get("text", "Invalid credentials")
                return {
                    "valid": False,
                    "error": error_message
                }
                
    except httpx.TimeoutException:
        return {
            "valid": False,
            "error": "Connection timeout - please try again"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }


@router.post("/connect")
async def connect_authorizenet(request: ConnectRequest):
    """
    Save Authorize.net credentials for a user.
    Credentials are encrypted before storage.
    """
    try:
        # Encrypt credentials before storing
        encrypted_api_login = encrypt_credential(request.api_login_id)
        encrypted_transaction_key = encrypt_credential(request.transaction_key)
        
        # Update user record with encrypted credentials
        result = await db.users.update_one(
            {"id": request.user_id},
            {
                "$set": {
                    "authorizenet_connected": True,
                    "authorizenet_api_login_id": encrypted_api_login,
                    "authorizenet_transaction_key": encrypted_transaction_key,
                    "authorizenet_environment": request.environment,
                    "authorizenet_connected_at": datetime.now(timezone.utc).isoformat(),
                    "authorizenet_verified": True,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Authorize.net account connected successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/disconnect")
async def disconnect_authorizenet(request: DisconnectRequest):
    """
    Remove Authorize.net credentials for a user.
    """
    try:
        await db.users.update_one(
            {"id": request.user_id},
            {
                "$set": {
                    "authorizenet_connected": False,
                    "authorizenet_verified": False,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                },
                "$unset": {
                    "authorizenet_api_login_id": "",
                    "authorizenet_transaction_key": "",
                    "authorizenet_environment": "",
                    "authorizenet_connected_at": ""
                }
            }
        )
        
        return {
            "success": True,
            "message": "Authorize.net account disconnected"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{user_id}")
async def get_authorizenet_status(user_id: str):
    """
    Get Authorize.net connection status for a user.
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
        "connected": user.get("authorizenet_connected", False),
        "verified": user.get("authorizenet_verified", False),
        "lastVerified": user.get("authorizenet_connected_at"),
        "environment": user.get("authorizenet_environment")
    }


# Payment processing endpoint for Authorize.net
class PaymentRequest(BaseModel):
    seller_id: str
    amount: float
    card_number: str
    expiration_date: str  # Format: MMYY
    cvv: str
    description: Optional[str] = "Effinsure Purchase"
    order_id: Optional[str] = None


@router.post("/process-payment")
async def process_payment(request: PaymentRequest):
    """
    Process a payment through a seller's Authorize.net account.
    Note: Platform fee is NOT automatically collected - it will be invoiced separately.
    """
    try:
        # Get seller's credentials
        seller = await db.users.find_one({"id": request.seller_id}, {"_id": 0})
        
        if not seller or not seller.get("authorizenet_connected"):
            raise HTTPException(
                status_code=400,
                detail="Seller does not have a connected Authorize.net account"
            )
        
        # Decrypt credentials
        api_login_id = decrypt_credential(seller["authorizenet_api_login_id"])
        transaction_key = decrypt_credential(seller["authorizenet_transaction_key"])
        environment = seller.get("authorizenet_environment", "sandbox")
        
        api_url = AUTHNET_PRODUCTION_URL if environment == "production" else AUTHNET_SANDBOX_URL
        
        # Build payment request
        payload = {
            "createTransactionRequest": {
                "merchantAuthentication": {
                    "name": api_login_id,
                    "transactionKey": transaction_key
                },
                "transactionRequest": {
                    "transactionType": "authCaptureTransaction",
                    "amount": str(request.amount),
                    "payment": {
                        "creditCard": {
                            "cardNumber": request.card_number,
                            "expirationDate": request.expiration_date,
                            "cardCode": request.cvv
                        }
                    },
                    "order": {
                        "invoiceNumber": request.order_id or f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        "description": request.description
                    }
                }
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                api_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            result = response.json()
            
            messages = result.get("messages", {})
            result_code = messages.get("resultCode", "Error")
            
            if result_code == "Ok":
                trans_response = result.get("transactionResponse", {})
                
                # Calculate platform fee (for invoicing purposes)
                platform_fee = round(request.amount * 0.055, 2)
                
                # Record transaction for invoicing
                await db.authorizenet_transactions.insert_one({
                    "seller_id": request.seller_id,
                    "transaction_id": trans_response.get("transId"),
                    "amount": request.amount,
                    "platform_fee_due": platform_fee,
                    "invoiced": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
                
                return {
                    "success": True,
                    "transaction_id": trans_response.get("transId"),
                    "auth_code": trans_response.get("authCode"),
                    "amount": request.amount,
                    "platform_fee_due": platform_fee,
                    "message": "Payment processed successfully. Platform fee will be invoiced."
                }
            else:
                error_message = messages.get("message", [{}])[0].get("text", "Transaction failed")
                trans_errors = result.get("transactionResponse", {}).get("errors", [])
                if trans_errors:
                    error_message = trans_errors[0].get("errorText", error_message)
                
                return {
                    "success": False,
                    "error": error_message
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
    
    result = await db.authorizenet_transactions.aggregate(pipeline).to_list(1)
    
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
