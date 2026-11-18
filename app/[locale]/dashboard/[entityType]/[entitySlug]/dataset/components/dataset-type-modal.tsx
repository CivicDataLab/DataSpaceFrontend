'use client';

import { useState, type ReactNode } from 'react';
import { Check, Database, MessageSquareText } from 'lucide-react';
import { Dialog, Text, type ComplexAction } from 'opub-ui';

import styles from './dataset-type-modal.module.scss';

export type DatasetType = 'DATA' | 'PROMPT';

const OPTIONS: Array<{
  value: DatasetType;
  label: string;
  description: string;
  icon: typeof Database;
}> = [
  {
    value: 'DATA',
    label: 'Dataset',
    description:
      'Create a standard dataset containing structured or unstructured data for public discovery, analysis, and reuse.',
    icon: Database,
  },
  {
    value: 'PROMPT',
    label: 'Prompt Dataset',
    description:
      'Create a dataset containing prompts and prompt-response examples for AI training, evaluation, and machine learning use cases.',
    icon: MessageSquareText,
  },
];

function dialogTitle(title: ReactNode) {
  return title as unknown as string;
}

interface DatasetTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: DatasetType) => void;
  isLoading?: boolean;
}

export function DatasetTypeModal({
  open,
  onClose,
  onSelect,
  isLoading,
}: DatasetTypeModalProps) {
  const [selectedType, setSelectedType] = useState<DatasetType | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSelectedType(null);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {open ? (
        <Dialog.Content
          style={{
            borderRadius: 'var(--border-radius-4)',
            maxWidth: '32rem',
            overflow: 'hidden',
          }}
          title={dialogTitle(
            <span className={styles.dialogTitle}>
              Add New Dataset
              <Text
                as="span"
                variant="bodySm"
                color="subdued"
                fontWeight="regular"
              >
                Choose what kind of dataset you want to create.
              </Text>
            </span>
          )}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: onClose,
              disabled: Boolean(isLoading),
              kind: 'tertiary',
              className: 'mr-4',
            } as ComplexAction,
          ]}
          footer={<span />}
          primaryAction={
            {
              content: 'Continue',
              onAction: () => {
                if (selectedType) onSelect(selectedType);
              },
              disabled: !selectedType || Boolean(isLoading),
              loading: Boolean(isLoading),
              className: selectedType ? styles.continue : undefined,
            } as ComplexAction
          }
        >
          <div
            className={styles.body}
            role="radiogroup"
            aria-label="Dataset type"
          >
            {OPTIONS.map((option) => {
              const selected = selectedType === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={isLoading}
                  className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                  onClick={() => setSelectedType(option.value)}
                >
                  <span
                    className={`${styles.iconWrap} ${selected ? styles.iconSelected : ''}`}
                    aria-hidden
                  >
                    <Icon size={18} />
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.titleRow}>
                      <Text fontWeight="semibold">{option.label}</Text>
                      {selected ? (
                        <Check size={16} className={styles.tick} aria-hidden />
                      ) : null}
                    </span>
                    <Text
                      as="span"
                      variant="bodySm"
                      color="subdued"
                      className={styles.description}
                    >
                      {option.description}
                    </Text>
                  </span>
                </button>
              );
            })}
            <Text variant="bodySm" color="subdued" className={styles.footnote}>
              You can&apos;t change this after the draft is created.
            </Text>
          </div>
        </Dialog.Content>
      ) : null}
    </Dialog>
  );
}
