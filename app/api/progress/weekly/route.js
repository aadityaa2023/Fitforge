/**
 * app/api/progress/weekly/route.js — Weekly progress (past 7 days)
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const workouts = await Workout.find({
      user_id: userId,
      completed_at: { $gte: sevenDaysAgo },
    })
      .select('reps xp_earned completed_at')
      .lean();

    // Group by day
    const byDay = {};
    for (const w of workouts) {
      const day = new Date(w.completed_at).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { reps: 0, workouts: 0, xp_earned: 0 };
      byDay[day].reps += w.reps || 0;
      byDay[day].xp_earned += w.xp_earned || 0;
      byDay[day].workouts += 1;
    }

    // Build 7-day span
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const day = d.toISOString().slice(0, 10);
      result.push({
        date: day,
        ...(byDay[day] || { reps: 0, workouts: 0, xp_earned: 0 }),
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }
}
