'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { CATEGORIES, COUNTIES } from '@/lib/constants';
import { createBulkListings } from '@/app/list/bulk/actions';

type ParsedRow = {
  title: string;
  description: string;
  category: string;
  county: string;
  quantity: string;
  price: string;
  preferredContact: string;
  visibility: string;
  errors: string[];
};

const CONTACT_OPTIONS = ['email', 'phone', 'both'];
const VISIBILITY_OPTIONS = ['all', 'group'];

export default function BulkUploadForm({
  defaultCounty,
  hasPhone,
  buyingGroup,
}: {
  defaultCounty: string;
  hasPhone: boolean;
  buyingGroup: string | null;
}) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  function validateRow(raw: any): ParsedRow {
    const title = (raw.title || '').trim();
    const description = (raw.description || '').trim();
    const category = (raw.category || '').trim();
    const county = (raw.county || '').trim();
    const quantity = (raw.quantity || '').trim();
    const price = (raw.price || '').trim();
    const preferredContactRaw = (raw.preferred_contact || 'email').trim().toLowerCase();
    const preferredContact = preferredContactRaw || 'email';
    const visibilityRaw = (raw.visibility || 'all').trim().toLowerCase();
    const visibility = visibilityRaw || 'all';

    const errors: string[] = [];
    if (!title) errors.push('Missing title');
    if (!description) errors.push('Missing description');
    if (!category) errors.push('Missing category');
    else if (!CATEGORIES.includes(category)) errors.push(`Unknown category "${category}"`);
    if (!county) errors.push('Missing county');
    else if (!COUNTIES.includes(county)) errors.push(`Unknown county "${county}"`);
    if (!price) errors.push('Missing price');
    else if (isNaN(Number(price)) || Number(price) < 0) errors.push('Price must be a positive number');
    if (!CONTACT_OPTIONS.includes(preferredContact)) {
      errors.push(`preferred_contact must be email, phone, or both`);
    } else if ((preferredContact === 'phone' || preferredContact === 'both') && !hasPhone) {
      errors.push('No phone number on your account, add one or use "email"');
    }
    if (!VISIBILITY_OPTIONS.includes(visibility)) {
      errors.push('visibility must be all or group');
    } else if (visibility === 'group' && !buyingGroup) {
      errors.push('You have no buying group set, use "all" or set one in Account');
    }

    return { title, description, category, county, quantity, price, preferredContact, visibility, errors };
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileError('');
    setResult(null);
    setParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setFileError('No rows found in that file.');
          setParsing(false);
          return;
        }
        if (results.data.length > 200) {
          setFileError(
            `That file has ${results.data.length} rows. Bulk upload is capped at 200 at a time, please split it into smaller files.`
          );
          setParsing(false);
          return;
        }
        const parsed = (results.data as any[]).map(validateRow);
        setRows(parsed);
        setParsing(false);
      },
      error: () => {
        setFileError('Could not read that file. Make sure it is a valid CSV.');
        setParsing(false);
      },
    });
  }

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidCount = rows.length - validRows.length;

  async function handlePublish() {
    setSubmitting(true);
    const outcome = await createBulkListings(
      validRows.map((r) => ({
        title: r.title,
        description: r.description,
        category: r.category,
        county: r.county,
        quantity: r.quantity,
        price: r.price,
        preferredContact: r.preferredContact,
        visibility: r.visibility,
      })),
      defaultCounty
    );
    setSubmitting(false);
    if (outcome?.success) {
      setResult(`Published ${outcome.count} listing${outcome.count === 1 ? '' : 's'}. Add photos to each from My Listings.`);
      setRows([]);
    } else {
      setResult('Something went wrong publishing these listings. Try again.');
    }
  }

  return (
    <div>
      <div className="request-box">
        <h2 className="admin-section-title">1. Download the template</h2>
        <p className="request-box-sub">
          The Excel version has real dropdowns for category, county, and preferred contact, so
          you can't type something that doesn't match. Fill it in, then save or export as CSV
          before uploading below.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/bulk-upload-template.xlsx" download className="btn btn-primary btn-sm">
            Download Excel Template (with dropdowns)
          </a>
          <a href="/bulk-upload-template.csv" download className="btn btn-ghost btn-sm">
            Download plain CSV instead
          </a>
        </div>
      </div>

      <div className="request-box" style={{ marginTop: '20px' }}>
        <h2 className="admin-section-title">2. Upload your filled-in file</h2>
        <p className="request-box-sub">
          If you used the Excel template, save it as CSV first (File → Save As, or Download → CSV
          in Google Sheets), then upload that CSV here.
        </p>
        <div className="file-field">
          Select your completed CSV file
          <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
        {parsing && <p className="upload-status">Reading file...</p>}
        {fileError && <p className="upload-error">{fileError}</p>}
      </div>

      {rows.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 className="admin-section-title">
            3. Review before publishing ({validRows.length} ready, {invalidCount} need fixing)
          </h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>County</th>
                  <th>Price</th>
                  <th>Contact</th>
                  <th>Visible To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.title || '—'}</td>
                    <td>{row.category || '—'}</td>
                    <td>{row.county || '—'}</td>
                    <td>{row.price ? `€${row.price}` : '—'}</td>
                    <td>{row.preferredContact}</td>
                    <td>{row.visibility === 'group' ? 'Group' : 'Everyone'}</td>
                    <td>
                      {row.errors.length === 0 ? (
                        <span className="billing-badge billing-active">Ready</span>
                      ) : (
                        <span className="billing-badge billing-past_due" title={row.errors.join(', ')}>
                          {row.errors[0]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
            disabled={validRows.length === 0 || submitting}
            onClick={handlePublish}
          >
            {submitting ? 'Publishing...' : `Publish ${validRows.length} Listing${validRows.length === 1 ? '' : 's'}`}
          </button>
        </div>
      )}

      {result && <div className="success-box" style={{ marginTop: '16px' }}>{result}</div>}
    </div>
  );
}
