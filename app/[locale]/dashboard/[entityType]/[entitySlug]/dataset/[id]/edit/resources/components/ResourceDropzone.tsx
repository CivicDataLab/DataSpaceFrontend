import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { graphql } from '@/gql';
import { CreateFileResourceInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'next-usequerystate';
import { Button, DropZone, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { bytesToSize } from '@/lib/utils';
import { createResourceFilesDoc } from './query';

export const ResourceDropzone = ({ reload }: { reload: () => void }) => {
  const fileTypes = ['PDF', 'CSV', 'XLS', 'XLSX', 'TXT', 'ZIP'];
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const [file, setFile] = React.useState<File[]>([]);

  const [resourceId, setResourceId] = useQueryState('id', parseAsString);

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
      onSuccess: (data: any) => {
        reload();
        setResourceId(data.createFileResources[0].id);
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
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
    []
  );

  const hint = (
    <>
      <Button kind="secondary" variant="interactive">
        Choose Files to Upload
      </Button>
      <Text>Maximum File Size Limit : 5 MB</Text>
      <Text className="flex items-center gap-1">
        Supported File Types :{' '}
        {fileTypes.map((type, index) => {
          return (
            <div className="rounded-1 bg-basePureWhite px-2 py-1" key={index}>
              {type}
            </div>
          );
        })}
      </Text>
    </>
  );

  const fileUpload = file.length === 0 && (
    <DropZone.FileUpload actionHint={hint} />
  );

  return (
    <>
      <DropZone
        accept=".json, .csv, application/json, text/csv, application/zip, /pdf , application/pdf"
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
