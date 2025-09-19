import { useCallback } from 'react';
import { 
  trackEvent, 
  trackPageView, 
  trackUserInteraction, 
  trackDatasetView, 
  trackUsecaseView, 
  trackSearch, 
  trackDownload,
  trackEngagement,
  trackError,
  trackScrollDepth
} from '@/lib/gtag';

export const useAnalytics = () => {
  const track = useCallback((eventName: string, parameters?: Record<string, any>) => {
    trackEvent(eventName, parameters);
  }, []);

  const trackPage = useCallback((pagePath: string, pageTitle?: string) => {
    trackPageView(pagePath, pageTitle);
  }, []);

  const trackInteraction = useCallback((action: string, element: string) => {
    trackUserInteraction(action, element);
  }, []);

  const trackDataset = useCallback((datasetId: string, datasetTitle?: string) => {
    trackDatasetView(datasetId, datasetTitle);
  }, []);

  const trackUsecase = useCallback((usecaseId: string, usecaseTitle?: string) => {
    trackUsecaseView(usecaseId, usecaseTitle);
  }, []);

  const trackSearchQuery = useCallback((query: string, resultCount?: number) => {
    trackSearch(query, resultCount);
  }, []);

  const trackFileDownload = useCallback((fileName: string, fileType?: string) => {
    trackDownload(fileName, fileType);
  }, []);

  const trackUserEngagement = useCallback((engagementType: string, value?: number) => {
    trackEngagement(engagementType, value);
  }, []);

  const trackAppError = useCallback((errorType: string, errorMessage?: string, errorPage?: string) => {
    trackError(errorType, errorMessage, errorPage);
  }, []);

  const trackScroll = useCallback((scrollPercentage: number) => {
    trackScrollDepth(scrollPercentage);
  }, []);

  return {
    track,
    trackPage,
    trackInteraction,
    trackDataset,
    trackUsecase,
    trackSearchQuery,
    trackFileDownload,
    trackUserEngagement,
    trackAppError,
    trackScroll,
  };
};
