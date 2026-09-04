'use client';

import React from 'react';
import { TourProvider } from '@/contexts/TourContext';
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
          retry: (failureCount, error: unknown) => {
            const status =
              typeof error === 'object' &&
              error !== null &&
              'response' in error &&
              typeof error.response === 'object' &&
              error.response !== null &&
              'status' in error.response &&
              typeof error.response.status === 'number'
                ? error.response.status
                : undefined;
            if (status !== undefined && status >= 400 && status < 500) {
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
            <TourProvider>
              <RouterEvents />
              <HolyLoader color="var(--action-primary-success-default)" />
              <Tooltip.Provider>
                {children}
                <Toaster />
              </Tooltip.Provider>
              {/* For now, tour guide is disabled as it is not working as expected */}
              {/* <TourGuide /> */}
            </TourProvider>
          </QueryClientProvider>
        </SessionGuard>
      </SessionProvider>
    </ErrorBoundary>
  );
}
