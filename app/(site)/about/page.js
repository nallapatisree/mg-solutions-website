import { getContent, getSettings } from '../../../lib/server-helpers';
import { SectionHeading } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return { title: `About — ${settings.company_name}`, description: settings.seo_description };
}

export default function AboutPage() {
  const content = getContent();

  return (
    <div className="section container-xl">
      <SectionHeading eyebrow="About us" title="About MG Solutions" description={content.about_content} />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="card p-8">
          <h3 className="text-lg font-semibold text-ink-900">Our Mission</h3>
          <p className="mt-3 text-sm text-ink-600">{content.mission}</p>
        </div>
        <div className="card p-8">
          <h3 className="text-lg font-semibold text-ink-900">Our Vision</h3>
          <p className="mt-3 text-sm text-ink-600">{content.vision}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Core Values</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            {['Quality craftsmanship', 'Transparent communication', 'Client-first thinking', 'Continuous improvement'].map((v) => (
              <li key={v} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {v}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Areas of Expertise</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Web Development', 'E-Commerce', 'UI/UX Design', 'SEO', 'Web Applications', 'Software Solutions'].map((t) => (
              <span key={t} className="rounded-full bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-600">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-12 text-xs text-ink-400">
        Note: All copy on this page is editable from Admin → Website Content, and is currently placeholder text pending real company information.
      </p>
    </div>
  );
}
