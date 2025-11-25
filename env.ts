import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    KEYCLOAK_CLIENT_ID: z.string().min(1).default('default-client-id'),
    KEYCLOAK_CLIENT_SECRET: z.string().min(1).default('default-client-secret'),
    AUTH_ISSUER: z.string().min(1).default('http://localhost:8080'),
    NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
    NEXTAUTH_SECRET: z.string().min(1).default('default-secret'),
    END_SESSION_URL: z.string().url().default('http://localhost:8080/logout'),
    REFRESH_TOKEN_URL: z.string().url().default('http://localhost:8080/token'),
    BACKEND_URL: z.string().url().default('http://localhost:8000'),
    SENTRY_FEATURE_ENABLED: z.string().optional(),
    SENTRY_ORG_NAME: z.string().optional(),
    SENTRY_PROJECT_NAME: z.string().optional(),
    SENTRY_DSN_URL: z.string().optional(),
    SENTRY_PROJECT_ID: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NEXT_PUBLIC_PLATFORM_URL: z.string().url().default('http://localhost:3000'),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_PLATFORM_URL: process.env.NEXT_PUBLIC_PLATFORM_URL,
  },
  
  skipValidation: process.env.NODE_ENV === 'development' && !process.env.CI,
});
