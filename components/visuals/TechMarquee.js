/**
 * A continuously scrolling band of technology names.
 * The list is duplicated so the CSS translate loop is seamless.
 * Pauses on hover, and stops entirely under `prefers-reduced-motion`.
 */
const TECHNOLOGIES = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Figma', 'Stripe', 'GraphQL'
];

export default function TechMarquee() {
  const items = [...TECHNOLOGIES, ...TECHNOLOGIES];

  return (
    <div className="marquee" aria-label="Technologies we work with">
      <div className="marquee-track">
        {items.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            className="mx-5 whitespace-nowrap text-sm font-semibold text-ink-400 transition-colors hover:text-brand-600"
            aria-hidden={i >= TECHNOLOGIES.length}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
