import Link from 'next/link';
import { getDb } from '../../lib/db';
import { getContent, getSettings } from '../../lib/server-helpers';
import { ServiceCard, ProjectCard, AnnouncementCard, TestimonialCard } from '../../components/cards';
import { SectionHeading, EmptyState } from '../../components/ui';
import HeroMockup from '../../components/visuals/HeroMockup';
import TechMarquee from '../../components/visuals/TechMarquee';
import ServiceIcon from '../../components/visuals/ServiceIcon';
import Reveal from '../../components/motion/Reveal';
import CountUp from '../../components/motion/CountUp';

export const dynamic = 'force-dynamic';

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function HomePage() {
  const db = getDb();
  const content = getContent();
  const settings = getSettings();

  const services = db.prepare('SELECT * FROM services WHERE is_published = 1 ORDER BY display_order ASC LIMIT 6').all();
  const projects = db.prepare(
    'SELECT * FROM projects WHERE is_published = 1 ORDER BY is_featured DESC, display_order ASC, created_at DESC LIMIT 3'
  ).all();
  const announcements = db.prepare(
    'SELECT * FROM announcements WHERE is_published = 1 ORDER BY is_pinned DESC, announcement_date DESC LIMIT 3'
  ).all();
  const testimonials = db.prepare(
    "SELECT * FROM testimonials WHERE approval_status = 'approved' AND is_visible = 1 ORDER BY is_featured DESC, created_at DESC LIMIT 3"
  ).all();

  const stats = [
    { label: 'Projects Delivered', value: content.stat_projects },
    { label: 'Happy Clients', value: content.stat_clients },
    { label: 'Years Active', value: content.stat_years },
    { label: 'Client Satisfaction', value: content.stat_satisfaction }
  ];

  const reasons = [
    { title: 'Modern engineering', text: 'Current frameworks, clean architecture and code your next developer can actually maintain.' },
    { title: 'Transparent process', text: 'Clear milestones and regular updates. You always know what stage your project is at.' },
    { title: 'Built to scale', text: 'Architecture that supports new modules and traffic growth without a costly rebuild.' },
    { title: 'Support after launch', text: 'We stay available for updates, fixes and improvements once you go live.' }
  ];

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="hero-grid absolute inset-0" aria-hidden="true" />
        <div className="hero-orb -left-20 top-0 h-72 w-72 bg-brand-300" aria-hidden="true" />
        <div className="hero-orb -right-10 top-32 h-64 w-64 bg-sky-300" style={{ animationDelay: '5s' }} aria-hidden="true" />

        <div className="container-xl relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:py-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
                </span>
                {content.hero_subheading}
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
                {content.hero_heading}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">{content.hero_description}</p>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary group px-6 py-3 text-base">
                  Start a Project <span className="link-arrow"><ArrowIcon /></span>
                </Link>
                <Link href="/services" className="btn-outline px-6 py-3 text-base">View Services</Link>
                <Link href="/projects" className="btn-ghost px-6 py-3 text-base">View Projects</Link>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-ink-100 pt-6">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-bold text-ink-900"><CountUp value={s.value} /></div>
                    <div className="text-xs text-ink-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:pl-4">
            <HeroMockup />
          </Reveal>
        </div>

        {/* Technology band */}
        <div className="relative border-y border-ink-100 bg-white/70 py-5 backdrop-blur">
          <p className="container-xl mb-3 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
            Technologies we work with
          </p>
          <TechMarquee />
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="section">
        <div className="container-xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="What we do" title="Our Services" description="Focused, modern technology services for growing businesses." />
              <Link href="/services" className="btn-outline">View all services</Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.length ? (
              services.map((s, i) => (
                <Reveal key={s.id} delay={i * 70}>
                  <ServiceCard service={s} />
                </Reveal>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState title="No services published yet" description="Add services from Admin → Services." />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Featured projects ---------------- */}
      <section className="section bg-ink-50/60">
        <div className="container-xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Our work" title="Featured Projects" description="A look at what we've been building." />
              <Link href="/projects" className="btn-outline">View all projects</Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length ? (
              projects.map((p, i) => (
                <Reveal key={p.id} delay={i * 90}>
                  <ProjectCard project={p} />
                </Reveal>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState title="No projects published yet" description="Add projects from Admin → Projects." />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Why choose us + stats ---------------- */}
      <section className="section">
        <div className="container-xl grid gap-12 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <SectionHeading eyebrow="Why MG Solutions" title="Why Choose Us" description={content.about_content} />
            <ul className="mt-7 space-y-5">
              {reasons.map((r) => (
                <li key={r.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-600 text-white">
                    <CheckIcon />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{r.title}</div>
                    <p className="mt-0.5 text-sm text-ink-500">{r.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="card card-lift relative overflow-hidden p-6 text-center">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700" />
                  <div className="text-3xl font-bold text-brand-600">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="mt-1 text-sm text-ink-500">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Process ---------------- */}
      <section className="section bg-ink-50/60">
        <div className="container-xl">
          <Reveal>
            <SectionHeading eyebrow="How we work" title="A Clear, Simple Process" align="center" />
          </Reveal>

          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line on large screens */}
            <div className="absolute left-0 right-0 top-6 hidden border-t-2 border-dashed border-ink-200 lg:block" aria-hidden="true" />

            {[
              { step: '01', title: 'Discovery', text: 'We learn your goals, audience and constraints before writing any code.' },
              { step: '02', title: 'Design', text: 'Wireframes and visual design so you see the result before development starts.' },
              { step: '03', title: 'Development', text: 'Clean, tested implementation with regular progress updates.' },
              { step: '04', title: 'Launch & Support', text: 'Deployment, handover and ongoing maintenance as you grow.' }
            ].map((p, i) => (
              <Reveal key={p.step} delay={i * 110}>
                <div className="relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-600 bg-white text-sm font-bold text-brand-600">
                    {p.step}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Announcements ---------------- */}
      <section className="section">
        <div className="container-xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Stay updated" title="Latest Announcements" />
              <Link href="/announcements" className="btn-outline">View all updates</Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.length ? (
              announcements.map((a, i) => (
                <Reveal key={a.id} delay={i * 90}>
                  <AnnouncementCard item={a} />
                </Reveal>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState title="No announcements yet" description="Publish updates from Admin → Announcements." />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="section bg-ink-50/60">
        <div className="container-xl">
          <Reveal>
            <SectionHeading eyebrow="Client feedback" title="What Our Clients Say" align="center" />
          </Reveal>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.length ? (
              testimonials.map((t, i) => (
                <Reveal key={t.id} delay={i * 90}>
                  <TestimonialCard t={t} />
                </Reveal>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState title="No approved testimonials yet" description="Approve client feedback from Admin → Testimonials." />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Contact CTA ---------------- */}
      <section className="section">
        <div className="container-xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 px-8 py-14 text-center text-white sm:px-16">
              {/* Decorative rings */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />

              <h2 className="relative mx-auto max-w-xl text-2xl font-bold sm:text-3xl">
                Have a project in mind? Let&apos;s build it together.
              </h2>
              <p className="relative mx-auto mt-3 max-w-lg text-brand-100">
                Tell us what you need and we&apos;ll get back to you with a clear plan and timeline.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50 active:scale-[0.98]">
                  Get a Quote
                </Link>
                <a href={`tel:${settings.phone}`} className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10 active:scale-[0.98]">
                  Call Us
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
