/**
 * app/api/workouts/history/route.js — Paginated workout history
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    const workouts = await Workout.find({ user_id: userId })
      .sort({ completed_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const result = workouts.map((w) => ({
      id: w._id.toString(),
      user_id: w.user_id.toString(),
      exercise: w.exercise,
      reps: w.reps,
      duration_seconds: w.duration_seconds,
      avg_form_score: w.avg_form_score,
      feedback_log: w.feedback_log,
      xp_earned: w.xp_earned,
      perfect_reps: w.perfect_reps,
      completed_at: w.completed_at,
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }
}
