'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({
  children,
  pendingText,
  className = 'btn btn-primary btn-full',
  disabled = false,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
