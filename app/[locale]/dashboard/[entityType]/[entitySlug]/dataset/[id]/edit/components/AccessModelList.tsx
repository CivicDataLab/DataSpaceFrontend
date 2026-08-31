import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  DataTable,
  IconButton,
  SearchInput,
  Spinner,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface AccessModelListProps {
  setList: (list: boolean) => void;
  list: boolean;
  setAccessModelId: (id: string | null) => void;
}

interface AccessModelRow {
  id: string;
  name: string;
  type: string;
  created?: string | null;
}

interface AccessModelTableRow {
  name: string;
  date?: string | null;
  type: string;
  id: string;
}

interface AccessModelTableCell {
  row: { original: AccessModelTableRow };
}

const accessModelQuery = graphql(`
  query accessModelResources($datasetId: UUID!) {
    accessModelResources(datasetId: $datasetId) {
      id
      name
      description
      type
      created
      modified
    }
  }
`);

const deleteAccessModel = graphql(`
  mutation deleteAccessModel($accessModelId: UUID!) {
    deleteAccessModel(accessModelId: $accessModelId)
  }
`);

const AccessModelList: React.FC<AccessModelListProps> = ({
  setList,
  list,
  setAccessModelId,
}) => {
  const ACCESS_MODEL_DELETE_ERROR_TOAST_ID = 'dataset-access-model-delete-error';
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

  const { data, isLoading, refetch } = useQuery(
    [`accessModelList_${params.id}`],
    () =>
      GraphQL(
        accessModelQuery,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          datasetId: params.id,
        }
      )
  );

  const [filteredRows, setFilteredRows] = useState<AccessModelRow[]>([]);
  const [prevAccessModels, setPrevAccessModels] = useState(
    data?.accessModelResources
  );
  if (data?.accessModelResources !== prevAccessModels) {
    setPrevAccessModels(data?.accessModelResources);
    if (data?.accessModelResources) {
      setFilteredRows(data.accessModelResources);
    }
  }

  useEffect(() => {
    refetch();
  }, [data, list, refetch]);

  const { mutate, isLoading: deleteLoading } = useMutation(
    (data: {
      accessModelId: `${string}-${string}-${string}-${string}-${string}`;
    }) =>
      GraphQL(
        deleteAccessModel,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        toast('Access Model Deleted Successfully');
        refetch();
      },
      onError: (err: unknown) => {
        toast(
          `Error: ${getErrorMessage(err, 'Unable to delete access model right now.')}`,
          { id: ACCESS_MODEL_DELETE_ERROR_TOAST_ID }
        );
      },
    }
  );

  const handleAccessModel = (row: AccessModelTableCell['row']) => {
    setAccessModelId(row.original.id);
    setList(false);
  };

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'name',
        header: 'Name of Access Type',
        cell: ({ row }: AccessModelTableCell) => (
          <div
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => handleAccessModel(row)}
          >
            <span>{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date Added',
        cell: ({ row }: AccessModelTableCell) => {
          return <Text>{formatDate(row.original.date ?? null) || ''}</Text>;
        },
      },
      {
        accessorKey: 'type',
        header: 'Permissions',
      },
      {
        header: 'DELETE',
        cell: ({ row }: AccessModelTableCell) => (
          <div className="text-center">
            <IconButton
              size="medium"
              icon={Icons.delete}
              color="interactive"
              onClick={() =>
                mutate({
                  accessModelId:
                    row.original.id as `${string}-${string}-${string}-${string}-${string}`,
                })
              }
            >
              Delete
            </IconButton>
          </div>
        ),
      },
    ];
  };

  const generateTableData = (accessModel: AccessModelRow[]) => {
    return accessModel?.map((item) => {
      const permission = item.type.split('.').pop();
      return {
        name: item.name,
        date: item.created,
        type: permission
          ? toTitleCase(permission.toLowerCase())
          : item.type,
        id: item.id,
      };
    });
  };

  const handleSearchChange = (e: string) => {
    const searchTerm = e.toLowerCase();
    const filtered = data?.accessModelResources.filter((row) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered || []);
  };

  return (
    <div>
      {!data || isLoading || deleteLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className=" my-6 flex flex-wrap items-center justify-between px-3 py-4">
            <Text>
              Showing {data?.accessModelResources?.length || 0} Access Types
            </Text>
            <SearchInput
              className="w-1/2 "
              placeholder="Search in Resources"
              label="Search"
              name="Search"
              onChange={(search) => handleSearchChange(search)}
            />
            <Button onClick={() => setList(false)}>Add Access Type</Button>
          </div>

          <DataTable
            columns={generateColumnData()}
            rows={generateTableData(filteredRows)}
            hideSelection
            truncate
            hideFooter
          />
        </>
      )}
    </div>
  );
};

export default AccessModelList;
