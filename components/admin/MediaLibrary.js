'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { EmptyState, Badge } from '../ui';
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
    notify('Upload complete — visible on the public Gallery by default');
    load();
  }

  async function toggleGallery(row) {
    const nextVisible = row.is_visible ? 0 : 1;
    const res = await fetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, is_visible: nextVisible })
    });
    if (res.ok) {
      notify(nextVisible ? 'Now visible on public Gallery' : 'Hidden from public Gallery');
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_visible: nextVisible } : r)));
    } else {
      notify('Unable to update', 'error');
    }
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
          <p className="mt-1 text-sm text-ink-500">
            Every image you upload lands here. Files marked{' '}
            <Badge tone="green">In Gallery</Badge> also appear on the public{' '}
            <Link href="/gallery" target="_blank" className="font-medium text-brand-600 hover:underline">
              /gallery
            </Link>{' '}
            page — click a photo below to toggle it.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/gallery" target="_blank" className="btn-outline">View public gallery ↗</Link>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary disabled:opacity-60">
            {uploading ? 'Uploading…' : '+ Upload images'}
          </button>
        </div>
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
        <EmptyState title="No media uploaded yet" description="Upload images to reuse them across services, projects and announcements — and optionally show them on the public Gallery page." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              <button
                onClick={() => toggleGallery(m)}
                className="group relative block w-full"
                title={m.is_visible ? 'Visible in public Gallery — click to hide' : 'Hidden from public Gallery — click to show'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.file_url} alt={m.alt_text || m.original_name} className="aspect-square w-full bg-ink-50 object-cover" loading="lazy" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-ink-800">
                    {m.is_visible ? 'Hide from gallery' : 'Show in gallery'}
                  </span>
                </span>
                <span className="absolute left-2 top-2">
                  <Badge tone={m.is_visible ? 'green' : 'gray'}>{m.is_visible ? 'In Gallery' : 'Hidden'}</Badge>
                </span>
              </button>
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
        message="The file will be removed from the server and from the public Gallery. Any page still using it will show a broken image."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default function MediaLibrary() {
  return <ToastProvider><Inner /></ToastProvider>;
}
