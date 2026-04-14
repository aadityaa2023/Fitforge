"""
main.py — FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import close_connection
from routers import auth, workout, gamification, progress, websocket_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FitForge API starting up...")
    yield
    logger.info("FitForge API shutting down...")
    await close_connection()


app = FastAPI(
    title="FitForge API",
    description="AI-Powered Gamified Workout & Fitness Analyzer",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(workout.router)
app.include_router(gamification.router)
app.include_router(progress.router)
app.include_router(websocket_router.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "app": "FitForge API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}
