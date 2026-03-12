# Platform Tour Guide - React Joyride Integration

This document explains how to use and configure the platform walkthrough feature built with React Joyride.

## Overview

The tour system provides an interactive walkthrough for users to learn about the platform's features. It includes:

- ✅ **First-time user detection** - Automatically shows tours to new users
- ✅ **Manual triggering** - Users can restart tours anytime
- ✅ **Skip functionality** - Users can skip tours at any point
- ✅ **Custom styling** - Matches platform design language
- ✅ **Config-driven** - Easy to add/modify tours via configuration
- ✅ **Mobile responsive** - Optimized for mobile devices
- ✅ **LocalStorage persistence** - Remembers which tours users have seen

## Architecture

### Core Components

1. **TourProvider** (`contexts/TourContext.tsx`)
   - Manages tour state globally
   - Tracks which tours have been seen
   - Provides tour control methods

2. **TourGuide** (`components/Tour/TourGuide.tsx`)
   - Renders the Joyride component
   - Applies custom styling
   - Handles tour callbacks

3. **Tour Configuration** (`config/tours.ts`)
   - Defines all available tours
   - Maps tours to routes
   - Configures tour steps

4. **Hooks**
   - `useTour()` - Access tour state and controls
   - `useTourTrigger()` - Auto-trigger tours for first-time users
   - `useManualTour()` - Manual tour control for current page

5. **UI Components**
   - `TourButton` - Button to manually start tours
   - `FloatingTourButton` - Floating action button for tours

## Quick Start

### 1. Add Tour Data Attributes to Your Components

Add `data-tour` attributes to elements you want to highlight:

```tsx
// Example: Home page
<div data-tour="search-bar">
  <SearchBar />
</div>

<nav>
  <Link href="/datasets" data-tour="datasets-link">
    Datasets
  </Link>
  <Link href="/usecases" data-tour="usecases-link">
    Use Cases
  </Link>
</nav>
```

### 2. Enable Auto-Tour for First-Time Users

In your page component:

```tsx
'use client';

import { useTourTrigger } from '@/hooks/use-tour-trigger';

export default function HomePage() {
  // Automatically show tour to first-time users
  useTourTrigger(true, 1000); // enabled, delay in ms

  return (
    <div>
      {/* Your page content */}
    </div>
  );
}
```

### 3. Add Manual Tour Button

```tsx
import { TourButton } from '@/components/Tour';

export default function Header() {
  return (
    <header>
      {/* Other header content */}
      <TourButton variant="both" label="Take a tour" />
    </header>
  );
}
```

Or use a floating button:

```tsx
import { FloatingTourButton } from '@/components/Tour';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <FloatingTourButton />
    </>
  );
}
```

## Creating New Tours

### Step 1: Define Tour Configuration

Edit `config/tours.ts`:

```typescript
export const myNewTour: TourConfig = {
  id: 'my-new-tour',
  name: 'My New Feature Tour',
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: 'body', // Use 'body' for centered modals
      content: 'Welcome to the new feature!',
      placement: 'center',
      disableBeacon: true, // Skip beacon for first step
    },
    {
      target: '[data-tour="feature-button"]',
      content: 'Click here to access the feature.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="settings"]',
      content: 'Configure your preferences here.',
      placement: 'left',
    },
  ],
};
```

### Step 2: Register Tour with Route

Add to `toursByRoute` in `config/tours.ts`:

```typescript
export const toursByRoute: Record<string, TourConfig> = {
  '/': homeTour,
  '/datasets': datasetsListingTour,
  '/my-new-page': myNewTour, // Add your tour here
  // ... other tours
};
```

### Step 3: Add Data Attributes to Your Page

```tsx
export default function MyNewPage() {
  useTourTrigger(); // Enable auto-tour

  return (
    <div>
      <button data-tour="feature-button">
        Feature Button
      </button>
      <div data-tour="settings">
        Settings Panel
      </div>
    </div>
  );
}
```

## Tour Step Configuration

Each step supports these properties:

```typescript
{
  target: string | HTMLElement;        // CSS selector or element
  content: React.ReactNode;            // Step content
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  title?: React.ReactNode;             // Optional step title
  disableBeacon?: boolean;             // Skip beacon animation
  disableOverlay?: boolean;            // Disable spotlight overlay
  disableScrolling?: boolean;          // Prevent scrolling to target
  offset?: number;                     // Offset from target
  placementBeacon?: Placement;         // Beacon placement
  styles?: Styles;                     // Custom styles for this step
}
```

## Programmatic Control

### Using the useTour Hook

```tsx
import { useTour } from '@/contexts/TourContext';

function MyComponent() {
  const {
    activeTour,
    isTourRunning,
    stepIndex,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    hasSeenTour,
    markTourAsSeen,
    resetAllTours,
  } = useTour();

  const handleStartTour = () => {
    const tour = getTourByRoute('/datasets');
    if (tour) {
      startTour(tour);
    }
  };

  return (
    <div>
      <button onClick={handleStartTour}>Start Tour</button>
      <button onClick={stopTour}>Stop Tour</button>
      <button onClick={resetAllTours}>Reset All Tours</button>
    </div>
  );
}
```

### Using the useManualTour Hook

```tsx
import { useManualTour } from '@/hooks/use-tour-trigger';

function MyComponent() {
  const { startTour, stopTour, hasTour, tourName, isTourRunning } = useManualTour();

  if (!hasTour) {
    return null; // No tour available for current page
  }

  return (
    <button onClick={startTour} disabled={isTourRunning}>
      Start {tourName}
    </button>
  );
}
```

## Customization

### Styling

The tour is styled to match the platform's design tokens. To customize:

1. **Global Styles**: Edit `TourGuide.tsx` styles object
2. **Per-Step Styles**: Add `styles` property to individual steps
3. **CSS Variables**: Uses platform CSS variables (e.g., `--base-violet-solid-9`)

### Mobile Optimization

The tour automatically adjusts for mobile:
- Smaller tooltip width (300px vs 400px)
- Adjusted font sizes
- Optimized padding
- Touch-friendly buttons

### Disabling Auto-Tours

To disable auto-tours globally, don't call `useTourTrigger()` in your pages.

To disable for specific users, you can add logic:

```tsx
const { user } = useSession();
const shouldShowTour = user?.preferences?.showTours ?? true;

useTourTrigger(shouldShowTour);
```

## Best Practices

### 1. Keep Tours Short
- Aim for 3-7 steps per tour
- Focus on key features only
- Create multiple tours for different sections

### 2. Use Clear Content
```tsx
{
  target: '[data-tour="download"]',
  content: 'Click here to download the dataset in various formats like CSV, JSON, or Excel.',
  placement: 'left',
}
```

### 3. Proper Target Selection
- Use unique `data-tour` attributes
- Avoid dynamic selectors that might change
- Ensure targets are visible when tour runs

### 4. Handle Missing Targets
The tour automatically skips steps if targets aren't found, but you should:
- Test tours thoroughly
- Use conditional rendering carefully
- Consider adding fallback content

### 5. Accessibility
- Provide clear, descriptive content
- Use proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

## Troubleshooting

### Tour Not Showing

1. Check if tour is registered in `toursByRoute`
2. Verify `data-tour` attributes exist on page
3. Check if user has already seen the tour (check localStorage)
4. Ensure `TourProvider` is in component tree

### Target Not Found

1. Verify element exists in DOM when tour runs
2. Check selector syntax
3. Add delay to `useTourTrigger()` if needed
4. Use browser DevTools to inspect elements

### Styling Issues

1. Check CSS variable values in browser
2. Verify Tailwind classes are available
3. Check z-index conflicts
4. Test in different browsers

### Mobile Issues

1. Test on actual devices, not just browser DevTools
2. Check touch event handling
3. Verify responsive breakpoints
4. Test with different screen sizes

## API Reference

### TourConfig

```typescript
interface TourConfig {
  id: string;                    // Unique tour identifier
  name: string;                  // Display name
  steps: Step[];                 // Array of tour steps
  continuous?: boolean;          // Show next button (default: true)
  showProgress?: boolean;        // Show step progress (default: true)
  showSkipButton?: boolean;      // Show skip button (default: true)
  disableScrolling?: boolean;    // Disable page scrolling (default: false)
}
```

### useTour() Return Values

```typescript
{
  activeTour: TourConfig | null;           // Current active tour
  isTourRunning: boolean;                  // Is tour currently running
  stepIndex: number;                       // Current step index
  startTour: (tour: TourConfig) => void;   // Start a tour
  stopTour: () => void;                    // Stop current tour
  nextStep: () => void;                    // Go to next step
  prevStep: () => void;                    // Go to previous step
  goToStep: (index: number) => void;       // Go to specific step
  hasSeenTour: (tourId: string) => boolean;// Check if tour was seen
  markTourAsSeen: (tourId: string) => void;// Mark tour as seen
  resetAllTours: () => void;               // Reset all tour history
  isMobile: boolean;                       // Is mobile device
}
```

## Examples

### Example 1: Conditional Tour Based on User Role

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { useTourTrigger } from '@/hooks/use-tour-trigger';

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  // Only show tour to admins
  useTourTrigger(isAdmin);

  return <div>{/* Dashboard content */}</div>;
}
```

### Example 2: Multi-Step Onboarding

```tsx
'use client';

import { useState } from 'react';
import { useTour } from '@/contexts/TourContext';
import { step1Tour, step2Tour, step3Tour } from '@/config/tours';

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const { startTour, isTourRunning } = useTour();

  const handleNextOnboarding = () => {
    if (currentStep === 1) {
      startTour(step1Tour);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      startTour(step2Tour);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      startTour(step3Tour);
      setCurrentStep(4);
    }
  };

  return (
    <div>
      <button onClick={handleNextOnboarding} disabled={isTourRunning}>
        Continue Onboarding (Step {currentStep}/3)
      </button>
    </div>
  );
}
```

### Example 3: Tour with Custom Trigger

```tsx
'use client';

import { useTour } from '@/contexts/TourContext';
import { datasetDetailTour } from '@/config/tours';

export default function DatasetPage() {
  const { startTour, hasSeenTour } = useTour();

  const handleHelpClick = () => {
    startTour(datasetDetailTour);
  };

  return (
    <div>
      <button onClick={handleHelpClick}>
        {hasSeenTour(datasetDetailTour.id) ? 'Replay Tour' : 'Need Help?'}
      </button>
      {/* Page content */}
    </div>
  );
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review example implementations
3. Check browser console for errors
4. Contact the development team

## Future Enhancements

Potential improvements:
- [ ] Analytics tracking for tour completion rates
- [ ] A/B testing different tour flows
- [ ] Video tutorials in tour steps
- [ ] Interactive elements within tours
- [ ] Multi-language support
- [ ] Tour templates for common patterns
