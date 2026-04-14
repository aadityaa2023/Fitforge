"""
models/workout.py — Pydantic schemas for workout sessions.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class WorkoutCreate(BaseModel):
    exercise: str = Field(..., description="squat | pushup | lunge | curl")
    reps: int = Field(..., ge=0)
    duration_seconds: int = Field(..., ge=0)
    avg_form_score: float = Field(0.0, ge=0.0, le=1.0)
    feedback_log: List[str] = []
    perfect_reps: int = 0


class WorkoutOut(BaseModel):
    id: str
    user_id: str
    exercise: str
    reps: int
    duration_seconds: int
    avg_form_score: float
    feedback_log: List[str]
    xp_earned: int
    perfect_reps: int
    completed_at: Optional[datetime] = None


class WorkoutStats(BaseModel):
    total_workouts: int
    total_reps: int
    total_xp: int
    best_streak: int
    favourite_exercise: Optional[str] = None


class DailyProgress(BaseModel):
    date: str            # "YYYY-MM-DD"
    reps: int
    workouts: int
    xp_earned: int
