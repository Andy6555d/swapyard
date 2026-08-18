'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createListing } from '../actions';
import { CATEGORY_GROUPS, UNGROUPED_CATEGORIES, COUNTIES } from '@/lib/constants';
import SubmitButton from '@/components/SubmitButton';

export default function ListStockForm({
  defaultCounty,
  hasPhone,
  buyingGroup,
}: {
  defaultCounty: string;
  hasPhone: boolean;
  buyingGroup: string | null;
}) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');
    setUploadStatus('');

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploadError('You need to be logged in to upload photos.');
      setUploading(false);
      return;
    }

    const fileArray = Array.from(files).slice(0, 6);
    const urls: string[] = [];
    const skipped: string[] = [];
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      if (!file.type.startsWith('image/')) {
        skipped.push(`${file.name} (not an image)`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        skipped.push(`${file.name} (over 8MB)`);
        continue;
      }

      setUploadStatus(`Uploading photo ${i + 1} of ${fileArray.length}…`);
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const fileName = `${user.id}/${Date.now()}-${i}-${safeName}`;
      const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }

    setImageUrls(urls);
    setUploadStatus(
      urls.length > 0
        ? `${urls.length} photo${urls.length > 1 ? 's' : ''} ready to publish`
        : 'No photos uploaded — you can still publish without photos'
    );
    if (skipped.length > 0) {
      setUploadError(`Skipped: ${skipped.join(', ')}`);
    }
    setUploading(false);
  }

  return (
    <form action={createListing}>
      <div className="field">
        <label htmlFor="title">Item title</label>
        <input type="text" id="title" name="title" placeholder="e.g. Class B engineering bricks, 400 units" required />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" placeholder="Condition, why it's surplus, collection notes..." required />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" required defaultValue="">
            <option value="" disabled>Select category</option>
            {CATEGORY_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
            {UNGROUPED_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="county">County</label>
          <select id="county" name="county" required defaultValue={defaultCounty}>
            <option value="" disabled>Select county</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input type="text" id="quantity" name="quantity" placeholder="e.g. 400 units, 22m²" />
        </div>
        <div className="field price-field">
          <label htmlFor="price">Asking price</label>
          <span>€</span>
          <input type="number" id="price" name="price" min="0" step="0.01" required />
        </div>
      </div>
      <div className="field">
        <label>Preferred contact for this listing</label>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="preferredContact" value="email" defaultChecked />
            <span>Email only</span>
          </label>
          {hasPhone && (
            <>
              <label className="radio-option">
                <input type="radio" name="preferredContact" value="phone" />
                <span>Phone only</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="preferredContact" value="both" />
                <span>Both</span>
              </label>
            </>
          )}
        </div>
        {!hasPhone && (
          <p className="upload-status">Add a phone number to your account to offer phone contact.</p>
        )}
      </div>
      {buyingGroup && (
        <div className="field">
          <label>Who can see this listing?</label>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" name="visibility" value="all" defaultChecked />
              <span>Everyone on SwapYard</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="visibility" value="group" />
              <span>{buyingGroup} members only</span>
            </label>
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor="images">Photos (up to 6)</label>
        <div className="file-field">
          Select up to 6 photos of the stock
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
          {uploadError && <p className="upload-error">{uploadError}</p>}
        </div>
      </div>
      <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
      <SubmitButton pendingText="Publishing…" disabled={uploading}>
        Publish Listing
      </SubmitButton>
    </form>
  );
}
