import React from 'react';
import { PatchDataset } from '@/types';

import { CreateDataset } from '../../../new/components/new-dataset';

interface EditDatasetProps {
  defaultVal: PatchDataset;
  submitRef: React.RefObject<HTMLButtonElement | null>;
  mutate: (res: {
    dataset_data: {
      title: string;
      description: string;
      id?: string;
    };
  }) => void;
  isLoading: boolean;
}

export function EditDataset({
  defaultVal,
  submitRef,
  mutate,
  isLoading,
}: EditDatasetProps) {
  return (
    <CreateDataset
      mutatePatch={mutate}
      isLoading={isLoading}
      defaultVal={defaultVal}
      submitRef={submitRef}
    />
  );
}
