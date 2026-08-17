'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addPhotosToListing } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function AddPhotosButton({
  listingId,
  currentCount,
}: {
  listingId: string;
  currentCount: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const remaining = 6 - currentCount;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || remaining <= 0) return;
    setUploading(true);
    setStatus('');

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus('You need to be logged in.');
      setUploading(false);
      return;
    }

    const fileArray = Array.from(files).slice(0, remaining);
    const urls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file.type.startsWith('image/')) continue;
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const fileName = `${user.id}/${Date.now()}-${i}-${safeName}`;
      const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }

    if (urls.length > 0) {
      await addPhotosToListing(listingId, urls);
      setStatus(`Added ${urls.length} photo${urls.length === 1 ? '' : 's'}`);
      router.refresh();
    } else {
      setStatus('No photos were added.');
    }
    setUploading(false);
  }

  if (remaining <= 0) {
    return <span className="upload-status">Photo limit reached (6)</span>;
  }

  return (
    <div>
      <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
        {uploading ? 'Uploading...' : 'Add Photos'}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </label>
      {status && <p className="upload-status">{status}</p>}
    </div>
  );
}
