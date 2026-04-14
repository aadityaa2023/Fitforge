"""
services/gamification_service.py
Handles all XP, level, streak, and achievement logic.
"""
from datetime import datetime, date, timedelta
from typing import Optional
from database import users_collection, workouts_collection

# ─── Level System ──────────────────────────────────────────────────────────────

LEVEL_THRESHOLDS = [
    (0,    "Beginner"),
    (200,  "Novice"),
    (600,  "Intermediate"),
    (1400, "Advanced"),
    (3000, "Elite"),
]

XP_REWARDS = {
    "per_rep":          1,
    "per_perfect_rep":  2,    # bonus for good form
    "workout_complete": 50,
    "daily_streak":     25,
}

# ─── Achievements definition ────────────────────────────────────────────────────

ACHIEVEMENTS = [
    {
        "id":          "first_workout",
        "title":       "First Step",
        "description": "Complete your first workout",
        "icon":        "fitness_center",
        "xp_reward":   100,
    },
    {
        "id":          "century",
        "title":       "Century Club",
        "description": "Complete 100 total reps",
        "icon":        "100",
        "xp_reward":   150,
    },
    {
        "id":          "week_streak",
        "title":       "On Fire",
        "description": "Maintain a 7-day workout streak",
        "icon":        "local_fire_department",
        "xp_reward":   200,
    },
    {
        "id":          "month_streak",
        "title":       "Unstoppable",
        "description": "Maintain a 30-day workout streak",
        "icon":        "bolt",
        "xp_reward":   500,
    },
    {
        "id":          "squat_master",
        "title":       "Squat Master",
        "description": "Complete 500 total squats",
        "icon":        "directions_run",
        "xp_reward":   300,
    },
    {
        "id":          "pushup_king",
        "title":       "Push-Up King",
        "description": "Complete 500 total push-ups",
        "icon":        "fitness_center",
        "xp_reward":   300,
    },
    {
        "id":          "level_3",
        "title":       "Intermediate",
        "description": "Reach Intermediate level",
        "icon":        "military_tech",
        "xp_reward":   250,
    },
    {
        "id":          "perfect_form",
        "title":       "Perfectionist",
        "description": "Complete 50 perfect-form reps",
        "icon":        "star",
        "xp_reward":   200,
    },
]

ACHIEVEMENTS_MAP = {a["id"]: a for a in ACHIEVEMENTS}


# ─── Helper functions ───────────────────────────────────────────────────────────

def calculate_level(xp: int) -> tuple[int, str]:
    """Return (level_index, level_name) for a given XP total."""
    level = 0
    level_name = LEVEL_THRESHOLDS[0][1]
    for idx, (threshold, name) in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = idx
            level_name = name
    return level, level_name


def calculate_xp_for_workout(reps: int, perfect_reps: int, has_streak: bool) -> int:
    """Calculate total XP earned for a completed workout."""
    xp = (
        reps * XP_REWARDS["per_rep"]
        + perfect_reps * XP_REWARDS["per_perfect_rep"]
        + XP_REWARDS["workout_complete"]
    )
    if has_streak:
        xp += XP_REWARDS["daily_streak"]
    return xp


async def update_streak(user_id: str) -> tuple[int, bool]:
    """
    Update the user's daily streak.
    Returns (new_streak, is_continuation) where is_continuation indicates a
    streak bonus should be awarded.
    """
    users = users_collection()
    user = await users.find_one({"_id": user_id})
    if not user:
        return 1, False

    today = date.today()
    last_date: Optional[datetime] = user.get("last_workout_date")

    if last_date is None:
        new_streak = 1
        is_continuation = False
    else:
        last = last_date.date() if isinstance(last_date, datetime) else last_date
        diff = (today - last).days
        if diff == 1:
            # Consecutive day
            new_streak = user.get("streak", 0) + 1
            is_continuation = True
        elif diff == 0:
            # Already worked out today — maintain streak
            new_streak = user.get("streak", 1)
            is_continuation = False
        else:
            # Streak broken
            new_streak = 1
            is_continuation = False

    await users.update_one(
        {"_id": user_id},
        {"$set": {"streak": new_streak, "last_workout_date": datetime.utcnow()}},
    )
    return new_streak, is_continuation


async def award_xp(user_id: str, xp_amount: int) -> dict:
    """
    Add XP to a user and update their level.
    Returns updated {xp, level, level_name}.
    """
    users = users_collection()
    user = await users.find_one({"_id": user_id})
    if not user:
        return {}

    new_xp = user.get("xp", 0) + xp_amount
    level, level_name = calculate_level(new_xp)

    await users.update_one(
        {"_id": user_id},
        {"$set": {"xp": new_xp, "level": level, "level_name": level_name}},
    )
    return {"xp": new_xp, "level": level, "level_name": level_name}


async def check_and_award_achievements(user_id: str) -> list[dict]:
    """
    Check all achievement conditions for a user and unlock new ones.
    Returns list of newly unlocked achievements.
    """
    users = users_collection()
    workouts = workouts_collection()

    user = await users.find_one({"_id": user_id})
    if not user:
        return []

    already_unlocked: list = user.get("achievements", [])
    newly_unlocked = []

    # Aggregate workout stats
    total_workouts = await workouts.count_documents({"user_id": user_id})
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": None,
                "total_reps": {"$sum": "$reps"},
                "total_perfect": {"$sum": "$perfect_reps"},
                "squats": {
                    "$sum": {
                        "$cond": [{"$eq": ["$exercise", "squat"]}, "$reps", 0]
                    }
                },
                "pushups": {
                    "$sum": {
                        "$cond": [{"$eq": ["$exercise", "pushup"]}, "$reps", 0]
                    }
                },
            }
        },
    ]
    stats_cursor = workouts.aggregate(pipeline)
    stats_list = await stats_cursor.to_list(length=1)
    stats = stats_list[0] if stats_list else {}

    total_reps = stats.get("total_reps", 0)
    total_perfect = stats.get("total_perfect", 0)
    total_squats = stats.get("squats", 0)
    total_pushups = stats.get("pushups", 0)
    streak = user.get("streak", 0)
    level = user.get("level", 0)

    # Check each achievement
    conditions = {
        "first_workout": total_workouts >= 1,
        "century":       total_reps >= 100,
        "week_streak":   streak >= 7,
        "month_streak":  streak >= 30,
        "squat_master":  total_squats >= 500,
        "pushup_king":   total_pushups >= 500,
        "level_3":       level >= 2,
        "perfect_form":  total_perfect >= 50,
    }

    bonus_xp = 0
    for ach_id, condition_met in conditions.items():
        if condition_met and ach_id not in already_unlocked:
            already_unlocked.append(ach_id)
            ach = ACHIEVEMENTS_MAP[ach_id]
            newly_unlocked.append(ach)
            bonus_xp += ach["xp_reward"]

    if newly_unlocked:
        await users.update_one(
            {"_id": user_id}, {"$set": {"achievements": already_unlocked}}
        )
        if bonus_xp > 0:
            await award_xp(user_id, bonus_xp)

    return newly_unlocked
