/**
 * app/api/progress/stats/route.js — Lifetime aggregate stats
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import User from '@/lib/models/User';
import { getUserIdFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);

    const agg = await Workout.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$exercise',
          total_reps: { $sum: '$reps' },
          count: { $sum: 1 },
          total_xp: { $sum: '$xp_earned' },
        },
      },
    ]);

    const totalWorkouts = agg.reduce((s, e) => s + e.count, 0);
    const totalReps = agg.reduce((s, e) => s + e.total_reps, 0);
    const totalXp = agg.reduce((s, e) => s + e.total_xp, 0);
    const favourite = agg.length > 0
      ? agg.reduce((prev, cur) => (cur.count > prev.count ? cur : prev))._id
      : null;

    const user = await User.findById(userId).lean();
    const bestStreak = user?.streak || 0;

    return NextResponse.json({
      total_workouts: totalWorkouts,
      total_reps: totalReps,
      total_xp: totalXp,
      best_streak: bestStreak,
      favourite_exercise: favourite,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }
}
