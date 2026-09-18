'use client';

import { useState } from 'react';
import { BUDGET_RANGES } from '../../../lib/resource-config';

const INITIAL = {
  name: '', email: '', mobile: '', company_name: '',
  service_requested: '', budget_range: '', project_description: '', message: ''
};

export default function EnquiryForm({ services }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverMessage, setServerMessage] = useState('');

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Client-side validation. The server re-validates independently — this is only UX.
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Please enter a valid email address';
    if (form.mobile && !/^[0-9+\-\s()]{7,20}$/.test(form.mobile)) e.mobile = 'Please enter a valid phone number';
    if (!form.message.trim() && !form.project_description.trim()) {
      e.message = 'Please tell us a little about your project';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setStatus('submitting');
    setServerMessage('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setServerMessage(data.error || 'Something went wrong. Please try again.');
        if (data.fields) setErrors(data.fields);
        return;
      }
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
      setServerMessage('Unable to send your enquiry right now. Please try again shortly.');
    }
  }

  if (status === 'success') {
    return (
      <div className="card p-10 text-center">
        <div className="mb-3 text-3xl">✓</div>
        <h3 className="text-lg font-semibold text-ink-900">Thank you — we&apos;ve received your enquiry</h3>
        <p className="mt-2 text-sm text-ink-500">Our team will get back to you as soon as possible.</p>
        <button onClick={() => setStatus('idle')} className="btn-outline mt-6">Send another enquiry</button>
      </div>
    );
  }

  const field = (name, label, type = 'text', required = false) => (
    <div>
      <label className="form-label" htmlFor={name}>
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        id={name}
        type={type}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        className="form-input"
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] ? <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{errors[name]}</p> : null}
    </div>
  );

  return (
    <div className="card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {field('name', 'Your name', 'text', true)}
        {field('email', 'Email address', 'email', true)}
        {field('mobile', 'Mobile number', 'tel')}
        {field('company_name', 'Company name')}

        <div>
          <label className="form-label" htmlFor="service_requested">Required service</label>
          <select id="service_requested" value={form.service_requested} onChange={(e) => update('service_requested', e.target.value)} className="form-input">
            <option value="">Select a service</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="budget_range">Budget range</label>
          <select id="budget_range" value={form.budget_range} onChange={(e) => update('budget_range', e.target.value)} className="form-input">
            <option value="">Select a range</option>
            {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="project_description">Project description</label>
          <textarea id="project_description" value={form.project_description} onChange={(e) => update('project_description', e.target.value)} className="form-textarea" />
        </div>

        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="message">Message <span className="text-red-500">*</span></label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="form-textarea"
            aria-invalid={!!errors.message}
          />
          {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
        </div>
      </div>

      {status === 'error' && serverMessage ? (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{serverMessage}</div>
      ) : null}

      <button onClick={handleSubmit} disabled={status === 'submitting'} className="btn-primary mt-6 w-full justify-center py-3 disabled:opacity-60">
        {status === 'submitting' ? 'Sending…' : 'Send Enquiry'}
      </button>
    </div>
  );
}
