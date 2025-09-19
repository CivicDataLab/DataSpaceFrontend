'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { GA_TRACKING_ID, pageview, trackEvent } from '@/lib/gtag';

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_TRACKING_ID && pathname) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // Track page view
      pageview(url);
      
      // Track additional page metadata
      trackEvent('page_view_detailed', {
        page_path: pathname,
        page_location: url,
        page_title: document.title,
        // Extract route information
        route_type: getRouteType(pathname),
        locale: pathname.split('/')[1] || 'en',
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: false, // We handle page views manually
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsInner />
      </Suspense>
    </>
  );
}

// Helper function to categorize routes
function getRouteType(pathname: string): string {
  if (pathname.includes('/datasets/')) return 'dataset_detail';
  if (pathname.includes('/datasets')) return 'dataset_list';
  if (pathname.includes('/usecases/')) return 'usecase_detail';
  if (pathname.includes('/usecases')) return 'usecase_list';
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/login')) return 'auth';
  if (pathname === '/' || pathname.match(/^\/[a-z]{2}$/)) return 'home';
  return 'other';
}
