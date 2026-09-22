'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';

// Manages the multi-screenshot gallery attached to a project.
export default function ScreenshotManager({ projectId, initial }) {
  const [shots, setShots] = useState(initial);
  const [pending, setPending] = useState('');

  async function add() {
    if (!pending) return;
    const res = await fetch('/api/admin/screenshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, image_url: pending, display_order: shots.length })
    });
    const data = await res.json();
    if (res.ok) {
      setShots((s) => [...s, { id: data.id, image_url: pending }]);
      setPending('');
    }
  }

  async function remove(id) {
    const res = await fetch('/api/admin/screenshots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setShots((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="rounded-xl border border-ink-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink-800">Project screenshots</h3>

      {shots.length ? (
        <div className="mb-4 grid grid-cols-3 gap-3">
          {shots.map((s) => (
            <div key={s.id} className="group relative overflow-hidden rounded-lg border border-ink-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image_url} alt="" className="aspect-video w-full object-cover" />
              <button
                onClick={() => remove(s.id)}
                className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove screenshot"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-xs text-ink-400">No screenshots added yet.</p>
      )}

      <ImageUploader value={pending} onChange={setPending} category="project" label="Add a screenshot" />
      {pending ? (
        <button onClick={add} className="btn-primary mt-3">Add to gallery</button>
      ) : null}
    </div>
  );
}
