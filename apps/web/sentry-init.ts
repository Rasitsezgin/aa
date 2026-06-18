/** Only initialize Sentry when a real project DSN is configured. */
export function resolveSentryDsn(): string | undefined {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn?.trim()) return undefined;
  if (dsn.includes('public.sentry.io')) return undefined;
  if (!dsn.includes('@')) return undefined;
  return dsn.trim();
}

export const sentryCommonOptions = {
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  debug: false,
} as const;
