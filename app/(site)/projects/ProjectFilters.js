'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PROJECT_STATUSES } from '../../../lib/resource-config';

export default function ProjectFilters({ categories, currentStatus, currentCategory }) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key, value) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/projects?${next.toString()}`);
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setParam('status', '')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!currentStatus ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`}
        >
          All
        </button>
        {PROJECT_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setParam('status', s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${currentStatus === s ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {categories.length ? (
        <select
          value={currentCategory}
          onChange={(e) => setParam('category', e.target.value)}
          className="form-input w-auto"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
