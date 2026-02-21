'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{ background: '#1a365d', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
