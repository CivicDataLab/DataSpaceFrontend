import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import router from 'next/router';
import { graphql } from '@/gql';
import { CreateFileResourceInput } from '@/gql/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  ButtonGroup,
  Combobox,
  Divider,
  DropZone,
  Icon,
  Spinner,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { bytesToSize } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { EditDistribution } from './EditDistribution';
import { EditResource } from './EditResource';

export function DistributionList({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
  setEditId: (id: string) => void;
}) {
  return (
    <div>
      {/* <Text variant="headingMd">Add Distribution</Text>
      <div className="pt-4">
        <Divider />
      </div> */}
      <div className="py-4">
        <NoList setPage={setPage} />
      </div>
    </div>
  );
}

const NoList = ({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
}) => {
  const fileTypes = ['PDF', 'CSV', 'XLS', 'XLSX', 'TXT'];
  const params = useParams();
  const [fileSelected, setFileSelected] = React.useState(false);

  const [file, setFile] = React.useState<File[]>([]);

  const createResourceFilesDoc: any = graphql(`
    mutation readFiles($fileResourceInput: CreateFileResourceInput!) {
      createFileResources(fileResourceInput: $fileResourceInput) {
        id
        created
        name
      }
    }
  `);

  const searchParams = useSearchParams();
  const resourceId = searchParams.get('id');

  const { mutate, isLoading } = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(createResourceFilesDoc, data),
    {
      onSuccess: () => {
        setFileSelected(true);
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
  const uploadedFile = file.length > 0 && (
    <div className="flex h-full items-center justify-center px-2 py-14">
      <div className="flex-col">
        <div>
          <Icon source={Icons.check} size={24} color="success" />
          <div className="flex">{file[0].name.substring(0, 15) + ' ...'} </div>
          <Text variant="bodySm">{file[0].size} bytes</Text>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Spinner size={40} />
        </div>
      ) : (
        <>
          {fileSelected || resourceId ? (
            <EditResource
              uploadedFile={uploadedFile}
              handleDropZoneDrop={handleDropZoneDrop}
              file={file}
            />
          ) : (
            <DropZone
              name="file_details"
              label="Upload"
              allowMultiple={true}
              onDrop={handleDropZoneDrop}
              labelHidden
              className="min-h-[70vh] bg-baseGraySlateSolid5"
            >
              {uploadedFile}
              {fileUpload}
            </DropZone>
          )}
        </>
      )}
    </>
  );
};
