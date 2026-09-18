'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EmptyState } from '../ui';
import ConfirmDialog from './ConfirmDialog';
import { ToastProvider, useToast } from './Toast';

const CATEGORIES = ['general', 'services', 'projects', 'project', 'announcements', 'testimonials'];

function Inner() {
  const notify = useToast();
  const inputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media${category ? `?category=${category}` : ''}`);
      const data = await res.json();
      setRows(data.rows || []);
    } catch {
      notify('Unable to load media', 'error');
    } finally {
      setLoading(false);
    }
  }, [category, notify]);

  useEffect(() => { load(); }, [load]);

  async function upload(files) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', category || 'general');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) notify(data.error || `Failed to upload ${file.name}`, 'error');
    }
    setUploading(false);
    notify('Upload complete');
    load();
  }

  async function doDelete() {
    const res = await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: confirmDelete.id })
    });
    if (res.ok) { notify('File deleted'); setConfirmDelete(null); load(); }
    else notify('Unable to delete', 'error');
  }

  function copyUrl(url) {
    navigator.clipboard?.writeText(window.location.origin + url);
    notify('URL copied to clipboard');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Media Library</h1>
          <p className="mt-1 text-sm text-ink-500">Images are validated by type and size, and stored with safe filenames.</p>
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary disabled:opacity-60">
          {uploading ? 'Uploading…' : '+ Upload images'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => upload(Array.from(e.target.files || []))}
        />
      </div>

      <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input w-auto" aria-label="Filter by category">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {loading ? (
        <div className="card p-12 text-center text-sm text-ink-400">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No media uploaded yet" description="Upload images to reuse them across services, projects and announcements." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.file_url} alt={m.alt_text || m.original_name} className="aspect-square w-full bg-ink-50 object-cover" loading="lazy" />
              <div className="p-3">
                <p className="truncate text-xs font-medium text-ink-700" title={m.original_name}>{m.original_name}</p>
                <p className="text-xs text-ink-400">{Math.round((m.size_bytes || 0) / 1024)} KB · {m.category}</p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => copyUrl(m.file_url)} className="btn-ghost px-2 py-1 text-xs">Copy URL</button>
                  <button onClick={() => setConfirmDelete(m)} className="btn-ghost px-2 py-1 text-xs text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this file?"
        message="The file will be removed from the server. Any page still using it will show a broken image."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default function MediaLibrary() {
  return <ToastProvider><Inner /></ToastProvider>;
}
