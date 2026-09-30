'use client';
import { createContext, useContext, useRef, useState } from 'react';

type StatusType = 'loading' | 'success';

const EditStatusContext = createContext<{
  status: StatusType;
  setStatus: (status: StatusType) => void;
  beforeStepNavigateRef: React.MutableRefObject<(() => boolean) | null>;
} | null>(null);

export const EditStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<StatusType>('success');
  const beforeStepNavigateRef = useRef<(() => boolean) | null>(null);

  return (
    <EditStatusContext.Provider
      value={{ status, setStatus, beforeStepNavigateRef }}
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
