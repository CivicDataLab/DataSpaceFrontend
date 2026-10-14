'use client';

import { useEffect } from 'react';

import { PublicationWizard } from '../../components/WizardShell';
import { usePublicationDraft } from '../../context';

export default function EditPublicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pendingBlocks, setStatus } = usePublicationDraft();

  useEffect(() => {
    if (pendingBlocks.length === 0) setStatus('success');
  }, [pendingBlocks.length, setStatus]);

  return <PublicationWizard mode="edit">{children}</PublicationWizard>;
}
