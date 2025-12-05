from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import paypalrestsdk
import base64
import uuid

load_dotenv()

router = APIRouter(prefix="/api/paypal-connect", tags=["paypal-connect"])

# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")

# Configure PayPal SDK
paypalrestsdk.configure({
    "mode": PAYPAL_MODE,
    "client_id": PAYPAL_CLIENT_ID,
    "client_secret": PAYPAL_CLIENT_SECRET
})

# OAuth URLs
if PAYPAL_MODE == "live":
    PAYPAL_OAUTH_URL = "https://www.paypal.com/signin/authorize"
    PAYPAL_TOKEN_URL = "https://api-m.paypal.com/v1/oauth2/token"
    PAYPAL_USERINFO_URL = "https://api-m.paypal.com/v1/identity/oauth2/userinfo"
else:
    PAYPAL_OAUTH_URL = "https://www.sandbox.paypal.com/signin/authorize"
    PAYPAL_TOKEN_URL = "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    PAYPAL_USERINFO_URL = "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo"


class InitiateOAuthRequest(BaseModel):
    user_id: str
    redirect_url: str


class OAuthCallbackRequest(BaseModel):
    code: str
    state: str


class MerchantStatusResponse(BaseModel):
    payer_id: str
    email: Optional[str]
    verified: bool
    has_access_token: bool


@router.post("/initiate-oauth")
async def initiate_oauth(request: InitiateOAuthRequest):
    """
    Generate PayPal OAuth authorization URL
    """
    try:
        # Generate a unique state parameter for security
        state = f"{request.user_id}_{uuid.uuid4().hex}"
        
        # Build authorization URL
        scopes = [
            "openid",
            "profile",
            "email",
            "https://uri.paypal.com/services/payments/payment"
        ]
        
        auth_url = (
            f"{PAYPAL_OAUTH_URL}"
            f"?client_id={PAYPAL_CLIENT_ID}"
            f"&response_type=code"
            f"&scope={'+'.join(scopes)}"
            f"&redirect_uri={request.redirect_url}"
            f"&state={state}"
        )
        
        return {
            "authorization_url": auth_url,
            "state": state,
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/exchange-token")
async def exchange_token(request: OAuthCallbackRequest, redirect_url: str):
    """
    Exchange authorization code for access token
    """
    try:
        import httpx
        
        # Prepare basic auth header
        credentials = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        # Exchange code for access token
        response = httpx.post(
            PAYPAL_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": request.code,
                "redirect_uri": redirect_url,
            },
            headers={
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to exchange token: {response.text}"
            )
        
        data = response.json()
        
        # Get user info
        user_info = None
        if data.get("access_token"):
            user_info_response = httpx.get(
                PAYPAL_USERINFO_URL,
                params={"schema": "paypalv1.1"},
                headers={
                    "Authorization": f"Bearer {data['access_token']}",
                    "Content-Type": "application/json"
                }
            )
            if user_info_response.status_code == 200:
                user_info = user_info_response.json()
        
        return {
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "expires_in": data.get("expires_in"),
            "payer_id": user_info.get("payer_id") if user_info else None,
            "email": user_info.get("email") if user_info else None,
            "verified": user_info.get("verified_account") if user_info else False,
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/merchant-status/{payer_id}")
async def get_merchant_status(payer_id: str, access_token: str):
    """
    Get merchant information using access token
    """
    try:
        import httpx
        
        # Get user information
        response = httpx.get(
            PAYPAL_USERINFO_URL,
            params={"schema": "paypalv1.1"},
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            user_info = response.json()
            return MerchantStatusResponse(
                payer_id=user_info.get("payer_id", payer_id),
                email=user_info.get("email"),
                verified=user_info.get("verified_account", False),
                has_access_token=True
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
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
        
        credentials = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        response = httpx.post(
            PAYPAL_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            headers={
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to refresh token: {response.text}"
            )
        
        data = response.json()
        
        return {
            "access_token": data.get("access_token"),
            "expires_in": data.get("expires_in"),
            "success": True,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/test-connection")
async def test_paypal_connection():
    """
    Test PayPal API connection with configured credentials
    """
    try:
        import httpx
        
        # Get an access token to test connection
        credentials = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        response = httpx.post(
            PAYPAL_TOKEN_URL,
            data={"grant_type": "client_credentials"},
            headers={
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        
        if response.status_code == 200:
            return {
                "success": True,
                "mode": PAYPAL_MODE,
                "message": "PayPal API connection successful"
            }
        else:
            return {
                "success": False,
                "error": response.text,
                "message": "Failed to connect to PayPal API"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
