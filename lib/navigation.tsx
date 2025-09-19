import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useIsNavigating } from '@/config/store';

export function navigateStart() {
  useIsNavigating.getState().setIsNavigation(true);
}

export function navigateEnd() {
  useIsNavigating.getState().setIsNavigation(false);
}

export function loadingStart() {
  useIsNavigating.getState().setIsNavigation(true);
}

function useOnComplete() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  React.useEffect(() => navigateEnd(), [pathname, searchParams]);
}
function InternalRouterEvents() {
  useOnComplete();
  return null;
}

export function RouterEvents() {
  return (
    <React.Suspense>
      <InternalRouterEvents />
    </React.Suspense>
  );
}

