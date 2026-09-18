import { NextResponse } from 'next/server';
import { getDb, logActivity } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/server-helpers';
import { getResource } from '../../../../lib/resource-config';
import { validateResource } from '../../../../lib/validate';
import { uniqueSlug } from '../../../../lib/slug';

export const runtime = 'nodejs';

// Generic collection endpoint for every admin-managed resource.
// GET  /api/admin/:resource        -> paginated list (supports ?q= &status= &page=)
// POST /api/admin/:resource        -> create

export async function GET(request, { params }) {
  try {
    requireAdmin();
  } catch (res) {
    return res;
  }

  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

  const db = getDb();
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const statusFilter = (url.searchParams.get('status') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const perPage = 20;

  const where = [];
  const args = [];

  if (q) {
    where.push(`${resource.titleField} LIKE ?`);
    args.push(`%${q}%`);
  }
  if (statusFilter) {
    const statusField = resource.table === 'testimonials' ? 'approval_status' : 'status';
    where.push(`${statusField} = ?`);
    args.push(statusFilter);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM ${resource.table} ${whereSql}`).get(...args).c;
  const rows = db
    .prepare(`SELECT * FROM ${resource.table} ${whereSql} ORDER BY ${resource.defaultSort} LIMIT ? OFFSET ?`)
    .all(...args, perPage, (page - 1) * perPage);

  return NextResponse.json({ rows, total, page, perPage, pages: Math.ceil(total / perPage) || 1 });
}

export async function POST(request, { params }) {
  let session;
  try {
    session = requireAdmin();
  } catch (res) {
    return res;
  }

  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  if (resource.adminCreate === false) {
    return NextResponse.json({ error: 'This resource cannot be created from admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { values, errors } = validateResource(resource, body);
    if (Object.keys(errors).length) {
      return NextResponse.json({ error: 'Please correct the highlighted fields', fields: errors }, { status: 400 });
    }

    const db = getDb();

    if (resource.slugFrom) {
      values.slug = uniqueSlug(db, resource.table, values.slug || values[resource.slugFrom]);
    }

    const cols = Object.keys(values);
    const stmt = db.prepare(
      `INSERT INTO ${resource.table} (${cols.join(', ')}) VALUES (${cols.map((c) => `@${c}`).join(', ')})`
    );
    const info = stmt.run(values);

    logActivity(db, session.email, `Created ${resource.singular.toLowerCase()}`, resource.table, info.lastInsertRowid);
    return NextResponse.json({ ok: true, id: info.lastInsertRowid });
  } catch (err) {
    return NextResponse.json({ error: 'Unable to save. Please check your input.' }, { status: 500 });
  }
}
