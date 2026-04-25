/**
 * lib/auth.js — JWT helpers and auth middleware for API routes
 */
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'changeme-use-a-long-random-string'
);
const EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '10080');

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

export async function createToken(userId) {
  const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000);
  return new SignJWT({ sub: userId.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(SECRET);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload.sub;
}

/**
 * Extract Bearer token from request headers and return the userId.
 * Throws on invalid/missing token.
 */
export async function getUserIdFromRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }
  const token = authHeader.slice(7);
  return verifyToken(token);
}
