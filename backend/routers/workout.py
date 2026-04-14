"""
routers/workout.py — Workout session creation, completion, and history.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from bson import ObjectId

from database import workouts_collection
from models.workout import WorkoutCreate, WorkoutOut
from routers.auth import get_current_user
from services.gamification_service import (
    update_streak,
    award_xp,
    calculate_xp_for_workout,
    check_and_award_achievements,
)

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def _workout_doc_to_out(doc: dict) -> WorkoutOut:
    return WorkoutOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        exercise=doc["exercise"],
        reps=doc["reps"],
        duration_seconds=doc["duration_seconds"],
        avg_form_score=doc.get("avg_form_score", 0.0),
        feedback_log=doc.get("feedback_log", []),
        xp_earned=doc.get("xp_earned", 0),
        perfect_reps=doc.get("perfect_reps", 0),
        completed_at=doc.get("completed_at"),
    )


@router.post("/complete", response_model=dict)
async def complete_workout(
    body: WorkoutCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Save a completed workout, award XP, update streak, and check achievements.
    Returns a summary with new XP total, newly unlocked achievements, etc.
    """
    user_id = current_user["_id"]

    # Update streak and determine bonus
    new_streak, is_continuation = await update_streak(str(user_id))

    # Calculate XP
    xp_earned = calculate_xp_for_workout(
        reps=body.reps,
        perfect_reps=body.perfect_reps,
        has_streak=is_continuation,
    )

    # Save workout document
    workouts = workouts_collection()
    workout_doc = {
        "user_id": user_id,
        "exercise": body.exercise,
        "reps": body.reps,
        "duration_seconds": body.duration_seconds,
        "avg_form_score": body.avg_form_score,
        "feedback_log": body.feedback_log,
        "perfect_reps": body.perfect_reps,
        "xp_earned": xp_earned,
        "completed_at": datetime.utcnow(),
    }
    result = await workouts.insert_one(workout_doc)

    # Award XP and check achievements
    updated_gamification = await award_xp(str(user_id), xp_earned)
    new_achievements = await check_and_award_achievements(str(user_id))

    return {
        "workout_id": str(result.inserted_id),
        "xp_earned": xp_earned,
        "new_streak": new_streak,
        "gamification": updated_gamification,
        "new_achievements": new_achievements,
    }


@router.get("/history", response_model=list[WorkoutOut])
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    """Paginated workout history for the logged-in user (newest first)."""
    workouts = workouts_collection()
    skip = (page - 1) * limit
    cursor = (
        workouts.find({"user_id": current_user["_id"]})
        .sort("completed_at", -1)
        .skip(skip)
        .limit(limit)
    )
    docs = await cursor.to_list(length=limit)
    return [_workout_doc_to_out(d) for d in docs]
