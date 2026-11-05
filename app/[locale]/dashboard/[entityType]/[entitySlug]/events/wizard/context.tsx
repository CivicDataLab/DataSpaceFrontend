'use client';

import { createContext, useContext, useRef, useState } from 'react';

import { useProviderEditState } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/edit-status';

type TitleSaveHandler = (title: string) => void;

type EventEditStatusContextValue = ReturnType<typeof useProviderEditState> & {
  detailsComplete: boolean;
  setDetailsComplete: (complete: boolean) => void;
  titleOverride: string | null;
  setTitleOverride: (title: string | null) => void;
  registerTitleSave: (handler: TitleSaveHandler) => void;
  saveTitle: TitleSaveHandler;
};

const EventEditStatusContext = createContext<EventEditStatusContextValue | null>(
  null
);

export function EventEditStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const editState = useProviderEditState();
  const [detailsComplete, setDetailsComplete] = useState(false);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const titleSaveRef = useRef<TitleSaveHandler>(() => {});

  return (
    <EventEditStatusContext.Provider
      value={{
        ...editState,
        detailsComplete,
        setDetailsComplete,
        titleOverride,
        setTitleOverride,
        registerTitleSave: (handler) => {
          titleSaveRef.current = handler;
        },
        saveTitle: (title) => titleSaveRef.current(title),
      }}
    >
      {children}
    </EventEditStatusContext.Provider>
  );
}

export function useEventEditStatus() {
  const context = useContext(EventEditStatusContext);
  if (!context) {
    throw new Error('useEventEditStatus must be used within EventEditStatusProvider');
  }
  return context;
}
