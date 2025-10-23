import { Step } from 'react-joyride';

/**
 * Tour configuration type
 */
export interface TourConfig {
  id: string;
  name: string;
  steps: Step[];
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  disableScrolling?: boolean;
}

/**
 * Home page tour configuration
 */
export const homeTour: TourConfig = {
  id: 'home-tour',
  name: 'Home Page Tour',
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: 'body',
      content: 'Welcome to CivicDataSpace! Let\'s take a quick tour to help you get started.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="search-bar"]',
      content: 'Use the search bar to quickly find datasets, use cases, and other resources.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="datasets-link"]',
      content: 'Browse all available datasets organized by categories and sectors.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="usecases-link"]',
      content: 'Explore real-world use cases and applications of our data.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="publishers-link"]',
      content: 'View all data publishers and organizations contributing to the platform.',
      placement: 'bottom',
      disableBeacon: true,
    },
  ],
};

/**
 * Datasets listing page tour
 */
export const datasetsListingTour: TourConfig = {
  id: 'datasets-listing-tour',
  name: 'Datasets Listing Tour',
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: '[data-tour="filters"]',
      content: 'Use filters to narrow down datasets by sector, organization, tags, and more.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="search"]',
      content: 'Search for specific datasets using keywords.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sort"]',
      content: 'Sort datasets by relevance, date, or alphabetically.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dataset-card"]',
      content: 'Click on any dataset card to view detailed information and download options.',
      placement: 'top',
      disableBeacon: true,
    },
  ],
};

/**
 * Dataset detail page tour
 */
export const datasetDetailTour: TourConfig = {
  id: 'dataset-detail-tour',
  name: 'Dataset Detail Tour',
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: '[data-tour="dataset-info"]',
      content: 'View comprehensive information about the dataset including description, metadata, and publisher details.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="download-button"]',
      content: 'Download the dataset in various formats.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="preview"]',
      content: 'Preview the dataset structure and sample data.',
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="related-datasets"]',
      content: 'Discover related datasets that might be useful for your work.',
      placement: 'top',
      disableBeacon: true,
    },
  ],
};

/**
 * Dashboard tour
 */
export const dashboardTour: TourConfig = {
  id: 'dashboard-tour',
  name: 'Dashboard Tour',
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: '[data-tour="sidebar"]',
      content: 'Navigate between different sections of your dashboard using the sidebar.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="create-dataset"]',
      content: 'Create and publish new datasets to share with the community.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="my-datasets"]',
      content: 'Manage all your published datasets here.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="analytics"]',
      content: 'View analytics and insights about your datasets\' usage and impact.',
      placement: 'left',
      disableBeacon: true,
    },
  ],
};

/**
 * Use cases listing tour
 */
export const useCasesListingTour: TourConfig = {
  id: 'usecases-listing-tour',
  name: 'Use Cases Listing Tour',
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: '[data-tour="filters"]',
      content: 'Filter use cases by sector, status, and related datasets.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="usecase-card"]',
      content: 'Click on any use case to learn more about real-world applications.',
      placement: 'top',
      disableBeacon: true,
    },
  ],
};

/**
 * All available tours mapped by route pattern
 */
export const toursByRoute: Record<string, TourConfig> = {
  '/': homeTour,
  '/datasets': datasetsListingTour,
  '/datasets/[slug]': datasetDetailTour,
  '/usecases': useCasesListingTour,
  '/dashboard': dashboardTour,
};

/**
 * Get tour configuration by route
 */
export function getTourByRoute(route: string): TourConfig | null {
  // Exact match
  if (toursByRoute[route]) {
    return toursByRoute[route];
  }

  // Pattern match for dynamic routes
  for (const [pattern, tour] of Object.entries(toursByRoute)) {
    if (pattern.includes('[') && route.match(new RegExp(pattern.replace(/\[.*?\]/g, '[^/]+')))) {
      return tour;
    }
  }

  return null;
}

/**
 * Get all available tours
 */
export function getAllTours(): TourConfig[] {
  return Object.values(toursByRoute);
}
