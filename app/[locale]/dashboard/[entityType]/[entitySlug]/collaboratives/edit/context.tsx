'use client';

import { createContext, useContext, useRef, useState } from 'react';

type StatusType = 'loading' | 'success';
type BeforeNavigateHandler = (() => Promise<void> | void) | null;

interface CollaborativeEditStatusContextValue {
  status: StatusType;
  setStatus: (status: StatusType) => void;
  registerBeforeNavigateHandler: (handler: BeforeNavigateHandler) => void;
  runBeforeNavigateHandler: () => Promise<void>;
  aboutCompleted: boolean;
  setAboutCompleted: (completed: boolean) => void;
  peopleCompleted: boolean;
  setPeopleCompleted: (completed: boolean) => void;
  contentCompleted: boolean;
  setContentCompleted: (completed: boolean) => void;
  stepShowErrors: boolean;
  setStepShowErrors: (show: boolean) => void;
}

const CollaborativeEditStatusContext =
  createContext<CollaborativeEditStatusContextValue | null>(null);

export const CollaborativeEditStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<StatusType>('success');
  const [aboutCompleted, setAboutCompleted] = useState(false);
  const [peopleCompleted, setPeopleCompleted] = useState(false);
  const [contentCompleted, setContentCompleted] = useState(false);
  const [stepShowErrors, setStepShowErrors] = useState(false);
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = (handler: BeforeNavigateHandler) => {
    beforeNavigateHandlerRef.current = handler;
  };

  const runBeforeNavigateHandler = async () => {
    await beforeNavigateHandlerRef.current?.();
  };

  return (
    <CollaborativeEditStatusContext.Provider
      value={{
        status,
        setStatus,
        registerBeforeNavigateHandler,
        runBeforeNavigateHandler,
        aboutCompleted,
        setAboutCompleted,
        peopleCompleted,
        setPeopleCompleted,
        contentCompleted,
        setContentCompleted,
        stepShowErrors,
        setStepShowErrors,
      }}
    >
      {children}
    </CollaborativeEditStatusContext.Provider>
  );
};

export const EditStatusProvider = CollaborativeEditStatusProvider;

export const useCollaborativeEditStatus = () => {
  const context = useContext(CollaborativeEditStatusContext);
  if (!context) {
    throw new Error(
      'useCollaborativeEditStatus must be used within CollaborativeEditStatusProvider'
    );
  }
  return context;
};

export const useEditStatus = () => {
  const { status, setStatus } = useCollaborativeEditStatus();
  return { status, setStatus };
};
