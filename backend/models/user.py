"""
models/user.py — Pydantic schemas for user-related data.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Public-facing user data (no password)."""
    id: str
    username: str
    email: str
    xp: int = 0
    level: int = 0
    level_name: str = "Beginner"
    streak: int = 0
    achievements: List[str] = []
    created_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
