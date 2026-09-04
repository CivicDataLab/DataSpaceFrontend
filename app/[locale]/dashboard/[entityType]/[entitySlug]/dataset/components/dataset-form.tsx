import React from 'react';
import { CreateDataset, PatchDataset } from '@/types';
import { Form } from 'opub-ui';
import { FieldValues, SubmitHandler, UseFormProps } from 'react-hook-form';

type DatasetFormValues = CreateDataset | PatchDataset;

interface DatasetFormProps {
  onSubmit: SubmitHandler<DatasetFormValues>;
  formOptions: UseFormProps<DatasetFormValues>;
  onChange?: () => void;
  children: React.ReactNode;
  submitRef: React.RefObject<HTMLButtonElement | null>;
}

export function DatasetForm({
  onSubmit,
  formOptions,
  onChange,
  children,
  submitRef,
}: DatasetFormProps) {
  return (
    <Form
      onSubmit={onSubmit}
      formOptions={formOptions as UseFormProps<FieldValues>}
      onChange={onChange}
    >
      {children}
      <button hidden ref={submitRef}>
        submit form
      </button>
    </Form>
  );
}
