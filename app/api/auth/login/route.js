/**
 * app/api/auth/login/route.js
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.hashed_password);
    if (!valid) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken(user._id);
    return NextResponse.json({ access_token: token, token_type: 'bearer' });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ detail: 'Login failed' }, { status: 500 });
  }
}
