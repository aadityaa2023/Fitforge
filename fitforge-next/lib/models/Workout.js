/**
 * lib/models/Workout.js — Mongoose Workout Schema
 */
import mongoose from 'mongoose';

const WorkoutSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercise: { type: String, required: true },
  reps: { type: Number, default: 0 },
  duration_seconds: { type: Number, default: 0 },
  avg_form_score: { type: Number, default: 0 },
  feedback_log: { type: [String], default: [] },
  perfect_reps: { type: Number, default: 0 },
  xp_earned: { type: Number, default: 0 },
  completed_at: { type: Date, default: Date.now },
});

export default mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema);
