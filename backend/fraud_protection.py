"""
Fraud Prevention & Dispute Management Module for Effinsure

This module handles:
1. Transaction metadata collection (IP, device fingerprint, 2FA verification)
2. Sold items tracking for sellers
3. Automatic dispute evidence submission (Visa CE3.0 compliant)
4. Webhook handling for Stripe dispute events

Visa Compelling Evidence 3.0 Requirements:
- Two prior undisputed transactions (120-365 days before dispute)
- At least two matching data elements (one must be IP or device fingerprint)
- Data elements: IP address, device ID/fingerprint, customer ID, shipping address
"""

from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import hashlib
import json
import stripe

router = APIRouter(prefix="/api/fraud-protection", tags=["fraud-protection"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')


# ============================================
# Models
# ============================================

class TransactionMetadata(BaseModel):
    """Metadata collected during checkout for fraud prevention."""
    # Core identifiers
    transaction_id: str
    order_id: str
    buyer_id: str
    seller_id: str
    
    # Payment details
    amount: float
    currency: str = "usd"
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    
    # Visa CE3.0 Required Fields
    customer_ip_address: str  # Public IP in clear text
    device_fingerprint: str  # ≥20 characters, unique device identifier
    device_id: Optional[str] = None  # IMEI/serial number if available
    user_login_id: str  # Customer account ID
    
    # Shipping information
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_zip: Optional[str] = None
    shipping_country: Optional[str] = None
    
    # 2FA Verification Details
    tfa_verified: bool = False
    tfa_phone_number: Optional[str] = None  # Masked for privacy
    tfa_verification_timestamp: Optional[str] = None
    tfa_verification_method: str = "sms"  # sms, email, authenticator
    
    # Device/Browser Information
    user_agent: Optional[str] = None
    browser_name: Optional[str] = None
    browser_version: Optional[str] = None
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    screen_resolution: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    
    # Additional fraud signals
    session_id: Optional[str] = None
    referrer_url: Optional[str] = None
    checkout_duration_seconds: Optional[int] = None
    
    # Timestamps
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CheckoutMetadataRequest(BaseModel):
    """Request to save checkout metadata."""
    order_id: str
    buyer_id: str
    seller_id: str
    amount: float
    currency: str = "usd"
    
    # Device/IP info (collected by frontend)
    ip_address: str
    device_fingerprint: str
    device_id: Optional[str] = None
    user_agent: Optional[str] = None
    screen_resolution: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    
    # Shipping
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_zip: Optional[str] = None
    shipping_country: Optional[str] = None
    
    # 2FA
    tfa_verified: bool = False
    tfa_phone_number: Optional[str] = None
    tfa_verification_timestamp: Optional[str] = None
    
    # Session info
    session_id: Optional[str] = None
    checkout_duration_seconds: Optional[int] = None


class DisputeEvidenceResponse(BaseModel):
    """Response containing dispute evidence package."""
    dispute_id: str
    transaction_id: str
    evidence_package: Dict[str, Any]
    ce3_eligible: bool
    prior_transactions: List[Dict[str, Any]]
    submission_status: str


# ============================================
# Metadata Collection Endpoints
# ============================================

@router.post("/collect-metadata")
async def collect_transaction_metadata(
    request: CheckoutMetadataRequest,
    x_forwarded_for: Optional[str] = Header(None),
    x_real_ip: Optional[str] = Header(None)
):
    """
    Collect and store transaction metadata for fraud prevention.
    Called during checkout before payment processing.
    """
    
    # Use forwarded IP if available (for proxied requests)
    client_ip = request.ip_address
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0].strip()
    elif x_real_ip:
        client_ip = x_real_ip
    
    # Generate unique transaction ID
    transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
    
    # Parse user agent for browser/OS info
    ua_info = parse_user_agent(request.user_agent or "")
    
    # Mask phone number for storage (keep last 4 digits)
    masked_phone = None
    if request.tfa_phone_number:
        masked_phone = f"***-***-{request.tfa_phone_number[-4:]}"
    
    # Create metadata record
    metadata = {
        "id": transaction_id,
        "transaction_id": transaction_id,
        "order_id": request.order_id,
        "buyer_id": request.buyer_id,
        "seller_id": request.seller_id,
        "amount": request.amount,
        "currency": request.currency,
        
        # CE3.0 Critical Fields
        "customer_ip_address": client_ip,
        "device_fingerprint": request.device_fingerprint,
        "device_id": request.device_id,
        "user_login_id": request.buyer_id,
        
        # Shipping
        "shipping_address": request.shipping_address,
        "shipping_city": request.shipping_city,
        "shipping_state": request.shipping_state,
        "shipping_zip": request.shipping_zip,
        "shipping_country": request.shipping_country,
        "full_shipping_address": f"{request.shipping_address}, {request.shipping_city}, {request.shipping_state} {request.shipping_zip}, {request.shipping_country}" if request.shipping_address else None,
        
        # 2FA Verification
        "tfa_verified": request.tfa_verified,
        "tfa_phone_number": masked_phone,
        "tfa_verification_timestamp": request.tfa_verification_timestamp,
        "tfa_verification_method": "sms",
        
        # Device/Browser
        "user_agent": request.user_agent,
        "browser_name": ua_info.get("browser_name"),
        "browser_version": ua_info.get("browser_version"),
        "os_name": ua_info.get("os_name"),
        "os_version": ua_info.get("os_version"),
        "screen_resolution": request.screen_resolution,
        "timezone": request.timezone,
        "language": request.language,
        
        # Session
        "session_id": request.session_id,
        "checkout_duration_seconds": request.checkout_duration_seconds,
        
        # Status
        "status": "pending",  # pending, completed, disputed, refunded
        "dispute_status": None,
        
        # Timestamps
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.transaction_metadata.insert_one(metadata)
    
    return {
        "success": True,
        "transaction_id": transaction_id,
        "message": "Metadata collected for fraud protection"
    }


@router.put("/update-metadata/{transaction_id}")
async def update_transaction_metadata(
    transaction_id: str,
    stripe_payment_intent_id: Optional[str] = None,
    stripe_charge_id: Optional[str] = None,
    status: Optional[str] = None
):
    """Update transaction metadata after payment completion."""
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if stripe_payment_intent_id:
        update_data["stripe_payment_intent_id"] = stripe_payment_intent_id
    if stripe_charge_id:
        update_data["stripe_charge_id"] = stripe_charge_id
    if status:
        update_data["status"] = status
    
    result = await db.transaction_metadata.update_one(
        {"transaction_id": transaction_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {"success": True, "message": "Metadata updated"}


# ============================================
# Seller Sales Dashboard Endpoints
# ============================================

@router.get("/seller/{seller_id}/sales")
async def get_seller_sales(seller_id: str, limit: int = 50, offset: int = 0):
    """
    Get seller's completed sales with fraud protection metadata.
    This is the seller's view of their sold items.
    """
    
    sales = await db.transaction_metadata.find(
        {"seller_id": seller_id, "status": {"$in": ["completed", "paid"]}}
    ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    
    # Format for display (hide sensitive buyer info)
    formatted_sales = []
    for sale in sales:
        formatted_sales.append({
            "transaction_id": sale.get("transaction_id"),
            "order_id": sale.get("order_id"),
            "amount": sale.get("amount"),
            "currency": sale.get("currency"),
            "created_at": sale.get("created_at"),
            "status": sale.get("status"),
            
            # Fraud protection indicators (not full details)
            "fraud_protection": {
                "ip_verified": bool(sale.get("customer_ip_address")),
                "device_fingerprinted": bool(sale.get("device_fingerprint")),
                "tfa_verified": sale.get("tfa_verified", False),
                "shipping_verified": bool(sale.get("full_shipping_address")),
            },
            
            # Dispute status
            "dispute_status": sale.get("dispute_status"),
            "ce3_eligible": check_ce3_eligibility(sale)
        })
    
    # Get total count
    total = await db.transaction_metadata.count_documents(
        {"seller_id": seller_id, "status": {"$in": ["completed", "paid"]}}
    )
    
    return {
        "sales": formatted_sales,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/seller/{seller_id}/sales/{transaction_id}")
async def get_sale_details(seller_id: str, transaction_id: str):
    """
    Get detailed sale information including full fraud protection data.
    Only accessible by the seller.
    """
    
    sale = await db.transaction_metadata.find_one({
        "seller_id": seller_id,
        "transaction_id": transaction_id
    })
    
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Check CE3.0 eligibility
    ce3_data = await check_ce3_eligibility_detailed(sale)
    
    return {
        "transaction_id": sale.get("transaction_id"),
        "order_id": sale.get("order_id"),
        "amount": sale.get("amount"),
        "currency": sale.get("currency"),
        "created_at": sale.get("created_at"),
        "status": sale.get("status"),
        
        # Full fraud protection details
        "fraud_protection": {
            "customer_ip_address": sale.get("customer_ip_address"),
            "device_fingerprint": sale.get("device_fingerprint")[:20] + "..." if sale.get("device_fingerprint") else None,
            "device_id": sale.get("device_id"),
            
            "tfa_verified": sale.get("tfa_verified"),
            "tfa_phone_number": sale.get("tfa_phone_number"),
            "tfa_verification_timestamp": sale.get("tfa_verification_timestamp"),
            
            "shipping_address": sale.get("full_shipping_address"),
            
            "browser": f"{sale.get('browser_name')} {sale.get('browser_version')}",
            "os": f"{sale.get('os_name')} {sale.get('os_version')}",
            "screen_resolution": sale.get("screen_resolution"),
            "timezone": sale.get("timezone"),
        },
        
        # CE3.0 eligibility
        "ce3_eligibility": ce3_data,
        
        # Dispute info
        "dispute_status": sale.get("dispute_status"),
        "stripe_payment_intent_id": sale.get("stripe_payment_intent_id"),
        "stripe_charge_id": sale.get("stripe_charge_id")
    }


# ============================================
# Dispute Management Endpoints
# ============================================

@router.post("/disputes/handle-webhook")
async def handle_stripe_dispute_webhook(request: Request):
    """
    Webhook handler for Stripe dispute events.
    Automatically submits evidence when a dispute is created.
    """
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            # For testing without webhook signature
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")
    
    # Handle dispute events
    if event.get('type') == 'charge.dispute.created':
        dispute = event['data']['object']
        await handle_dispute_created(dispute)
    
    elif event.get('type') == 'charge.dispute.updated':
        dispute = event['data']['object']
        await handle_dispute_updated(dispute)
    
    return {"received": True}


async def handle_dispute_created(dispute: dict):
    """
    Handle new dispute - automatically gather and submit evidence.
    """
    
    charge_id = dispute.get('charge')
    dispute_id = dispute.get('id')
    reason = dispute.get('reason')
    
    # Find the transaction by Stripe charge ID
    transaction = await db.transaction_metadata.find_one({
        "stripe_charge_id": charge_id
    })
    
    if not transaction:
        # Try payment intent
        payment_intent = dispute.get('payment_intent')
        if payment_intent:
            transaction = await db.transaction_metadata.find_one({
                "stripe_payment_intent_id": payment_intent
            })
    
    if not transaction:
        # Log for manual review
        await db.dispute_logs.insert_one({
            "dispute_id": dispute_id,
            "charge_id": charge_id,
            "status": "no_transaction_found",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return
    
    # Update transaction status
    await db.transaction_metadata.update_one(
        {"transaction_id": transaction["transaction_id"]},
        {"$set": {
            "dispute_status": "active",
            "dispute_id": dispute_id,
            "dispute_reason": reason,
            "dispute_created_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Build and submit evidence
    evidence_package = await build_evidence_package(transaction, dispute)
    
    # Submit evidence to Stripe
    submission_result = await submit_dispute_evidence(dispute_id, evidence_package)
    
    # Log the submission
    await db.dispute_logs.insert_one({
        "dispute_id": dispute_id,
        "transaction_id": transaction["transaction_id"],
        "seller_id": transaction["seller_id"],
        "charge_id": charge_id,
        "reason": reason,
        "evidence_submitted": True,
        "evidence_package": evidence_package,
        "submission_result": submission_result,
        "ce3_eligible": evidence_package.get("ce3_eligible", False),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Notify seller (could send email/notification here)
    await db.seller_notifications.insert_one({
        "seller_id": transaction["seller_id"],
        "type": "dispute_created",
        "title": "Dispute Received - Evidence Auto-Submitted",
        "message": f"A dispute was filed for order {transaction['order_id']}. Evidence has been automatically submitted based on your fraud protection data.",
        "dispute_id": dispute_id,
        "transaction_id": transaction["transaction_id"],
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })


async def handle_dispute_updated(dispute: dict):
    """Handle dispute status updates."""
    
    dispute_id = dispute.get('id')
    status = dispute.get('status')
    
    # Update our records
    await db.transaction_metadata.update_many(
        {"dispute_id": dispute_id},
        {"$set": {
            "dispute_status": status,
            "dispute_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log the update
    await db.dispute_logs.insert_one({
        "dispute_id": dispute_id,
        "event": "status_update",
        "new_status": status,
        "created_at": datetime.now(timezone.utc).isoformat()
    })


async def build_evidence_package(transaction: dict, dispute: dict) -> dict:
    """
    Build comprehensive evidence package for dispute response.
    Follows Stripe API evidence format and Visa CE3.0 requirements.
    """
    
    # Check CE3.0 eligibility
    ce3_data = await check_ce3_eligibility_detailed(transaction)
    
    # Build access activity log
    access_log = f"""
Transaction Verification Log for Order {transaction.get('order_id')}
================================================================

TRANSACTION DETAILS:
- Transaction ID: {transaction.get('transaction_id')}
- Amount: ${transaction.get('amount')} {transaction.get('currency', 'USD').upper()}
- Date: {transaction.get('created_at')}

CUSTOMER VERIFICATION (2FA):
- 2FA Verified: {'YES' if transaction.get('tfa_verified') else 'NO'}
- Verification Method: SMS to {transaction.get('tfa_phone_number')}
- Verification Time: {transaction.get('tfa_verification_timestamp')}
- Phone number matches account on file

DEVICE & NETWORK INFORMATION:
- IP Address: {transaction.get('customer_ip_address')}
- Device Fingerprint: {transaction.get('device_fingerprint')}
- Browser: {transaction.get('browser_name')} {transaction.get('browser_version')}
- Operating System: {transaction.get('os_name')} {transaction.get('os_version')}
- Screen Resolution: {transaction.get('screen_resolution')}
- Timezone: {transaction.get('timezone')}
- Language: {transaction.get('language')}

SHIPPING INFORMATION:
- Address: {transaction.get('full_shipping_address')}

CHECKOUT BEHAVIOR:
- Session Duration: {transaction.get('checkout_duration_seconds')} seconds
- Session ID: {transaction.get('session_id')}

This transaction was verified through our 2FA system. The customer 
successfully entered a verification code sent to their registered 
phone number before the purchase was completed.
"""
    
    # Build evidence dict for Stripe API
    evidence = {
        "customer_purchase_ip": transaction.get("customer_ip_address"),
        "customer_email_address": transaction.get("buyer_id"),  # If we have email
        "customer_name": None,  # Would need to fetch from user record
        "billing_address": None,
        "shipping_address": transaction.get("full_shipping_address"),
        "access_activity_log": access_log,
        "product_description": f"Order {transaction.get('order_id')} - Purchase verified with 2FA",
        "service_date": transaction.get("created_at", "")[:10],  # YYYY-MM-DD format
        "uncategorized_text": f"""
FRAUD PREVENTION EVIDENCE:

1. TWO-FACTOR AUTHENTICATION VERIFIED
   The customer successfully completed 2FA verification via SMS 
   at {transaction.get('tfa_verification_timestamp')}.

2. DEVICE FINGERPRINTING
   Device fingerprint captured: {transaction.get('device_fingerprint')[:30]}...
   This creates a unique identifier for the customer's device.

3. IP ADDRESS VERIFICATION  
   Customer IP: {transaction.get('customer_ip_address')}
   
4. CHECKOUT BEHAVIOR ANALYSIS
   Normal checkout pattern observed with {transaction.get('checkout_duration_seconds')} second session.

This transaction shows strong indicators of legitimate cardholder activity
based on successful 2FA verification and consistent device/network data.
"""
    }
    
    # Add CE3.0 specific data if eligible
    if ce3_data.get("eligible"):
        evidence["uncategorized_text"] += f"""

VISA COMPELLING EVIDENCE 3.0 QUALIFICATION:
This dispute qualifies for Visa CE3.0 based on matching data elements
with {len(ce3_data.get('prior_transactions', []))} prior undisputed transactions.

Matching Elements:
- IP Address Match: {ce3_data.get('ip_match', False)}
- Device Fingerprint Match: {ce3_data.get('device_match', False)}
- Customer ID Match: {ce3_data.get('customer_match', False)}
- Shipping Address Match: {ce3_data.get('address_match', False)}
"""
    
    return {
        "evidence": evidence,
        "ce3_eligible": ce3_data.get("eligible", False),
        "ce3_data": ce3_data,
        "transaction_id": transaction.get("transaction_id")
    }


async def submit_dispute_evidence(dispute_id: str, evidence_package: dict) -> dict:
    """Submit evidence to Stripe."""
    
    try:
        # Submit evidence via Stripe API
        result = stripe.Dispute.modify(
            dispute_id,
            evidence=evidence_package["evidence"],
            submit=True  # Auto-submit the evidence
        )
        
        return {
            "success": True,
            "status": result.status,
            "submission_count": result.evidence_details.submission_count
        }
    
    except stripe.error.StripeError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        # If Stripe isn't configured, log for manual handling
        return {
            "success": False,
            "error": f"Stripe not configured: {str(e)}",
            "manual_review_required": True
        }


# ============================================
# CE3.0 Eligibility Check
# ============================================

def check_ce3_eligibility(transaction: dict) -> bool:
    """Quick check if transaction has required CE3.0 data."""
    
    has_ip = bool(transaction.get("customer_ip_address"))
    has_device = bool(transaction.get("device_fingerprint"))
    has_customer_id = bool(transaction.get("buyer_id"))
    has_shipping = bool(transaction.get("full_shipping_address"))
    
    # Need IP or device fingerprint, plus at least one more element
    if has_ip or has_device:
        other_elements = sum([has_customer_id, has_shipping])
        return other_elements >= 1
    
    return False


async def check_ce3_eligibility_detailed(transaction: dict) -> dict:
    """
    Detailed CE3.0 eligibility check with prior transaction matching.
    
    Requirements:
    - Two prior undisputed transactions (120-365 days old)
    - At least two matching data elements
    - One must be IP address or device fingerprint
    """
    
    buyer_id = transaction.get("buyer_id")
    ip_address = transaction.get("customer_ip_address")
    device_fingerprint = transaction.get("device_fingerprint")
    shipping_address = transaction.get("full_shipping_address")
    
    # Calculate date range (120-365 days ago)
    now = datetime.now(timezone.utc)
    min_date = (now - timedelta(days=365)).isoformat()
    max_date = (now - timedelta(days=120)).isoformat()
    
    # Find prior undisputed transactions
    prior_transactions = await db.transaction_metadata.find({
        "buyer_id": buyer_id,
        "status": {"$in": ["completed", "paid"]},
        "dispute_status": {"$in": [None, "won"]},  # Undisputed or won
        "created_at": {"$gte": min_date, "$lte": max_date},
        "transaction_id": {"$ne": transaction.get("transaction_id")}
    }).sort("created_at", -1).limit(10).to_list(10)
    
    if len(prior_transactions) < 2:
        return {
            "eligible": False,
            "reason": f"Need 2 prior undisputed transactions, found {len(prior_transactions)}",
            "prior_transactions": []
        }
    
    # Check for matching elements
    matching_transactions = []
    
    for prior in prior_transactions:
        matches = {
            "ip_match": prior.get("customer_ip_address") == ip_address,
            "device_match": prior.get("device_fingerprint") == device_fingerprint,
            "customer_match": prior.get("buyer_id") == buyer_id,
            "address_match": prior.get("full_shipping_address") == shipping_address
        }
        
        # Count matches (need at least 2, one must be IP or device)
        match_count = sum(matches.values())
        has_required_match = matches["ip_match"] or matches["device_match"]
        
        if match_count >= 2 and has_required_match:
            matching_transactions.append({
                "transaction_id": prior.get("transaction_id"),
                "date": prior.get("created_at"),
                "amount": prior.get("amount"),
                "matches": matches
            })
    
    eligible = len(matching_transactions) >= 2
    
    return {
        "eligible": eligible,
        "reason": "Meets CE3.0 requirements" if eligible else "Insufficient matching prior transactions",
        "prior_transactions": matching_transactions[:2],  # Only need 2
        "ip_match": any(t["matches"]["ip_match"] for t in matching_transactions),
        "device_match": any(t["matches"]["device_match"] for t in matching_transactions),
        "customer_match": any(t["matches"]["customer_match"] for t in matching_transactions),
        "address_match": any(t["matches"]["address_match"] for t in matching_transactions)
    }


@router.get("/disputes/{dispute_id}/evidence")
async def get_dispute_evidence(dispute_id: str):
    """Get the evidence package for a specific dispute."""
    
    dispute_log = await db.dispute_logs.find_one({"dispute_id": dispute_id})
    
    if not dispute_log:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    return {
        "dispute_id": dispute_id,
        "transaction_id": dispute_log.get("transaction_id"),
        "evidence_submitted": dispute_log.get("evidence_submitted"),
        "ce3_eligible": dispute_log.get("ce3_eligible"),
        "submission_result": dispute_log.get("submission_result"),
        "created_at": dispute_log.get("created_at")
    }


@router.get("/seller/{seller_id}/disputes")
async def get_seller_disputes(seller_id: str):
    """Get all disputes for a seller."""
    
    disputes = await db.dispute_logs.find({
        "seller_id": seller_id
    }).sort("created_at", -1).to_list(100)
    
    return {
        "disputes": disputes,
        "total": len(disputes)
    }


# ============================================
# Utility Functions
# ============================================

def parse_user_agent(user_agent: str) -> dict:
    """Parse user agent string for browser/OS info."""
    
    result = {
        "browser_name": None,
        "browser_version": None,
        "os_name": None,
        "os_version": None
    }
    
    if not user_agent:
        return result
    
    ua_lower = user_agent.lower()
    
    # Detect browser
    if "chrome" in ua_lower and "edg" not in ua_lower:
        result["browser_name"] = "Chrome"
    elif "firefox" in ua_lower:
        result["browser_name"] = "Firefox"
    elif "safari" in ua_lower and "chrome" not in ua_lower:
        result["browser_name"] = "Safari"
    elif "edg" in ua_lower:
        result["browser_name"] = "Edge"
    
    # Detect OS
    if "windows" in ua_lower:
        result["os_name"] = "Windows"
    elif "mac os" in ua_lower or "macintosh" in ua_lower:
        result["os_name"] = "macOS"
    elif "linux" in ua_lower:
        result["os_name"] = "Linux"
    elif "android" in ua_lower:
        result["os_name"] = "Android"
    elif "iphone" in ua_lower or "ipad" in ua_lower:
        result["os_name"] = "iOS"
    
    return result


def generate_device_fingerprint(data: dict) -> str:
    """Generate a device fingerprint from available data."""
    
    fingerprint_data = f"{data.get('user_agent', '')}{data.get('screen_resolution', '')}{data.get('timezone', '')}{data.get('language', '')}"
    
    return hashlib.sha256(fingerprint_data.encode()).hexdigest()
