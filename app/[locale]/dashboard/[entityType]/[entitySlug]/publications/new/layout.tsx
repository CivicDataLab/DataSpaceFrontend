'use client';

import { useEffect, useRef } from 'react';

import { PublicationWizard } from '../components/WizardShell';
import { usePublicationDraft } from '../context';

export default function NewPublicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resetDraft } = usePublicationDraft();
  const resetOnce = useRef(false);

  useEffect(() => {
    if (!resetOnce.current) {
      resetOnce.current = true;
      resetDraft();
    }
    return () => resetDraft();
  }, [resetDraft]);

  return <PublicationWizard mode="new">{children}</PublicationWizard>;
}
