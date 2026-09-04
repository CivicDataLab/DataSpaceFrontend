import { CreateFileResourceInput } from '@/gql/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import {
  Button,
  DataTable,
  Dialog,
  DropZone,
  IconButton,
  SearchInput,
  Text,
  toast,
} from 'opub-ui';
import React, { useEffect } from 'react';

import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { createResourceFilesDoc, updateResourceList } from './query';

type FilteredRow = {
  name_of_resource: string;
  type: string;
  date_added: string;
  id: string;
};

interface ResourceListItem {
  name: string;
  type: string;
  created?: string | null;
  id: string;
}

interface ResourceTableCell {
  row: { original: FilteredRow };
}

type ResourceListProps = {
  data: ResourceListItem[];
  refetch: () => void;
  isPromptDataset?: boolean;
};

export const ResourceListView = ({ data, refetch, isPromptDataset = false }: ResourceListProps) => {
  const fileLabel = isPromptDataset ? 'Prompt Files' : 'Data Files';
  const fileButtonLabel = isPromptDataset ? 'ADD NEW PROMPT FILE' : 'ADD NEW DATA FILE';
  const RESOURCE_DELETE_ERROR_TOAST_ID = 'dataset-resource-delete-error';
  const RESOURCE_ADD_ERROR_TOAST_ID = 'dataset-resource-add-error';
  const getErrorMessage = (err: unknown, fallback: string) =>
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
      ? err.message.trim()
      : fallback;
  const [resourceId, setResourceId] = useQueryState('id', parseAsString);
  const [file, setFile] = React.useState<File[]>([]);

  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  useEffect(() => {
    refetch();
  }, [resourceId, refetch]);

  const updateResourceMutation = useMutation(
    (variables: { resourceId: string }) =>
      GraphQL(
        updateResourceList,
        {
          [params.entityType]: params.entitySlug,
        },
        variables
      ),
    {
      onSuccess: (_data, variables) => {
        const updatedFilteredRows = filteredRows.filter(
          (row) => row.id !== variables.resourceId
        );
        setFilteredRows(updatedFilteredRows);
        refetch();
        toast('Resource Deleted Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to delete resource right now.'), {
          id: RESOURCE_DELETE_ERROR_TOAST_ID,
        });
      },
    }
  );

  const createResourceMutation = useMutation(
    (variables: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(
        createResourceFilesDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        variables
      ),
    {
      onSuccess: (result) => {
        const updatedRows = result.createFileResources.map((item) => ({
          name_of_resource: item.name,
          type: item.type,
        date_added: formatDate(item.created ?? null) || '',
          id: item.id,
        }));

        setFilteredRows((prevRows: FilteredRow[]) => [
          ...prevRows,
          ...updatedRows,
        ]);

        refetch();

        toast('Resource Added Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });

        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${params.id}/edit/resources?id=${result.createFileResources[0]?.id}`
        );
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to add resource right now.'), {
          id: RESOURCE_ADD_ERROR_TOAST_ID,
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
        setFile([]);
      },
    }
  );

  const deleteRow = (row: FilteredRow) => {
    updateResourceMutation.mutate({
      resourceId: row.id,
    });
  };

  const handleResourceID = (info: ResourceTableCell) => {
    setResourceId(info.row.original.id);
  };

  const table = {
    columns: [
      {
        accessorKey: 'name_of_resource',
        header: 'NAME OF RESOURCE',
        cell: (info: ResourceTableCell) => {
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
        cell: ({ row }: ResourceTableCell) => (
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
      data.map((item) => ({
        name_of_resource: item.name,
        type: item.type,
        date_added: formatDate(item.created ?? null) || '',
        id: item.id,
      })) || [],
  };

  const [filteredRows, setFilteredRows] = React.useState<FilteredRow[]>(
    table.rows
  );

  useEffect(() => {
    const updatedRows =
      data.map((item) => ({
        name_of_resource: item.name,
        type: item.type,
        date_added: formatDate(item.created ?? null) || '',
        id: item.id,
      })) || [];

    setFilteredRows(updatedRows);
  }, [data]);

  const handleSearchChange = (search: string) => {
    const searchTerm = search.toLowerCase();
    const filtered = table.rows.filter((row) =>
      row.name_of_resource.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered);
  };

  const filteredColumns = table.columns.filter(
    (column) => column.accessorKey !== 'id'
  );

  const dropZone = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      createResourceMutation.mutate({
        fileResourceInput: {
          dataset: params.id,
          files: acceptedFiles,
        },
      });
      setFile((files) => [...files, ...acceptedFiles]);
    },
    [createResourceMutation, params.id]
  );

  const uploadedFile = file.length > 0 && (
    <div className="flex flex-col gap-2 p-4">
      {file.map((uploaded, index) => {
        return <div key={index}>{uploaded.name}</div>;
      })}
    </div>
  );

  return (
    <div className="mt-3">
      <div className="my-8 flex flex-wrap items-center justify-between gap-6 ">
        <div className="flex flex-wrap items-center gap-2">
          <Text>
            Showing {filteredRows.length} of {filteredRows.length} {fileLabel}
          </Text>
          <SearchInput
            placeholder={`Search in ${fileLabel}`}
            label="Search"
            name="Search"
            onChange={(search) => handleSearchChange(search)}
            onClear={() => handleSearchChange('')}
          />
        </div>
        <Dialog>
          <Dialog.Trigger>
            <Button size="medium">{fileButtonLabel}</Button>
          </Dialog.Trigger>
          <Dialog.Content title={'Add New Resource'}>
            {createResourceMutation.isLoading ? (
              <Loading />
            ) : (
              <DropZone
                accept=".csv,.json,.pdf,.xlsx,.xls,.xml,.zip,application/json,text/csv,application/pdf,application/zip,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/xml,application/xml"
                name="file_upload"
                allowMultiple={true}
                onDrop={dropZone}
              >
                {uploadedFile}
                {file.length === 0 && (
                  <DropZone.FileUpload
                    actionHint={'CSV, JSON, PDF, XLS, XLSX, XML, ZIP'}
                  />
                )}
              </DropZone>
            )}
          </Dialog.Content>
        </Dialog>
      </div>
      <DataTable
        columns={filteredColumns}
        rows={filteredRows}
        hideFooter={false}
        hideSelection={true}
        defaultRowCount={10}
        hideViewSelector
      />
    </div>
  );
};
