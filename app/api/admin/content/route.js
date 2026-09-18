import { NextResponse } from 'next/server';
import { getDb, logActivity } from '../../../../lib/db';
import { requireAdmin, getContent, upsertKeyValue } from '../../../../lib/server-helpers';
import { str } from '../../../../lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    requireAdmin();
  } catch (res) {
    return res;
  }

  return NextResponse.json({ content: getContent() });
}

export async function PUT(request) {
  let session;

  try {
    session = requireAdmin();
  } catch (res) {
    return res;
  }

  try {
    const body = await request.json();
    const db = getDb();

    const save = db.transaction((entries) => {
      for (const [key, value] of entries) {
        upsertKeyValue(
          'website_content',
          str(key, { max: 80 }),
          str(value, { max: 20000 })
        );
      }
    });

    save(Object.entries(body));

    logActivity(
      db,
      session.email,
      'Updated website content',
      'website_content',
      null
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Unable to save content' },
      { status: 500 }
    );
  }
}