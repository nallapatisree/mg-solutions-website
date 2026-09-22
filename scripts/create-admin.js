#!/usr/bin/env node
/**
 * Creates (or updates) an admin account.
 *
 *   npm run create-admin                      -> uses ADMIN_EMAIL / ADMIN_PASSWORD from .env
 *   node scripts/create-admin.js a@b.com pw "Full Name"
 *
 * Passwords are hashed with bcrypt (cost 12) and are never stored in plain text.
 */
require('dotenv').config();

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './data/mgsolutions.db';

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';
const name = process.argv[4] || 'Administrator';

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
  console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const hash = bcrypt.hashSync(password, 12);
const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);

if (existing) {
  db.prepare('UPDATE admin_users SET password_hash = ?, name = ? WHERE email = ?').run(hash, name, email);
  console.log(`✓ Password updated for existing admin: ${email}`);
} else {
  db.prepare('INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
  console.log(`✓ Admin account created: ${email}`);
}

console.log('  Sign in at http://localhost:3000/admin/login');
db.close();
