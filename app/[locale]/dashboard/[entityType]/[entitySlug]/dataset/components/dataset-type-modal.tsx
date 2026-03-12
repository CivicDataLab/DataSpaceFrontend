'use client';

import { Button, Dialog, Icon, Text } from 'opub-ui';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Icons } from '@/components/icons';

export type DatasetType = 'DATA' | 'PROMPT';

interface DatasetTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: DatasetType) => void;
  isLoading?: boolean;
}

interface TypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

const TypeCard = ({
  title,
  description,
  icon,
  selected,
  onSelect,
}: TypeCardProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={twMerge(
        'flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all hover:border-interactive hover:bg-surfaceHovered',
        selected
          ? 'border-interactive bg-surfaceSelected'
          : 'border-borderSubdued bg-surface'
      )}
    >
      <div
        className={twMerge(
          'flex h-16 w-16 items-center justify-center rounded-full',
          selected ? 'bg-interactive text-onInteractive' : 'bg-surfaceNeutral'
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <Text variant="headingMd" as="h3">
          {title}
        </Text>
        <Text variant="bodySm" color="subdued">
          {description}
        </Text>
      </div>
    </button>
  );
};

export function DatasetTypeModal({
  open,
  onClose,
  onSelect,
  isLoading,
}: DatasetTypeModalProps) {
  const [selectedType, setSelectedType] = useState<DatasetType>('DATA');

  const handleCreate = () => {
    onSelect(selectedType);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {open && (
        <Dialog.Content title="Create New Dataset">
          <div className="flex flex-col gap-4">
            <Text variant="bodyMd">
              Select the type of dataset you want to create:
            </Text>

            <div className="grid grid-cols-2 gap-4">
              <TypeCard
                title="Data Dataset"
                description="Upload data files like CSV, Excel, or connect to APIs. Ideal for structured data, statistics, and tabular information."
                icon={<Icon source={Icons.dataset} size={32} />}
                selected={selectedType === 'DATA'}
                onSelect={() => setSelectedType('DATA')}
              />

              <TypeCard
                title="Prompt Dataset"
                description="Create a collection of prompts for AI models. Includes prompt-specific metadata like task type, target languages, and domains."
                icon={<Icon source={Icons.light} size={32} />}
                selected={selectedType === 'PROMPT'}
                onSelect={() => setSelectedType('PROMPT')}
              />
            </div>

            {selectedType === 'PROMPT' && (
              <div className="mt-2 rounded-md bg-surfaceNeutralSubdued p-3">
                <Text variant="bodySm" color="subdued">
                  <strong>Prompt datasets</strong> include additional metadata
                  fields for AI/ML use cases: task type, target languages, domain,
                  prompt format, and more.
                </Text>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button kind="tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} loading={isLoading}>
                Create Dataset
              </Button>
            </div>
          </div>
        </Dialog.Content>
      )}
    </Dialog>
  );
}
