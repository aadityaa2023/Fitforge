# FitForge — Next.js Full-Stack

AI-powered workout tracking, real-time pose analysis, and gamified fitness coaching — built as a unified Next.js application.

## Architecture

```
fitforge-next/
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes (Backend)
│   │   ├── auth/            # register, login, me
│   │   ├── workouts/        # complete, history
│   │   ├── gamification/    # profile, leaderboard, achievements
│   │   ├── progress/        # weekly, stats
│   │   └── ai-planner/      # generate (Gemini AI)
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── workout/
│   ├── progress/
│   ├── achievements/
│   ├── leaderboard/
│   └── ai-planner/
├── components/              # Shared React components
├── context/                 # AuthContext
├── hooks/                   # useWebSocket, useVoiceCoach
├── lib/                     # MongoDB, models, auth helpers
│   ├── mongodb.js
│   ├── auth.js
│   ├── gamification.js
│   ├── theme.js
│   ├── apiClient.js
│   └── models/              # User.js, Workout.js
└── .env.local               # Environment variables
```

## Setup

1. Install dependencies: `npm install`
2. Configure .env.local (MONGODB_URI, JWT_SECRET, GEMINI_API_KEY)
3. Start MongoDB locally (port 27017)
4. Start Python pose analysis service: `cd ../backend && uvicorn main:app --reload`
5. Run Next.js: `npm run dev`
6. Open http://localhost:3000
