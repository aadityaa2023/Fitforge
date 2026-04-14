"""
routers/ai_planner.py — Generative AI Smart Recovery & Diet Planner
Uses Google Gemini to generate personalized recovery routines + meal plans
based on the user's actual workout performance data.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
import json
import re

import google.generativeai as genai

from config import settings
from routers.auth import get_current_user
from database import users_collection, workouts_collection
from bson import ObjectId

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai-planner", tags=["AI Planner"])


# ─── Request / Response models ───────────────────────────────────────────────────

class PlanRequest(BaseModel):
    """
    Client can optionally pass the latest workout stats.
    If omitted, we fetch the user's last session from the DB.
    """
    exercise: Optional[str] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    avg_form_score: Optional[float] = None
    feedback_log: Optional[list[str]] = None
    fatigue_level: Optional[int] = None


# ─── Helpers ─────────────────────────────────────────────────────────────────────

def _build_prompt(username: str, level: str, streak: int, workout: dict) -> str:
    exercise       = workout.get("exercise", "general exercise")
    reps           = workout.get("reps", 0)
    duration       = workout.get("duration_seconds", 0)
    form_score     = round((workout.get("avg_form_score", 0.75)) * 100)
    feedback_items = workout.get("feedback_log", [])
    minutes        = duration // 60

    feedback_str = (
        "No specific form issues detected — great technique!"
        if not feedback_items
        else "; ".join(set(feedback_items[:5]))
    )

    fatigue = workout.get("fatigue_level")
    fatigue_context = ""
    if fatigue is not None:
        fatigue_map = {1: "Exhausted/Severe Soreness", 2: "Tired/Sore", 3: "Normal", 4: "Good", 5: "Energetic/Fresh"}
        f_desc = fatigue_map.get(fatigue, "Normal")
        fatigue_context = f"\n- User's self-reported fatigue level today: {fatigue}/5 ({f_desc}). IMPORTANT: If fatigue is 1 or 2, recommend a Deload or active recovery session for their next workout."

    return f"""
You are FitForge AI — a world-class personal trainer and sports nutritionist.

A user just completed a workout. Analyze their performance and generate a highly
personalized recovery plan and meal plan for the rest of their day.

USER PROFILE:
- Name: {username}
- Fitness level: {level}
- Current streak: {streak} consecutive workout days

TODAY'S WORKOUT:
- Exercise: {exercise}
- Reps completed: {reps}
- Duration: {minutes} minutes
- Average form score: {form_score}% (100% = perfect technique)
- AI form feedback during workout: {feedback_str}{fatigue_context}

Your task: Return a JSON object (no markdown, no code fences, raw JSON only) with EXACTLY this structure:
{{
  "summary": "2-3 sentence personal summary addressing {username} by name, referencing their actual stats",
  "recovery": {{
    "cool_down": ["3-4 specific stretches for {exercise} targeting the muscles used"],
    "rest_recommendation": "specific rest advice based on {form_score}% form score and {reps} reps",
    "soreness_areas": ["2-3 body areas to expect soreness from {exercise}"],
    "tips": ["2-3 recovery tips tailored to a {level} athlete with a {streak}-day streak"]
  }},
  "nutrition": {{
    "pre_next_workout": "What to eat before their next workout",
    "post_workout_meal": {{
      "description": "A specific meal name and description",
      "protein_g": <number>,
      "carbs_g": <number>,
      "calories": <number>
    }},
    "hydration_ml": <number between 500 and 3000>,
    "snacks": ["2 healthy snack ideas for rest of the day"],
    "avoid": ["1-2 foods/drinks to avoid today based on workout intensity"]
  }},
  "next_workout": {{
    "recommendation": "What exercise to do next time and why",
    "target_reps": <number based on current performance>,
    "focus": "The 1 most important form improvement based on their feedback"
  }},
  "motivation": "A short, powerful motivational message personalized to their {streak}-day streak and performance"
}}

Be specific, scientific, and encouraging. Tailor everything to the actual numbers provided.
""".strip()


async def _fetch_latest_workout(user_id: str) -> dict:
    """Fetch the user's most recent workout from MongoDB."""
    cursor = workouts_collection().find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(1)
    docs = await cursor.to_list(length=1)
    return docs[0] if docs else {}


# ─── Route ───────────────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_plan(body: PlanRequest, current_user: dict = Depends(get_current_user)):
    """
    Generate a personalized AI recovery + diet plan for the current user.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI Planner is not configured. Please add GEMINI_API_KEY to the backend .env file."
        )

    user_id  = str(current_user["_id"])
    username = current_user.get("username", "Athlete")
    level    = current_user.get("level_name", "Beginner")
    streak   = current_user.get("streak", 0)

    # Merge request body with DB workout (request body takes precedence)
    db_workout = await _fetch_latest_workout(user_id)
    workout = {**db_workout, **{k: v for k, v in body.dict().items() if v is not None}}

    prompt = _build_prompt(username, level, streak, workout)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        # Using the latest Gemini 2.5 Flash model which is supported by your key
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2000,
                response_mime_type="application/json",
            )
        )
        raw = response.text.strip()

        # Strip markdown code fences if model wrapped output anyway
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        plan = json.loads(raw)
        return {"success": True, "plan": plan}

    except json.JSONDecodeError as e:
        logger.error("Gemini returned non-JSON: %s", raw)
        raise HTTPException(status_code=502, detail=f"AI returned an unexpected format: {e}")
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")
