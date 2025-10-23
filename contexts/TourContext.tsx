'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TourConfig } from '@/config/tours';

interface TourContextType {
  // Current active tour
  activeTour: TourConfig | null;
  
  // Tour state
  isTourRunning: boolean;
  stepIndex: number;
  
  // Tour controls
  startTour: (tour: TourConfig) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  
  // First-time user tracking
  hasSeenTour: (tourId: string) => boolean;
  markTourAsSeen: (tourId: string) => void;
  resetAllTours: () => void;
  
  // Mobile detection
  isMobile: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = 'civicdata-tours-seen';

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [seenTours, setSeenTours] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Load seen tours from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSeenTours(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load tour history:', error);
    }
  }, []);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save seen tours to localStorage
  const saveSeenTours = useCallback((tours: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(tours)));
    } catch (error) {
      console.error('Failed to save tour history:', error);
    }
  }, []);

  const startTour = useCallback((tour: TourConfig) => {
    setActiveTour(tour);
    setIsTourRunning(true);
    setStepIndex(0);
  }, []);

  const stopTour = useCallback(() => {
    if (activeTour) {
      const newSeenTours = new Set(seenTours);
      newSeenTours.add(activeTour.id);
      setSeenTours(newSeenTours);
      saveSeenTours(newSeenTours);
    }
    
    setIsTourRunning(false);
    setActiveTour(null);
    setStepIndex(0);
  }, [activeTour, seenTours, saveSeenTours]);

  const nextStep = useCallback(() => {
    if (activeTour && stepIndex < activeTour.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      stopTour();
    }
  }, [activeTour, stepIndex, stopTour]);

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  }, [stepIndex]);

  const goToStep = useCallback((index: number) => {
    if (activeTour && index >= 0 && index < activeTour.steps.length) {
      setStepIndex(index);
    }
  }, [activeTour]);

  const hasSeenTour = useCallback((tourId: string) => {
    return seenTours.has(tourId);
  }, [seenTours]);

  const markTourAsSeen = useCallback((tourId: string) => {
    const newSeenTours = new Set(seenTours);
    newSeenTours.add(tourId);
    setSeenTours(newSeenTours);
    saveSeenTours(newSeenTours);
  }, [seenTours, saveSeenTours]);

  const resetAllTours = useCallback(() => {
    setSeenTours(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: TourContextType = {
    activeTour,
    isTourRunning,
    stepIndex,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
    hasSeenTour,
    markTourAsSeen,
    resetAllTours,
    isMobile,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
