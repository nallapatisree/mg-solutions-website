import { getDb } from '../lib/db';

// Dynamic sitemap: always reflects currently published content.
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const db = getDb();

  const staticRoutes = ['', '/about', '/services', '/projects', '/gallery', '/announcements', '/contact'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8
  }));

  const services = db.prepare('SELECT slug, updated_at FROM services WHERE is_published = 1').all();
  const projects = db.prepare('SELECT slug, updated_at FROM projects WHERE is_published = 1').all();
  const announcements = db.prepare('SELECT slug, updated_at FROM announcements WHERE is_published = 1').all();

  const dynamicRoutes = [
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: new Date(s.updated_at) })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: new Date(p.updated_at) })),
    ...announcements.map((a) => ({ url: `${base}/announcements/${a.slug}`, lastModified: new Date(a.updated_at) }))
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
