'use client';

import { createContext, useContext, useRef, useState } from 'react';

type StatusType = 'loading' | 'success';
type BeforeNavigateHandler = (() => Promise<void> | void) | null;

interface DatasetEditStatusContextValue {
  status: StatusType;
  setStatus: (status: StatusType) => void;
  registerBeforeNavigateHandler: (handler: BeforeNavigateHandler) => void;
  runBeforeNavigateHandler: () => Promise<void>;
  filesCompleted: boolean;
  setFilesCompleted: (completed: boolean) => void;
  metadataCompleted: boolean;
  setMetadataCompleted: (completed: boolean) => void;
  stepShowErrors: boolean;
  setStepShowErrors: (show: boolean) => void;
}

const DatasetEditStatusContext =
  createContext<DatasetEditStatusContextValue | null>(null);

export const DatasetEditStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<StatusType>('success');
  const [filesCompleted, setFilesCompleted] = useState(false);
  const [metadataCompleted, setMetadataCompleted] = useState(false);
  const [stepShowErrors, setStepShowErrors] = useState(false);
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
        filesCompleted,
        setFilesCompleted,
        metadataCompleted,
        setMetadataCompleted,
        stepShowErrors,
        setStepShowErrors,
      }}
    >
      {children}
    </DatasetEditStatusContext.Provider>
  );
};

export const useDatasetEditStatus = () => {
  const context = useContext(DatasetEditStatusContext);
  if (!context) {
    throw new Error(
      'useDatasetEditStatus must be used within DatasetEditStatusProvider'
    );
  }
  return context;
};
