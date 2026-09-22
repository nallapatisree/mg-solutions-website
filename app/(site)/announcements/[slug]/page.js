import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import { Badge } from '../../../../components/ui';

export const dynamic = 'force-dynamic';

function getAnnouncement(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM announcements WHERE slug = ? AND is_published = 1').get(slug);
}

export async function generateMetadata({ params }) {
  const a = getAnnouncement(params.slug);
  if (!a) return {};
  return {
    title: a.seo_title || a.title,
    description: a.seo_description || (a.content || '').slice(0, 155),
    openGraph: { title: a.seo_title || a.title, images: a.image_url ? [a.image_url] : [] }
  };
}

export default function AnnouncementDetailPage({ params }) {
  const a = getAnnouncement(params.slug);
  if (!a) notFound();

  return (
    <article className="section container-xl max-w-3xl">
      <Link href="/announcements" className="text-sm font-medium text-brand-600 hover:underline">← All announcements</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-400">
        <Badge tone="gray">{a.category}</Badge>
        <time dateTime={a.announcement_date}>{new Date(a.announcement_date).toLocaleDateString()}</time>
      </div>
      <h1 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">{a.title}</h1>
      {a.image_url ? (
        <img src={a.image_url} alt={a.image_alt || a.title} className="mt-8 w-full rounded-2xl border border-ink-100 object-cover" loading="lazy" />
      ) : null}
      <div className="mt-8 whitespace-pre-line leading-relaxed text-ink-600">{a.content}</div>
    </article>
  );
}
