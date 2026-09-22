import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSessionFromCookies } from '../../../lib/auth';
import EnquiryManager from '../../../components/admin/EnquiryManager';

export const dynamic = 'force-dynamic';

export default function Page() {
  if (!getSessionFromCookies()) redirect('/admin/login');
  return (
    <Suspense fallback={<div className="card p-12 text-center text-sm text-ink-400">Loading…</div>}>
      <EnquiryManager />
    </Suspense>
  );
}
