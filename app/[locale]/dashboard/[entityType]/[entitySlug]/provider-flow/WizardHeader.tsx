'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Spinner, Text, TextField } from 'opub-ui';

import { Icons } from '@/components/icons';

export type WizardSaveStatus = 'loading' | 'success';

interface WizardHeaderProps {
  title: string;
  untitledLabel: string;
  goBackURL: string;
  status: WizardSaveStatus;
  titlePending?: boolean;
  onTitleSave?: (title: string) => void;
  titleFieldName?: string;
  footer?: ReactNode;
}

export function WizardHeader({
  title,
  untitledLabel,
  goBackURL,
  status,
  titlePending = false,
  onTitleSave,
  titleFieldName = 'providerTitle',
  footer,
}: WizardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [syncedTitle, setSyncedTitle] = useState(title);
  if (title !== syncedTitle) {
    setSyncedTitle(title);
    setDraftTitle(title);
  }

  const handleSave = () => {
    const next = draftTitle.trim();
    if (next && next !== title) {
      onTitleSave?.(next);
    }
    setEditing(false);
  };

  return (
    <div
      className={
        footer
          ? 'border-b flex flex-col gap-4 border-b-1 border-solid border-baseGraySlateSolid6 pb-4'
          : 'flex flex-col gap-4 border-b-1 border-solid border-baseGraySlateSolid6 pb-4'
      }
    >
      <div
        className={
          footer
            ? 'flex flex-wrap items-start justify-between gap-3 border-b-1 border-solid border-baseGraySlateSolid6 p-4'
            : 'flex flex-wrap items-start justify-between gap-3 p-4'
        }
      >
        <div className="flex min-w-0 items-center gap-2">
          <Link href={goBackURL} aria-label="Close editor" className="shrink-0">
            <Icon source={Icons.cross} size={20} />
          </Link>
          {editing ? (
            <div className="flex min-w-0 items-center gap-2">
              <TextField
                label=""
                labelHidden
                name={titleFieldName}
                value={draftTitle}
                onChange={setDraftTitle}
                onBlur={handleSave}
              />
              <Button kind="tertiary" onClick={handleSave}>
                Save
              </Button>
            </div>
          ) : titlePending ? (
            <div
              className="h-7 w-48 animate-pulse rounded-1 bg-baseGraySlateSolid3"
              aria-hidden
            />
          ) : (
            <>
              <Text
                variant="headingLg"
                fontWeight="semibold"
                title={title}
                className="truncate"
              >
                {title || untitledLabel}
              </Text>
              {onTitleSave ? (
                <Button
                  kind="tertiary"
                  onClick={() => setEditing(true)}
                  aria-label="Edit title"
                >
                  <Icon source={Icons.pencil} size={16} />
                </Button>
              ) : null}
            </>
          )}
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
      {footer}
    </div>
  );
}
