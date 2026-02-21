import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Sample rate for error events (1.0 = 100%)
  sampleRate: 1.0,

  // Sample rate for performance transactions
  tracesSampleRate: 0.2,

  // Don't send PII by default
  sendDefaultPii: false,
});
