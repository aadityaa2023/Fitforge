/**
 * app/api/gamification/leaderboard/route.js — Top 10 users by XP
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}, 'username xp level level_name streak')
      .sort({ xp: -1 })
      .limit(10)
      .lean();

    const board = users.map((u, idx) => ({
      rank: idx + 1,
      id: u._id.toString(),
      username: u.username,
      xp: u.xp || 0,
      level: u.level || 0,
      level_name: u.level_name || 'Beginner',
      streak: u.streak || 0,
    }));

    return NextResponse.json(board);
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
