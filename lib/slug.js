import slugify from 'slugify';

// Generates a URL-safe slug that is unique within the given table.
export function uniqueSlug(db, table, source, currentId = null) {
  const base = slugify(String(source || 'item'), { lower: true, strict: true }) || 'item';
  let candidate = base;
  let i = 2;

  const query = currentId
    ? db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`)
    : db.prepare(`SELECT id FROM ${table} WHERE slug = ?`);

  while (currentId ? query.get(candidate, currentId) : query.get(candidate)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}
