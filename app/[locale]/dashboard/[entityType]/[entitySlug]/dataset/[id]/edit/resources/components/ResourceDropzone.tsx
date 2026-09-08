import { CreateFileResourceInput } from '@/gql/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { Button, DropZone, Tag, Text, toast } from 'opub-ui';
import React from 'react';

import { GraphQL } from '@/lib/api';
import { createResourceFilesDoc } from './query';

export const ResourceDropzone = ({ reload }: { reload: () => void }) => {
  const fileTypes = ['CSV', 'JSON', 'PDF', 'XLS', 'XLSX', 'XML', 'ZIP'];
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
  const [file, setFile] = React.useState<File[]>([]);

  const [, setResourceId] = useQueryState('id', parseAsString);

  const { mutate } = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(
        createResourceFilesDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (data) => {
        reload();
        setResourceId(data.createFileResources[0].id);
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to upload resource right now.'), {
          id: RESOURCE_UPLOAD_ERROR_TOAST_ID,
        });
        setFile([]);
      },
    }
  );

  const handleDropZoneDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      mutate({
        fileResourceInput: {
          dataset: params.id,
          files: acceptedFiles,
        },
      });
      setFile((files) => [...files, ...acceptedFiles]);
    },
    [mutate, params.id]
  );

  const hint = (
    <>
      <Button kind="secondary" variant="interactive">
        Choose Files to Upload
      </Button>
      <Text>Maximum File Size Limit : 50 MB</Text>
      <div className="flex flex-wrap flex-row items-center gap-2">
      <Text variant="bodyMd" color="subdued">
          Supported File Types:
        </Text>
        <div className="flex flex-wrap flex-row gap-2">
          {fileTypes.map((type, index) => {
            return (
              <Tag fillColor="white" textColor="baseDefault" key={index}>
                {type}
              </Tag>
            );
          })}
        </div>
      </div>
    </>
  );

  const fileUpload = file.length === 0 && (
    <DropZone.FileUpload actionHint={hint} />
  );

  return (
    <>
      <DropZone
        accept=".csv,.json,.pdf,.xlsx,.xls,.xml,.zip,application/json,text/csv,application/pdf,application/zip,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/xml,application/xml"
        name="file_details"
        label="Upload"
        allowMultiple={true}
        onDrop={handleDropZoneDrop}
        labelHidden
        className="min-h-[70vh] bg-baseGraySlateSolid5"
      >
        {fileUpload}
      </DropZone>
    </>
  );
};
