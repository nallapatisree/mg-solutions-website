'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getResource } from '../../lib/resource-config';
import { Badge, statusTone, EmptyState } from '../ui';
import ImageUploader from './ImageUploader';
import ConfirmDialog from './ConfirmDialog';
import { ToastProvider, useToast } from './Toast';
import ScreenshotManager from './ScreenshotManager';

function fieldDefaults(resource) {
  const out = {};
  for (const f of resource.fields) {
    if (f.type === 'checkbox') out[f.name] = f.default ?? 0;
    else if (f.type === 'number') out[f.name] = f.default ?? 0;
    else out[f.name] = f.default ?? '';
  }
  return out;
}

function ManagerInner({ resourceKey, statusFilters }) {
  const resource = getResource(resourceKey);
  const searchParams = useSearchParams();
  const notify = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const [editing, setEditing] = useState(null); // null | 'new' | row object
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('q', query);
      if (status) params.set('status', status);

      const res = await fetch(`/api/admin/${resourceKey}?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(data.rows);
      setPages(data.pages);
    } catch {
      setError('Unable to load data. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, [resourceKey, page, query, status]);

  useEffect(() => { load(); }, [load]);

  // Support /admin/<resource>?new=1 deep-link from dashboard quick actions
  useEffect(() => {
    if (searchParams.get('new') === '1' && resource.adminCreate !== false) openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setForm(fieldDefaults(resource));
    setFormErrors({});
    setEditing('new');
  }

  async function openEdit(row) {
    const res = await fetch(`/api/admin/${resourceKey}/${row.id}`);
    const data = await res.json();
    const record = data.row || row;

    // `technologies` is stored as a JSON array; the form edits it as comma-separated text.
    if (record.technologies) {
      try { record.technologies = JSON.parse(record.technologies).join(', '); } catch { record.technologies = ''; }
    }
    setForm(record);
    setFormErrors({});
    setEditing(record);
  }

  async function save() {
    setSaving(true);
    setFormErrors({});
    try {
      const isNew = editing === 'new';
      const res = await fetch(isNew ? `/api/admin/${resourceKey}` : `/api/admin/${resourceKey}/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setFormErrors(data.fields);
        notify(data.error || 'Unable to save', 'error');
        return;
      }
      notify(isNew ? `${resource.singular} created` : `${resource.singular} updated`);
      setEditing(null);
      load();
    } catch {
      notify('Unable to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function patch(row, updates) {
    try {
      const res = await fetch(`/api/admin/${resourceKey}/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error();
      notify('Updated');
      load();
    } catch {
      notify('Unable to update', 'error');
    }
  }

  async function doDelete() {
    try {
      const res = await fetch(`/api/admin/${resourceKey}/${confirmDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      notify(`${resource.singular} deleted`);
      setConfirmDelete(null);
      load();
    } catch {
      notify('Unable to delete', 'error');
    }
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setFormErrors((e) => ({ ...e, [name]: undefined }));
  }

  function renderCell(row, col) {
    const value = row[col];
    if (col === 'is_published') return <Badge tone={value ? 'green' : 'gray'}>{value ? 'Published' : 'Hidden'}</Badge>;
    if (col === 'is_featured') return value ? <Badge tone="amber">Featured</Badge> : <span className="text-ink-300">—</span>;
    if (col === 'status' || col === 'approval_status') return <Badge tone={statusTone(value)}>{value}</Badge>;
    if (col === 'created_at' || col === 'announcement_date') return <span className="text-ink-500">{new Date(value).toLocaleDateString()}</span>;
    if (col === 'rating') return <span className="text-amber-500">{'★'.repeat(value)}</span>;
    return <span className="text-ink-700">{value || <span className="text-ink-300">—</span>}</span>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">{resource.label}</h1>
        {resource.adminCreate !== false ? (
          <button onClick={openNew} className="btn-primary">+ New {resource.singular}</button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder={`Search ${resource.label.toLowerCase()}…`}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="form-input max-w-xs"
          aria-label="Search"
        />
        {statusFilters?.length ? (
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="form-input w-auto" aria-label="Filter by status">
            <option value="">All statuses</option>
            {statusFilters.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : null}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-sm text-ink-400">Loading…</div>
      ) : error ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={load} className="btn-outline mt-4">Retry</button>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title={`No ${resource.label.toLowerCase()} yet`} description={resource.adminCreate !== false ? `Click "New ${resource.singular}" to add your first one.` : undefined} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  {resource.listColumns.map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">{c.replace(/_/g, ' ')}</th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-ink-50/50">
                    {resource.listColumns.map((c) => (
                      <td key={c} className="px-4 py-3">{renderCell(row, c)}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {resourceKey === 'testimonials' && row.approval_status !== 'approved' ? (
                          <button onClick={() => patch(row, { approval_status: 'approved' })} className="btn-ghost px-2 py-1 text-xs text-emerald-700">Approve</button>
                        ) : null}
                        {resourceKey === 'testimonials' && row.approval_status !== 'rejected' ? (
                          <button onClick={() => patch(row, { approval_status: 'rejected' })} className="btn-ghost px-2 py-1 text-xs text-red-600">Reject</button>
                        ) : null}
                        {'is_published' in row ? (
                          <button onClick={() => patch(row, { is_published: row.is_published ? 0 : 1 })} className="btn-ghost px-2 py-1 text-xs">
                            {row.is_published ? 'Hide' : 'Show'}
                          </button>
                        ) : null}
                        <button onClick={() => openEdit(row)} className="btn-ghost px-2 py-1 text-xs text-brand-600">Edit</button>
                        <button onClick={() => setConfirmDelete(row)} className="btn-ghost px-2 py-1 text-xs text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 ? (
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-sm">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost disabled:opacity-40">← Previous</button>
              <span className="text-ink-500">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-ghost disabled:opacity-40">Next →</button>
            </div>
          ) : null}
        </div>
      )}

      {/* Create / edit drawer */}
      {editing ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-card">
            <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-ink-900">
                {editing === 'new' ? `New ${resource.singular}` : `Edit ${resource.singular}`}
              </h2>
              <button onClick={() => setEditing(null)} className="h-9 w-9 rounded-md text-ink-500 hover:bg-ink-50" aria-label="Close">✕</button>
            </div>

            <div className="space-y-5 p-6">
              {resource.fields.map((f) => {
                const err = formErrors[f.name];
                const common = { id: f.name, 'aria-invalid': !!err, className: 'form-input' };

                return (
                  <div key={f.name}>
                    {f.type === 'image' ? (
                      <ImageUploader value={form[f.name] || ''} onChange={(url) => setField(f.name, url)} category={resourceKey} label={f.label} />
                    ) : f.type === 'checkbox' ? (
                      <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
                        <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setField(f.name, e.target.checked ? 1 : 0)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                        {f.label}
                      </label>
                    ) : (
                      <>
                        <label className="form-label" htmlFor={f.name}>
                          {f.label} {f.required ? <span className="text-red-500">*</span> : null}
                        </label>
                        {f.type === 'textarea' ? (
                          <textarea {...common} className="form-textarea" value={form[f.name] || ''} onChange={(e) => setField(f.name, e.target.value)} />
                        ) : f.type === 'select' ? (
                          <select {...common} value={form[f.name] || ''} onChange={(e) => setField(f.name, e.target.value)}>
                            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            {...common}
                            type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                            min={f.min}
                            max={f.max}
                            value={form[f.name] ?? ''}
                            onChange={(e) => setField(f.name, e.target.value)}
                          />
                        )}
                      </>
                    )}
                    {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
                  </div>
                );
              })}

              {resource.hasScreenshots && editing !== 'new' ? (
                <ScreenshotManager projectId={editing.id} initial={editing.screenshots || []} />
              ) : resource.hasScreenshots ? (
                <p className="rounded-lg bg-ink-50 px-4 py-3 text-xs text-ink-500">
                  Save this project first, then reopen it to upload screenshots.
                </p>
              ) : null}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-ink-100 bg-white px-6 py-4">
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete this ${resource.singular.toLowerCase()}?`}
        message="This action cannot be undone."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default function ResourceManager(props) {
  return (
    <ToastProvider>
      <ManagerInner {...props} />
    </ToastProvider>
  );
}
