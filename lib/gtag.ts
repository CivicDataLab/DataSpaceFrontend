export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Custom events for your application
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

// Track user interactions
export const trackUserInteraction = (action: string, element: string) => {
  trackEvent('user_interaction', {
    action,
    element,
  });
};

// Track dataset views
export const trackDatasetView = (datasetId: string, datasetTitle?: string) => {
  trackEvent('dataset_view', {
    dataset_id: datasetId,
    dataset_title: datasetTitle,
  });
};

// Track usecase views
export const trackUsecaseView = (usecaseId: string, usecaseTitle?: string) => {
  trackEvent('usecase_view', {
    usecase_id: usecaseId,
    usecase_title: usecaseTitle,
  });
};

// Track search queries
export const trackSearch = (query: string, resultCount?: number) => {
  trackEvent('search', {
    search_term: query,
    result_count: resultCount,
  });
};

// Track downloads
export const trackDownload = (fileName: string, fileType?: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  });
};

export const trackPageWithTiming = (pagePath: string, pageTitle?: string, loadTime?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: pagePath,
      page_title: pageTitle,
      custom_map: { metric1: 'page_load_time' },
    });
    
    if (loadTime) {
      window.gtag('event', 'timing_complete', {
        name: 'page_load',
        value: Math.round(loadTime),
      });
    }
  }
};

export const trackEngagement = (engagementType: string, value?: number) => {
  trackEvent('user_engagement', {
    engagement_type: engagementType,
    value: value,
  });
};

export const trackError = (errorType: string, errorMessage?: string, errorPage?: string) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    error_page: errorPage || window.location.pathname,
  });
};

export const trackScrollDepth = (scrollPercentage: number) => {
  trackEvent('scroll', {
    scroll_depth: scrollPercentage,
    page_path: window.location.pathname,
  });
};
