'use client';

import { createContext, useContext, useRef, useState } from 'react';

type StatusType = 'loading' | 'success';
type BeforeNavigateHandler = (() => Promise<void> | void) | null;

interface UseCaseEditStatusContextValue {
  status: StatusType;
  setStatus: (status: StatusType) => void;
  registerBeforeNavigateHandler: (handler: BeforeNavigateHandler) => void;
  runBeforeNavigateHandler: () => Promise<void>;
  builderCompleted: boolean;
  setBuilderCompleted: (completed: boolean) => void;
  connectCompleted: boolean;
  setConnectCompleted: (completed: boolean) => void;
  stepShowErrors: boolean;
  setStepShowErrors: (show: boolean) => void;
}

const UseCaseEditStatusContext =
  createContext<UseCaseEditStatusContextValue | null>(null);

export const UseCaseEditStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<StatusType>('success');
  const [builderCompleted, setBuilderCompleted] = useState(false);
  const [connectCompleted, setConnectCompleted] = useState(false);
  const [stepShowErrors, setStepShowErrors] = useState(false);
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = (handler: BeforeNavigateHandler) => {
    beforeNavigateHandlerRef.current = handler;
  };

  const runBeforeNavigateHandler = async () => {
    await beforeNavigateHandlerRef.current?.();
  };

  return (
    <UseCaseEditStatusContext.Provider
      value={{
        status,
        setStatus,
        registerBeforeNavigateHandler,
        runBeforeNavigateHandler,
        builderCompleted,
        setBuilderCompleted,
        connectCompleted,
        setConnectCompleted,
        stepShowErrors,
        setStepShowErrors,
      }}
    >
      {children}
    </UseCaseEditStatusContext.Provider>
  );
};

export const EditStatusProvider = UseCaseEditStatusProvider;

export const useUseCaseEditStatus = () => {
  const context = useContext(UseCaseEditStatusContext);
  if (!context) {
    throw new Error(
      'useUseCaseEditStatus must be used within UseCaseEditStatusProvider'
    );
  }
  return context;
};

export const useEditStatus = () => {
  const { status, setStatus } = useUseCaseEditStatus();
  return { status, setStatus };
};
