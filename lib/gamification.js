/**
 * lib/gamification.js — XP, level, streak and achievement logic
 */

export const LEVEL_THRESHOLDS = [
  [0, 'Beginner'],
  [200, 'Novice'],
  [600, 'Intermediate'],
  [1400, 'Advanced'],
  [3000, 'Elite'],
];

export const XP_REWARDS = {
  per_rep: 1,
  per_perfect_rep: 2,
  workout_complete: 50,
  daily_streak: 25,
};

export const ACHIEVEMENTS = [
  { id: 'first_workout', title: 'First Step', description: 'Complete your first workout', icon: 'fitness_center', xp_reward: 100 },
  { id: 'century', title: 'Century Club', description: 'Complete 100 total reps', icon: '100', xp_reward: 150 },
  { id: 'week_streak', title: 'On Fire', description: 'Maintain a 7-day workout streak', icon: 'local_fire_department', xp_reward: 200 },
  { id: 'month_streak', title: 'Unstoppable', description: 'Maintain a 30-day workout streak', icon: 'bolt', xp_reward: 500 },
  { id: 'squat_master', title: 'Squat Master', description: 'Complete 500 total squats', icon: 'directions_run', xp_reward: 300 },
  { id: 'pushup_king', title: 'Push-Up King', description: 'Complete 500 total push-ups', icon: 'fitness_center', xp_reward: 300 },
  { id: 'level_3', title: 'Intermediate', description: 'Reach Intermediate level', icon: 'military_tech', xp_reward: 250 },
  { id: 'perfect_form', title: 'Perfectionist', description: 'Complete 50 perfect-form reps', icon: 'star', xp_reward: 200 },
];

export const ACHIEVEMENTS_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function calculateLevel(xp) {
  let level = 0;
  let levelName = LEVEL_THRESHOLDS[0][1];
  for (let idx = 0; idx < LEVEL_THRESHOLDS.length; idx++) {
    const [threshold, name] = LEVEL_THRESHOLDS[idx];
    if (xp >= threshold) {
      level = idx;
      levelName = name;
    }
  }
  return [level, levelName];
}

export function calculateXpForWorkout(reps, perfectReps, hasStreak) {
  let xp =
    reps * XP_REWARDS.per_rep +
    perfectReps * XP_REWARDS.per_perfect_rep +
    XP_REWARDS.workout_complete;
  if (hasStreak) xp += XP_REWARDS.daily_streak;
  return xp;
}
