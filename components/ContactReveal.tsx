'use client';

import { useState } from 'react';

export default function ContactReveal({
  email,
  phone,
  preferredContact,
  revealClassName = 'contact-link',
  emailClassName = 'contact-link',
  phoneClassName = 'contact-link',
  revealLabel = 'Show contact →',
}: {
  email?: string | null;
  phone?: string | null;
  preferredContact: string;
  revealClassName?: string;
  emailClassName?: string;
  phoneClassName?: string;
  revealLabel?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button type="button" className={revealClassName} onClick={() => setRevealed(true)}>
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
