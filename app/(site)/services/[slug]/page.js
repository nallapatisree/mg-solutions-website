import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import ServiceIcon from '../../../../components/visuals/ServiceIcon';

export const dynamic = 'force-dynamic';

function getService(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM services WHERE slug = ? AND is_published = 1').get(slug);
}

export async function generateMetadata({ params }) {
  const service = getService(params.slug);
  if (!service) return {};
  return {
    title: service.seo_title || service.name,
    description: service.seo_description || service.short_description
  };
}

export default function ServiceDetailPage({ params }) {
  const service = getService(params.slug);
  if (!service) notFound();

  return (
    <div className="section container-xl max-w-3xl">
      <Link href="/services" className="text-sm font-medium text-brand-600 hover:underline">← All services</Link>
      <div className="mt-4 flex items-center gap-4">
        {service.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.icon_url} alt={service.image_alt || service.name} className="h-14 w-14 rounded-xl object-contain" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <ServiceIcon name={service.name} className="h-7 w-7" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-ink-900">{service.name}</h1>
      </div>
      <p className="mt-6 whitespace-pre-line text-ink-600">{service.detailed_description || service.short_description}</p>

      <div className="mt-10">
        <Link href="/contact" className="btn-primary px-6 py-3">Get a Quote for This Service</Link>
      </div>
    </div>
  );
}
