"""
routers/auth.py — Registration, login, and current user endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from bson import ObjectId

from config import settings
from database import users_collection
from models.user import UserCreate, UserLogin, UserOut, Token, TokenData

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ─── Helpers ────────────────────────────────────────────────────────────────────

def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    # bcrypt expects bytes, so we encode the password
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def _create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def _user_doc_to_out(user: dict) -> UserOut:
    from services.gamification_service import calculate_level
    xp = user.get("xp", 0)
    level, level_name = calculate_level(xp)
    return UserOut(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        xp=xp,
        level=level,
        level_name=level_name,
        streak=user.get("streak", 0),
        achievements=user.get("achievements", []),
        created_at=user.get("created_at"),
    )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency: decode JWT and return raw user document."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception

    users = users_collection()
    user = await users.find_one({"_id": ObjectId(token_data.user_id)})
    if user is None:
        raise credentials_exception
    return user


# ─── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate):
    users = users_collection()

    # Uniqueness checks
    if await users.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await users.find_one({"username": body.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Build user document
    user_doc = {
        "username": body.username,
        "email": body.email,
        "hashed_password": _hash_password(body.password),
        "xp": 0,
        "level": 0,
        "level_name": "Beginner",
        "streak": 0,
        "last_workout_date": None,
        "achievements": [],
        "created_at": datetime.utcnow(),
    }
    result = await users.insert_one(user_doc)
    token = _create_access_token(str(result.inserted_id))
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(body: UserLogin):
    users = users_collection()
    user = await users.find_one({"email": body.email})
    if not user or not _verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = _create_access_token(str(user["_id"]))
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_doc_to_out(current_user)
