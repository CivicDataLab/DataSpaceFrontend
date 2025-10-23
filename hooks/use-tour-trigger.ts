'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTour } from '@/contexts/TourContext';
import { getTourByRoute } from '@/config/tours';

/**
 * Hook to automatically trigger tour for first-time users on specific routes
 * 
 * @param enabled - Whether to enable auto-trigger (default: true)
 * @param delay - Delay in ms before showing tour (default: 1000)
 */
export function useTourTrigger(enabled: boolean = true, delay: number = 1000) {
  const pathname = usePathname();
  const { startTour, hasSeenTour, isTourRunning } = useTour();

  useEffect(() => {
    if (!enabled || isTourRunning) return;

    // Get tour for current route
    const tour = getTourByRoute(pathname);
    
    if (tour && !hasSeenTour(tour.id)) {
      // Delay showing tour to allow page to fully load
      const timer = setTimeout(() => {
        startTour(tour);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [pathname, enabled, delay, startTour, hasSeenTour, isTourRunning]);
}

/**
 * Hook to manually control tour for a specific route
 */
export function useManualTour() {
  const pathname = usePathname();
  const { startTour, stopTour, isTourRunning } = useTour();

  const startCurrentTour = () => {
    const tour = getTourByRoute(pathname);
    if (tour) {
      startTour(tour);
    }
  };

  const tour = getTourByRoute(pathname);

  return {
    startTour: startCurrentTour,
    stopTour,
    isTourRunning,
    hasTour: !!tour,
    tourName: tour?.name,
  };
}
