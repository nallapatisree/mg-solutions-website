import { getDb } from '../../../lib/db';
import { getSettings } from '../../../lib/server-helpers';
import { AnnouncementCard } from '../../../components/cards';
import { SectionHeading, EmptyState } from '../../../components/ui';
import Reveal from '../../../components/motion/Reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return { title: `Announcements — ${settings.company_name}` };
}

export default function AnnouncementsPage() {
  const db = getDb();
  const items = db
    .prepare('SELECT * FROM announcements WHERE is_published = 1 ORDER BY is_pinned DESC, announcement_date DESC')
    .all();

  return (
    <div className="section container-xl">
      <SectionHeading eyebrow="News & updates" title="Announcements" description="Company news, launches and important notices." align="center" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length ? items.map((a, i) => (
          <Reveal key={a.id} delay={i * 70}><AnnouncementCard item={a} /></Reveal>
        )) : (
          <div className="sm:col-span-2 lg:col-span-3"><EmptyState title="No announcements published yet" /></div>
        )}
      </div>
    </div>
  );
}
