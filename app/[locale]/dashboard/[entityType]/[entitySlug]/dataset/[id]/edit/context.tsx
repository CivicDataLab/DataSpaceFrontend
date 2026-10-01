'use client';

import { createContext, useContext, useState } from 'react';

import { useProviderEditState } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/edit-status';

type DatasetEditStatusContextValue = ReturnType<typeof useProviderEditState> & {
  filesCompleted: boolean;
  setFilesCompleted: (completed: boolean) => void;
  metadataCompleted: boolean;
  setMetadataCompleted: (completed: boolean) => void;
};

const DatasetEditStatusContext =
  createContext<DatasetEditStatusContextValue | null>(null);

export const DatasetEditStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const editState = useProviderEditState();
  const [filesCompleted, setFilesCompleted] = useState(false);
  const [metadataCompleted, setMetadataCompleted] = useState(false);

  return (
    <DatasetEditStatusContext.Provider
      value={{
        ...editState,
        filesCompleted,
        setFilesCompleted,
        metadataCompleted,
        setMetadataCompleted,
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
