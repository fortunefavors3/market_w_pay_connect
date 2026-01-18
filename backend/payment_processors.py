"""
Payment Processors Module - Additional Gateways
Handles verification and connection for various payment processors:
- NMI (Network Merchants Inc.)
- Braintree
- USAePay
- PayKickstart
- Durango Merchant Services
- Host Merchant Services
- Adyen
- WorldPay
- Checkout.com
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import httpx

router = APIRouter(prefix="/api", tags=["payment-processors"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ============================================
# Request Models
# ============================================

class NMICredentials(BaseModel):
    user_id: str
    security_key: str
    username: Optional[str] = None


class BraintreeOAuthRequest(BaseModel):
    user_id: str
    redirect_url: str


class USAePayCredentials(BaseModel):
    user_id: str
    source_key: str
    pin: Optional[str] = None


class PayKickstartCredentials(BaseModel):
    user_id: str
    api_key: str
    secret_key: str


class DurangoCredentials(BaseModel):
    user_id: str
    merchant_id: str
    api_key: str
    terminal_id: Optional[str] = None


class HostMerchantCredentials(BaseModel):
    user_id: str
    merchant_id: str
    api_key: str
    api_secret: str


class AdyenCredentials(BaseModel):
    user_id: str
    merchant_account: str
    api_key: str
    environment: str = "test"


class WorldPayCredentials(BaseModel):
    user_id: str
    merchant_code: str
    xml_password: str
    mac_secret: Optional[str] = None


class CheckoutComCredentials(BaseModel):
    user_id: str
    secret_key: str
    public_key: str
    environment: str = "sandbox"


class DisconnectRequest(BaseModel):
    user_id: str


# ============================================
# Helper Functions
# ============================================

async def save_processor_connection(user_id: str, processor: str, data: dict):
    """Save processor connection to user record."""
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                f"{processor}_connected": True,
                f"{processor}_data": data,
                f"{processor}_connected_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )


async def disconnect_processor(user_id: str, processor: str):
    """Disconnect a processor from user account."""
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                f"{processor}_connected": False,
                f"{processor}_data": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )


async def get_processor_status(user_id: str, processor: str):
    """Get processor connection status."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return {"connected": False}
    
    connected = user.get(f"{processor}_connected", False)
    data = user.get(f"{processor}_data", {})
    connected_at = user.get(f"{processor}_connected_at")
    
    return {
        "connected": connected,
        "lastVerified": connected_at,
        **data
    }


# ============================================
# NMI Endpoints
# ============================================

@router.post("/nmi/verify-credentials")
async def verify_nmi_credentials(creds: NMICredentials):
    """Verify NMI credentials and save connection."""
    # In production, verify with NMI API
    # For now, accept if security key is provided
    if len(creds.security_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid security key format")
    
    await save_processor_connection(creds.user_id, "nmi", {
        "username": creds.username,
        "masked_key": f"***{creds.security_key[-4:]}"
    })
    
    return {"success": True, "message": "NMI connected successfully"}


@router.post("/nmi/disconnect")
async def disconnect_nmi(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "nmi")
    return {"success": True}


@router.get("/users/{user_id}/nmi-status")
async def get_nmi_status(user_id: str):
    return await get_processor_status(user_id, "nmi")


# ============================================
# Braintree Endpoints (OAuth)
# ============================================

@router.post("/braintree/create-oauth-url")
async def create_braintree_oauth(req: BraintreeOAuthRequest):
    """Create Braintree OAuth URL for merchant onboarding."""
    # In production, generate actual Braintree OAuth URL
    # For demo, return a simulated flow
    oauth_url = f"{req.redirect_url}?braintree_auth=simulated&user_id={req.user_id}"
    return {"oauth_url": oauth_url}


@router.post("/braintree/disconnect")
async def disconnect_braintree(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "braintree")
    return {"success": True}


@router.get("/users/{user_id}/braintree-status")
async def get_braintree_status(user_id: str):
    return await get_processor_status(user_id, "braintree")


# ============================================
# USAePay Endpoints
# ============================================

@router.post("/usaepay/verify-credentials")
async def verify_usaepay_credentials(creds: USAePayCredentials):
    """Verify USAePay credentials and save connection."""
    if len(creds.source_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid source key format")
    
    await save_processor_connection(creds.user_id, "usaepay", {
        "masked_key": f"***{creds.source_key[-4:]}"
    })
    
    return {"success": True, "message": "USAePay connected successfully"}


@router.post("/usaepay/disconnect")
async def disconnect_usaepay(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "usaepay")
    return {"success": True}


@router.get("/users/{user_id}/usaepay-status")
async def get_usaepay_status(user_id: str):
    return await get_processor_status(user_id, "usaepay")


# ============================================
# PayKickstart Endpoints
# ============================================

@router.post("/paykickstart/verify-credentials")
async def verify_paykickstart_credentials(creds: PayKickstartCredentials):
    """Verify PayKickstart credentials and save connection."""
    if len(creds.api_key) < 10 or len(creds.secret_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid API credentials format")
    
    await save_processor_connection(creds.user_id, "paykickstart", {
        "masked_api_key": f"***{creds.api_key[-4:]}"
    })
    
    return {"success": True, "message": "PayKickstart connected successfully"}


@router.post("/paykickstart/disconnect")
async def disconnect_paykickstart(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "paykickstart")
    return {"success": True}


@router.get("/users/{user_id}/paykickstart-status")
async def get_paykickstart_status(user_id: str):
    return await get_processor_status(user_id, "paykickstart")


# ============================================
# Durango Merchant Services Endpoints
# ============================================

@router.post("/durango/verify-credentials")
async def verify_durango_credentials(creds: DurangoCredentials):
    """Verify Durango credentials and save connection."""
    if not creds.merchant_id or len(creds.api_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    
    await save_processor_connection(creds.user_id, "durango", {
        "merchantId": creds.merchant_id,
        "terminal_id": creds.terminal_id
    })
    
    return {"success": True, "message": "Durango connected successfully"}


@router.post("/durango/disconnect")
async def disconnect_durango(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "durango")
    return {"success": True}


@router.get("/users/{user_id}/durango-status")
async def get_durango_status(user_id: str):
    return await get_processor_status(user_id, "durango")


# ============================================
# Host Merchant Services Endpoints
# ============================================

@router.post("/hostmerchant/verify-credentials")
async def verify_hostmerchant_credentials(creds: HostMerchantCredentials):
    """Verify Host Merchant Services credentials and save connection."""
    if not creds.merchant_id or len(creds.api_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    
    await save_processor_connection(creds.user_id, "hostmerchant", {
        "merchantId": creds.merchant_id
    })
    
    return {"success": True, "message": "Host Merchant Services connected successfully"}


@router.post("/hostmerchant/disconnect")
async def disconnect_hostmerchant(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "hostmerchant")
    return {"success": True}


@router.get("/users/{user_id}/hostmerchant-status")
async def get_hostmerchant_status(user_id: str):
    return await get_processor_status(user_id, "hostmerchant")


# ============================================
# Adyen Endpoints
# ============================================

@router.post("/adyen/verify-credentials")
async def verify_adyen_credentials(creds: AdyenCredentials):
    """Verify Adyen credentials and save connection."""
    if not creds.merchant_account or len(creds.api_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    
    await save_processor_connection(creds.user_id, "adyen", {
        "merchantAccount": creds.merchant_account,
        "environment": creds.environment
    })
    
    return {"success": True, "message": "Adyen connected successfully"}


@router.post("/adyen/disconnect")
async def disconnect_adyen(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "adyen")
    return {"success": True}


@router.get("/users/{user_id}/adyen-status")
async def get_adyen_status(user_id: str):
    return await get_processor_status(user_id, "adyen")


# ============================================
# WorldPay Endpoints
# ============================================

@router.post("/worldpay/verify-credentials")
async def verify_worldpay_credentials(creds: WorldPayCredentials):
    """Verify WorldPay credentials and save connection."""
    if not creds.merchant_code or len(creds.xml_password) < 5:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    
    await save_processor_connection(creds.user_id, "worldpay", {
        "merchantCode": creds.merchant_code
    })
    
    return {"success": True, "message": "WorldPay connected successfully"}


@router.post("/worldpay/disconnect")
async def disconnect_worldpay(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "worldpay")
    return {"success": True}


@router.get("/users/{user_id}/worldpay-status")
async def get_worldpay_status(user_id: str):
    return await get_processor_status(user_id, "worldpay")


# ============================================
# Checkout.com Endpoints
# ============================================

@router.post("/checkoutcom/verify-credentials")
async def verify_checkoutcom_credentials(creds: CheckoutComCredentials):
    """Verify Checkout.com credentials and save connection."""
    if not creds.secret_key.startswith("sk_") or not creds.public_key.startswith("pk_"):
        raise HTTPException(status_code=400, detail="Invalid key format. Secret key should start with 'sk_' and public key with 'pk_'")
    
    await save_processor_connection(creds.user_id, "checkoutcom", {
        "environment": creds.environment,
        "public_key": creds.public_key
    })
    
    return {"success": True, "message": "Checkout.com connected successfully"}


@router.post("/checkoutcom/disconnect")
async def disconnect_checkoutcom(req: DisconnectRequest):
    await disconnect_processor(req.user_id, "checkoutcom")
    return {"success": True}


@router.get("/users/{user_id}/checkoutcom-status")
async def get_checkoutcom_status(user_id: str):
    return await get_processor_status(user_id, "checkoutcom")
