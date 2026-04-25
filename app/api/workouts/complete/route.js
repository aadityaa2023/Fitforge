/**
 * app/api/workouts/complete/route.js
 * Save completed workout, award XP, update streak, check achievements.
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Workout from '@/lib/models/Workout';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  calculateXpForWorkout,
  calculateLevel,
  ACHIEVEMENTS,
  ACHIEVEMENTS_MAP,
} from '@/lib/gamification';

async function updateStreak(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = user.last_workout_date ? new Date(user.last_workout_date) : null;
  let newStreak = 1;
  let isContinuation = false;

  if (lastDate) {
    const last = new Date(lastDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = (user.streak || 0) + 1;
      isContinuation = true;
    } else if (diffDays === 0) {
      newStreak = user.streak || 1;
      isContinuation = false;
    } else {
      newStreak = 1;
      isContinuation = false;
    }
  }

  await User.findByIdAndUpdate(user._id, {
    streak: newStreak,
    last_workout_date: new Date(),
  });

  return [newStreak, isContinuation];
}

async function awardXp(userId, xpAmount) {
  const user = await User.findById(userId);
  if (!user) return {};

  const newXp = (user.xp || 0) + xpAmount;
  const [level, level_name] = calculateLevel(newXp);

  await User.findByIdAndUpdate(userId, { xp: newXp, level, level_name });
  return { xp: newXp, level, level_name };
}

async function checkAndAwardAchievements(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const alreadyUnlocked = user.achievements || [];
  const newlyUnlocked = [];

  // Aggregate workout stats
  const totalWorkouts = await Workout.countDocuments({ user_id: userId });
  const statsAgg = await Workout.aggregate([
    { $match: { user_id: user._id } },
    {
      $group: {
        _id: null,
        total_reps: { $sum: '$reps' },
        total_perfect: { $sum: '$perfect_reps' },
        squats: { $sum: { $cond: [{ $eq: ['$exercise', 'squat'] }, '$reps', 0] } },
        pushups: { $sum: { $cond: [{ $eq: ['$exercise', 'pushup'] }, '$reps', 0] } },
      },
    },
  ]);
  const stats = statsAgg[0] || {};

  const conditions = {
    first_workout: totalWorkouts >= 1,
    century: (stats.total_reps || 0) >= 100,
    week_streak: (user.streak || 0) >= 7,
    month_streak: (user.streak || 0) >= 30,
    squat_master: (stats.squats || 0) >= 500,
    pushup_king: (stats.pushups || 0) >= 500,
    level_3: (user.level || 0) >= 2,
    perfect_form: (stats.total_perfect || 0) >= 50,
  };

  let bonusXp = 0;
  const newUnlockedIds = [...alreadyUnlocked];

  for (const [achId, conditionMet] of Object.entries(conditions)) {
    if (conditionMet && !alreadyUnlocked.includes(achId)) {
      newUnlockedIds.push(achId);
      const ach = ACHIEVEMENTS_MAP[achId];
      newlyUnlocked.push(ach);
      bonusXp += ach.xp_reward;
    }
  }

  if (newlyUnlocked.length > 0) {
    await User.findByIdAndUpdate(userId, { achievements: newUnlockedIds });
    if (bonusXp > 0) {
      await awardXp(userId, bonusXp);
    }
  }

  return newlyUnlocked;
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);
    const body = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ detail: 'User not found' }, { status: 404 });

    const [newStreak, isContinuation] = await updateStreak(user);

    const xpEarned = calculateXpForWorkout(
      body.reps || 0,
      body.perfect_reps || 0,
      isContinuation
    );

    const workout = await Workout.create({
      user_id: userId,
      exercise: body.exercise,
      reps: body.reps || 0,
      duration_seconds: body.duration_seconds || 0,
      avg_form_score: body.avg_form_score || 0,
      feedback_log: body.feedback_log || [],
      perfect_reps: body.perfect_reps || 0,
      xp_earned: xpEarned,
    });

    const updatedGamification = await awardXp(userId, xpEarned);
    const newAchievements = await checkAndAwardAchievements(userId);

    return NextResponse.json({
      workout_id: workout._id.toString(),
      xp_earned: xpEarned,
      new_streak: newStreak,
      gamification: updatedGamification,
      new_achievements: newAchievements,
    });
  } catch (err) {
    console.error('Complete workout error:', err);
    return NextResponse.json({ detail: 'Unauthorized or server error' }, { status: 401 });
  }
}
