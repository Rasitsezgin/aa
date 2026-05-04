import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV !== 'production',

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Server-side integrations
  integrations: [],

  // Before send for server-side
  beforeSend(event) {
    // Remove sensitive data from server events
    if (event.request?.headers) {
      const sensitiveHeaders = [
        'authorization',
        'cookie',
        'x-api-key',
        'x-secret',
        'api-secret',
        'api-key',
      ];

      sensitiveHeaders.forEach((header) => {
        delete event.request.headers[header];
      });
    }

    // Filter out local development errors
    if (event.tags?.['environment'] === 'development' && process.env.NODE_ENV === 'production') {
      return null;
    }

    return event;
  },
});
