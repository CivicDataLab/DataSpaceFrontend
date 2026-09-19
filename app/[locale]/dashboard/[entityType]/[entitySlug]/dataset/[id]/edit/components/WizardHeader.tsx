'use client';

import Link from 'next/link';
import { Icon, Spinner, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

interface WizardHeaderProps {
  title: string;
  goBackURL: string;
  status: 'loading' | 'success';
}

export function WizardHeader({ title, goBackURL, status }: WizardHeaderProps) {
  return (
    <div className="border-b flex flex-col gap-4 border-b-1 border-solid border-baseGraySlateSolid6 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-1 border-solid border-baseGraySlateSolid6 p-4">
        <div className="flex min-w-0 items-center gap-2 ">
          <Link href={goBackURL} aria-label="Close editor" className="shrink-0">
            <Icon source={Icons.cross} size={20} />
          </Link>
          <Text
            variant="headingLg"
            fontWeight="semibold"
            title={title}
            className="truncate"
          >
            {title || 'Untitled dataset'}
          </Text>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surfaceSuccess px-3 py-1 text-textSuccess">
          {status === 'loading' ? (
            <Spinner size={16} />
          ) : (
            <Icon source={Icons.check} size={16} color="success" />
          )}
          <Text variant="bodySm" className="text-textSuccess">
            {status === 'loading' ? 'Saving…' : 'All changes saved'}
          </Text>
        </div>
      </div>
      <div className="border ml-3 flex w-fit items-center gap-2 rounded-full border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault px-2 py-1">
        <Icon source={Icons.globe} size={16} color="default" />
        <Text variant="bodySm" color="subdued" className=" text-textSubdued">
          Public visibility · Public once published
        </Text>
      </div>
    </div>
  );
}
