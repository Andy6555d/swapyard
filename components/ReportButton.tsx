'use client';

import { useState } from 'react';
import { reportContent } from '@/app/actions';

const REASONS = [
  'Illegal or prohibited item',
  'Misleading or fraudulent listing',
  'Spam or irrelevant',
  'Other',
];

export default function ReportButton({
  listingId,
  requestId,
}: {
  listingId?: string;
  requestId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    if (listingId) formData.set('listingId', listingId);
    if (requestId) formData.set('requestId', requestId);
    const result = await reportContent(formData);
    setSubmitting(false);
    if (result?.success) {
      setSubmitted(true);
      setOpen(false);
    }
  }

  if (submitted) {
    return <span className="upload-status">Reported, thank you.</span>;
  }

  if (!open) {
    return (
      <button type="button" className="report-link" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="report-form">
      <select name="reason" required defaultValue="">
        <option value="" disabled>Why are you reporting this?</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <textarea name="detail" placeholder="Any extra detail (optional)" rows={2} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn btn-danger btn-sm" disabled={submitting}>
          {submitting ? 'Sending...' : 'Submit Report'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
