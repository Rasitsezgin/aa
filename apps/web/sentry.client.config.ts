import * as Sentry from '@sentry/nextjs';
import { resolveSentryDsn, sentryCommonOptions } from './sentry-init';

const dsn = resolveSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    ...sentryCommonOptions,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.feedbackIntegration({
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
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      'Network Error',
      'Failed to fetch',
      'NetworkError',
      'Non-Error exception captured',
      'chrome-extension',
      'moz-extension',
    ],
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.Cookie;
        delete event.request.headers['X-API-Key'];
      }
      if (event.exception?.values) {
        event.exception.values.forEach((exception) => {
          if (exception.stacktrace?.frames) {
            exception.stacktrace.frames.forEach((frame) => {
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
}
