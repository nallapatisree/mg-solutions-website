'use client';

import { useCallback, useEffect, useState } from 'react';
import { ENQUIRY_STATUSES } from '../../lib/resource-config';
import { Badge, statusTone, EmptyState } from '../ui';
import ConfirmDialog from './ConfirmDialog';
import { ToastProvider, useToast } from './Toast';

function Inner() {
  const notify = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      if (query) params.set('q', query);
      const res = await fetch(`/api/admin/enquiries?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRows(data.rows);
      setPages(data.pages);
    } catch {
      setError('Unable to load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [status, query, page]);

  useEffect(() => { load(); }, [load]);

  async function patch(id, updates) {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) { notify('Enquiry updated'); load(); }
    else notify('Unable to update', 'error');
  }

  async function saveNotes() {
    await patch(selected.id, { internal_notes: notes });
    setSelected((s) => ({ ...s, internal_notes: notes }));
  }

  async function doDelete() {
    const res = await fetch(`/api/admin/enquiries/${confirmDelete.id}`, { method: 'DELETE' });
    if (res.ok) { notify('Enquiry deleted'); setConfirmDelete(null); setSelected(null); load(); }
    else notify('Unable to delete', 'error');
  }

  function open(row) {
    setSelected(row);
    setNotes(row.internal_notes || '');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Enquiries</h1>

      <div className="flex flex-wrap gap-3">
        <input type="search" placeholder="Search by name…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="form-input max-w-xs" aria-label="Search enquiries" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="form-input w-auto" aria-label="Filter by status">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-sm text-ink-400">Loading…</div>
      ) : error ? (
        <div className="card p-12 text-center"><p className="text-sm text-red-600">{error}</p><button onClick={load} className="btn-outline mt-4">Retry</button></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No enquiries found" description="Enquiries submitted from the website contact form appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-800">{r.name}</td>
                    <td className="px-4 py-3 text-ink-500">
                      <div>{r.email}</div>
                      {r.mobile ? <div className="text-xs">{r.mobile}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{r.service_requested || '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => patch(r.id, { status: e.target.value })}
                        className="rounded-md border border-ink-200 px-2 py-1 text-xs"
                        aria-label={`Status for ${r.name}`}
                      >
                        {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => open(r)} className="btn-ghost px-2 py-1 text-xs text-brand-600">View</button>
                      <button onClick={() => setConfirmDelete(r)} className="btn-ghost px-2 py-1 text-xs text-red-600">Delete</button>
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

      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">{selected.name}</h2>
                <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
              </div>
              <button onClick={() => setSelected(null)} className="h-9 w-9 rounded-md text-ink-500 hover:bg-ink-50" aria-label="Close">✕</button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              {[
                ['Email', selected.email],
                ['Mobile', selected.mobile],
                ['Company', selected.company_name],
                ['Service requested', selected.service_requested],
                ['Budget range', selected.budget_range],
                ['Received', new Date(selected.created_at).toLocaleString()]
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-ink-50 pb-2">
                  <dt className="text-ink-400">{label}</dt>
                  <dd className="text-right font-medium text-ink-800">{value}</dd>
                </div>
              ))}
            </dl>

            {selected.project_description ? (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-ink-800">Project description</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{selected.project_description}</p>
              </div>
            ) : null}

            {selected.message ? (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-ink-800">Message</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{selected.message}</p>
              </div>
            ) : null}

            <div className="mt-6">
              <label className="form-label" htmlFor="notes">
                Private internal notes <span className="font-normal text-ink-400">(never shown on the website)</span>
              </label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="form-textarea" />
              <button onClick={saveNotes} className="btn-primary mt-3">Save notes</button>
            </div>

            <div className="mt-6 flex gap-2 border-t border-ink-100 pt-5">
              <a href={`mailto:${selected.email}`} className="btn-outline">Reply by email</a>
              {selected.mobile ? <a href={`tel:${selected.mobile}`} className="btn-outline">Call</a> : null}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this enquiry?"
        message="This will permanently remove the enquiry and its notes."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default function EnquiryManager() {
  return <ToastProvider><Inner /></ToastProvider>;
}
