'use client';

import { createContext, useContext, useRef, useState } from 'react';

import { useProviderEditState } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/edit-status';

type TitleSaveHandler = (title: string) => void;

type ChartEditStatusContextValue = ReturnType<typeof useProviderEditState> & {
  buildComplete: boolean;
  setBuildComplete: (complete: boolean) => void;
  titleOverride: string | null;
  setTitleOverride: (title: string | null) => void;
  registerTitleSave: (handler: TitleSaveHandler) => void;
  saveTitle: TitleSaveHandler;
};

const ChartEditStatusContext = createContext<ChartEditStatusContextValue | null>(
  null
);

export function ChartEditStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const editState = useProviderEditState();
  const [buildComplete, setBuildComplete] = useState(false);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const titleSaveRef = useRef<TitleSaveHandler>(() => {});

  return (
    <ChartEditStatusContext.Provider
      value={{
        ...editState,
        buildComplete,
        setBuildComplete,
        titleOverride,
        setTitleOverride,
        registerTitleSave: (handler) => {
          titleSaveRef.current = handler;
        },
        saveTitle: (title) => titleSaveRef.current(title),
      }}
    >
      {children}
    </ChartEditStatusContext.Provider>
  );
}

export function useChartEditStatus() {
  const context = useContext(ChartEditStatusContext);
  if (!context) {
    throw new Error('useChartEditStatus must be used within ChartEditStatusProvider');
  }
  return context;
}
