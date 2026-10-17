/**
 * lib/models/User.js — Mongoose User Schema
 */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  google_id: { type: String, sparse: true, unique: true },
  hashed_password: { type: String, required: false },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  level_name: { type: String, default: 'Beginner' },
  streak: { type: Number, default: 0 },
  last_workout_date: { type: Date, default: null },
  achievements: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
