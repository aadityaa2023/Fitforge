"""
routers/websocket_router.py
WebSocket endpoint for real-time pose analysis.

Protocol:
  Client → Server: JSON  { "frame": "<base64 JPEG>", "exercise": "squat" }
  Server → Client: JSON  { "rep_count": N, "stage": "...", "feedback": [...],
                           "angles": {...}, "form_score": F, "frame": "<b64 annotated JPEG>" }

One PoseAnalyzer instance lives for the lifetime of a WebSocket connection (one session).
"""
import base64
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.pose_analyzer import PoseAnalyzer

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])


@router.websocket("/ws/workout")
async def workout_websocket(websocket: WebSocket):
    await websocket.accept()
    analyzer: PoseAnalyzer | None = None
    current_exercise: str | None = None

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            exercise = data.get("exercise", "squat")
            frame_b64: str = data.get("frame", "")

            if not frame_b64:
                await websocket.send_json({"error": "No frame data"})
                continue

            # (Re)create analyzer if exercise changes
            if exercise != current_exercise:
                if analyzer:
                    analyzer.close()
                analyzer = PoseAnalyzer(exercise=exercise)
                current_exercise = exercise

            # Decode frame and analyze
            try:
                frame_bytes = base64.b64decode(frame_b64)
            except Exception:
                await websocket.send_json({"error": "Invalid base64 frame"})
                continue

            result = analyzer.analyze_frame(frame_bytes)

            if result is None:
                await websocket.send_json({"detected": False})
                continue

            await websocket.send_json(
                {
                    "detected": True,
                    "exercise": result.exercise,
                    "rep_count": result.rep_count,
                    "stage": result.stage,
                    "feedback": result.feedback,
                    "angles": result.angles,
                    "form_score": result.form_score,
                    "frame": result.annotated_frame_b64,
                }
            )

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as exc:
        logger.error(f"WebSocket error: {exc}")
        await websocket.send_json({"error": str(exc)})
    finally:
        if analyzer:
            analyzer.close()
