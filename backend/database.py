"""
database.py — Async MongoDB connection via Motor driver.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# Global client instance
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_db():
    """Return the fitforge database instance."""
    return get_client()[settings.db_name]


# Convenient collection accessors
def users_collection():
    return get_db()["users"]


def workouts_collection():
    return get_db()["workouts"]


def achievements_collection():
    return get_db()["achievements"]


async def close_connection():
    """Call on application shutdown."""
    global _client
    if _client:
        _client.close()
        _client = None
