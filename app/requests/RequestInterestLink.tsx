'use client';

import { logRequestInterest } from '@/app/actions';

export default function RequestInterestLink({
  requestId,
  email,
}: {
  requestId: string;
  email?: string | null;
}) {
  return (
    <a
      className="contact-link"
      href={`mailto:${email}`}
      onClick={() => {
        logRequestInterest(requestId).catch(() => {});
      }}
    >
      I have this →
    </a>
  );
}
