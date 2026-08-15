'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({
  children,
  pendingText,
  className = 'btn btn-primary btn-full',
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
