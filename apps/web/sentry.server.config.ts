import * as Sentry from '@sentry/nextjs';
import { resolveSentryDsn, sentryCommonOptions } from './sentry-init';

const dsn = resolveSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    ...sentryCommonOptions,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [],
    ignoreErrors: [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'Network Error',
      'Failed to fetch',
    ],
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.Cookie;
        delete event.request.headers['X-API-Key'];
      }
      return event;
    },
  });
}
