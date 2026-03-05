"""
Checkout Analytics Module
Tracks checkout funnel events to measure:
- Fraud prevention effectiveness (step 2 → step 3 abandonment)
- Conversion rates
- Cart abandonment patterns
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

router = APIRouter(prefix="/api/checkout-analytics", tags=["checkout-analytics"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ============================================
# Models
# ============================================

class CheckoutEventRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    event_type: str  # "checkout_started", "shipping_completed", "payment_entered", "buy_now_clicked", "2fa_shown", "2fa_completed", "2fa_abandoned"
    cart_total: Optional[float] = None
    items_count: Optional[int] = None
    metadata: Optional[dict] = None


# ============================================
# Event Tracking
# ============================================

@router.post("/track-event")
async def track_checkout_event(request: CheckoutEventRequest):
    """Track a checkout funnel event."""
    
    event = {
        "id": f"evt_{uuid.uuid4().hex[:16]}",
        "session_id": request.session_id,
        "user_id": request.user_id,
        "event_type": request.event_type,
        "cart_total": request.cart_total,
        "items_count": request.items_count,
        "metadata": request.metadata or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }
    
    await db.checkout_events.insert_one(event)
    
    # Update session tracking
    await db.checkout_sessions.update_one(
        {"session_id": request.session_id},
        {
            "$set": {
                "last_event": request.event_type,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "user_id": request.user_id,
                "cart_total": request.cart_total
            },
            "$setOnInsert": {
                "session_id": request.session_id,
                "started_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    # Special handling for fraud detection events
    if request.event_type == "2fa_abandoned":
        await db.fraud_prevention_events.insert_one({
            "id": f"fraud_{uuid.uuid4().hex[:16]}",
            "session_id": request.session_id,
            "user_id": request.user_id,
            "event": "checkout_abandoned_at_2fa",
            "cart_total": request.cart_total,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "potential_fraud_value": request.cart_total or 0
        })
    
    return {"success": True, "event_id": event["id"]}


@router.post("/mark-session-abandoned")
async def mark_session_abandoned(session_id: str, last_step: str):
    """Mark a checkout session as abandoned (called when user leaves page)."""
    
    session = await db.checkout_sessions.find_one({"session_id": session_id})
    if not session:
        return {"success": False, "error": "Session not found"}
    
    # Only mark as abandoned if not completed
    if session.get("last_event") not in ["2fa_completed", "payment_successful"]:
        await db.checkout_sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "abandoned",
                "abandoned_at": datetime.now(timezone.utc).isoformat(),
                "abandoned_step": last_step
            }}
        )
        
        # Track as fraud prevention if abandoned at 2FA step
        if last_step == "2fa_verification":
            await db.fraud_prevention_events.insert_one({
                "id": f"fraud_{uuid.uuid4().hex[:16]}",
                "session_id": session_id,
                "user_id": session.get("user_id"),
                "event": "checkout_abandoned_at_2fa",
                "cart_total": session.get("cart_total", 0),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "potential_fraud_value": session.get("cart_total", 0)
            })
    
    return {"success": True}


# ============================================
# Analytics Endpoints for Admin
# ============================================

@router.get("/funnel-stats")
async def get_checkout_funnel_stats(days: int = 30):
    """Get checkout funnel statistics for the last N days."""
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Get event counts
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": "$event_type",
            "count": {"$sum": 1}
        }}
    ]
    
    event_counts = {}
    async for doc in db.checkout_events.aggregate(pipeline):
        event_counts[doc["_id"]] = doc["count"]
    
    # Calculate funnel metrics
    checkouts_started = event_counts.get("checkout_started", 0)
    shipping_completed = event_counts.get("shipping_completed", 0)
    payment_entered = event_counts.get("payment_entered", 0)
    buy_now_clicked = event_counts.get("buy_now_clicked", 0)
    tfa_shown = event_counts.get("2fa_shown", 0)
    tfa_completed = event_counts.get("2fa_completed", 0)
    tfa_abandoned = event_counts.get("2fa_abandoned", 0)
    
    # Calculate rates
    step1_to_step2_rate = (shipping_completed / checkouts_started * 100) if checkouts_started > 0 else 0
    step2_to_buynow_rate = (buy_now_clicked / payment_entered * 100) if payment_entered > 0 else 0
    buynow_to_complete_rate = (tfa_completed / buy_now_clicked * 100) if buy_now_clicked > 0 else 0
    tfa_abandonment_rate = (tfa_abandoned / tfa_shown * 100) if tfa_shown > 0 else 0
    
    # Overall conversion rate
    overall_conversion_rate = (tfa_completed / checkouts_started * 100) if checkouts_started > 0 else 0
    
    return {
        "period_days": days,
        "funnel": {
            "checkouts_started": checkouts_started,
            "shipping_completed": shipping_completed,
            "payment_entered": payment_entered,
            "buy_now_clicked": buy_now_clicked,
            "tfa_shown": tfa_shown,
            "tfa_completed": tfa_completed,
            "tfa_abandoned": tfa_abandoned
        },
        "rates": {
            "step1_to_step2": round(step1_to_step2_rate, 2),
            "step2_to_buynow": round(step2_to_buynow_rate, 2),
            "buynow_to_complete": round(buynow_to_complete_rate, 2),
            "tfa_abandonment_rate": round(tfa_abandonment_rate, 2),
            "overall_conversion": round(overall_conversion_rate, 2)
        }
    }


@router.get("/fraud-prevention-stats")
async def get_fraud_prevention_stats(days: int = 30):
    """Get fraud prevention statistics - key metric for 2FA effectiveness."""
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Get fraud events
    fraud_events = await db.fraud_prevention_events.find({
        "timestamp": {"$gte": start_date}
    }).to_list(10000)
    
    total_prevented = len(fraud_events)
    total_value_prevented = sum(e.get("potential_fraud_value", 0) for e in fraud_events)
    
    # Get daily breakdown
    daily_pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$substr": ["$timestamp", 0, 10]},
            "count": {"$sum": 1},
            "value": {"$sum": "$potential_fraud_value"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    daily_data = []
    async for doc in db.fraud_prevention_events.aggregate(daily_pipeline):
        daily_data.append({
            "date": doc["_id"],
            "prevented_count": doc["count"],
            "prevented_value": round(doc["value"], 2)
        })
    
    # Compare with completed checkouts to get prevention percentage
    completed_checkouts = await db.checkout_events.count_documents({
        "event_type": "2fa_completed",
        "timestamp": {"$gte": start_date}
    })
    
    total_at_2fa = await db.checkout_events.count_documents({
        "event_type": {"$in": ["2fa_shown", "buy_now_clicked"]},
        "timestamp": {"$gte": start_date}
    })
    
    prevention_rate = (total_prevented / total_at_2fa * 100) if total_at_2fa > 0 else 0
    
    return {
        "period_days": days,
        "summary": {
            "total_prevented_attempts": total_prevented,
            "total_value_prevented": round(total_value_prevented, 2),
            "prevention_rate": round(prevention_rate, 2),
            "completed_checkouts": completed_checkouts,
            "total_reached_2fa": total_at_2fa
        },
        "daily_breakdown": daily_data
    }


@router.get("/abandonment-details")
async def get_abandonment_details(days: int = 30, limit: int = 50):
    """Get detailed abandonment data for analysis."""
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Get abandoned sessions at 2FA step
    abandoned_sessions = await db.checkout_sessions.find({
        "status": "abandoned",
        "abandoned_step": "2fa_verification",
        "abandoned_at": {"$gte": start_date}
    }, {"_id": 0}).sort("abandoned_at", -1).limit(limit).to_list(limit)
    
    # Get abandonment by step
    step_pipeline = [
        {"$match": {"status": "abandoned", "abandoned_at": {"$gte": start_date}}},
        {"$group": {
            "_id": "$abandoned_step",
            "count": {"$sum": 1},
            "total_value": {"$sum": "$cart_total"}
        }}
    ]
    
    abandonment_by_step = {}
    async for doc in db.checkout_sessions.aggregate(step_pipeline):
        abandonment_by_step[doc["_id"] or "unknown"] = {
            "count": doc["count"],
            "total_value": round(doc.get("total_value") or 0, 2)
        }
    
    return {
        "period_days": days,
        "abandonment_by_step": abandonment_by_step,
        "recent_2fa_abandonments": abandoned_sessions,
        "key_metric": {
            "2fa_abandonments": abandonment_by_step.get("2fa_verification", {}).get("count", 0),
            "2fa_abandoned_value": abandonment_by_step.get("2fa_verification", {}).get("total_value", 0),
            "description": "Checkouts abandoned at 2FA step = potential fraud prevented"
        }
    }


@router.get("/daily-trends")
async def get_daily_trends(days: int = 30):
    """Get daily checkout trends for charting."""
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": {
                "date": {"$substr": ["$timestamp", 0, 10]},
                "event": "$event_type"
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    
    # Organize by date
    trends = {}
    async for doc in db.checkout_events.aggregate(pipeline):
        date = doc["_id"]["date"]
        event = doc["_id"]["event"]
        if date not in trends:
            trends[date] = {
                "date": date,
                "checkouts_started": 0,
                "buy_now_clicked": 0,
                "tfa_completed": 0,
                "tfa_abandoned": 0
            }
        
        if event == "checkout_started":
            trends[date]["checkouts_started"] = doc["count"]
        elif event == "buy_now_clicked":
            trends[date]["buy_now_clicked"] = doc["count"]
        elif event == "2fa_completed":
            trends[date]["tfa_completed"] = doc["count"]
        elif event == "2fa_abandoned":
            trends[date]["tfa_abandoned"] = doc["count"]
    
    return {
        "period_days": days,
        "daily_trends": list(trends.values())
    }
