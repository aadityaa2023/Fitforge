# FitForge 🏋️ — AI-Powered Gamified Fitness Analyzer

A full-stack application combining real-time **computer vision posture analysis** (MediaPipe) with a **gamification engine** (XP, levels, streaks, achievements) to keep you motivated and consistent.

---

## Features

### 🤖 AI / Computer Vision
- Real-time pose detection via MediaPipe Pose
- Joint angle calculation for each exercise
- Automatic rep counting (state-machine per exercise)
- Form feedback overlays: `"Keep your back straight!"`, `"Go deeper!"`
- Annotated skeleton frame streamed back to browser via WebSocket
- Supports: **Squats, Push-Ups, Lunges, Bicep Curls**

### 🎮 Gamification
- XP rewards per rep, per workout, and perfect-form bonuses
- 5 progressive levels: Beginner → Novice → Intermediate → Advanced → Elite
- Daily workout streak tracking
- 8 achievements with XP rewards (e.g., "Century Club", "On Fire 🔥")

### 📊 Dashboard & Analytics
- XP progress bar with level indicator
- Weekly reps & XP bar/area charts (Recharts)
- Lifetime stats: total workouts, reps, XP, favourite exercise
- Top-10 leaderboard by XP

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Material UI v5, Framer Motion, Recharts |
| **Backend** | FastAPI, Python 3.11, Uvicorn |
| **CV / AI** | MediaPipe Pose, OpenCV, NumPy |
| **Database** | MongoDB (Motor async driver) |
| **Auth** | JWT (python-jose) + bcrypt (passlib) |
| **Real-time** | WebSocket (FastAPI native) |

---

## Project Structure

```
FitForge/
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── config.py                   # Settings (env vars)
│   ├── database.py                 # Motor MongoDB client
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   ├── user.py                 # Pydantic user schemas
│   │   └── workout.py              # Pydantic workout schemas
│   ├── routers/
│   │   ├── auth.py                 # /api/auth/*
│   │   ├── workout.py              # /api/workouts/*
│   │   ├── gamification.py         # /api/gamification/*
│   │   ├── progress.py             # /api/progress/*
│   │   └── websocket_router.py     # ws://host/ws/workout
│   └── services/
│       ├── pose_analyzer.py        # MediaPipe pose analysis engine
│       └── gamification_service.py # XP / level / streak / achievements
└── frontend/
    └── src/
        ├── App.jsx                 # Router + auth guard
        ├── main.jsx                # MUI ThemeProvider entry
        ├── theme.js                # Dark theme configuration
        ├── context/AuthContext.jsx
        ├── services/
        │   ├── api.js              # Axios instance + JWT interceptor
        │   └── auth.js             # All REST API calls
        ├── hooks/useWebSocket.js   # WebSocket lifecycle hook
        ├── components/
        │   ├── Navbar.jsx
        │   ├── CameraFeed.jsx      # Webcam capture + WS frame sender
        │   ├── RepCounter.jsx
        │   ├── FeedbackBanner.jsx
        │   ├── XPBar.jsx
        │   ├── StreakBadge.jsx
        │   └── AchievementCard.jsx
        └── pages/
            ├── Login.jsx
            ├── Signup.jsx
            ├── Dashboard.jsx
            ├── Workout.jsx         # Main AI workout screen
            ├── Progress.jsx
            ├── Achievements.jsx
            └── Leaderboard.jsx
```

---

## Setup Instructions

### Prerequisites
- **Python 3.11+** (mediapipe requires this)
- **Node.js 18+**
- **MongoDB** — either:
  - Local: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies (this takes 2-3 minutes for mediapipe+opencv)
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and set:
#   MONGO_URI=mongodb://localhost:27017   (or your Atlas URI)
#   SECRET_KEY=<any-long-random-string>

# Start the API server
uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

### 3. Using the App

1. Open `http://localhost:5173` → click **Sign up free**
2. Create your account
3. Navigate to **Workout** → select an exercise (e.g., Squats)
4. Click **Start Workout** → allow camera access
5. Perform reps in front of the camera — AI will:
   - Draw skeleton overlay in real-time
   - Count your reps automatically
   - Show form feedback banners
6. Click **Save & Finish** → earn XP and check for achievements!
7. Explore **Dashboard**, **Progress**, **Achievements**, **Leaderboard**

---

## WebSocket Protocol

The AI workout engine communicates via WebSocket at `ws://localhost:8000/ws/workout`.

**Client → Server (JSON):**
```json
{ "frame": "<base64 JPEG string>", "exercise": "squat" }
```

**Server → Client (JSON):**
```json
{
  "detected": true,
  "exercise": "squat",
  "rep_count": 5,
  "stage": "up",
  "feedback": ["Keep your back straight!"],
  "angles": { "knee": 145.2, "back": 158.9 },
  "form_score": 0.85,
  "frame": "<base64 JPEG with skeleton drawn>"
}
```

---

## XP & Level System

| Action | XP Reward |
|---|---|
| Each rep | +1 XP |
| Each perfect-form rep (≥85% score) | +2 XP |
| Complete a workout | +50 XP |
| Continuation of daily streak | +25 XP |

| Level | Name | XP Required |
|---|---|---|
| 0 | Beginner | 0 |
| 1 | Novice | 200 |
| 2 | Intermediate | 600 |
| 3 | Advanced | 1,400 |
| 4 | Elite | 3,000 |

---

## Achievements

| Achievement | Trigger | XP Bonus |
|---|---|---|
| 🏋️ First Step | Complete 1st workout | +100 |
| 💯 Century Club | 100 total reps | +150 |
| 🔥 On Fire | 7-day streak | +200 |
| ⚡ Unstoppable | 30-day streak | +500 |
| 🦵 Squat Master | 500 total squats | +300 |
| 💪 Push-Up King | 500 total push-ups | +300 |
| 🥈 Intermediate | Reach level 2 | +250 |
| ✨ Perfectionist | 50 perfect-form reps | +200 |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/workouts/complete` | Save completed workout |
| GET | `/api/workouts/history` | Paginated workout history |
| GET | `/api/gamification/profile` | XP, level, streak details |
| GET | `/api/gamification/leaderboard` | Top 10 by XP |
| GET | `/api/gamification/achievements` | All achievements + unlock status |
| GET | `/api/progress/weekly` | Last 7 days of workouts |
| GET | `/api/progress/stats` | Lifetime aggregate stats |
| WS | `/ws/workout` | Real-time pose analysis |

---

## Future Improvements

- 🎙️ **Voice coach** using Web Speech API TTS for audio feedback
- 🍎 **Diet planner** with BMR-based calorie recommendations
- 📅 **Weekly challenges** (e.g., "100 squats this week")
- 🤖 **TensorFlow classifier** for automatic exercise detection
- 📱 **Progressive Web App** (PWA) installable on mobile
- 🔔 **Push notifications** for streak reminders
- 🎥 **Session recording** for review

---

*Built with ❤️ — FitForge v1.0.0*
