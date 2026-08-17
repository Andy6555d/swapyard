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
  errors: string[];
};

export default function BulkUploadForm({ defaultCounty }: { defaultCounty: string }) {
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

    const errors: string[] = [];
    if (!title) errors.push('Missing title');
    if (!description) errors.push('Missing description');
    if (!category) errors.push('Missing category');
    else if (!CATEGORIES.includes(category)) errors.push(`Unknown category "${category}"`);
    if (!county) errors.push('Missing county');
    else if (!COUNTIES.includes(county)) errors.push(`Unknown county "${county}"`);
    if (!price) errors.push('Missing price');
    else if (isNaN(Number(price)) || Number(price) < 0) errors.push('Price must be a positive number');

    return { title, description, category, county, quantity, price, errors };
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
          Fill it in using Excel, Google Sheets, or Numbers, then save or export as CSV before
          uploading it below.
        </p>
        <a href="/bulk-upload-template.csv" download className="btn btn-secondary btn-sm">
          Download CSV Template
        </a>
      </div>

      <div className="request-box" style={{ marginTop: '20px' }}>
        <h2 className="admin-section-title">2. Upload your filled-in file</h2>
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
