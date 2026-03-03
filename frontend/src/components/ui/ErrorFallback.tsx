'use client';

import { useEffect } from 'react';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
        <p className="text-sm text-text-muted mb-4">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
