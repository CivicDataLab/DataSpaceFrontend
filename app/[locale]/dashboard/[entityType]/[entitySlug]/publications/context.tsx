'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

import {
  emptyDetails,
  type DetailsDraft,
  type NavigateResult,
  type PendingBlock,
} from './model';

type SaveStatus = 'unsaved' | 'loading' | 'success';
type BeforeNavigateHandler = (() => Promise<NavigateResult | void> | NavigateResult | void) | null;

interface PublicationDraftContextValue {
  details: DetailsDraft;
  setDetails: (next: DetailsDraft | ((current: DetailsDraft) => DetailsDraft)) => void;
  pendingBlocks: PendingBlock[];
  setPendingBlocks: (
    next: PendingBlock[] | ((current: PendingBlock[]) => PendingBlock[])
  ) => void;
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
  showErrors: boolean;
  setShowErrors: (show: boolean) => void;
  detailsReady: boolean;
  setDetailsReady: (ready: boolean) => void;
  registerBeforeNavigateHandler: (handler: BeforeNavigateHandler) => void;
  runBeforeNavigateHandler: () => Promise<NavigateResult | void>;
  resetDraft: () => void;
}

const PublicationDraftContext =
  createContext<PublicationDraftContextValue | null>(null);

export function PublicationDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [details, setDetails] = useState<DetailsDraft>(emptyDetails);
  const [pendingBlocks, setPendingBlocks] = useState<PendingBlock[]>([]);
  const [status, setStatus] = useState<SaveStatus>('unsaved');
  const [showErrors, setShowErrors] = useState(false);
  const [detailsReady, setDetailsReady] = useState(false);
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = useCallback(
    (handler: BeforeNavigateHandler) => {
      beforeNavigateHandlerRef.current = handler;
    },
    []
  );

  const runBeforeNavigateHandler = useCallback(async () => {
    return beforeNavigateHandlerRef.current?.();
  }, []);

  const resetDraft = useCallback(() => {
    setDetails(emptyDetails());
    setPendingBlocks([]);
    setStatus('unsaved');
    setShowErrors(false);
    setDetailsReady(false);
  }, []);

  return (
    <PublicationDraftContext.Provider
      value={{
        details,
        setDetails,
        pendingBlocks,
        setPendingBlocks,
        status,
        setStatus,
        showErrors,
        setShowErrors,
        detailsReady,
        setDetailsReady,
        registerBeforeNavigateHandler,
        runBeforeNavigateHandler,
        resetDraft,
      }}
    >
      {children}
    </PublicationDraftContext.Provider>
  );
}

export function usePublicationDraft() {
  const context = useContext(PublicationDraftContext);
  if (!context) {
    throw new Error(
      'usePublicationDraft must be used within PublicationDraftProvider'
    );
  }
  return context;
}
