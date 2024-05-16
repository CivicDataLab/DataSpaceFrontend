import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  DataTable,
  Dialog,
  DropZone,
  IconButton,
  SearchInput,
  Spinner,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { createResourceFilesDoc } from './DistributionList';

export const ResourceListView = ({ data, refetch }: any) => {
  const updateResourceList: any = graphql(`
    mutation deleteFileResource($resourceId: UUID!) {
      deleteFileResource(resourceId: $resourceId)
    }
  `);

  const [resourceId, setResourceId] = useQueryState('id', parseAsString);

  const { mutate, isLoading } = useMutation(
    (data: { resourceId: string }) => GraphQL(updateResourceList, data),
    {
      onSuccess: () => {
        refetch();
        toast('Resource Deleted Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const { mutate: transform } = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(createResourceFilesDoc, data),
    {
      onSuccess: (data: any) => {
        refetch();
        toast('Resource Added Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const params = useParams();

  const deleteRow = (row: any) => {
    mutate({
      resourceId: row.id,
    });
  };

  const handleResourceID = (info: any) => {
    setResourceId(info.row.original.id);
  };

  const table = {
    columns: [
      {
        accessorKey: 'name_of_resource',
        header: 'NAME OF RESOURCE',
        cell: (info: any) => {
          return (
            <div
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => handleResourceID(info)}
            >
              {info.row.original.name_of_resource}
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'TYPE',
      },
      {
        accessorKey: 'date_added',
        header: 'DATE ADDED',
      },
      {
        accessorKey: 'id',
        header: 'id',
      },
      {
        header: 'DELETE',
        cell: ({ row }: any) => (
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="interactive"
            onClick={() => deleteRow(row.original)}
          >
            Delete
          </IconButton>
        ),
      },
    ],

    rows:
      data.map((item: any) => ({
          name_of_resource: item.name,
          type: item.type,
          date_added: formatDate(item.created),
          id: item.id,
        })) || [],
  };

  //const [filteredRows, setFilteredRows] = React.useState(table.rows);

  // const handleSearchChange = (e:string) => {
  //   console.log(e, 'e');
  //   const searchTerm = e.toLowerCase();
  //   const filtered = table.rows.filter((row:any) =>
  //     row.name_of_resource.toLowerCase().includes(searchTerm)
  //   );
  //   setFilteredRows(filtered);
  // };

  const filteredColumns = table.columns.filter(
    (column) => column.accessorKey !== 'id'
  );

  const [file, setFile] = React.useState<File[]>([]);

  const dropZone = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      transform({
        fileResourceInput: {
          dataset: params.id,
          files: acceptedFiles,
        },
      });
      setFile((files) => [...files, ...acceptedFiles]);
    },
    []
  );

  const uploadedFile = file.length > 0 && (
    <div className="flex flex-col gap-2 p-4">
      {file.map((file, index) => {
        return <div key={index}>{file.name}</div>;
      })}
    </div>
  );

  return (
    <div className="mt-3">
      <div className="my-8 flex items-center gap-6 px-4">
        {/* <Text>
          Showing {table.rows.length} of {table.rows.length} resources
        </Text> */}
        {/* <SearchInput
          className="w-1/2 "
          placeholder="Search in Resources"
          label="Search"
          name="Search"
          onChange={function Ga() {} }
        /> */}
        {/* <Dialog>
          <Dialog.Trigger>
            <Button size="medium" className=" mx-5">
              ADD NEW RESOURCE
            </Button>
          </Dialog.Trigger>
          <Dialog.Content title={'Add New Resource'}>
            <DropZone
              name="file_upload"
              allowMultiple={true}
              onDrop={dropZone}
            >
              {uploadedFile}
              {file.length === 0 && <DropZone.FileUpload />}
            </DropZone>
          </Dialog.Content>
        </Dialog> */}
      </div>
      <DataTable
        addToolbar
        columns={filteredColumns}
        rows={table.rows}
        hideFooter={true}
        hideSelection={true}
        defaultRowCount={10}
        hideViewSelector
      />
    </div>
  );
};
