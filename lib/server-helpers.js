import { NextResponse } from 'next/server';
import { getSessionFromCookies } from './auth';
import { getDb } from './db';

// Use inside API route handlers to enforce admin auth.
// Returns the session if valid, or throws a Response to return immediately.
export function requireAdmin() {
  const session = getSessionFromCookies();
  if (!session) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const DEFAULT_SETTINGS = {
  company_name: 'MG Solutions',
  company_logo: '',
  favicon: '',
  email: 'hello@mgsolutions.example',
  phone: '+91 00000 00000',
  whatsapp: '+910000000000',
  address: 'Placeholder Address, City, State, India',
  social_linkedin: '',
  social_twitter: '',
  social_instagram: '',
  social_facebook: '',
  website_title: 'MG Solutions — Technology & Digital Solutions',
  seo_description: 'MG Solutions builds modern websites, web applications and digital solutions for growing businesses.',
  google_analytics_id: '',
  maintenance_mode: '0'
};

const DEFAULT_CONTENT = {
  hero_heading: 'Building Modern Digital Experiences',
  hero_subheading: 'MG Solutions',
  hero_description:
    'We design and build professional websites, web applications and digital products that help businesses grow. [Placeholder copy — edit in Admin → Website Content]',
  about_content:
    'MG Solutions is a technology-focused team helping businesses establish a strong digital presence. [Placeholder — edit in Admin]',
  mission: 'To deliver reliable, modern technology solutions that create real business value. [Placeholder — edit in Admin]',
  vision: 'To be a trusted digital solutions partner for growing businesses. [Placeholder — edit in Admin]',
  stat_projects: '25+',
  stat_clients: '18+',
  stat_years: '3+',
  stat_satisfaction: '100%',
  footer_note: '© MG Solutions. All rights reserved. [Placeholder footer text]'
};

export function getSettings() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const map = { ...DEFAULT_SETTINGS };
  rows.forEach((r) => (map[r.key] = r.value));
  return map;
}

export function getContent() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM website_content').all();
  const map = { ...DEFAULT_CONTENT };
  rows.forEach((r) => (map[r.key] = r.value));
  return map;
}

export function upsertKeyValue(table, key, value, adminEmail) {
  const db = getDb();
  db.prepare(
    `INSERT INTO ${table} (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(key, value);
}

export { DEFAULT_SETTINGS, DEFAULT_CONTENT };
