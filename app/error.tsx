'use client';
import { ErrorState } from '@/components/ui/primitives';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="mx-auto max-w-2xl p-8">
      <ErrorState
        message="This page is temporarily unavailable. No changes have been confirmed."
        retry={reset}
      />
    </main>
  );
}
