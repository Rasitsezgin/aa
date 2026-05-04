import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://public.sentry.io/',

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes here
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.feedbackIntegration({
      // Additional Feedback configuration goes here
      colorScheme: 'system',
      showBranding: false,
      buttonLabel: 'Hata Bildir',
      formTitle: 'Hata Bildirimi',
      nameLabel: 'Adınız',
      emailLabel: 'E-posta',
      isRequiredLabel: '(zorunlu)',
      submitButtonLabel: 'Gönder',
      cancelButtonLabel: 'İptal',
      successMessageText: 'Hata bildiriminiz için teşekkürler!',
    }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV !== 'production',

  // Environments
  environment: process.env.NODE_ENV || 'development',

  // Release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Ignore specific errors
  ignoreErrors: [
    // Network errors
    'Network Error',
    'Failed to fetch',
    'NetworkError',
    // Third-party script errors
    'Non-Error exception captured',
    // Browser extensions
    'chrome-extension',
    'moz-extension',
  ],

  // Before send hook to filter sensitive data
  beforeSend(event) {
    // Remove sensitive data from requests
    if (event.request?.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers.Cookie;
      delete event.request.headers['X-API-Key'];
    }

    // Sanitize error messages that might contain sensitive data
    if (event.exception?.values) {
      event.exception.values.forEach((exception) => {
        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames.forEach((frame) => {
            // Remove query parameters from file paths
            if (frame.abs_path) {
              frame.abs_path = frame.abs_path.split('?')[0];
            }
          });
        }
      });
    }

    return event;
  },
});
