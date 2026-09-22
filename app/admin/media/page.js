import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '../../../lib/auth';
import MediaLibrary from '../../../components/admin/MediaLibrary';

export const dynamic = 'force-dynamic';

export default function Page() {
  if (!getSessionFromCookies()) redirect('/admin/login');
  return <MediaLibrary />;
}
