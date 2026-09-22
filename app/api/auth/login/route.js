import { NextResponse } from 'next/server';
import { getDb, logActivity } from '../../../../lib/db';
import { verifyPassword, signSession, setSessionCookie } from '../../../../lib/auth';
import { str, isEmail } from '../../../../lib/validate';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = str(body.email).toLowerCase();
    const password = str(body.password, { max: 200 });

    if (!isEmail(email) || !password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);

    // Generic message for both "no such user" and "bad password" - avoids account enumeration.
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    setSessionCookie(token);
    logActivity(db, user.email, 'Logged in', 'auth', user.id);

    return NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now' }, { status: 500 });
  }
}
