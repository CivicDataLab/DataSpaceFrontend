/**
 * Tour utility functions
 */

import { TourConfig, TourStorageData } from '@/types/tour';

const STORAGE_KEY = 'civicdata-tours-seen';

/**
 * Get seen tours from localStorage
 */
export function getSeenTours(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: string[] = JSON.parse(stored);
      return new Set(data);
    }
  } catch (error) {
    console.error('Failed to load tour history:', error);
  }
  
  return new Set();
}

/**
 * Save seen tours to localStorage
 */
export function saveSeenTours(tours: Set<string>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(tours)));
  } catch (error) {
    console.error('Failed to save tour history:', error);
  }
}

/**
 * Check if a tour has been seen
 */
export function hasSeenTour(tourId: string): boolean {
  const seenTours = getSeenTours();
  return seenTours.has(tourId);
}

/**
 * Mark a tour as seen
 */
export function markTourAsSeen(tourId: string): void {
  const seenTours = getSeenTours();
  seenTours.add(tourId);
  saveSeenTours(seenTours);
}

/**
 * Reset all tour history
 */
export function resetAllTours(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset tour history:', error);
  }
}

/**
 * Reset specific tour
 */
export function resetTour(tourId: string): void {
  const seenTours = getSeenTours();
  seenTours.delete(tourId);
  saveSeenTours(seenTours);
}

/**
 * Get tour statistics
 */
export function getTourStats(): {
  totalSeen: number;
  seenTours: string[];
} {
  const seenTours = getSeenTours();
  return {
    totalSeen: seenTours.size,
    seenTours: Array.from(seenTours),
  };
}

/**
 * Check if element exists in DOM
 */
export function elementExists(selector: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return document.querySelector(selector) !== null;
  } catch (error) {
    console.error('Invalid selector:', selector, error);
    return false;
  }
}

/**
 * Validate tour configuration
 */
export function validateTour(tour: TourConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!tour.id) {
    errors.push('Tour must have an id');
  }

  if (!tour.name) {
    errors.push('Tour must have a name');
  }

  if (!tour.steps || tour.steps.length === 0) {
    errors.push('Tour must have at least one step');
  }

  if (tour.steps) {
    tour.steps.forEach((step, index) => {
      if (!step.target) {
        errors.push(`Step ${index + 1} must have a target`);
      }
      if (!step.content) {
        errors.push(`Step ${index + 1} must have content`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768;
}

/**
 * Wait for element to appear in DOM
 */
export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element | null> {
  return new Promise((resolve) => {
    if (elementExists(selector)) {
      resolve(document.querySelector(selector));
      return;
    }

    const observer = new MutationObserver(() => {
      if (elementExists(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Scroll element into view smoothly
 */
export function scrollToElement(selector: string): void {
  if (typeof window === 'undefined') return;
  
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }
}

/**
 * Get tour progress percentage
 */
export function getTourProgress(currentStep: number, totalSteps: number): number {
  if (totalSteps === 0) return 0;
  return Math.round(((currentStep + 1) / totalSteps) * 100);
}

/**
 * Format tour step for analytics
 */
export function formatTourStepForAnalytics(
  tourId: string,
  stepIndex: number,
  stepTarget: string
): {
  tourId: string;
  stepIndex: number;
  stepTarget: string;
  timestamp: number;
} {
  return {
    tourId,
    stepIndex,
    stepTarget,
    timestamp: Date.now(),
  };
}

/**
 * Debounce function for resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if tours are enabled (can be used for feature flags)
 */
export function areToursEnabled(): boolean {
  // Add your feature flag logic here
  // For now, always return true
  return true;
}

/**
 * Get recommended delay based on page complexity
 */
export function getRecommendedDelay(elementCount: number): number {
  if (elementCount < 10) return 500;
  if (elementCount < 50) return 1000;
  if (elementCount < 100) return 1500;
  return 2000;
}
