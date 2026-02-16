"""
Admin Module - Dashboard and Management Tools
Provides admin functionality for:
- Viewing all sellers and their status
- Managing suspensions
- Viewing and managing fee invoices
- Fraud prevention management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ============================================
# Models
# ============================================

class UpdateSellerStatusRequest(BaseModel):
    user_id: str
    is_suspended: bool
    reason: Optional[str] = None


class MarkInvoicePaidRequest(BaseModel):
    invoice_id: str


# ============================================
# Dashboard Stats
# ============================================

@router.get("/dashboard-stats")
async def get_admin_dashboard_stats():
    """Get overview statistics for admin dashboard."""
    
    # Total sellers
    total_sellers = await db.users.count_documents({"id": {"$regex": "^user_"}})
    
    # Suspended sellers
    suspended_sellers = await db.users.count_documents({"is_suspended": True})
    
    # Active sellers (has any payment processor connected)
    active_sellers = await db.users.count_documents({
        "$or": [
            {"stripe_connected": True},
            {"stripeConnected": True},
            {"square_connected": True},
            {"squareConnected": True},
            {"paypal_connected": True},
            {"paypalConnected": True},
            {"authorizenet_connected": True},
            {"nmi_connected": True},
            {"braintree_connected": True},
            {"adyen_connected": True},
            {"worldpay_connected": True},
            {"checkoutcom_connected": True}
        ]
    })
    
    # Total unpaid fees
    unpaid_invoices = await db.fee_invoices.find({"paid": False}).to_list(1000)
    total_unpaid_fees = sum(inv.get("amount", 0) for inv in unpaid_invoices)
    
    # Total collected fees (from fee_charges)
    paid_charges = await db.fee_charges.find({"status": "succeeded"}).to_list(10000)
    total_collected_fees = sum(ch.get("amount", 0) for ch in paid_charges)
    
    # Platform sales (all time)
    all_payments = await db.payments.find({"status": {"$in": ["succeeded", "completed", "paid"]}}).to_list(100000)
    total_platform_sales = sum(p.get("amount", 0) for p in all_payments)
    
    # Blocked identifiers count
    blocked_count = await db.blocked_identifiers.count_documents({"active": True})
    
    # Recent activity - last 7 days
    from datetime import timedelta
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent_sales = await db.payments.count_documents({
        "status": {"$in": ["succeeded", "completed", "paid"]},
        "created_at": {"$gte": seven_days_ago}
    })
    
    return {
        "sellers": {
            "total": total_sellers,
            "active": active_sellers,
            "suspended": suspended_sellers
        },
        "fees": {
            "total_unpaid": round(total_unpaid_fees, 2),
            "total_collected": round(total_collected_fees, 2),
            "unpaid_invoices_count": len(unpaid_invoices)
        },
        "platform": {
            "total_sales": round(total_platform_sales, 2),
            "recent_transactions": recent_sales
        },
        "fraud_prevention": {
            "blocked_identifiers": blocked_count
        }
    }


# ============================================
# Seller Management
# ============================================

@router.get("/sellers")
async def get_all_sellers(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,  # "all", "active", "suspended"
    search: Optional[str] = None
):
    """Get all sellers with their status and stats."""
    
    query = {"id": {"$regex": "^user_"}}
    
    if status == "suspended":
        query["is_suspended"] = True
    elif status == "active":
        query["is_suspended"] = {"$ne": True}
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"id": {"$regex": search, "$options": "i"}}
        ]
    
    sellers = await db.users.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    # Enrich with sales data
    enriched_sellers = []
    for seller in sellers:
        # Get sales stats
        payments = await db.payments.find({
            "seller_id": seller["id"],
            "status": {"$in": ["succeeded", "completed", "paid"]}
        }).to_list(10000)
        
        total_sales = sum(p.get("amount", 0) for p in payments)
        
        # Get pending fees
        pending_fees = await db.fee_invoices.find({
            "seller_id": seller["id"],
            "paid": False
        }).to_list(100)
        
        total_pending = sum(f.get("amount", 0) for f in pending_fees)
        
        # Determine connected processors
        processors = []
        if seller.get("stripe_connected") or seller.get("stripeConnected"):
            processors.append("Stripe")
        if seller.get("square_connected") or seller.get("squareConnected"):
            processors.append("Square")
        if seller.get("paypal_connected") or seller.get("paypalConnected"):
            processors.append("PayPal")
        if seller.get("authorizenet_connected"):
            processors.append("Authorize.net")
        if seller.get("nmi_connected"):
            processors.append("NMI")
        if seller.get("braintree_connected"):
            processors.append("Braintree")
        if seller.get("adyen_connected"):
            processors.append("Adyen")
        if seller.get("worldpay_connected"):
            processors.append("WorldPay")
        if seller.get("checkoutcom_connected"):
            processors.append("Checkout.com")
        
        enriched_sellers.append({
            "id": seller.get("id"),
            "email": seller.get("email"),
            "phone": seller.get("phone"),
            "name": seller.get("name"),
            "is_suspended": seller.get("is_suspended", False),
            "suspension_reason": seller.get("suspension_reason"),
            "total_sales": round(total_sales, 2),
            "pending_fees": round(total_pending, 2),
            "processors": processors,
            "auto_charge_enabled": seller.get("billing_auto_charge_enabled", False),
            "created_at": seller.get("created_at"),
            "identifiers_blocked": seller.get("identifiers_blocked", False)
        })
    
    return {
        "sellers": enriched_sellers,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/sellers/{user_id}")
async def get_seller_detail(user_id: str):
    """Get detailed information about a specific seller."""
    
    seller = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Get all payments
    payments = await db.payments.find(
        {"seller_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(100).to_list(100)
    
    # Get all fee invoices
    invoices = await db.fee_invoices.find(
        {"seller_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get fee charges
    charges = await db.fee_charges.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get blocked identifiers
    blocked = await db.blocked_identifiers.find(
        {"original_user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "seller": seller,
        "payments": payments,
        "invoices": invoices,
        "fee_charges": charges,
        "blocked_identifiers": blocked
    }


@router.post("/sellers/update-status")
async def update_seller_status(request: UpdateSellerStatusRequest):
    """Manually suspend or unsuspend a seller."""
    from fraud_prevention import block_user_identifiers, unblock_user_identifiers
    
    update_data = {
        "is_suspended": request.is_suspended,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if request.is_suspended:
        update_data["suspension_reason"] = request.reason or "manual_admin_action"
        # Block identifiers
        await block_user_identifiers(request.user_id, request.reason or "manual_admin_action")
    else:
        update_data["suspension_reason"] = None
        # Unblock identifiers
        await unblock_user_identifiers(request.user_id)
    
    result = await db.users.update_one(
        {"id": request.user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    return {
        "success": True,
        "user_id": request.user_id,
        "is_suspended": request.is_suspended
    }


# ============================================
# Invoice Management
# ============================================

@router.get("/invoices")
async def get_all_invoices(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,  # "all", "paid", "unpaid", "past_due"
    seller_id: Optional[str] = None
):
    """Get all fee invoices."""
    
    query = {}
    
    if status == "paid":
        query["paid"] = True
    elif status == "unpaid":
        query["paid"] = False
    elif status == "past_due":
        query["paid"] = False
        # Past due logic would need date comparison
    
    if seller_id:
        query["seller_id"] = seller_id
    
    invoices = await db.fee_invoices.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.fee_invoices.count_documents(query)
    
    # Enrich with seller info
    enriched = []
    for inv in invoices:
        seller = await db.users.find_one({"id": inv.get("seller_id")}, {"_id": 0, "email": 1, "phone": 1})
        enriched.append({
            **inv,
            "seller_email": seller.get("email") if seller else None,
            "seller_phone": seller.get("phone") if seller else None
        })
    
    return {
        "invoices": enriched,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/invoices/mark-paid")
async def mark_invoice_paid(request: MarkInvoicePaidRequest):
    """Mark an invoice as paid manually."""
    from fraud_prevention import unblock_user_identifiers
    
    invoice = await db.fee_invoices.find_one({"id": request.invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await db.fee_invoices.update_one(
        {"id": request.invoice_id},
        {"$set": {
            "paid": True,
            "paid_at": datetime.now(timezone.utc).isoformat(),
            "paid_method": "manual_admin"
        }}
    )
    
    # Check if seller should be unsuspended
    seller_id = invoice["seller_id"]
    remaining_unpaid = await db.fee_invoices.count_documents({
        "seller_id": seller_id,
        "paid": False
    })
    
    unsuspended = False
    if remaining_unpaid == 0:
        await db.users.update_one(
            {"id": seller_id},
            {"$set": {
                "is_suspended": False,
                "suspension_reason": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        await unblock_user_identifiers(seller_id)
        unsuspended = True
    
    return {
        "success": True,
        "invoice_id": request.invoice_id,
        "seller_unsuspended": unsuspended
    }


# ============================================
# Fraud Prevention Management
# ============================================

@router.get("/blocked-identifiers")
async def get_blocked_identifiers(
    skip: int = 0,
    limit: int = 50,
    identifier_type: Optional[str] = None  # "phone", "email", "card_fingerprint"
):
    """Get all blocked identifiers."""
    
    query = {"active": True}
    if identifier_type:
        query["type"] = identifier_type
    
    blocked = await db.blocked_identifiers.find(query, {"_id": 0}).sort("blocked_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.blocked_identifiers.count_documents(query)
    
    return {
        "blocked_identifiers": blocked,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/unblock-identifier/{identifier_id}")
async def unblock_single_identifier(identifier_id: str):
    """Unblock a specific identifier."""
    
    result = await db.blocked_identifiers.update_one(
        {"id": identifier_id},
        {"$set": {
            "active": False,
            "unblocked_at": datetime.now(timezone.utc).isoformat(),
            "unblocked_by": "admin"
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Identifier not found")
    
    return {"success": True}


# ============================================
# Activity Log
# ============================================

@router.get("/recent-activity")
async def get_recent_activity(limit: int = 20):
    """Get recent platform activity."""
    
    activities = []
    
    # Recent payments
    recent_payments = await db.payments.find(
        {"status": {"$in": ["succeeded", "completed", "paid"]}},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    for p in recent_payments:
        activities.append({
            "type": "sale",
            "description": f"Sale of ${p.get('amount', 0):.2f}",
            "seller_id": p.get("seller_id"),
            "timestamp": p.get("created_at"),
            "amount": p.get("amount")
        })
    
    # Recent suspensions
    recent_suspensions = await db.users.find(
        {"is_suspended": True},
        {"_id": 0, "id": 1, "email": 1, "updated_at": 1}
    ).sort("updated_at", -1).limit(5).to_list(5)
    
    for s in recent_suspensions:
        activities.append({
            "type": "suspension",
            "description": f"Account suspended: {s.get('email', s.get('id'))}",
            "seller_id": s.get("id"),
            "timestamp": s.get("updated_at")
        })
    
    # Recent fee payments
    recent_charges = await db.fee_charges.find(
        {"status": "succeeded"},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    for c in recent_charges:
        activities.append({
            "type": "fee_payment",
            "description": f"Fee payment of ${c.get('amount', 0):.2f}",
            "seller_id": c.get("user_id"),
            "timestamp": c.get("created_at"),
            "amount": c.get("amount")
        })
    
    # Sort all by timestamp
    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return {"activities": activities[:limit]}
