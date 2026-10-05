'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Building2, Check, User } from 'lucide-react';
import { Button, Dialog, Text } from 'opub-ui';

import styles from './add-new-entry-dialog.module.scss';

export type NewEntryKind = 'person' | 'organisation';

const OPTIONS: Array<{
  value: NewEntryKind;
  label: string;
  icon: typeof User;
  description: (subject: string) => string;
}> = [
  {
    value: 'person',
    label: 'Person',
    icon: User,
    description: (subject) =>
      `Add an individual who is contributing to, partnering on or supporting this ${subject.replace(/ /g, '\u00A0')}.`,
  },
  {
    value: 'organisation',
    label: 'Organisation',
    icon: Building2,
    description: () =>
      "Add an organisation that isn't on CivicDataSpace yet. It becomes available to connect elsewhere too.",
  },
];

function dialogHeading(heading: ReactNode) {
  return heading as unknown as string;
}

interface AddNewEntryDialogProps {
  open: boolean;
  subject: string;
  onOpenChange: (open: boolean) => void;
  onContinue: (kind: NewEntryKind) => void;
}

export function AddNewEntryDialog({
  open,
  subject,
  onOpenChange,
  onContinue,
}: AddNewEntryDialogProps) {
  const [kind, setKind] = useState<NewEntryKind>('person');

  useEffect(() => {
    if (open) setKind('person');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <Dialog.Content
          style={{
            borderRadius: 'var(--border-radius-4)',
            overflow: 'hidden',
          }}
          title={dialogHeading(
            <span className={styles.dialogTitle}>
              Add New
              <Text
                as="span"
                variant="bodySm"
                color="subdued"
                fontWeight="regular"
              >
                Choose whether you&apos;re adding a person or an organisation.
              </Text>
            </span>
          )}

          footer={
            <div className={styles.footerActions}>
              <Button kind="neutral" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className={styles.continue}
                onClick={() => onContinue(kind)}
              >
                Continue
              </Button>
            </div>
          }
        >
          <div
            className={styles.list}
            role="radiogroup"
            aria-label="Add a person or an organisation"
          >
            {OPTIONS.map((option) => {
              const selected = kind === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                  onClick={() => setKind(option.value)}
                >
                  <span className={styles.iconWrap} aria-hidden>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className={styles.titleRow}>
                      <Text fontWeight="semibold">{option.label}</Text>
                      {selected ? (
                        <Check size={16} className={styles.tick} aria-hidden />
                      ) : null}
                    </span>
                    <div className="mt-0">
                      <Text variant="bodySm" color="subdued">
                        {option.description(subject)}
                      </Text>
                    </div>
                  </span>
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      ) : null}
    </Dialog>
  );
}
