"""
routers/gamification.py — Leaderboard, user profile, and achievements.
"""
from fastapi import APIRouter, Depends
from bson import ObjectId

from database import users_collection
from routers.auth import get_current_user
from services.gamification_service import ACHIEVEMENTS, LEVEL_THRESHOLDS, calculate_level

router = APIRouter(prefix="/api/gamification", tags=["gamification"])


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return full gamification profile for the current user."""
    xp = current_user.get("xp", 0)
    level, level_name = calculate_level(xp)

    # Calculate XP needed for next level
    next_level_xp = None
    for threshold, name in LEVEL_THRESHOLDS:
        if threshold > xp:
            next_level_xp = threshold
            break

    current_level_xp = 0
    for threshold, _ in LEVEL_THRESHOLDS:
        if threshold <= xp:
            current_level_xp = threshold

    return {
        "username": current_user["username"],
        "xp": xp,
        "level": level,
        "level_name": level_name,
        "streak": current_user.get("streak", 0),
        "achievements": current_user.get("achievements", []),
        "xp_to_next_level": next_level_xp,
        "current_level_min_xp": current_level_xp,
    }


@router.get("/leaderboard")
async def get_leaderboard():
    """Top 10 users by XP."""
    users = users_collection()
    cursor = users.find(
        {},
        {"username": 1, "xp": 1, "level": 1, "level_name": 1, "streak": 1}
    ).sort("xp", -1).limit(10)
    docs = await cursor.to_list(length=10)

    board = []
    for rank, doc in enumerate(docs, start=1):
        board.append({
            "rank": rank,
            "id": str(doc["_id"]),
            "username": doc["username"],
            "xp": doc.get("xp", 0),
            "level": doc.get("level", 0),
            "level_name": doc.get("level_name", "Beginner"),
            "streak": doc.get("streak", 0),
        })
    return board


@router.get("/achievements")
async def get_achievements(current_user: dict = Depends(get_current_user)):
    """Return all achievements with unlock status for the current user."""
    unlocked = set(current_user.get("achievements", []))
    result = []
    for ach in ACHIEVEMENTS:
        result.append(
            {
                **ach,
                "unlocked": ach["id"] in unlocked,
            }
        )
    return result
