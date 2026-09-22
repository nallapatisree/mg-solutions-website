import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/server-helpers';
import { str, toInt } from '../../../../lib/validate';

export const runtime = 'nodejs';

// Manage the screenshot gallery attached to a project.
export async function POST(request) {
  try { requireAdmin(); } catch (res) { return res; }

  try {
    const body = await request.json();
    const projectId = toInt(body.project_id);
    const imageUrl = str(body.image_url, { max: 500 });
    if (!projectId || !imageUrl) {
      return NextResponse.json({ error: 'Project and image are required' }, { status: 400 });
    }

    const db = getDb();
    const info = db.prepare(
      `INSERT INTO project_screenshots (project_id, image_url, alt_text, display_order)
       VALUES (?, ?, ?, ?)`
    ).run(projectId, imageUrl, str(body.alt_text, { max: 300 }), toInt(body.display_order, 0));

    return NextResponse.json({ ok: true, id: info.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: 'Unable to add screenshot' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try { requireAdmin(); } catch (res) { return res; }

  try {
    const { id } = await request.json();
    getDb().prepare('DELETE FROM project_screenshots WHERE id = ?').run(toInt(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to remove screenshot' }, { status: 500 });
  }
}
