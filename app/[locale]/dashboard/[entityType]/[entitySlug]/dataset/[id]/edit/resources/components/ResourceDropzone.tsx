'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CreateFileResourceInput } from '@/gql/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, DropZone, Icon, Labelled, Tag, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { createResourceFilesDoc, updateResourceList } from './query';

export const RESOURCE_FILE_TYPES = [
  'CSV',
  'JSON',
  'PDF',
  'XLS',
  'XLSX',
  'XML',
  'ZIP',
] as const;

export const RESOURCE_FILE_ACCEPT =
  '.csv,.json,.pdf,.xlsx,.xls,.xml,.zip,application/json,text/csv,application/pdf,application/zip,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/xml,application/xml';

interface ResourceDropzoneProps {
  reload: () => void | Promise<unknown>;
  onPendingChange?: (files: File[]) => void;
  error?: string;
  /** When set, an in-flight upload is deleted instead of kept. */
  discardUploadRef?: React.MutableRefObject<boolean>;
}

export const ResourceDropzone = ({
  reload,
  onPendingChange,
  error,
  discardUploadRef,
}: ResourceDropzoneProps) => {
  const RESOURCE_UPLOAD_ERROR_TOAST_ID = 'dataset-resource-upload-error';
  const getErrorMessage = (err: unknown, fallback: string) =>
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
      ? err.message.trim()
      : fallback;
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(
        createResourceFilesDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: async (result) => {
        if (discardUploadRef?.current) {
          const created = result.createFileResources ?? [];
          await Promise.all(
            created.map((item) => {
              const resourceId = item?.id;
              if (!resourceId) return Promise.resolve();
              return GraphQL(
                updateResourceList,
                {
                  [params.entityType]: params.entitySlug,
                },
                { resourceId }
              );
            })
          );
          onPendingChange?.([]);
          await reload();
          void queryClient.invalidateQueries({
            queryKey: [`dataset_title_${params.id}`],
          });
          return;
        }
        await reload();
        onPendingChange?.([]);
        void queryClient.invalidateQueries({
          queryKey: [`dataset_title_${params.id}`],
        });
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to upload resource right now.'), {
          id: RESOURCE_UPLOAD_ERROR_TOAST_ID,
        });
        onPendingChange?.([]);
      },
    }
  );

  const handleDropZoneDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (discardUploadRef) discardUploadRef.current = false;
      onPendingChange?.(acceptedFiles);
      mutate({
        fileResourceInput: {
          dataset: params.id,
          files: acceptedFiles,
        },
      });
    },
    [discardUploadRef, mutate, onPendingChange, params.id]
  );

  return (
    <Labelled
      label="Upload dataset file"
      labelHidden
      error={error}
      className={cn(
        error &&
          '[&_[class*="DropZone-module_DropZone"]]:bg-surfaceCritical [&_[class*="DropZone-module_hasOutline"]]:after:!border-[var(--border-critical-default)]'
      )}
    >
      <DropZone
        accept={RESOURCE_FILE_ACCEPT}
        name="file_details"
        label="Upload dataset file"
        allowMultiple
        onDrop={handleDropZoneDrop}
        labelHidden
        disabled={isLoading}
        className="bg-default min-h-[240px] "
      >
        <div className="flex flex-col items-center gap-3 bg-baseGraySlateSolid2 py-8">
          <Icon source={Icons.dropzone} size={36} color="subdued" />
          <Text fontWeight="medium">
            Drag and drop files here, or click to browse.
          </Text>
          <div className="flex flex-col items-center gap-2">
            <Text variant="bodySm" color="subdued">
              Supported file types:
            </Text>
            <div className="flex flex-wrap justify-center gap-2">
              {RESOURCE_FILE_TYPES.map((type) => (
                <span
                  key={type}
                  className="text-black rounded-full border-1 border-solid border-baseGraySlateSolid8 bg-baseGraySlateSolid3 px-2  text-75"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <Button
            kind="secondary"
            className="rounded-2 border-1 border-solid border-baseGraySlateSolid8 bg-white text-[var(--base-default)]"
          >
            Browse File
          </Button>
          <Text variant="bodySm" color="subdued">
            Maximum file size limit: 50MB
          </Text>
        </div>
      </DropZone>
    </Labelled>
  );
};
