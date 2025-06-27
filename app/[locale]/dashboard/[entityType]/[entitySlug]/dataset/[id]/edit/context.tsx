'use client';
import { createContext, useContext, useState } from 'react';

type StatusType = 'loading' | 'success';

const DatasetEditStatusContext = createContext<{
  status: StatusType;
  setStatus: (status: StatusType) => void;
} | null>(null);

export const DatasetEditStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<StatusType>('success');

  return (
    <DatasetEditStatusContext.Provider value={{ status, setStatus }}>
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
