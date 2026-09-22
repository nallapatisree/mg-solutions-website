import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

export function uploadDir() {
  return process.env.UPLOAD_DIR || './public/uploads';
}

export function maxUploadBytes() {
  return Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024;
}

// Validates a File (from formData) and writes it to disk with a safe, random filename.
// Returns { url, filename } on success, throws Error with a user-safe message on failure.
export async function saveUpload(file, categoryPrefix = 'general') {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('No file provided');
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, SVG');
  }
  if (file.size > maxUploadBytes()) {
    throw new Error(`File too large. Max size is ${process.env.MAX_UPLOAD_MB || 5}MB`);
  }

  const originalExt = path.extname(file.name || '').toLowerCase();
  const ext = ALLOWED_EXT.has(originalExt) ? originalExt : '.jpg';
  const safeName = `${categoryPrefix}-${Date.now()}-${nanoid(8)}${ext}`;

  const dir = uploadDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, safeName), buffer);

  return {
    url: `/uploads/${safeName}`,
    filename: safeName,
    size: file.size,
    mime: file.type
  };
}
