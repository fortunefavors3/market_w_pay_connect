"""
Fraud Prevention Module for Effinsure

Prevents suspended sellers from creating new accounts by tracking:
1. Phone numbers
2. Email addresses  
3. Payment card fingerprints (last4 + exp_month + exp_year + brand)

When a user is suspended for unpaid fees, their identifiers are added to a blocklist.
New account registrations and payment method additions are checked against this blocklist.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hashlib

router = APIRouter(prefix="/api/fraud-prevention", tags=["fraud-prevention"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ============================================
# Models
# ============================================

class CheckIdentifiersRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None


class CheckCardRequest(BaseModel):
    card_fingerprint: str  # hash of last4+exp_month+exp_year+brand


class BlockIdentifiersRequest(BaseModel):
    user_id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    reason: str = "account_suspended"


class BlockCardRequest(BaseModel):
    user_id: str
    last4: str
    exp_month: int
    exp_year: int
    brand: str
    reason: str = "account_suspended"


# ============================================
# Helper Functions
# ============================================

def normalize_phone(phone: str) -> str:
    """Normalize phone number by removing all non-digit characters."""
    if not phone:
        return ""
    return ''.join(filter(str.isdigit, phone))


def normalize_email(email: str) -> str:
    """Normalize email by lowercasing and stripping whitespace."""
    if not email:
        return ""
    return email.lower().strip()


def create_card_fingerprint(last4: str, exp_month: int, exp_year: int, brand: str) -> str:
    """
    Create a fingerprint hash from card details.
    This allows us to identify the same card across different accounts
    without storing sensitive card data.
    """
    card_string = f"{last4}:{exp_month}:{exp_year}:{brand.lower()}"
    return hashlib.sha256(card_string.encode()).hexdigest()


async def is_identifier_blocked(identifier_type: str, identifier_value: str) -> dict:
    """Check if a specific identifier is blocked."""
    if not identifier_value:
        return {"blocked": False}
    
    # Normalize the value
    if identifier_type == "phone":
        identifier_value = normalize_phone(identifier_value)
    elif identifier_type == "email":
        identifier_value = normalize_email(identifier_value)
    
    blocked = await db.blocked_identifiers.find_one({
        "type": identifier_type,
        "value": identifier_value,
        "active": True
    }, {"_id": 0})
    
    if blocked:
        return {
            "blocked": True,
            "reason": blocked.get("reason"),
            "blocked_at": blocked.get("blocked_at"),
            "original_user_id": blocked.get("original_user_id")
        }
    
    return {"blocked": False}


async def block_user_identifiers(user_id: str, reason: str = "account_suspended"):
    """
    Block all identifiers associated with a user.
    Called when a user is suspended for unpaid fees.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user:
        return {"success": False, "error": "User not found"}
    
    blocked_count = 0
    now = datetime.now(timezone.utc).isoformat()
    
    # Block phone number
    phone = user.get("phone")
    if phone:
        normalized_phone = normalize_phone(phone)
        await db.blocked_identifiers.update_one(
            {"type": "phone", "value": normalized_phone},
            {
                "$set": {
                    "type": "phone",
                    "value": normalized_phone,
                    "original_value": phone,
                    "original_user_id": user_id,
                    "reason": reason,
                    "blocked_at": now,
                    "active": True
                }
            },
            upsert=True
        )
        blocked_count += 1
    
    # Block email
    email = user.get("email")
    if email:
        normalized_email = normalize_email(email)
        await db.blocked_identifiers.update_one(
            {"type": "email", "value": normalized_email},
            {
                "$set": {
                    "type": "email",
                    "value": normalized_email,
                    "original_value": email,
                    "original_user_id": user_id,
                    "reason": reason,
                    "blocked_at": now,
                    "active": True
                }
            },
            upsert=True
        )
        blocked_count += 1
    
    # Block any saved payment cards
    customer_id = user.get("billing_stripe_customer_id")
    if customer_id:
        try:
            import stripe
            stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
            
            payment_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type="card"
            )
            
            for pm in payment_methods.data:
                fingerprint = create_card_fingerprint(
                    pm.card.last4,
                    pm.card.exp_month,
                    pm.card.exp_year,
                    pm.card.brand
                )
                
                await db.blocked_identifiers.update_one(
                    {"type": "card_fingerprint", "value": fingerprint},
                    {
                        "$set": {
                            "type": "card_fingerprint",
                            "value": fingerprint,
                            "card_last4": pm.card.last4,
                            "card_brand": pm.card.brand,
                            "original_user_id": user_id,
                            "reason": reason,
                            "blocked_at": now,
                            "active": True
                        }
                    },
                    upsert=True
                )
                blocked_count += 1
                
        except Exception as e:
            print(f"Error blocking cards for user {user_id}: {e}")
    
    # Mark user as having blocked identifiers
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"identifiers_blocked": True, "identifiers_blocked_at": now}}
    )
    
    return {"success": True, "blocked_count": blocked_count}


async def unblock_user_identifiers(user_id: str):
    """
    Unblock all identifiers associated with a user.
    Called when a suspended user pays their fees.
    """
    # Deactivate all blocked identifiers for this user
    result = await db.blocked_identifiers.update_many(
        {"original_user_id": user_id},
        {"$set": {"active": False, "unblocked_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update user record
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"identifiers_blocked": False}}
    )
    
    return {"success": True, "unblocked_count": result.modified_count}


# ============================================
# API Endpoints
# ============================================

@router.post("/check-registration")
async def check_registration_eligibility(request: CheckIdentifiersRequest):
    """
    Check if phone/email can be used to register a new account.
    Returns blocked=True if any identifier is associated with a suspended account.
    """
    results = {
        "can_register": True,
        "blocked_identifiers": []
    }
    
    # Check phone
    if request.phone:
        phone_check = await is_identifier_blocked("phone", request.phone)
        if phone_check["blocked"]:
            results["can_register"] = False
            results["blocked_identifiers"].append({
                "type": "phone",
                "reason": phone_check.get("reason")
            })
    
    # Check email
    if request.email:
        email_check = await is_identifier_blocked("email", request.email)
        if email_check["blocked"]:
            results["can_register"] = False
            results["blocked_identifiers"].append({
                "type": "email", 
                "reason": email_check.get("reason")
            })
    
    if not results["can_register"]:
        results["message"] = "This phone number or email is associated with an account that has unpaid platform fees. Please resolve the outstanding balance before creating a new account."
    
    return results


@router.post("/check-card")
async def check_card_eligibility(request: CheckCardRequest):
    """
    Check if a payment card can be added to an account.
    Returns blocked=True if card was previously used by a suspended account.
    """
    card_check = await is_identifier_blocked("card_fingerprint", request.card_fingerprint)
    
    if card_check["blocked"]:
        return {
            "can_use_card": False,
            "message": "This payment card is associated with an account that has unpaid platform fees. Please use a different card or resolve the outstanding balance.",
            "reason": card_check.get("reason")
        }
    
    return {"can_use_card": True}


@router.post("/check-card-details")
async def check_card_details_eligibility(last4: str, exp_month: int, exp_year: int, brand: str):
    """
    Check card eligibility using card details directly.
    Creates fingerprint from provided details and checks blocklist.
    """
    fingerprint = create_card_fingerprint(last4, exp_month, exp_year, brand)
    
    card_check = await is_identifier_blocked("card_fingerprint", fingerprint)
    
    if card_check["blocked"]:
        return {
            "can_use_card": False,
            "fingerprint": fingerprint,
            "message": "This payment card is associated with an account that has unpaid platform fees. Please use a different card or resolve the outstanding balance.",
            "reason": card_check.get("reason")
        }
    
    return {"can_use_card": True, "fingerprint": fingerprint}


@router.post("/block-user")
async def block_user_endpoint(request: BlockIdentifiersRequest):
    """
    Admin endpoint to block all identifiers for a user.
    Typically called automatically when a user is suspended.
    """
    result = await block_user_identifiers(request.user_id, request.reason)
    return result


@router.post("/unblock-user/{user_id}")
async def unblock_user_endpoint(user_id: str):
    """
    Admin endpoint to unblock all identifiers for a user.
    Called when a suspended user pays their outstanding fees.
    """
    result = await unblock_user_identifiers(user_id)
    return result


@router.get("/blocked-list")
async def get_blocked_list(limit: int = 100, skip: int = 0):
    """
    Admin endpoint to view all blocked identifiers.
    """
    blocked = await db.blocked_identifiers.find(
        {"active": True},
        {"_id": 0}
    ).sort("blocked_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.blocked_identifiers.count_documents({"active": True})
    
    return {
        "blocked_identifiers": blocked,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/check-user-status/{user_id}")
async def check_user_block_status(user_id: str):
    """
    Check if a user's identifiers are currently blocked.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user:
        return {"found": False}
    
    blocked_identifiers = await db.blocked_identifiers.find(
        {"original_user_id": user_id, "active": True},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "found": True,
        "identifiers_blocked": user.get("identifiers_blocked", False),
        "blocked_count": len(blocked_identifiers),
        "blocked_identifiers": blocked_identifiers
    }
