import { getDb } from '../../../lib/db';
import { getSettings } from '../../../lib/server-helpers';
import { ServiceCard } from '../../../components/cards';
import { SectionHeading, EmptyState } from '../../../components/ui';
import Reveal from '../../../components/motion/Reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return { title: `Services — ${settings.company_name}` };
}

export default function ServicesPage() {
  const db = getDb();
  const services = db.prepare('SELECT * FROM services WHERE is_published = 1 ORDER BY display_order ASC').all();

  return (
    <div className="section container-xl">
      <SectionHeading eyebrow="What we offer" title="Our Services" description="Modern, focused technology services designed for growing businesses." align="center" />
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.length ? services.map((s, i) => (
          <Reveal key={s.id} delay={i * 70}><ServiceCard service={s} /></Reveal>
        )) : (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="No services published yet" />
          </div>
        )}
      </div>
    </div>
  );
}
