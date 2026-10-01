'use client';

import { ReactNode, useEffect } from 'react';
import { useStepperStep } from 'opub-ui';

export function StepErrorSync({
  setStepShowErrors,
}: {
  setStepShowErrors: (show: boolean) => void;
}) {
  const { showErrors } = useStepperStep();

  useEffect(() => {
    setStepShowErrors(showErrors);
  }, [showErrors, setStepShowErrors]);

  return null;
}

export function wizardStepContent(
  isActive: boolean,
  children: ReactNode,
  setStepShowErrors: (show: boolean) => void
) {
  if (!isActive) return null;
  return (
    <>
      <StepErrorSync setStepShowErrors={setStepShowErrors} />
      {children}
    </>
  );
}
