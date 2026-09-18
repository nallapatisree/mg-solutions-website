// Central SQLite connection + schema definition.
// Using better-sqlite3: synchronous, file-based, zero external server to install.
// This module is imported by API routes and server components only (Node runtime).

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/mgsolutions.db';

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Reuse a single connection across hot-reloads in dev (Next.js reloads modules)
const globalForDb = globalThis;

function createConnection() {
  ensureDir(DB_PATH);
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon_url TEXT,
      short_description TEXT,
      detailed_description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT,
      seo_description TEXT,
      image_alt TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      thumbnail_url TEXT,
      short_description TEXT,
      detailed_description TEXT,
      client_name TEXT,
      category TEXT,
      technologies TEXT, -- JSON array stored as text
      project_url TEXT,
      completion_date TEXT,
      status TEXT NOT NULL DEFAULT 'In Development', -- Upcoming | In Development | Completed | Live
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_screenshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      display_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT,
      image_url TEXT,
      image_alt TEXT,
      announcement_date TEXT NOT NULL DEFAULT (date('now')),
      category TEXT NOT NULL DEFAULT 'Company Announcement',
      is_published INTEGER NOT NULL DEFAULT 1,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      company_name TEXT,
      image_url TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      feedback TEXT NOT NULL,
      service_taken TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      approval_status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT,
      company_name TEXT,
      service_requested TEXT,
      budget_range TEXT,
      project_description TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'New', -- New | Contacted | Follow Up | Converted | Closed
      internal_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS website_content (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_url TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size_bytes INTEGER,
      alt_text TEXT,
      category TEXT, -- service | project | announcement | testimonial | general
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_email TEXT,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
    CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);
    CREATE INDEX IF NOT EXISTS idx_testimonials_approval ON testimonials(approval_status, is_visible);
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
  `);
}

export function getDb() {
  if (!globalForDb.__mgDb) {
    globalForDb.__mgDb = createConnection();
  }
  return globalForDb.__mgDb;
}

export function logActivity(db, adminEmail, action, entity, entityId) {
  db.prepare(
    `INSERT INTO admin_activity (admin_email, action, entity, entity_id) VALUES (?, ?, ?, ?)`
  ).run(adminEmail || 'system', action, entity || null, entityId || null);
}
