'use client';

import React, { createContext, useContext, useRef, useState } from 'react';

type BeforeNavigateHandler = (() => Promise<void> | void) | null;

type EditStatusContextType = {
  status: 'saved' | 'unsaved' | 'saving';
  setStatus: (status: 'saved' | 'unsaved' | 'saving') => void;
  versionsCompleted: boolean;
  setVersionsCompleted: (completed: boolean) => void;
  infoCompleted: boolean;
  setInfoCompleted: (completed: boolean) => void;
  stepShowErrors: boolean;
  setStepShowErrors: (show: boolean) => void;
  registerBeforeNavigateHandler: (handler: BeforeNavigateHandler) => void;
  runBeforeNavigateHandler: () => Promise<void>;
};

const EditStatusContext = createContext<EditStatusContextType | undefined>(
  undefined
);

export const EditStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [versionsCompleted, setVersionsCompleted] = useState(false);
  const [infoCompleted, setInfoCompleted] = useState(false);
  const [stepShowErrors, setStepShowErrors] = useState(false);
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = (handler: BeforeNavigateHandler) => {
    beforeNavigateHandlerRef.current = handler;
  };

  const runBeforeNavigateHandler = async () => {
    await beforeNavigateHandlerRef.current?.();
  };

  return (
    <EditStatusContext.Provider
      value={{
        status,
        setStatus,
        versionsCompleted,
        setVersionsCompleted,
        infoCompleted,
        setInfoCompleted,
        stepShowErrors,
        setStepShowErrors,
        registerBeforeNavigateHandler,
        runBeforeNavigateHandler,
      }}
    >
      {children}
    </EditStatusContext.Provider>
  );
};

export const useEditStatus = () => {
  const context = useContext(EditStatusContext);
  if (!context) {
    throw new Error('useEditStatus must be used within EditStatusProvider');
  }
  return context;
};
