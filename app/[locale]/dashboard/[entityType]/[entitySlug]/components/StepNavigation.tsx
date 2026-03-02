import { usePathname, useRouter } from 'next/navigation';
import { Button, Icon, Text } from 'opub-ui';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';

interface StepNavigationProps {
  steps: string[]; // Array of steps (e.g., ['metadata', 'details', 'publish'])
  onBeforeNavigate?: () => Promise<void> | void;
}

const StepNavigation = ({ steps, onBeforeNavigate }: StepNavigationProps) => {
  const pathname = usePathname(); // Get the current URL path
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Route has changed (or initial mount), re-enable navigation controls.
    setIsNavigating(false);
  }, [pathname]);

  const navigateWithBlur = async (newPath: string) => {
    setIsNavigating(true);

    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur();
    }

    if (onBeforeNavigate) {
      try {
        await onBeforeNavigate();
      } catch {
        // Preserve current behavior: navigation should still continue.
      }
    }

    try {
      router.push(newPath);
    } catch {
      setIsNavigating(false);
    }
  };

  // Find the current step's index based on the pathname (without query params)
  const currentIndex = steps.findIndex((step) =>
    pathname.split('?')[0].endsWith(step)
  );

  if (currentIndex === -1) {
    return null; // In case no valid step is found
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newPath = pathname.replace(
        steps[currentIndex],
        steps[currentIndex - 1]
      );
      void navigateWithBlur(newPath); // Update the URL to the previous step
    }
  };

  const goToNext = () => {
    if (currentIndex < steps.length - 1) {
      const newPath = pathname.replace(
        steps[currentIndex],
        steps[currentIndex + 1]
      );
      void navigateWithBlur(newPath); // Update the URL to the next step
    }
  };

  return (
    <div className="flex items-center justify-center gap-10">
      <Button
        onClick={goToPrevious}
        disabled={currentIndex === 0 || isNavigating} // Disable if at the first step
        kind="tertiary"
      >
        <div className="flex items-center gap-1">
          <Icon
            source={Icons.back}
            size={24}
            color={currentIndex === 0 ? 'disabled' : 'warning'}
          />
          <Text color={currentIndex === 0 ? 'disabled' : 'medium'}>
            Previous
          </Text>
        </div>
      </Button>
      <Text>
        Step <b>{currentIndex + 1}</b> of {steps.length}
      </Text>
      <Button
        onClick={goToNext}
        disabled={currentIndex === steps.length - 1 || isNavigating} // Disable if at the last step
        kind="tertiary"
        className="flex gap-1"
      >
        <div className="flex items-center gap-1">
          <Text
            color={currentIndex === steps.length - 1 ? 'disabled' : 'medium'}
          >
            {' '}
            Next
          </Text>
          <Icon
            source={Icons.arrowRight}
            size={24}
            color={currentIndex === steps.length - 1 ? 'disabled' : 'warning'}
          />
        </div>
      </Button>
    </div>
  );
};

export default StepNavigation;
