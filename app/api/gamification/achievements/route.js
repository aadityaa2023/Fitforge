/**
 * app/api/gamification/achievements/route.js
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserIdFromRequest } from '@/lib/auth';
import { ACHIEVEMENTS } from '@/lib/gamification';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

    const unlocked = new Set(user.achievements || []);
    const result = ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: unlocked.has(ach.id),
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }
}
