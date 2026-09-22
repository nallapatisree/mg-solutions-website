import { getDb } from '../../../lib/db';
import { getSettings } from '../../../lib/server-helpers';
import { SectionHeading, EmptyState } from '../../../components/ui';
import GalleryGrid from '../../../components/GalleryGrid';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: `Gallery — ${settings.company_name}`,
    description: 'A visual look at our work, projects and team updates.'
  };
}

const CATEGORY_LABELS = {
  general: 'General',
  services: 'Services',
  projects: 'Projects',
  project: 'Projects',
  announcements: 'Announcements',
  testimonials: 'Testimonials'
};

export default function GalleryPage({ searchParams }) {
  const db = getDb();
  const activeCategory = searchParams?.category || '';

  // Only files an admin has explicitly marked visible ever reach the public site.
  const items = activeCategory
    ? db.prepare('SELECT * FROM media WHERE is_visible = 1 AND category = ? ORDER BY created_at DESC').all(activeCategory)
    : db.prepare('SELECT * FROM media WHERE is_visible = 1 ORDER BY created_at DESC').all();

  const categoryCounts = db
    .prepare('SELECT category, COUNT(*) AS c FROM media WHERE is_visible = 1 GROUP BY category')
    .all()
    .filter((row) => row.category);

  return (
    <div className="section container-xl">
      <SectionHeading
        eyebrow="Our work in pictures"
        title="Gallery"
        description="Screenshots, project visuals and updates from the MG Solutions team."
        align="center"
      />

      {categoryCounts.length > 1 ? (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <a
            href="/gallery"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !activeCategory ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
            }`}
          >
            All ({categoryCounts.reduce((sum, c) => sum + c.c, 0)})
          </a>
          {categoryCounts.map((c) => (
            <a
              key={c.category}
              href={`/gallery?category=${encodeURIComponent(c.category)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === c.category ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
              }`}
            >
              {CATEGORY_LABELS[c.category] || c.category} ({c.c})
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        {items.length ? (
          <GalleryGrid items={items} />
        ) : (
          <EmptyState
            title="No images in the gallery yet"
            description="Upload images from Admin → Media, then mark them visible to have them appear here."
          />
        )}
      </div>
    </div>
  );
}
