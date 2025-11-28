'use client';

import React from 'react';
import { useManualTour } from '@/hooks/use-tour-trigger';
import { HelpCircle } from 'lucide-react';

interface TourButtonProps {
  variant?: 'icon' | 'text' | 'both';
  className?: string;
  label?: string;
}

/**
 * Button component to manually trigger the tour for current page
 * Can be placed in header, footer, or anywhere on the page
 */
export function TourButton({ 
  variant = 'both', 
  className = '',
  label = 'Take a tour'
}: TourButtonProps) {
  const { startTour, hasTour, isTourRunning } = useManualTour();

  // Don't render if no tour available for current page
  if (!hasTour) {
    return null;
  }

  // Don't render if tour is already running
  if (isTourRunning) {
    return null;
  }

  const baseClasses = 'inline-flex items-center gap-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-actionPrimaryBasicDefault';
  
  const variantClasses = {
    icon: 'p-2 hover:bg-actionSecondaryBasicHovered',
    text: 'px-4 py-2 text-sm font-medium text-textMedium hover:text-textDefault hover:bg-actionSecondaryBasicHovered',
    both: 'px-4 py-2 text-sm font-medium bg-actionSecondaryBasicDefault hover:bg-actionSecondaryBasicHovered text-textDefault',
  };

  return (
    <button
      onClick={startTour}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={label}
      title={label}
    >
      <HelpCircle className="w-4 h-4" />
      {(variant === 'text' || variant === 'both') && <span>{label}</span>}
    </button>
  );
}

/**
 * Floating action button for tour - positioned fixed on screen
 */
export function FloatingTourButton() {
  const { startTour, hasTour, isTourRunning } = useManualTour();

  if (!hasTour || isTourRunning) {
    return null;
  }

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-actionPrimaryBasicDefault text-textOnBGDefault shadow-lg hover:bg-actionPrimaryBasicHovered transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-actionPrimaryBasicDefault"
      aria-label="Take a tour"
      title="Take a tour"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
}
