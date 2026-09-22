import { NextResponse } from 'next/server';
import { getDb, logActivity } from '../../../lib/db';
import { requireAdmin } from '../../../lib/server-helpers';
import { saveUpload } from '../../../lib/uploads';
import { str } from '../../../lib/validate';

export const runtime = 'nodejs';

// Admin-only media upload. Validates MIME type + size, writes with a safe random filename,
// and records the file in the `media` table so it can be reused from the media library.
export async function POST(request) {
  let session;
  try { session = requireAdmin(); } catch (res) { return res; }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const category = str(formData.get('category') || 'general', { max: 40 });
    const altText = str(formData.get('alt_text') || '', { max: 300 });

    const saved = await saveUpload(file, category);

    const db = getDb();
    const info = db.prepare(
      `INSERT INTO media (file_url, original_name, mime_type, size_bytes, alt_text, category)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(saved.url, str(file.name, { max: 200 }), saved.mime, saved.size, altText, category);

    logActivity(db, session.email, 'Uploaded media', 'media', info.lastInsertRowid);
    return NextResponse.json({ ok: true, url: saved.url, id: info.lastInsertRowid });
  } catch (err) {
    // saveUpload throws user-safe messages (type/size), everything else is generic.
    const message = err?.message && err.message.length < 200 ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
