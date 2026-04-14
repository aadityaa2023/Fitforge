"""
services/pose_analyzer.py
Real-time pose analysis using MediaPipe Pose.
Supports: squats, push-ups, lunges, bicep curls.
"""
import math
import base64
import numpy as np
import cv2
import mediapipe as mp
from dataclasses import dataclass, field
from typing import Optional

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


# ─── Data classes ───────────────────────────────────────────────────────────────

@dataclass
class Landmark:
    x: float
    y: float
    z: float
    visibility: float


@dataclass
class PoseResult:
    landmarks: list[dict]           # [{x, y, z, visibility, name}]
    angles: dict[str, float]        # {"knee": 145.2, ...}
    rep_count: int
    stage: str                      # "up" | "down" | "left" | "right"
    feedback: list[str]             # ["Keep your back straight"]
    form_score: float               # 0.0 – 1.0
    exercise: str
    annotated_frame_b64: str        # base64 JPEG with skeleton drawn


# ─── Utility ────────────────────────────────────────────────────────────────────

def _calculate_angle(a: tuple, b: tuple, c: tuple) -> float:
    """
    Calculate the angle at vertex b formed by points a-b-c.
    Uses the arctangent of the cross product / dot product method for stability.
    Returns angle in degrees [0, 180].
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-7)
    angle = math.degrees(math.acos(np.clip(cosine, -1.0, 1.0)))
    return angle


def _lm_to_tuple(lm) -> tuple:
    return (lm.x, lm.y)


LANDMARK_NAMES = {idx: name for name, idx in mp_pose.PoseLandmark.__members__.items()}


# ─── Per-exercise state machines ────────────────────────────────────────────────

def _analyze_squat(lm, rep_count: int, stage: str):
    """
    State machine for squat rep counting.
    Key joints: hip, knee, ankle (both sides averaged).
    """
    feedback = []
    form_issues = 0

    # Use left side as representative
    hip   = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_HIP.value])
    knee  = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_KNEE.value])
    ankle = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_ANKLE.value])
    shoulder = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value])

    knee_angle = _calculate_angle(hip, knee, ankle)
    back_angle = _calculate_angle(shoulder, hip, knee)  # trunk angle

    # Rep counting: down when knee angle < 100°, up when > 160°
    if knee_angle < 100:
        new_stage = "down"
    elif knee_angle > 160:
        new_stage = "up"
    else:
        new_stage = stage

    if new_stage == "up" and stage == "down":
        rep_count += 1

    # Form feedback
    if new_stage == "down" and knee_angle > 95:
        feedback.append("Go deeper — past parallel!")
        form_issues += 1
    if back_angle < 130:
        feedback.append("Keep your back straight!")
        form_issues += 1

    angles = {"knee": round(knee_angle, 1), "back": round(back_angle, 1)}
    form_score = max(0.0, 1.0 - form_issues * 0.3)
    return rep_count, new_stage, feedback, angles, form_score


def _analyze_pushup(lm, rep_count: int, stage: str):
    """
    State machine for push-up rep counting.
    Key joints: shoulder, elbow, wrist.
    """
    feedback = []
    form_issues = 0

    shoulder = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value])
    elbow    = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_ELBOW.value])
    wrist    = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_WRIST.value])
    hip      = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_HIP.value])
    ankle    = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_ANKLE.value])

    elbow_angle = _calculate_angle(shoulder, elbow, wrist)
    body_angle  = _calculate_angle(shoulder, hip, ankle)

    # Rep: down when elbow < 90°, up when > 160°
    if elbow_angle < 90:
        new_stage = "down"
    elif elbow_angle > 160:
        new_stage = "up"
    else:
        new_stage = stage

    if new_stage == "up" and stage == "down":
        rep_count += 1

    # Form feedback
    if body_angle < 160:
        feedback.append("Keep your hips level — don't sag!")
        form_issues += 1
    if new_stage == "up" and elbow_angle < 155:
        feedback.append("Fully extend your arms at the top!")
        form_issues += 1

    angles = {"elbow": round(elbow_angle, 1), "body": round(body_angle, 1)}
    form_score = max(0.0, 1.0 - form_issues * 0.35)
    return rep_count, new_stage, feedback, angles, form_score


def _analyze_lunge(lm, rep_count: int, stage: str):
    """
    State machine for lunge rep counting.
    Tracks front knee angle.
    """
    feedback = []
    form_issues = 0

    hip   = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_HIP.value])
    knee  = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_KNEE.value])
    ankle = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_ANKLE.value])
    shoulder = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value])

    knee_angle  = _calculate_angle(hip, knee, ankle)
    trunk_angle = _calculate_angle(shoulder, hip, knee)

    if knee_angle < 100:
        new_stage = "down"
    elif knee_angle > 160:
        new_stage = "up"
    else:
        new_stage = stage

    if new_stage == "up" and stage == "down":
        rep_count += 1

    if trunk_angle < 150:
        feedback.append("Keep your torso upright!")
        form_issues += 1
    if new_stage == "down" and knee_angle > 100:
        feedback.append("Lower your back knee toward the floor!")
        form_issues += 1

    angles = {"knee": round(knee_angle, 1), "trunk": round(trunk_angle, 1)}
    form_score = max(0.0, 1.0 - form_issues * 0.3)
    return rep_count, new_stage, feedback, angles, form_score


def _analyze_curl(lm, rep_count: int, stage: str):
    """
    State machine for bicep curl rep counting.
    Key joints: shoulder, elbow, wrist.
    """
    feedback = []
    form_issues = 0

    shoulder = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value])
    elbow    = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_ELBOW.value])
    wrist    = _lm_to_tuple(lm[mp_pose.PoseLandmark.LEFT_WRIST.value])

    elbow_angle = _calculate_angle(shoulder, elbow, wrist)

    if elbow_angle < 50:
        new_stage = "up"
    elif elbow_angle > 150:
        new_stage = "down"
    else:
        new_stage = stage

    if new_stage == "down" and stage == "up":
        rep_count += 1

    if new_stage == "up" and elbow_angle > 60:
        feedback.append("Curl all the way up!")
        form_issues += 1
    if new_stage == "down" and elbow_angle < 160:
        feedback.append("Fully extend at the bottom!")
        form_issues += 1

    angles = {"elbow": round(elbow_angle, 1)}
    form_score = max(0.0, 1.0 - form_issues * 0.35)
    return rep_count, new_stage, feedback, angles, form_score


EXERCISE_ANALYZERS = {
    "squat":  _analyze_squat,
    "pushup": _analyze_pushup,
    "lunge":  _analyze_lunge,
    "curl":   _analyze_curl,
}


# ─── Main PoseAnalyzer class ────────────────────────────────────────────────────

class PoseAnalyzer:
    """
    Stateful pose analyzer for a single exercise session.
    Maintains rep count and stage across frames.
    """

    def __init__(self, exercise: str):
        if exercise not in EXERCISE_ANALYZERS:
            raise ValueError(
                f"Unsupported exercise '{exercise}'. "
                f"Choose from: {list(EXERCISE_ANALYZERS.keys())}"
            )
        self.exercise = exercise
        self.rep_count = 0
        self.stage = "up"           # initial position
        self.feedback_history: list[str] = []
        self.perfect_reps = 0
        self._pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.6,
        )

    def analyze_frame(self, frame_bytes: bytes) -> Optional[PoseResult]:
        """
        Process a JPEG frame (bytes) and return a PoseResult.
        Returns None if no pose is detected.
        """
        # Decode JPEG → numpy array
        nparr = np.frombuffer(frame_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return None

        # MediaPipe expects RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self._pose.process(image_rgb)

        if not results.pose_landmarks:
            return None

        lm = results.pose_landmarks.landmark

        # Run exercise-specific analyzer
        analyzer_fn = EXERCISE_ANALYZERS[self.exercise]
        prev_rep = self.rep_count
        self.rep_count, self.stage, feedback, angles, form_score = analyzer_fn(
            lm, self.rep_count, self.stage
        )

        # Track perfect reps
        if self.rep_count > prev_rep and form_score >= 0.85:
            self.perfect_reps += 1

        # Accumulate unique feedback
        for fb in feedback:
            if fb not in self.feedback_history[-5:]:
                self.feedback_history.append(fb)

        # Serialize landmarks
        serialized_lm = []
        for idx, landmark in enumerate(lm):
            serialized_lm.append(
                {
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                    "visibility": landmark.visibility,
                    "name": LANDMARK_NAMES.get(idx, str(idx)),
                }
            )

        # Draw skeleton on the frame
        mp_drawing.draw_landmarks(
            image,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
        )

        # Add rep count overlay text
        cv2.rectangle(image, (0, 0), (230, 85), (0, 0, 0), -1)
        cv2.putText(image, f"Reps: {self.rep_count}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 230, 100), 3)
        cv2.putText(image, f"Stage: {self.stage}", (10, 75),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)
        if feedback:
            cv2.rectangle(image, (0, image.shape[0] - 50), (image.shape[1], image.shape[0]), (0, 0, 180), -1)
            cv2.putText(image, feedback[0], (10, image.shape[0] - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Encode annotated frame to base64
        _, buffer = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 75])
        frame_b64 = base64.b64encode(buffer).decode("utf-8")

        return PoseResult(
            landmarks=serialized_lm,
            angles=angles,
            rep_count=self.rep_count,
            stage=self.stage,
            feedback=feedback,
            form_score=round(form_score, 2),
            exercise=self.exercise,
            annotated_frame_b64=frame_b64,
        )

    def reset(self):
        """Reset counters for a new set."""
        self.rep_count = 0
        self.stage = "up"
        self.feedback_history = []
        self.perfect_reps = 0

    def close(self):
        self._pose.close()
