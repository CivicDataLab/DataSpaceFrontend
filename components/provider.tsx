'use client';

import React from 'react';
import { ErrorBoundary } from '@sentry/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HolyLoader from 'holy-loader';
import { SessionProvider } from 'next-auth/react';
import { Toaster, Tooltip } from 'opub-ui';

import { RouterEvents } from '@/lib/navigation';
import SessionGuard from './SessionGuard';

export default function Provider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          staleTime: 5 * 60 * 1000, // 5 minutes
          cacheTime: 10 * 60 * 1000, // 10 minutes
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
              return false;
            }
            return failureCount < 2;
          },
        },
        mutations: {
          retry: 1,
        },
      },
    })
  );

  return (
    <ErrorBoundary>
      <SessionProvider>
        <SessionGuard>
          <QueryClientProvider client={client}>
            <RouterEvents />
            <HolyLoader color="var(--action-primary-success-default)" />
            <Tooltip.Provider>
              {children}
              <Toaster />
            </Tooltip.Provider>
          </QueryClientProvider>
        </SessionGuard>
      </SessionProvider>
    </ErrorBoundary>
  );
}
