/**
 * app/api/auth/me/route.js
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateLevel } from '@/lib/gamification';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    const xp = user.xp || 0;
    const [level, level_name] = calculateLevel(xp);

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      xp,
      level,
      level_name,
      streak: user.streak || 0,
      achievements: user.achievements || [],
      created_at: user.created_at,
    });
  } catch (err) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }
}
