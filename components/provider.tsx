'use client';

import React from 'react';
import { TourProvider } from '@/contexts/TourContext';
import { ErrorBoundary } from '@sentry/nextjs';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HolyLoader from 'holy-loader';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'opub-ui';

import { RouterEvents } from '@/lib/navigation';
import SessionGuard from './SessionGuard';

/**
 * The top loading bar comes from holy-loader, not our code.
 * It adds a node with an invalid role="bar", then deletes and recreates
 * it on every page change. Screen readers should ignore it (it is only
 * visual). aria-hidden on the wrapper hides the whole bar from them.
 * Delete this wrapper if holy-loader stops using role="bar":
 * https://github.com/tomcru/holy-loader
 */
function HolyLoaderWithValidAria() {
  React.useEffect(() => {
    // Hide the bar if it is already on the page.
    document.getElementById('holy-progress')?.setAttribute('aria-hidden', 'true');

    // Hide it again whenever holy-loader inserts a new one.
    const observer = new MutationObserver((mutations) => {
      for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
          if (node instanceof HTMLElement && node.id === 'holy-progress') {
            node.setAttribute('aria-hidden', 'true');
          }
        }
      }
    });

    // Only watch new children of body — that is where the bar is added.
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, []);

  return <HolyLoader color="var(--action-primary-success-default)" />;
}

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
              <HolyLoaderWithValidAria />
              <TooltipProvider skipDelayDuration={200}>
                {children}
                <Toaster />
              </TooltipProvider>
              {/* For now, tour guide is disabled as it is not working as expected */}
              {/* <TourGuide /> */}
            </TourProvider>
          </QueryClientProvider>
        </SessionGuard>
      </SessionProvider>
    </ErrorBoundary>
  );
}
