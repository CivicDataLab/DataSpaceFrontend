// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_URL,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // The 'tunnel' option allows you to route browser requests to Sentry through a specified Next.js route. This can help circumvent ad-blockers that may prevent Sentry from capturing errors and performance data.
  tunnel: '/api/sentry-monitoring',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
