/**
 * app/api/ai-planner/generate/route.js — Gemini AI recovery & diet planner
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import User from '@/lib/models/User';
import { getUserIdFromRequest } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

function buildPrompt(username, level, streak, workout) {
  const exercise = workout.exercise || 'general exercise';
  const reps = workout.reps || 0;
  const duration = workout.duration_seconds || 0;
  const formScore = Math.round((workout.avg_form_score || 0.75) * 100);
  const feedbackItems = workout.feedback_log || [];
  const minutes = Math.floor(duration / 60);

  const feedbackStr = feedbackItems.length === 0
    ? 'No specific form issues detected — great technique!'
    : [...new Set(feedbackItems.slice(0, 5))].join('; ');

  const fatigue = workout.fatigue_level;
  let fatigueContext = '';
  if (fatigue != null) {
    const fatigueMap = { 1: 'Exhausted/Severe Soreness', 2: 'Tired/Sore', 3: 'Normal', 4: 'Good', 5: 'Energetic/Fresh' };
    const fDesc = fatigueMap[fatigue] || 'Normal';
    fatigueContext = `\n- User's self-reported fatigue level today: ${fatigue}/5 (${fDesc}). IMPORTANT: If fatigue is 1 or 2, recommend a Deload or active recovery session for their next workout.`;
  }

  return `You are FitForge AI — a world-class personal trainer and sports nutritionist.

A user just completed a workout. Analyze their performance and generate a highly
personalized recovery plan and meal plan for the rest of their day.

USER PROFILE:
- Name: ${username}
- Fitness level: ${level}
- Current streak: ${streak} consecutive workout days

TODAY'S WORKOUT:
- Exercise: ${exercise}
- Reps completed: ${reps}
- Duration: ${minutes} minutes
- Average form score: ${formScore}% (100% = perfect technique)
- AI form feedback during workout: ${feedbackStr}${fatigueContext}

Your task: Return a JSON object (no markdown, no code fences, raw JSON only) with EXACTLY this structure:
{
  "summary": "2-3 sentence personal summary addressing ${username} by name, referencing their actual stats",
  "recovery": {
    "cool_down": ["3-4 specific stretches for ${exercise} targeting the muscles used"],
    "rest_recommendation": "specific rest advice based on ${formScore}% form score and ${reps} reps",
    "soreness_areas": ["2-3 body areas to expect soreness from ${exercise}"],
    "tips": ["2-3 recovery tips tailored to a ${level} athlete with a ${streak}-day streak"]
  },
  "nutrition": {
    "pre_next_workout": "What to eat before their next workout",
    "post_workout_meal": {
      "description": "A specific meal name and description",
      "protein_g": <number>,
      "carbs_g": <number>,
      "calories": <number>
    },
    "hydration_ml": <number between 500 and 3000>,
    "snacks": ["2 healthy snack ideas for rest of the day"],
    "avoid": ["1-2 foods/drinks to avoid today based on workout intensity"]
  },
  "next_workout": {
    "recommendation": "What exercise to do next time and why",
    "target_reps": <number based on current performance>,
    "focus": "The 1 most important form improvement based on their feedback"
  },
  "motivation": "A short, powerful motivational message personalized to their ${streak}-day streak and performance"
}

Be specific, scientific, and encouraging. Tailor everything to the actual numbers provided.`.trim();
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);
    const body = await req.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { detail: 'AI Planner is not configured. Please add GEMINI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

    // Get latest workout from DB
    const latestWorkout = await Workout.findOne({ user_id: userId })
      .sort({ completed_at: -1 })
      .lean();

    // Merge request body over DB workout (body takes precedence)
    const workout = {
      ...(latestWorkout || {}),
      ...(Object.fromEntries(Object.entries(body).filter(([, v]) => v != null))),
    };

    const prompt = buildPrompt(
      user.username || 'Athlete',
      user.level_name || 'Beginner',
      user.streak || 0,
      workout
    );

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    });

    let raw = result.response.text().trim();
    // Strip markdown fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    const plan = JSON.parse(raw);
    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error('AI Planner error:', err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ detail: 'AI returned unexpected format' }, { status: 502 });
    }
    if (err.message?.includes('Unauthorized') || err.message?.includes('Missing')) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ detail: `AI generation failed: ${err.message}` }, { status: 502 });
  }
}
