/**
 * lib/models/User.js — Mongoose User Schema
 */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true },
  hashed_password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  level_name: { type: String, default: 'Beginner' },
  streak: { type: Number, default: 0 },
  last_workout_date: { type: Date, default: null },
  achievements: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
