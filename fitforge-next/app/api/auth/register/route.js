/**
 * app/api/auth/register/route.js
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ detail: 'All fields required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ detail: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ detail: 'Username already taken' }, { status: 400 });
    }

    const hashed_password = await hashPassword(password);
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      hashed_password,
    });

    const token = await createToken(user._id);
    return NextResponse.json({ access_token: token, token_type: 'bearer' }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ detail: 'Registration failed' }, { status: 500 });
  }
}
