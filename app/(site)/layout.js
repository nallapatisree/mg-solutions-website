import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getSettings, getContent } from '../../lib/server-helpers';
import { getSessionFromCookies } from '../../lib/auth';
import ScrollToTop from '../../components/motion/ScrollToTop';

export default function SiteLayout({ children }) {
  const settings = getSettings();
  const content = getContent();
  const isMaintenanceOn = settings.maintenance_mode === '1';
  const isAdmin = !!getSessionFromCookies();

  if (isMaintenanceOn && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-white">
        <div className="mb-4 text-3xl font-bold">{settings.company_name}</div>
        <h1 className="text-xl font-semibold">We&apos;ll be back shortly</h1>
        <p className="mt-3 max-w-md text-ink-300">
          The site is currently undergoing scheduled maintenance. Please check back soon.
        </p>
        <a href="/admin/login" className="mt-8 text-xs text-ink-500 hover:text-ink-300">
          Admin access
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header companyName={settings.company_name} logo={settings.company_logo} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} footerNote={content.footer_note} />
      <ScrollToTop />
    </div>
  );
}
