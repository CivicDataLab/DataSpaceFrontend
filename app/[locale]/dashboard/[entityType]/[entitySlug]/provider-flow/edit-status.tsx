'use client';

import { useRef, useState } from 'react';

export type ProviderSaveStatus = 'loading' | 'success';
export type BeforeNavigateHandler = (() => Promise<void> | void) | null;

export function useProviderEditState() {
  const [status, setStatus] = useState<ProviderSaveStatus>('success');
  const [stepShowErrors, setStepShowErrors] = useState(false);
  const beforeNavigateHandlerRef = useRef<BeforeNavigateHandler>(null);

  const registerBeforeNavigateHandler = (handler: BeforeNavigateHandler) => {
    beforeNavigateHandlerRef.current = handler;
  };

  const runBeforeNavigateHandler = async () => {
    await beforeNavigateHandlerRef.current?.();
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
