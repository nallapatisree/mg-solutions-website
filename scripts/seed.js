#!/usr/bin/env node
/**
 * Seeds the database with clearly-marked PLACEHOLDER demo content so the site
 * is not empty during development.
 *
 *   npm run seed
 *
 * IMPORTANT: none of this is real MG Solutions information. Every record is
 * editable and deletable from the Admin CMS.
 */
require('dotenv').config();

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './data/mgsolutions.db';
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Reuse the same schema the app creates at runtime.
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- Services ----------
const SERVICES = [
  ['Website Development', 'Custom, responsive websites built on modern frameworks.'],
  ['E-Commerce Development', 'Online stores with secure checkout and inventory management.'],
  ['Business Websites', 'Professional websites that establish credibility and generate leads.'],
  ['Custom Web Applications', 'Tailored web apps that automate and streamline operations.'],
  ['UI/UX Design', 'Clean, user-focused interface design backed by research.'],
  ['SEO Services', 'Technical and on-page SEO to improve search visibility.'],
  ['Website Maintenance', 'Ongoing updates, security patches and performance monitoring.'],
  ['Software Solutions', 'Purpose-built software aligned to specific business processes.'],
  ['Digital Solutions', 'End-to-end digital transformation support.'],
  ['Innovative Business Solutions', 'Technology-led approaches to complex business problems.']
];

const insertService = db.prepare(`
  INSERT OR IGNORE INTO services (name, slug, short_description, detailed_description, display_order, is_published, seo_title, seo_description)
  VALUES (?, ?, ?, ?, ?, 1, ?, ?)
`);

SERVICES.forEach(([name, short], i) => {
  insertService.run(
    name,
    slugify(name),
    short,
    `${short}\n\n[PLACEHOLDER DETAILED DESCRIPTION] This section describes the ${name} service in depth — the process, deliverables and typical timelines. Replace this text from Admin → Services.`,
    i,
    `${name} — MG Solutions`,
    short
  );
});

// ---------- Projects ----------
const PROJECTS = [
  ['Sample Retail Storefront', 'E-Commerce', 'Completed', 1, ['Next.js', 'Stripe', 'PostgreSQL']],
  ['Sample Corporate Website', 'Business Website', 'Live', 1, ['React', 'Tailwind CSS', 'Node.js']],
  ['Sample Inventory Dashboard', 'Web Application', 'In Development', 0, ['React', 'Express', 'MySQL']],
  ['Sample Booking Platform', 'Web Application', 'Upcoming', 0, ['Next.js', 'Prisma', 'SQLite']],
  ['Sample Portfolio Site', 'Business Website', 'Completed', 0, ['Astro', 'Tailwind CSS']],
  ['Sample Learning Portal', 'Web Application', 'Live', 1, ['Next.js', 'TypeScript', 'PostgreSQL']]
];

const insertProject = db.prepare(`
  INSERT OR IGNORE INTO projects
    (name, slug, short_description, detailed_description, client_name, category, technologies, project_url, completion_date, status, is_featured, is_published, display_order, seo_title, seo_description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
`);

PROJECTS.forEach(([name, category, status, featured, techs], i) => {
  const short = `[PLACEHOLDER] A demonstration ${category.toLowerCase()} project used to illustrate the portfolio layout.`;
  insertProject.run(
    name,
    slugify(name),
    short,
    `${short}\n\n[PLACEHOLDER DETAILED DESCRIPTION] Describe the brief, the approach taken, technical challenges and the outcome. Replace this from Admin → Projects.`,
    '[Placeholder Client]',
    category,
    JSON.stringify(techs),
    '',
    status === 'Completed' || status === 'Live' ? '2025-06-15' : null,
    status,
    featured,
    i,
    `${name} — MG Solutions`,
    short
  );
});

// ---------- Announcements ----------
const ANNOUNCEMENTS = [
  ['Welcome to the New MG Solutions Website', 'Company Announcement', 1],
  ['New Service: Custom Web Applications', 'New Service Launch', 0],
  ['We Are Hiring Frontend Developers', 'Hiring Update', 0],
  ['Sample Project Launch Announcement', 'New Project Launch', 0]
];

const insertAnnouncement = db.prepare(`
  INSERT OR IGNORE INTO announcements (title, slug, content, announcement_date, category, is_published, is_pinned, is_featured, seo_title, seo_description)
  VALUES (?, ?, ?, date('now', ?), ?, 1, ?, ?, ?, ?)
`);

ANNOUNCEMENTS.forEach(([title, category, pinned], i) => {
  const body = `[PLACEHOLDER ANNOUNCEMENT CONTENT] This is demo content for "${title}". Replace or delete it from Admin → Announcements.`;
  insertAnnouncement.run(
    title, slugify(title), body, `-${i * 7} days`, category, pinned, i === 0 ? 1 : 0,
    `${title} — MG Solutions`, body.slice(0, 150)
  );
});

// ---------- Testimonials ----------
const TESTIMONIALS = [
  ['[Placeholder] Anita R.', 'Sample Retail Co.', 5, 'approved', 1],
  ['[Placeholder] Vikram S.', 'Sample Logistics Ltd.', 5, 'approved', 1],
  ['[Placeholder] Priya M.', 'Sample Consulting', 4, 'approved', 0],
  ['[Placeholder] Rahul K.', 'Sample Startup', 5, 'pending', 0]
];

const insertTestimonial = db.prepare(`
  INSERT OR IGNORE INTO testimonials (client_name, company_name, rating, feedback, service_taken, approval_status, is_featured, is_visible)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

TESTIMONIALS.forEach(([name, company, rating, statusVal, featured]) => {
  insertTestimonial.run(
    name, company, rating,
    '[PLACEHOLDER FEEDBACK] Demo testimonial text used to show the testimonial layout. This is not real client feedback. Manage it from Admin → Testimonials.',
    'Website Development', statusVal, featured
  );
});

// ---------- Enquiries ----------
const insertEnquiry = db.prepare(`
  INSERT OR IGNORE INTO enquiries (name, email, mobile, company_name, service_requested, budget_range, project_description, message, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

[
  ['[Demo] Sample Enquiry One', 'demo1@example.com', 'New'],
  ['[Demo] Sample Enquiry Two', 'demo2@example.com', 'Contacted']
].forEach(([name, email, statusVal]) => {
  insertEnquiry.run(
    name, email, '+910000000000', 'Sample Company', 'Website Development', 'Not sure yet',
    '[PLACEHOLDER] Demo enquiry used to populate the admin enquiry list.',
    '[PLACEHOLDER] Demo message.', statusVal
  );
});

console.log('✓ Database seeded with placeholder demo content.');
console.log('  All demo records are clearly marked and can be edited or deleted from the Admin CMS.');
db.close();
