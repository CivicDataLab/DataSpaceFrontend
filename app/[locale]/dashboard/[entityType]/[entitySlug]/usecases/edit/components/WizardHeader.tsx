'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Spinner, Text, TextField } from 'opub-ui';

import { Icons } from '@/components/icons';

interface WizardHeaderProps {
  title: string;
  goBackURL: string;
  status: 'loading' | 'success';
  titlePending?: boolean;
  onTitleSave?: (title: string) => void;
}

export function WizardHeader({
  title,
  goBackURL,
  status,
  titlePending = false,
  onTitleSave,
}: WizardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  const handleSave = () => {
    const next = draftTitle.trim();
    if (next && next !== title) {
      onTitleSave?.(next);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-4 border-b-1 border-solid border-baseGraySlateSolid6 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={goBackURL} aria-label="Close editor" className="shrink-0">
            <Icon source={Icons.cross} size={20} />
          </Link>
          {editing ? (
            <div className="flex min-w-0 items-center gap-2">
              <TextField
                label=""
                labelHidden
                name="useCaseTitle"
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
                {title || 'Untitled Use Case'}
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
    </div>
  );
}
