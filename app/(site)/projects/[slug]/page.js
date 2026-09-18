import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import { Badge, statusTone } from '../../../../components/ui';
import ProjectPlaceholder from '../../../../components/visuals/ProjectPlaceholder';
import Reveal from '../../../../components/motion/Reveal';

export const dynamic = 'force-dynamic';

function getProject(slug) {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE slug = ? AND is_published = 1').get(slug);
  if (!project) return null;
  const screenshots = db
    .prepare('SELECT * FROM project_screenshots WHERE project_id = ? ORDER BY display_order ASC')
    .all(project.id);
  return { ...project, screenshots };
}

export async function generateMetadata({ params }) {
  const p = getProject(params.slug);
  if (!p) return {};
  return {
    title: p.seo_title || p.name,
    description: p.seo_description || p.short_description,
    openGraph: { title: p.seo_title || p.name, description: p.seo_description || p.short_description, images: p.thumbnail_url ? [p.thumbnail_url] : [] }
  };
}

export default function ProjectDetailPage({ params }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  let techs = [];
  try { techs = JSON.parse(project.technologies || '[]'); } catch { techs = []; }

  return (
    <div className="section container-xl max-w-4xl">
      <Link href="/projects" className="text-sm font-medium text-brand-600 hover:underline">← All projects</Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge tone={statusTone(project.status)}>{project.status}</Badge>
        {project.category ? <Badge tone="gray">{project.category}</Badge> : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">{project.name}</h1>
      <p className="mt-3 text-lg text-ink-500">{project.short_description}</p>

      <Reveal>
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink-100">
          {project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.name} className="w-full object-cover" loading="lazy" />
          ) : (
            <ProjectPlaceholder name={project.name} category={project.category} className="w-full" />
          )}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-ink-900">About this project</h2>
          <p className="mt-3 whitespace-pre-line text-ink-600">{project.detailed_description || project.short_description}</p>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Project details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {project.client_name ? (
                <div><dt className="text-ink-400">Client</dt><dd className="font-medium text-ink-800">{project.client_name}</dd></div>
              ) : null}
              {project.completion_date ? (
                <div><dt className="text-ink-400">Completed</dt><dd className="font-medium text-ink-800">{new Date(project.completion_date).toLocaleDateString()}</dd></div>
              ) : null}
              <div><dt className="text-ink-400">Status</dt><dd className="font-medium text-ink-800">{project.status}</dd></div>
            </dl>
            {project.project_url ? (
              <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full justify-center">
                Visit Project
              </a>
            ) : null}
          </div>

          {techs.length ? (
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Technologies</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {techs.map((t) => (
                  <span key={t} className="rounded-md bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">{t}</span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {project.screenshots?.length ? (
        <div className="mt-14">
          <h2 className="text-lg font-semibold text-ink-900">Screenshots</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {project.screenshots.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <img
                  src={s.image_url}
                  alt={s.alt_text || `${project.name} screenshot`}
                  className="w-full rounded-xl border border-ink-100 object-cover transition-transform duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </Reveal>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
