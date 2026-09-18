'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▤' },
  { href: '/admin/services', label: 'Services', icon: '⚙' },
  { href: '/admin/projects', label: 'Projects', icon: '◧' },
  { href: '/admin/announcements', label: 'Announcements', icon: '✦' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '★' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: '✉' },
  { href: '/admin/media', label: 'Media', icon: '🖼' },
  { href: '/admin/content', label: 'Website Content', icon: '✎' },
  { href: '/admin/settings', label: 'Settings & SEO', icon: '⚑' }
];

export default function AdminShell({ user, companyName, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-ink-800 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
          {companyName?.[0] || 'M'}
        </span>
        <span className="font-semibold text-white">{companyName}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive(item.href) ? 'bg-brand-600 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
            }`}
          >
            <span aria-hidden="true" className="w-4 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <div className="px-3 py-2">
          <div className="truncate text-sm font-medium text-white">{user.name}</div>
          <div className="truncate text-xs text-ink-400">{user.email}</div>
        </div>
        <Link href="/" target="_blank" className="block rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-ink-800 hover:text-white">
          View website ↗
        </Link>
        <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-300 hover:bg-ink-800 hover:text-white">
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-64 flex-none bg-ink-950 lg:block">{sidebar}</aside>

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-ink-950 lg:hidden">{sidebar}</aside>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-ink-200 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="h-10 w-10 rounded-md text-ink-700 hover:bg-ink-50" aria-label="Open menu">☰</button>
          <span className="font-semibold text-ink-900">{companyName} Admin</span>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
