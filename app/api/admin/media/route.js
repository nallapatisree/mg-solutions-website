import { NextResponse } from 'next/server';
import { getDb, logActivity } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/server-helpers';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request) {
  try { requireAdmin(); } catch (res) { return res; }

  const db = getDb();
  const url = new URL(request.url);
  const category = (url.searchParams.get('category') || '').trim();

  const rows = category
    ? db.prepare('SELECT * FROM media WHERE category = ? ORDER BY created_at DESC').all(category)
    : db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();

  return NextResponse.json({ rows });
}

// Deletes the DB record and removes the file from disk.
export async function DELETE(request) {
  let session;
  try { session = requireAdmin(); } catch (res) { return res; }

  try {
    const { id } = await request.json();
    const db = getDb();
    const row = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only ever delete inside the uploads directory - guards against path traversal.
    const uploadsRoot = path.resolve(process.env.UPLOAD_DIR || './public/uploads');
    const filePath = path.resolve(uploadsRoot, path.basename(row.file_url));
    if (filePath.startsWith(uploadsRoot) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    logActivity(db, session.email, 'Deleted media', 'media', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete file' }, { status: 500 });
  }
}
