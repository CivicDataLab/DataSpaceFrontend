'use client';
import { createContext, useContext, useRef, useState } from 'react';

type StatusType = 'loading' | 'success';
type BeforeNavigateHandler = (() => Promise<void> | void) | null;

const DatasetEditStatusContext = createContext<{
  status: StatusType;
  setStatus: (status: StatusType) => void;
  registerBeforeNavigateHandler: (handler: BeforeNavigateHandler) => void;
  runBeforeNavigateHandler: () => Promise<void>;
} | null>(null);

export const DatasetEditStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<StatusType>('success');
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = (handler: BeforeNavigateHandler) => {
    beforeNavigateHandlerRef.current = handler;
  };

  const runBeforeNavigateHandler = async () => {
    await beforeNavigateHandlerRef.current?.();
  };

  return (
    <DatasetEditStatusContext.Provider
      value={{
        status,
        setStatus,
        registerBeforeNavigateHandler,
        runBeforeNavigateHandler,
      }}
    >
      {children}
    </DatasetEditStatusContext.Provider>
  );
};

export const useDatasetEditStatus = () => {
  const context = useContext(DatasetEditStatusContext);
  if (!context) {
    throw new Error('useDatasetEditStatus must be used within DatasetEditStatusProvider');
  }
  return context;
};
