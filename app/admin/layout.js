import { getSessionFromCookies } from '../../lib/auth';
import { getSettings } from '../../lib/server-helpers';
import AdminShell from '../../components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — MG Solutions',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }) {
  const session = getSessionFromCookies();

  // /admin/login lives under this segment but must render without the admin chrome.
  // Middleware already redirects unauthenticated users away from every other /admin route,
  // and each page re-checks the session server-side as a second line of defence.
  if (!session) {
    return <>{children}</>;
  }

  const settings = getSettings();
  return (
    <AdminShell user={{ name: session.name, email: session.email }} companyName={settings.company_name}>
      {children}
    </AdminShell>
  );
}
