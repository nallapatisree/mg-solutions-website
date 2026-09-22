import { NextResponse } from 'next/server';
import { getDb, logActivity } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/server-helpers';
import { getResource } from '../../../../../lib/resource-config';
import { validateResource } from '../../../../../lib/validate';
import { uniqueSlug } from '../../../../../lib/slug';

export const runtime = 'nodejs';

// GET    /api/admin/:resource/:id -> single record (+ screenshots for projects)
// PUT    /api/admin/:resource/:id -> full update
// PATCH  /api/admin/:resource/:id -> partial update (toggles: publish, feature, approve, status)
// DELETE /api/admin/:resource/:id -> delete

function loadResource(params) {
  const resource = getResource(params.resource);
  const id = parseInt(params.id, 10);
  return { resource, id: Number.isNaN(id) ? null : id };
}

export async function GET(request, { params }) {
  try { requireAdmin(); } catch (res) { return res; }

  const { resource, id } = loadResource(params);
  if (!resource || !id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const db = getDb();
  const row = db.prepare(`SELECT * FROM ${resource.table} WHERE id = ?`).get(id);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (resource.hasScreenshots) {
    row.screenshots = db
      .prepare('SELECT * FROM project_screenshots WHERE project_id = ? ORDER BY display_order ASC')
      .all(id);
  }

  return NextResponse.json({ row });
}

export async function PUT(request, { params }) {
  let session;
  try { session = requireAdmin(); } catch (res) { return res; }

  const { resource, id } = loadResource(params);
  if (!resource || !id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await request.json();
    const { values, errors } = validateResource(resource, body);
    if (Object.keys(errors).length) {
      return NextResponse.json({ error: 'Please correct the highlighted fields', fields: errors }, { status: 400 });
    }

    const db = getDb();
    if (resource.slugFrom) {
      values.slug = uniqueSlug(db, resource.table, values.slug || values[resource.slugFrom], id);
    }

    const sets = Object.keys(values).map((c) => `${c} = @${c}`).join(', ');
    db.prepare(`UPDATE ${resource.table} SET ${sets}, updated_at = datetime('now') WHERE id = @id`).run({ ...values, id });

    logActivity(db, session.email, `Updated ${resource.singular.toLowerCase()}`, resource.table, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to save changes' }, { status: 500 });
  }
}

// Partial updates for toggles. Only whitelisted columns may be patched.
const PATCHABLE = new Set([
  'is_published', 'is_featured', 'is_pinned', 'is_visible',
  'approval_status', 'status', 'display_order', 'internal_notes'
]);

export async function PATCH(request, { params }) {
  let session;
  try { session = requireAdmin(); } catch (res) { return res; }

  const { resource, id } = loadResource(params);
  if (!resource || !id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await request.json();
    const updates = {};

    for (const [key, value] of Object.entries(body)) {
      if (!PATCHABLE.has(key)) continue;
      if (key.startsWith('is_')) updates[key] = value ? 1 : 0;
      else if (key === 'display_order') updates[key] = parseInt(value, 10) || 0;
      else updates[key] = String(value).slice(0, 20000);
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const db = getDb();
    const sets = Object.keys(updates).map((c) => `${c} = @${c}`).join(', ');
    db.prepare(`UPDATE ${resource.table} SET ${sets}, updated_at = datetime('now') WHERE id = @id`).run({ ...updates, id });

    logActivity(db, session.email, `Updated ${resource.singular.toLowerCase()}`, resource.table, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to update' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  let session;
  try { session = requireAdmin(); } catch (res) { return res; }

  const { resource, id } = loadResource(params);
  if (!resource || !id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const db = getDb();
    db.prepare(`DELETE FROM ${resource.table} WHERE id = ?`).run(id);
    logActivity(db, session.email, `Deleted ${resource.singular.toLowerCase()}`, resource.table, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete' }, { status: 500 });
  }
}
