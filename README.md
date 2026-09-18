# MG Solutions — Website + Admin CMS

A production-ready full-stack company website with a secure Admin Content Management System.
Administrators manage every piece of public content — services, projects, announcements,
testimonials, enquiries, media, site copy, contact details and SEO — without touching source code.

> **Placeholder content notice**
> Company phone, address, logo, brand colours and all demo records are **clearly marked
> placeholders**. No invented information is presented as real MG Solutions data.
> Everything is editable from the Admin CMS.

---

## 1. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | One codebase for public site, admin UI and API. Server Components keep DB queries off the client. |
| Language | JavaScript (ES modules) | No build-step friction; easy for another developer to pick up. |
| Database | **SQLite** via `better-sqlite3` | Zero external server to install or pay for. Synchronous driver, real SQL, real relations and indexes. Migrating to PostgreSQL later means swapping `lib/db.js` only. |
| Auth | **JWT in an httpOnly cookie** + `bcryptjs` (cost 12) | Stateless, no session store, cookie unreadable from JavaScript. |
| Styling | **Tailwind CSS** | Consistent spacing/typography scale, no stylesheet sprawl. |
| Uploads | Local filesystem → `/public/uploads` | Validated by MIME type and size, stored under random safe filenames. |

## 2. Project structure

```
mg-solutions/
├── app/
│   ├── (site)/                  # Public website (shared layout + maintenance gate)
│   │   ├── page.js              # Home
│   │   ├── about/
│   │   ├── services/            # + [slug] detail
│   │   ├── projects/            # + [slug] detail, ProjectFilters
│   │   ├── announcements/       # + [slug] detail
│   │   └── contact/             # + EnquiryForm
│   ├── admin/                   # Admin CMS (auth-guarded)
│   │   ├── login/
│   │   ├── page.js              # Dashboard
│   │   ├── services|projects|announcements|testimonials/
│   │   ├── enquiries/  media/  content/  settings/
│   │   └── layout.js
│   ├── api/
│   │   ├── auth/login|logout/
│   │   ├── enquiries/           # PUBLIC — contact form intake
│   │   ├── testimonials/        # PUBLIC — client feedback (always `pending`)
│   │   ├── upload/              # ADMIN — validated media upload
│   │   └── admin/
│   │       ├── [resource]/      # Generic CRUD: list + create
│   │       │   └── [id]/        # Generic CRUD: read, update, patch, delete
│   │       ├── content|settings|media|screenshots/
│   ├── sitemap.js  robots.js  not-found.js  error.js  layout.js
├── components/
│   ├── Header.js  Footer.js  cards.js  ui.js
│   └── admin/  AdminShell, ResourceManager, EnquiryManager,
│               KeyValueEditor, MediaLibrary, ImageUploader,
│               ScreenshotManager, ConfirmDialog, Toast
├── lib/
│   ├── db.js                    # Connection + schema/migrations + activity log
│   ├── auth.js                  # Hashing, JWT signing, cookie handling
│   ├── validate.js              # Server-side validation primitives
│   ├── slug.js                  # Collision-free slug generation
│   ├── uploads.js               # File type/size validation, safe filenames
│   ├── server-helpers.js        # requireAdmin guard, settings/content accessors
│   └── resource-config.js       # Single source of truth for all managed entities
├── scripts/  create-admin.js  seed.js  schema.sql
├── middleware.js                # Edge guard for /admin
└── .env.example
```

### Architectural note: the config-driven CRUD core

`lib/resource-config.js` defines each managed entity once — its table, fields, types,
validation rules, list columns and sort order. That single definition drives **both**:

* the generic API at `app/api/admin/[resource]/` (list, create, read, update, patch, delete), and
* the generic admin UI in `components/admin/ResourceManager.js` (table, filters, pagination, form drawer, confirm dialogs, toasts).

**Adding a new module means adding one table and one config entry — no new API routes, no new UI.**
This is what keeps the future-expansion modules (employees, invoices, tickets, blog) cheap to add
without complicating the current application.

Separation of concerns is enforced by directory: UI in `components/`, business logic and data
access in `lib/`, HTTP surface in `app/api/`, presentation in `app/`.

## 3. Database schema

| Table | Purpose | Key relationships |
|---|---|---|
| `admin_users` | Admin accounts | — |
| `services` | Service catalogue | referenced by slug |
| `projects` | Portfolio | 1 → many `project_screenshots` |
| `project_screenshots` | Gallery images | FK → `projects(id)` **ON DELETE CASCADE** |
| `announcements` | Company updates | — |
| `testimonials` | Client feedback + approval workflow | — |
| `enquiries` | Contact form submissions + private notes | — |
| `website_content` | Key/value site copy | — |
| `settings` | Key/value global config | — |
| `media` | Uploaded file registry | — |
| `admin_activity` | Audit trail of admin actions | — |

Indexes exist on `projects(status)`, `projects(is_published)`, `announcements(is_published)`,
`testimonials(approval_status, is_visible)` and `enquiries(status)` — the columns every public
and admin list query filters on.

Schema is applied automatically on first connection (`runMigrations` in `lib/db.js`), so there is
no separate migration step to run.

## 4. Environment variables

Copy `.env.example` to `.env` and fill it in. **Never commit `.env`.**

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_PATH` | yes | SQLite file location |
| `JWT_SECRET` | **yes in production** | Signs admin session tokens. App refuses to start in production with the placeholder value. |
| `SESSION_HOURS` | no | Session lifetime (default 12) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | bootstrap only | Used by `npm run create-admin` |
| `UPLOAD_DIR` | no | Upload destination (default `./public/uploads`) |
| `MAX_UPLOAD_MB` | no | Per-file size cap (default 5) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Absolute URLs in sitemap and Open Graph tags |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | no | Also settable from Admin → Settings |

## 5. Installation & running locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then generate a real secret and paste it into JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Seed placeholder demo content (optional but recommended)
npm run seed

# 4. Create your first admin account
npm run create-admin
#    ...or explicitly:
node scripts/create-admin.js you@company.com "YourStrongPassword" "Your Name"

# 5. Start the dev server
npm run dev
```

* Public website → http://localhost:3000
* Admin CMS → http://localhost:3000/admin

**Database setup:** none required beyond the above. The SQLite file and full schema are created
automatically on first run. To reset completely, delete the `data/` folder and re-run `npm run seed`.

## 6. Production build & deployment

```bash
npm run build
npm start
```

**Deployment checklist**

1. Set `JWT_SECRET` to a fresh 48-byte random value — never reuse the development one.
2. Set `NEXT_PUBLIC_SITE_URL` to your real domain so sitemap/OG URLs are absolute.
3. Serve over HTTPS. Session cookies are automatically flagged `secure` when `NODE_ENV=production`.
4. Mount **persistent storage** for `data/` (the database) and `public/uploads/` (media).
   On ephemeral-filesystem hosts (Vercel, Heroku) these are wiped on redeploy — use a VPS,
   Render/Railway with a persistent disk, or Docker with volumes.
5. Back up `data/mgsolutions.db` and `public/uploads/` together — they are a matched pair.
6. Put the app behind a reverse proxy (nginx/Caddy) for TLS termination, gzip and rate limiting on `/api/auth/login`.

**Recommended:** a small VPS with nginx + PM2, or a container platform with a persistent volume.

## 7. Security considerations

**Implemented**

* Passwords hashed with bcrypt at cost 12 — plain text is never stored or logged.
* Sessions are JWTs in `httpOnly`, `sameSite=lax`, `secure`-in-production cookies — unreadable by client JavaScript, which blocks token theft via XSS.
* Two layers of admin protection: `middleware.js` rejects unauthenticated `/admin` requests at the edge, and every admin page and API route independently calls `requireAdmin()` / checks the session server-side.
* All writes are server-validated in `lib/validate.js`. Client-side validation exists only for UX and is never trusted.
* All SQL uses prepared statements with bound parameters — no string interpolation of user input.
* `PATCH` updates are restricted to an explicit column whitelist, so a crafted request cannot flip arbitrary fields.
* Uploads are validated by MIME type **and** extension against an allow-list, size-capped, and written with generated random filenames — an uploaded file can never overwrite an existing one or execute.
* Media deletion resolves paths and confirms they sit inside the uploads root, blocking path traversal.
* Login returns an identical message for unknown accounts and wrong passwords, preventing account enumeration.
* Public error responses are generic; stack traces and DB errors are never sent to the browser.
* `/admin` and `/api` are excluded in `robots.js` and the admin layout sets `noindex`.
* Admin actions are recorded in `admin_activity` for audit.
* Private enquiry notes are stored in a column no public query ever reads.

**Before going live, also consider**

* Rate limiting on `/api/auth/login` and `/api/enquiries` (nginx `limit_req` or a middleware counter) — the app does not rate limit by default.
* CAPTCHA or a honeypot field on the public contact form if spam becomes an issue.
* Rotating `JWT_SECRET` periodically; this invalidates all active sessions by design.

## 8. Future expansion

The architecture already supports the planned modules without restructuring:

* **Adding a CRUD module** (Blog, Careers, Invoices, Quotations, Support Tickets): add the table to `lib/db.js`, add an entry to `lib/resource-config.js`, and add a four-line page that renders `<ResourceManager resourceKey="..." />`. The API and UI come for free.
* **Employee / Client portals**: `admin_users` already carries a `role` column. Add roles (`employee`, `client`), extend `requireAdmin()` into a `requireRole(...)` guard, and add route groups `app/(employee)` and `app/(client)` mirroring `app/(site)`. The employee-management dashboard remains a **separate project** as specified — nothing here has been complicated to anticipate it.
* **Email / WhatsApp notifications**: add a `lib/notify.js` service and call it from the enquiry API route. The route is already the single intake point.
* **Scaling past SQLite**: `lib/db.js` is the only file that knows about the database driver. Swapping to PostgreSQL means rewriting that one module and adjusting the `datetime('now')` defaults.
* **Moving media to object storage**: `lib/uploads.js` is the only file that touches the filesystem. Replace `saveUpload` with an S3/R2 client and the rest of the app is unchanged.

## 9. Verifying the data flow

Every admin feature is wired end to end — Admin UI → API → validation → database → public website.
To confirm:

1. Sign in at `/admin`, open **Services**, create a service, leave it published → it appears at `/services` and on the homepage immediately.
2. Open **Projects**, create one, save, reopen it and upload screenshots → they render in the gallery at `/projects/<slug>`.
3. Create an **Announcement** → it appears on the homepage and at `/announcements`.
4. Submit the form at `/contact` → the enquiry appears under **Admin → Enquiries**; change its status and add a private note (never exposed publicly).
5. Create a testimonial with status `pending` → it does **not** appear publicly; approve it → it appears.
6. Edit **Website Content** or **Settings** → hero copy, stats, contact details and footer update across the site.
7. Toggle **maintenance mode** in Settings → public visitors see the maintenance page while your admin session retains full access.
