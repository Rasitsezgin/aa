import * as Sentry from '@sentry/nextjs';
import { resolveSentryDsn, sentryCommonOptions } from './sentry-init';

const dsn = resolveSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    ...sentryCommonOptions,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}
