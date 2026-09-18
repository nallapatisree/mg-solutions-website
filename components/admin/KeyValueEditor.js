'use client';

import { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import { ToastProvider, useToast } from './Toast';

// Generic editor for the key/value backed `website_content` and `settings` tables.
function Inner({ endpoint, payloadKey, groups, title, description }) {
  const notify = useToast();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setValues(data[payloadKey] || {});
      } catch {
        setError('Unable to load. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint, payloadKey]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error();
      notify('Saved — changes are live on the website');
    } catch {
      notify('Unable to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  if (loading) return <div className="card p-12 text-center text-sm text-ink-400">Loading…</div>;
  if (error) return <div className="card p-12 text-center text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>

      {groups.map((group) => (
        <div key={group.title} className="card p-6">
          <h2 className="mb-5 font-semibold text-ink-900">{group.title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {group.fields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                {f.type === 'image' ? (
                  <ImageUploader value={values[f.key] || ''} onChange={(url) => set(f.key, url)} category="general" label={f.label} />
                ) : f.type === 'textarea' ? (
                  <>
                    <label className="form-label" htmlFor={f.key}>{f.label}</label>
                    <textarea id={f.key} value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} className="form-textarea" />
                  </>
                ) : f.type === 'toggle' ? (
                  <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
                    <input type="checkbox" checked={values[f.key] === '1'} onChange={(e) => set(f.key, e.target.checked ? '1' : '0')} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                    {f.label}
                  </label>
                ) : (
                  <>
                    <label className="form-label" htmlFor={f.key}>{f.label}</label>
                    <input id={f.key} type="text" value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} className="form-input" placeholder={f.placeholder} />
                  </>
                )}
                {f.hint ? <p className="mt-1 text-xs text-ink-400">{f.hint}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary shadow-card disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

export default function KeyValueEditor(props) {
  return <ToastProvider><Inner {...props} /></ToastProvider>;
}
