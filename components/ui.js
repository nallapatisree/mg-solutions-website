export function Badge({ children, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-ink-100 text-ink-600'
  };
  return <span className={`badge ${tones[tone] || tones.gray}`}>{children}</span>;
}

export function statusTone(status) {
  switch (status) {
    case 'Live':
      return 'green';
    case 'Completed':
      return 'brand';
    case 'In Development':
      return 'amber';
    case 'Upcoming':
      return 'gray';
    case 'New':
      return 'brand';
    case 'Contacted':
      return 'amber';
    case 'Follow Up':
      return 'amber';
    case 'Converted':
      return 'green';
    case 'Closed':
      return 'gray';
    case 'approved':
      return 'green';
    case 'pending':
      return 'amber';
    case 'rejected':
      return 'red';
    default:
      return 'gray';
  }
}

export function EmptyState({ title = 'Nothing here yet', description = '', icon = '—' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p> : null}
    </div>
  );
}

export function Stars({ rating = 5 }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label={`${full} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">
          {i < full ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-ink-500">{description}</p> : null}
    </div>
  );
}
