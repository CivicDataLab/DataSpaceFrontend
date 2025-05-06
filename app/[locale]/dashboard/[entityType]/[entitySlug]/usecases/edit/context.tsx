'use client';
import { createContext, useContext, useState } from 'react';

type StatusType = 'loading' | 'success';

const EditStatusContext = createContext<{
  status: StatusType;
  setStatus: (status: StatusType) => void;
} | null>(null);

export const EditStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<StatusType>('success');

  return (
    <EditStatusContext.Provider value={{ status, setStatus }}>
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
