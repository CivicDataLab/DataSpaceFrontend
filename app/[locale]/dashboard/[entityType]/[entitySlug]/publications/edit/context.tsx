'use client';

import React, { createContext, useContext, useState } from 'react';

type EditStatusContextType = {
  status: 'saved' | 'unsaved' | 'saving';
  setStatus: (status: 'saved' | 'unsaved' | 'saving') => void;
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
