import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromCookies } from '../../../../lib/auth';
import { getDb, logActivity } from '../../../../lib/db';

export const runtime = 'nodejs';

export async function POST() {
  const session = getSessionFromCookies();
  if (session) logActivity(getDb(), session.email, 'Logged out', 'auth', session.id);
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
