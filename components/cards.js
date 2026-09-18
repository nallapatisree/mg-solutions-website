import Link from 'next/link';
import { Badge, Stars, statusTone } from './ui';
import ServiceIcon from './visuals/ServiceIcon';
import ProjectPlaceholder from './visuals/ProjectPlaceholder';

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function ServiceCard({ service }) {
  return (
    <Link href={`/services/${service.slug}`} className="card card-lift group flex flex-col p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
        {service.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.icon_url} alt={service.image_alt || service.name} className="h-6 w-6 object-contain" />
        ) : (
          <ServiceIcon name={service.name} className="h-5 w-5" />
        )}
      </div>
      <h3 className="text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{service.name}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-500">{service.short_description}</p>
      <span className="link-arrow mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        Learn More <ArrowIcon />
      </span>
    </Link>
  );
}

export function ProjectCard({ project }) {
  let techs = [];
  try {
    techs = JSON.parse(project.technologies || '[]');
  } catch {
    techs = [];
  }

  return (
    <Link href={`/projects/${project.slug}`} className="card card-lift group overflow-hidden">
      <div className="zoom-frame aspect-video w-full bg-ink-50">
        {project.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.thumbnail_url} alt={project.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          /* No uploaded thumbnail yet — show a generated interface preview
             instead of an empty placeholder box. */
          <ProjectPlaceholder name={project.name} category={project.category} className="h-full w-full" />
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone={statusTone(project.status)}>{project.status}</Badge>
          {project.is_featured ? <Badge tone="amber">Featured</Badge> : null}
        </div>
        <h3 className="text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{project.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{project.short_description}</p>
        {techs.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techs.slice(0, 4).map((t) => (
              <span key={t} className="rounded-md bg-ink-50 px-2 py-0.5 text-xs text-ink-600">{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function AnnouncementCard({ item }) {
  return (
    <Link href={`/announcements/${item.slug}`} className="card card-lift group flex flex-col overflow-hidden">
      <div className="zoom-frame aspect-[16/9] w-full bg-ink-50">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.image_alt || item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <ProjectPlaceholder name={item.title} category={item.category} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-ink-400">
          {item.is_pinned ? <Badge tone="amber">Pinned</Badge> : null}
          <Badge tone="gray">{item.category}</Badge>
          <time dateTime={item.announcement_date}>{new Date(item.announcement_date).toLocaleDateString()}</time>
        </div>
        <h3 className="text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{item.title}</h3>
      </div>
    </Link>
  );
}

export function TestimonialCard({ t }) {
  return (
    <div className="card card-lift flex h-full flex-col p-6">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="mb-3 text-brand-100" aria-hidden="true">
        <path d="M9.5 6C6.5 6 4 8.5 4 11.5S6.5 17 9.5 17c.3 0 .5 0 .8-.1C9.6 18.7 8 20 6 20v2c4.4 0 8-3.6 8-8v-2.5C14 8.5 12.5 6 9.5 6zm10 0C16.5 6 14 8.5 14 11.5S16.5 17 19.5 17c.3 0 .5 0 .8-.1-.7 1.8-2.3 3.1-4.3 3.1v2c4.4 0 8-3.6 8-8v-2.5C24 8.5 22.5 6 19.5 6z" />
      </svg>
      <Stars rating={t.rating} />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">&ldquo;{t.feedback}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
        {t.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.image_url} alt={t.client_name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
            {t.client_name?.replace(/\[.*?\]\s*/, '')?.[0] || '?'}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">{t.client_name}</div>
          <div className="truncate text-xs text-ink-500">{t.company_name || t.service_taken}</div>
        </div>
      </div>
    </div>
  );
}
