import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mg_admin_session';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_this_with_a_long_random_string') {
    // Fail loudly in production; allow a dev fallback so `next dev` works out of the box.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong random value in production (.env)');
    }
    return 'dev-only-insecure-secret-change-me';
  }
  return secret;
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signSession(payload) {
  const hours = Number(process.env.SESSION_HOURS || 12);
  return jwt.sign(payload, getSecret(), { expiresIn: `${hours}h` });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export function setSessionCookie(token) {
  const hours = Number(process.env.SESSION_HOURS || 12);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: hours * 60 * 60
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export function getSessionFromCookies() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
