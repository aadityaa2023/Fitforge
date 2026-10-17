/**
 * app/api/auth/google/route.js
 * 
 * Verifies Google OAuth ID token, automatically registers new users
 * or logs in existing users, and issues a FitForge JWT token.
 */
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { createToken } from '@/lib/auth';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(googleClientId);

export async function POST(req) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ detail: 'Missing Google credential' }, { status: 400 });
    }

    // Verify token with Google
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr);
      return NextResponse.json({ detail: 'Invalid or expired Google token' }, { status: 401 });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ detail: 'Unable to retrieve user information from Google' }, { status: 400 });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // 1. Find user by google_id or email
    let user = await User.findOne({
      $or: [{ google_id: googleId }, { email: normalizedEmail }],
    });

    if (user) {
      // If user exists, update missing google_id or profile picture/name
      let modified = false;
      if (!user.google_id) {
        user.google_id = googleId;
        modified = true;
      }
      if (picture && (!user.avatar || user.avatar !== picture)) {
        user.avatar = picture;
        modified = true;
      }
      if (name && (!user.name || user.name !== name)) {
        user.name = name;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // 2. Register new user automatically
      // Generate clean unique username
      let baseUsername = (name || normalizedEmail.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '')
        .slice(0, 20);

      if (baseUsername.length < 3) {
        baseUsername = `user_${Date.now().toString().slice(-4)}`;
      }

      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername.slice(0, 16)}_${counter}`;
        counter++;
      }

      user = await User.create({
        username: uniqueUsername,
        email: normalizedEmail,
        name: name || uniqueUsername,
        avatar: picture || '',
        google_id: googleId,
        xp: 0,
        level: 0,
        level_name: 'Beginner',
        streak: 0,
        achievements: [],
      });
    }

    const token = await createToken(user._id);

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    return NextResponse.json(
      { detail: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
