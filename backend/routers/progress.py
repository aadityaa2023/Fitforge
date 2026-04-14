"""
routers/progress.py — Weekly progress and aggregate stats.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, date
from collections import defaultdict

from database import workouts_collection, users_collection
from models.workout import WorkoutStats, DailyProgress
from routers.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/weekly", response_model=list[DailyProgress])
async def get_weekly_progress(current_user: dict = Depends(get_current_user)):
    """Returns rep/workout/xp counts for each of the past 7 days."""
    workouts = workouts_collection()
    user_id = current_user["_id"]
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    cursor = workouts.find(
        {"user_id": user_id, "completed_at": {"$gte": seven_days_ago}},
        {"reps": 1, "xp_earned": 1, "completed_at": 1},
    )
    docs = await cursor.to_list(length=200)

    # Group by date string
    by_day: dict[str, dict] = defaultdict(lambda: {"reps": 0, "workouts": 0, "xp_earned": 0})
    for doc in docs:
        day_key = doc["completed_at"].strftime("%Y-%m-%d")
        by_day[day_key]["reps"] += doc.get("reps", 0)
        by_day[day_key]["xp_earned"] += doc.get("xp_earned", 0)
        by_day[day_key]["workouts"] += 1

    # Build 7-day span (fill gaps with zeros)
    result = []
    for i in range(6, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        data = by_day.get(day, {"reps": 0, "workouts": 0, "xp_earned": 0})
        result.append(
            DailyProgress(
                date=day,
                reps=data["reps"],
                workouts=data["workouts"],
                xp_earned=data["xp_earned"],
            )
        )
    return result


@router.get("/stats", response_model=WorkoutStats)
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Aggregate lifetime stats for the current user."""
    workouts = workouts_collection()
    user_id = current_user["_id"]

    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": "$exercise",
                "total_reps": {"$sum": "$reps"},
                "count": {"$sum": 1},
                "total_xp": {"$sum": "$xp_earned"},
            }
        },
    ]
    cursor = workouts.aggregate(pipeline)
    by_exercise = await cursor.to_list(length=20)

    total_workouts = sum(e["count"] for e in by_exercise)
    total_reps = sum(e["total_reps"] for e in by_exercise)
    total_xp = sum(e["total_xp"] for e in by_exercise)
    favourite = (
        max(by_exercise, key=lambda e: e["count"])["_id"] if by_exercise else None
    )

    user = await users_collection().find_one({"_id": user_id})
    best_streak = user.get("streak", 0) if user else 0

    return WorkoutStats(
        total_workouts=total_workouts,
        total_reps=total_reps,
        total_xp=total_xp,
        best_streak=best_streak,
        favourite_exercise=favourite,
    )
