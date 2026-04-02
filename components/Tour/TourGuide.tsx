'use client';

import React, { useEffect } from 'react';
import { Joyride, EventData, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useTour } from '@/contexts/TourContext';

/**
 * Custom styled TourGuide component using React Joyride
 * Styled according to platform design language
 */
export function TourGuide() {
  const { activeTour, isTourRunning, stepIndex, nextStep, prevStep, stopTour, isMobile } = useTour();

  // Handle Joyride callbacks
  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, action } = data;

    // Tour finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      stopTour();
      return;
    }

    // Handle step changes
    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        nextStep();
      } else if (action === ACTIONS.PREV) {
        prevStep();
      } else if (action === ACTIONS.CLOSE) {
        stopTour();
      }
    }

    // Handle target not found
    if (type === EVENTS.TARGET_NOT_FOUND) {
      console.warn('Tour target not found, skipping step');
      nextStep();
    }
  };

  // Disable body scroll when tour is running (optional)
  useEffect(() => {
    if (isTourRunning && activeTour?.disableScrolling) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isTourRunning, activeTour]);

  if (!activeTour || !isTourRunning) {
    return null;
  }

  return (
    <Joyride
      steps={activeTour.steps}
      run={isTourRunning}
      stepIndex={stepIndex}
      continuous={activeTour.continuous ?? true}
      onEvent={handleJoyrideCallback}
      scrollToFirstStep={true}
      options={{
        showProgress: activeTour.showProgress ?? true,
        scrollOffset: 100,
        overlayClickAction: false,
        blockTargetInteraction: true,
        ...(activeTour.showSkipButton ? { buttons: ['back', 'close', 'primary', 'skip'] } : {}),
      }}
      // Custom styles matching platform design
      styles={{
        arrow: {
          color: 'var(--base-pure-white)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        floater: {
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: 'var(--base-pure-white)',
          color: 'var(--text-default)',
          width: isMobile ? 300 : 400,
          borderRadius: 'var(--border-radius-md, 8px)',
          padding: isMobile ? 16 : 20,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          maxHeight: '100vh',
          overflowY: 'auto',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: 600,
          color: 'var(--text-default)',
          marginBottom: 8,
        },
        tooltipContent: {
          fontSize: isMobile ? '14px' : '15px',
          lineHeight: 1.6,
          color: 'var(--text-medium)',
          padding: '8px 0',
        },
        buttonPrimary: {
          backgroundColor: 'var(--action-primary-basic-default)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          color: 'var(--text-on-bg-default)',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 500,
          padding: isMobile ? '8px 16px' : '10px 20px',
          outline: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        },
        buttonBack: {
          backgroundColor: 'transparent',
          borderRadius: 'var(--border-radius-sm, 6px)',
          color: 'var(--text-medium)',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 500,
          padding: isMobile ? '8px 16px' : '10px 20px',
          outline: 'none',
          border: '1px solid var(--border-default)',
          cursor: 'pointer',
          marginRight: 8,
          transition: 'all 0.2s ease',
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          color: 'var(--text-subdued)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: 500,
          padding: isMobile ? '6px 12px' : '8px 16px',
          outline: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        },
        buttonClose: {
          color: 'var(--text-subdued)',
          fontSize: '20px',
          padding: 8,
          outline: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        },
        beacon: {
          backgroundColor: 'var(--action-primary-basic-default)',
          borderRadius: '50%',
        },
        beaconInner: {
          backgroundColor: 'var(--action-primary-basic-default)',
        },
        beaconOuter: {
          backgroundColor: 'var(--action-primary-basic-default)',
          border: '2px solid var(--action-primary-basic-default)',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}
