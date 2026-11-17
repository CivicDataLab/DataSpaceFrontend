'use client';

import { Icon, Spinner, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

export type WizardSaveStatus = 'unsaved' | 'loading' | 'success';

export function SaveStatusBadge({ status }: { status: WizardSaveStatus }) {
  const saved = status === 'success';

  return (
    <div
      className={`flex items-center gap-1 rounded-full px-3 py-1 ${
        saved
          ? 'bg-surfaceSuccess text-textSuccess'
          : 'bg-surfaceNeutral text-textSubdued'
      }`}
    >
      {status === 'loading' ? (
        <Spinner size={16} />
      ) : saved ? (
        <Icon source={Icons.check} size={16} color="success" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-textSubdued" aria-hidden />
      )}
      <Text
        variant="bodySm"
        className={saved ? 'text-textSuccess' : 'text-textSubdued'}
      >
        {status === 'loading'
          ? 'Saving…'
          : saved
            ? 'All changes saved'
            : 'Unsaved changes'}
      </Text>
    </div>
  );
}
