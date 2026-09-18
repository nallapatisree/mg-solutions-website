import { getDb } from '../../../lib/db';
import { getSettings } from '../../../lib/server-helpers';
import { SectionHeading } from '../../../components/ui';
import EnquiryForm from './EnquiryForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return { title: `Contact — ${settings.company_name}`, description: 'Get in touch with us to discuss your project.' };
}

export default function ContactPage() {
  const settings = getSettings();
  const db = getDb();
  const services = db
    .prepare('SELECT name FROM services WHERE is_published = 1 ORDER BY display_order ASC')
    .all()
    .map((s) => s.name);

  const waNumber = (settings.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="section container-xl">
      <SectionHeading eyebrow="Get in touch" title="Start Your Project" description="Tell us what you need and we'll get back to you shortly." align="center" />

      <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EnquiryForm services={services} />
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Quick contact</h3>
            <div className="mt-4 space-y-2">
              {waNumber ? (
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-outline w-full justify-center">
                  WhatsApp
                </a>
              ) : null}
              <a href={`tel:${settings.phone}`} className="btn-outline w-full justify-center">Call {settings.phone}</a>
              <a href={`mailto:${settings.email}`} className="btn-outline w-full justify-center">Email Us</a>
            </div>
          </div>

          <div className="card p-6 text-sm text-ink-600">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Office</h3>
            <p>{settings.address}</p>
            <p className="mt-3">{settings.email}</p>
            <p>{settings.phone}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
