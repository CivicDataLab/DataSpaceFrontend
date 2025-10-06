import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    KEYCLOAK_CLIENT_ID: z.string().min(1),
    KEYCLOAK_CLIENT_SECRET: z.string().min(1),
    AUTH_ISSUER: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    END_SESSION_URL: z.string().url(),
    REFRESH_TOKEN_URL: z.string().url(),
    BACKEND_URL: z.string().url(),
    SENTRY_FEATURE_ENABLED: z.string().optional(),
    SENTRY_ORG_NAME: z.string().optional(),
    SENTRY_PROJECT_NAME: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NEXT_PUBLIC_PLATFORM_URL: z.string().url(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_PLATFORM_URL: process.env.NEXT_PUBLIC_PLATFORM_URL,
  },
});
