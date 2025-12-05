from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/stripe-connect", tags=["stripe-connect"])

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class CreateAccountRequest(BaseModel):
    user_id: str
    email: str
    business_type: str = "individual"  # or "company"
    country: str = "US"


class AccountLinkRequest(BaseModel):
    account_id: str
    refresh_url: str
    return_url: str


class AccountStatusResponse(BaseModel):
    account_id: str
    charges_enabled: bool
    payouts_enabled: bool
    details_submitted: bool
    requirements: dict


@router.post("/create-account")
async def create_connected_account(request: CreateAccountRequest):
    """
    Create a Stripe Connect account for a seller and save to user profile
    """
    try:
        account = stripe.Account.create(
            type="express",  # Express accounts are easiest for sellers
            email=request.email,
            country=request.country,
            business_type=request.business_type,
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True},
            },
        )
        
        return {
            "account_id": account.id,
            "user_id": request.user_id,
            "success": True,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-account-link")
async def create_account_link(request: AccountLinkRequest):
    """
    Create an account link for onboarding
    """
    try:
        account_link = stripe.AccountLink.create(
            account=request.account_id,
            refresh_url=request.refresh_url,
            return_url=request.return_url,
            type="account_onboarding",
        )
        
        return {
            "url": account_link.url,
            "success": True,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/account-status/{account_id}")
async def get_account_status(account_id: str):
    """
    Get the status of a connected account
    """
    try:
        account = stripe.Account.retrieve(account_id)
        
        return AccountStatusResponse(
            account_id=account.id,
            charges_enabled=account.charges_enabled,
            payouts_enabled=account.payouts_enabled,
            details_submitted=account.details_submitted,
            requirements={
                "currently_due": account.requirements.currently_due,
                "eventually_due": account.requirements.eventually_due,
                "past_due": account.requirements.past_due,
            }
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/account/{account_id}")
async def delete_account(account_id: str):
    """
    Delete a connected account
    """
    try:
        account = stripe.Account.delete(account_id)
        return {
            "success": True,
            "deleted": account.deleted,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-login-link/{account_id}")
async def create_login_link(account_id: str):
    """
    Create a login link for sellers to access their Stripe dashboard
    """
    try:
        login_link = stripe.Account.create_login_link(account_id)
        
        return {
            "url": login_link.url,
            "success": True,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe Connect webhooks
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # In production, verify webhook signature
    # webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        # For now, just parse the event
        event = stripe.Event.construct_from(
            stripe.util.json.loads(payload), stripe.api_key
        )
        
        # Handle different event types
        if event.type == "account.updated":
            account = event.data.object
            print(f"Account updated: {account.id}")
            # Update database with account status
            
        elif event.type == "account.application.authorized":
            account = event.data.object
            print(f"Account authorized: {account.id}")
            
        elif event.type == "account.application.deauthorized":
            account = event.data.object
            print(f"Account deauthorized: {account.id}")
            
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
