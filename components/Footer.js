import Link from 'next/link';

export default function Footer({ settings, footerNote }) {
  const socials = [
    { key: 'social_linkedin', label: 'LinkedIn' },
    { key: 'social_twitter', label: 'Twitter / X' },
    { key: 'social_instagram', label: 'Instagram' },
    { key: 'social_facebook', label: 'Facebook' }
  ].filter((s) => settings[s.key]);

  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-200">
      <div className="container-xl grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 text-lg font-bold text-white">{settings.company_name}</div>
          <p className="text-sm text-ink-400">{settings.seo_description}</p>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
            <li><Link href="/announcements" className="hover:text-white">Announcements</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Contact</div>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
            <li className="max-w-xs">{settings.address}</li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Connect</div>
          {socials.length ? (
            <ul className="space-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={settings[s.key]} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">[Social links — add in Admin]</p>
          )}
        </div>
      </div>

      <div className="border-t border-ink-800 py-5 text-center text-xs text-ink-500">
        {footerNote}
      </div>
    </footer>
  );
}
