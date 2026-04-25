/**
 * app/api/gamification/profile/route.js
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateLevel, LEVEL_THRESHOLDS } from '@/lib/gamification';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

    const xp = user.xp || 0;
    const [level, level_name] = calculateLevel(xp);

    let nextLevelXp = null;
    let currentLevelMinXp = 0;

    for (const [threshold] of LEVEL_THRESHOLDS) {
      if (threshold > xp) {
        nextLevelXp = threshold;
        break;
      }
    }
    for (const [threshold] of LEVEL_THRESHOLDS) {
      if (threshold <= xp) currentLevelMinXp = threshold;
    }

    return NextResponse.json({
      username: user.username,
      xp,
      level,
      level_name,
      streak: user.streak || 0,
      achievements: user.achievements || [],
      xp_to_next_level: nextLevelXp,
      current_level_min_xp: currentLevelMinXp,
    });
  } catch (err) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }
}
