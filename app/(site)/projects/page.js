import { getDb } from '../../../lib/db';
import { getSettings } from '../../../lib/server-helpers';
import { ProjectCard } from '../../../components/cards';
import { SectionHeading, EmptyState } from '../../../components/ui';
import Reveal from '../../../components/motion/Reveal';
import ProjectFilters from './ProjectFilters';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = getSettings();
  return { title: `Projects — ${settings.company_name}` };
}

export default function ProjectsPage({ searchParams }) {
  const db = getDb();
  const status = searchParams?.status || '';
  const category = searchParams?.category || '';

  let query = 'SELECT * FROM projects WHERE is_published = 1';
  const args = [];
  if (status) {
    query += ' AND status = ?';
    args.push(status);
  }
  if (category) {
    query += ' AND category = ?';
    args.push(category);
  }
  query += ' ORDER BY is_featured DESC, display_order ASC, created_at DESC';

  const projects = db.prepare(query).all(...args);
  const allCategories = db
    .prepare("SELECT DISTINCT category FROM projects WHERE is_published = 1 AND category IS NOT NULL AND category != ''")
    .all()
    .map((r) => r.category);

  return (
    <div className="section container-xl">
      <SectionHeading eyebrow="Our work" title="Project Portfolio" description="Completed, active and upcoming work from our team." align="center" />

      <ProjectFilters categories={allCategories} currentStatus={status} currentCategory={category} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length ? projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 70}><ProjectCard project={p} /></Reveal>
        )) : (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="No projects match these filters" />
          </div>
        )}
      </div>
    </div>
  );
}
