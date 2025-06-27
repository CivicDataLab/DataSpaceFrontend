import * as Sentry from '@sentry/nextjs';

export async function register() {
  const isSentryEnabled = process.env.SENTRY_ENABLED === 'true'; 

  if (isSentryEnabled) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
