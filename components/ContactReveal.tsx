'use client';

import { useState } from 'react';
import { logContactReveal } from '@/app/actions';

export default function ContactReveal({
  email,
  phone,
  preferredContact,
  listingId,
  revealClassName = 'contact-link',
  emailClassName = 'contact-link',
  phoneClassName = 'contact-link',
  revealLabel = 'Show contact →',
}: {
  email?: string | null;
  phone?: string | null;
  preferredContact: string;
  listingId?: string;
  revealClassName?: string;
  emailClassName?: string;
  phoneClassName?: string;
  revealLabel?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  function handleReveal() {
    setRevealed(true);
    if (listingId) {
      logContactReveal(listingId).catch(() => {});
    }
  }

  if (!revealed) {
    return (
      <button type="button" className={revealClassName} onClick={handleReveal}>
        {revealLabel}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {(preferredContact === 'email' || preferredContact === 'both') && email && (
        <a className={emailClassName} href={`mailto:${email}`}>
          Email
        </a>
      )}
      {(preferredContact === 'phone' || preferredContact === 'both') && phone && (
        <a className={phoneClassName} href={`tel:${phone}`}>
          Call {phone}
        </a>
      )}
    </div>
  );
}
