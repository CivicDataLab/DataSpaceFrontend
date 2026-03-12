/**
 * Tour-related TypeScript types and interfaces
 */

import { Step, Placement, Styles } from 'react-joyride';

/**
 * Tour configuration interface
 */
export interface TourConfig {
  /** Unique identifier for the tour */
  id: string;
  
  /** Display name of the tour */
  name: string;
  
  /** Array of tour steps */
  steps: Step[];
  
  /** Whether to show next/prev buttons (default: true) */
  continuous?: boolean;
  
  /** Whether to show step progress (default: true) */
  showProgress?: boolean;
  
  /** Whether to show skip button (default: true) */
  showSkipButton?: boolean;
  
  /** Whether to disable page scrolling during tour (default: false) */
  disableScrolling?: boolean;
}

/**
 * Tour step interface (extends Joyride Step)
 */
export interface TourStep extends Step {
  /** CSS selector or HTMLElement to target */
  target: string | HTMLElement;
  
  /** Content to display in the tooltip */
  content: React.ReactNode;
  
  /** Placement of the tooltip relative to target */
  placement?: Placement;
  
  /** Optional title for the step */
  title?: React.ReactNode;
  
  /** Skip the beacon animation for this step */
  disableBeacon?: boolean;
  
  /** Disable the spotlight overlay for this step */
  disableOverlay?: boolean;
  
  /** Disable scrolling to this step */
  disableScrolling?: boolean;
  
  /** Offset from the target element */
  offset?: number;
  
  /** Custom styles for this step */
  styles?: Styles;
}

/**
 * Tour context state
 */
export interface TourContextState {
  /** Currently active tour */
  activeTour: TourConfig | null;
  
  /** Whether a tour is currently running */
  isTourRunning: boolean;
  
  /** Current step index */
  stepIndex: number;
  
  /** Whether the device is mobile */
  isMobile: boolean;
}

/**
 * Tour context actions
 */
export interface TourContextActions {
  /** Start a tour */
  startTour: (tour: TourConfig) => void;
  
  /** Stop the current tour */
  stopTour: () => void;
  
  /** Go to next step */
  nextStep: () => void;
  
  /** Go to previous step */
  prevStep: () => void;
  
  /** Go to specific step by index */
  goToStep: (index: number) => void;
  
  /** Check if a tour has been seen */
  hasSeenTour: (tourId: string) => boolean;
  
  /** Mark a tour as seen */
  markTourAsSeen: (tourId: string) => void;
  
  /** Reset all tour history */
  resetAllTours: () => void;
}

/**
 * Complete tour context type
 */
export type TourContextType = TourContextState & TourContextActions;

/**
 * Tour button variant types
 */
export type TourButtonVariant = 'icon' | 'text' | 'both';

/**
 * Tour button props
 */
export interface TourButtonProps {
  /** Button variant style */
  variant?: TourButtonVariant;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Button label text */
  label?: string;
}

/**
 * Manual tour hook return type
 */
export interface UseManualTourReturn {
  /** Start the tour for current page */
  startTour: () => void;
  
  /** Stop the current tour */
  stopTour: () => void;
  
  /** Whether a tour is currently running */
  isTourRunning: boolean;
  
  /** Whether current page has a tour */
  hasTour: boolean;
  
  /** Name of the tour for current page */
  tourName?: string;
}

/**
 * Tour trigger hook options
 */
export interface UseTourTriggerOptions {
  /** Whether to enable auto-trigger */
  enabled?: boolean;
  
  /** Delay in milliseconds before showing tour */
  delay?: number;
}

/**
 * Tour route mapping type
 */
export type TourRouteMap = Record<string, TourConfig>;

/**
 * LocalStorage tour data structure
 */
export interface TourStorageData {
  /** Array of seen tour IDs */
  seenTours: string[];
  
  /** Last updated timestamp */
  lastUpdated?: number;
}
