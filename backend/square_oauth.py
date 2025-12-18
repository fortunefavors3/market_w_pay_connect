from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from square import Square
from square.client import SquareEnvironment
import uuid

load_dotenv()

router = APIRouter(prefix="/api/square-connect", tags=["square-connect"])

# Determine environment
SQUARE_ENV_STR = os.getenv("SQUARE_ENVIRONMENT", "sandbox")
SQUARE_ENV = SquareEnvironment.SANDBOX if SQUARE_ENV_STR == "sandbox" else SquareEnvironment.PRODUCTION

# Initialize Square Client
square_client = Square(
    token=os.getenv("SQUARE_ACCESS_TOKEN"),
    environment=SQUARE_ENV
)

SQUARE_APPLICATION_ID = os.getenv("SQUARE_APPLICATION_ID")
SQUARE_APPLICATION_SECRET = os.getenv("SQUARE_APPLICATION_SECRET")
SQUARE_ENVIRONMENT = os.getenv("SQUARE_ENVIRONMENT", "sandbox")

# OAuth URLs
if SQUARE_ENVIRONMENT == "production":
    SQUARE_OAUTH_URL = "https://connect.squareup.com/oauth2/authorize"
    SQUARE_TOKEN_URL = "https://connect.squareup.com/oauth2/token"
else:
    SQUARE_OAUTH_URL = "https://connect.squareupsandbox.com/oauth2/authorize"
    SQUARE_TOKEN_URL = "https://connect.squareupsandbox.com/oauth2/token"


class InitiateOAuthRequest(BaseModel):
    user_id: str
    redirect_url: str


class OAuthCallbackRequest(BaseModel):
    code: str
    state: str


class MerchantStatusResponse(BaseModel):
    merchant_id: str
    business_name: Optional[str]
    is_active: bool
    has_access_token: bool


@router.post("/initiate-oauth")
async def initiate_oauth(request: InitiateOAuthRequest):
    """
    Generate Square OAuth authorization URL
    """
    try:
        # Generate a unique state parameter for security
        state = f"{request.user_id}_{uuid.uuid4().hex}"
        
        # Build authorization URL
        permissions = [
            "MERCHANT_PROFILE_READ",
            "PAYMENTS_WRITE",
            "PAYMENTS_READ",
            "ORDERS_WRITE",
            "ORDERS_READ",
        ]
        
        # URL encode the redirect_uri
        from urllib.parse import quote
        encoded_redirect = quote(request.redirect_url, safe='')
        
        auth_url = (
            f"{SQUARE_OAUTH_URL}"
            f"?client_id={SQUARE_APPLICATION_ID}"
            f"&scope={'+'.join(permissions)}"
            f"&session=false"
            f"&state={state}"
            f"&redirect_uri={encoded_redirect}"
        )
        
        return {
            "authorization_url": auth_url,
            "state": state,
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/exchange-token")
async def exchange_token(request: OAuthCallbackRequest):
    """
    Exchange authorization code for access token
    """
    try:
        import httpx
        
        # Exchange code for access token
        response = httpx.post(
            SQUARE_TOKEN_URL,
            json={
                "client_id": SQUARE_APPLICATION_ID,
                "client_secret": SQUARE_APPLICATION_SECRET,
                "code": request.code,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to exchange token: {response.text}"
            )
        
        data = response.json()
        
        return {
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "expires_at": data.get("expires_at"),
            "merchant_id": data.get("merchant_id"),
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/merchant-status/{merchant_id}")
async def get_merchant_status(merchant_id: str, access_token: str):
    """
    Get merchant information using access token
    """
    try:
        # Create a client with the merchant's access token
        merchant_client = Square(
            token=access_token,
            environment=SQUARE_ENV
        )
        
        # Get merchant information
        result = merchant_client.merchants.list_merchants()
        
        if result.is_success():
            merchants = result.body.get("merchant", [])
            if merchants:
                merchant = merchants[0] if isinstance(merchants, list) else merchants
                return MerchantStatusResponse(
                    merchant_id=merchant_id,
                    business_name=merchant.get("business_name"),
                    is_active=merchant.get("status") == "ACTIVE",
                    has_access_token=True
                )
            else:
                return MerchantStatusResponse(
                    merchant_id=merchant_id,
                    business_name=None,
                    is_active=False,
                    has_access_token=True
                )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.errors
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh-token")
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh an expired access token
    """
    try:
        import httpx
        
        response = httpx.post(
            SQUARE_TOKEN_URL,
            json={
                "client_id": SQUARE_APPLICATION_ID,
                "client_secret": SQUARE_APPLICATION_SECRET,
                "refresh_token": request.refresh_token,
                "grant_type": "refresh_token",
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to refresh token: {response.text}"
            )
        
        data = response.json()
        
        return {
            "access_token": data.get("access_token"),
            "expires_at": data.get("expires_at"),
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class RevokeTokenRequest(BaseModel):
    access_token: str

@router.post("/revoke-token")
async def revoke_access_token(request: RevokeTokenRequest):
    """
    Revoke a merchant's access token (disconnect)
    """
    try:
        import httpx
        
        revoke_url = (
            "https://connect.squareupsandbox.com/oauth2/revoke"
            if SQUARE_ENVIRONMENT == "sandbox"
            else "https://connect.squareup.com/oauth2/revoke"
        )
        
        response = httpx.post(
            revoke_url,
            json={
                "client_id": SQUARE_APPLICATION_ID,
                "access_token": request.access_token,
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return {"success": True, "revoked": True}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to revoke token: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/test-connection")
async def test_square_connection():
    """
    Test Square API connection with configured credentials
    """
    try:
        # Test the connection by listing locations
        result = square_client.locations.list()
        
        return {
            "success": True,
            "environment": SQUARE_ENV_STR,
            "message": "Square API connection successful",
            "locations": result.locations if hasattr(result, 'locations') else []
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
