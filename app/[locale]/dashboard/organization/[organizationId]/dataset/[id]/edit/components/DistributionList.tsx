import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import router from 'next/router';
import { graphql } from '@/gql';
import { CreateFileResourceInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from 'next-usequerystate';
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
import { ResourceListView } from './ResourceListView';

export const getReourceDoc: any = graphql(`
  query getResources($filters: DatasetFilter) {
    datasets(filters: $filters) {
      resources {
        id
        dataset {
          pk
        }
        schema {
          id
          fieldName
          format
          description
        }
        type
        name
        description
        created
        fileDetails {
          id
          resource {
            pk
          }
          file {
            name
            path
            url
          }
          size
          created
          modified
        }
      }
    }
  }
`);

export function DistributionList({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
  setEditId: (id: string) => void;
}) {
  const params = useParams();

  const {
    data,
    isLoading,
    refetch,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_resources_${params.id}`],
    () => GraphQL(getReourceDoc, { filters: { id: params.id } }),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const searchParams = useSearchParams();
  const resourceId = searchParams.get('id');

  return (
    <div>
      {isLoading ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Spinner size={40} />
        </div>
      ) : (
        <>
          {data && data.datasets[0].resources.length > 0 ? (
            <>
              {resourceId ? (
                <EditResource
                  reload={refetch}
                  data={data.datasets[0].resources}
                />
              ) : (
                <ResourceListView
                  refetch={refetch}
                  data={data.datasets[0].resources}
                />
              )}
            </>
          ) : (
            <div className="py-4">
              <NoList setPage={setPage} reload={refetch} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const createResourceFilesDoc: any = graphql(`
  mutation readFiles($fileResourceInput: CreateFileResourceInput!) {
    createFileResources(fileResourceInput: $fileResourceInput) {
      id
      created
      name
      type
    }
  }
`);

const NoList = ({
  setPage,
  reload,
}: {
  setPage: (page: 'list' | 'create') => void;
  reload: any;
}) => {
  const fileTypes = ['PDF', 'CSV', 'XLS', 'XLSX', 'TXT'];
  const params = useParams();
  const [file, setFile] = React.useState<File[]>([]);

  const [resourceId, setResourceId] = useQueryState('id', parseAsString);

  const { mutate, isLoading } = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(createResourceFilesDoc, data),
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
        accept=".json, .csv, application/json, text/csv"
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
