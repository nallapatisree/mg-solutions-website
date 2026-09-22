import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '../../lib/auth';
import { getDb } from '../../lib/db';
import { Badge, statusTone } from '../../components/ui';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const session = getSessionFromCookies();
  if (!session) redirect('/admin/login');

  const db = getDb();
  const one = (sql) => db.prepare(sql).get().c;

  const stats = [
    { label: 'Total Projects', value: one('SELECT COUNT(*) AS c FROM projects'), href: '/admin/projects' },
    { label: 'Active Projects', value: one("SELECT COUNT(*) AS c FROM projects WHERE status IN ('In Development','Upcoming')"), href: '/admin/projects' },
    { label: 'Completed Projects', value: one("SELECT COUNT(*) AS c FROM projects WHERE status IN ('Completed','Live')"), href: '/admin/projects' },
    { label: 'Total Services', value: one('SELECT COUNT(*) AS c FROM services'), href: '/admin/services' },
    { label: 'Total Enquiries', value: one('SELECT COUNT(*) AS c FROM enquiries'), href: '/admin/enquiries' },
    { label: 'New Enquiries', value: one("SELECT COUNT(*) AS c FROM enquiries WHERE status = 'New'"), href: '/admin/enquiries', highlight: true },
    { label: 'Total Testimonials', value: one('SELECT COUNT(*) AS c FROM testimonials'), href: '/admin/testimonials' },
    { label: 'Total Announcements', value: one('SELECT COUNT(*) AS c FROM announcements'), href: '/admin/announcements' }
  ];

  const pendingTestimonials = one("SELECT COUNT(*) AS c FROM testimonials WHERE approval_status = 'pending'");
  const recentEnquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5').all();
  const recentProjects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC LIMIT 5').all();
  const recentAnnouncements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5').all();
  const activity = db.prepare('SELECT * FROM admin_activity ORDER BY created_at DESC LIMIT 8').all();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Welcome back, {session.name}.</p>
      </div>

      {pendingTestimonials > 0 ? (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-800">
            {pendingTestimonials} testimonial{pendingTestimonials === 1 ? '' : 's'} awaiting your approval.
          </p>
          <Link href="/admin/testimonials?status=pending" className="text-sm font-semibold text-amber-900 hover:underline">Review →</Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:shadow-card">
            <div className={`text-2xl font-bold ${s.highlight && s.value > 0 ? 'text-brand-600' : 'text-ink-900'}`}>{s.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">{s.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/projects?new=1" className="btn-outline">+ New Project</Link>
          <Link href="/admin/services?new=1" className="btn-outline">+ New Service</Link>
          <Link href="/admin/announcements?new=1" className="btn-outline">+ New Announcement</Link>
          <Link href="/admin/testimonials?new=1" className="btn-outline">+ New Testimonial</Link>
          <Link href="/admin/content" className="btn-outline">Edit Website Content</Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {recentEnquiries.length ? (
            <ul className="divide-y divide-ink-100">
              {recentEnquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink-800">{e.name}</div>
                    <div className="truncate text-xs text-ink-400">{e.service_requested || e.email}</div>
                  </div>
                  <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-ink-400">No enquiries yet</p>}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent Projects</h2>
            <Link href="/admin/projects" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {recentProjects.length ? (
            <ul className="divide-y divide-ink-100">
              {recentProjects.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="truncate text-sm font-medium text-ink-800">{p.name}</span>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-ink-400">No projects yet</p>}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent Announcements</h2>
            <Link href="/admin/announcements" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {recentAnnouncements.length ? (
            <ul className="divide-y divide-ink-100">
              {recentAnnouncements.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="truncate text-sm font-medium text-ink-800">{a.title}</span>
                  <Badge tone={a.is_published ? 'green' : 'gray'}>{a.is_published ? 'Published' : 'Draft'}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-ink-400">No announcements yet</p>}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-ink-900">Recent Admin Activity</h2>
          {activity.length ? (
            <ul className="divide-y divide-ink-100">
              {activity.map((a) => (
                <li key={a.id} className="py-3">
                  <div className="text-sm text-ink-800">{a.action}</div>
                  <div className="text-xs text-ink-400">{a.admin_email} · {new Date(a.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-ink-400">No activity recorded yet</p>}
        </div>
      </div>
    </div>
  );
}
