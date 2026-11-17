'use client';

import { useEffect, useRef, useState } from 'react';

export type ProviderSaveStatus = 'unsaved' | 'loading' | 'success';
export type BeforeNavigateHandler = (() => Promise<void | false> | void | false) | null;

export function useProviderEditState() {
  const [status, setStatus] = useState<ProviderSaveStatus>('success');
  const [stepShowErrors, setStepShowErrors] = useState(false);
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = (handler: BeforeNavigateHandler) => {
    beforeNavigateHandlerRef.current = handler;
  };

  const runBeforeNavigateHandler = async () => {
    return beforeNavigateHandlerRef.current?.();
  };

  return {
    status,
    setStatus,
    registerBeforeNavigateHandler,
    runBeforeNavigateHandler,
    stepShowErrors,
    setStepShowErrors,
  };
}

export function formSaveStatus(
  saving: boolean,
  dirty: boolean
): ProviderSaveStatus {
  if (saving) return 'loading';
  if (dirty) return 'unsaved';
  return 'success';
}

export function useSettleSaveStatus(
  saving: boolean,
  setStatus: (status: ProviderSaveStatus) => void
) {
  const wasSaving = useRef(false);

  useEffect(() => {
    if (saving) {
      wasSaving.current = true;
      setStatus('loading');
      return;
    }
    if (wasSaving.current) {
      wasSaving.current = false;
      setStatus('success');
    }
  }, [saving, setStatus]);
}
