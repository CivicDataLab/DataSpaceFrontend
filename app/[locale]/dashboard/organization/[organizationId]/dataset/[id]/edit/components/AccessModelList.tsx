import { UUID } from 'crypto';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, IconButton, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface AccessModelListProps {
  setQueryList: any;
  queryList: any;
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

const deleteAccessModel: any = graphql(`
  mutation deleteAccessModel($accessModelId: UUID!) {
    deleteAccessModel(accessModelId: $accessModelId)
  }
`);

const AccessModelList: React.FC<AccessModelListProps> = ({
  setQueryList,
  queryList,
}) => {
  const params = useParams();

  const {
    data,
    isLoading,
    refetch,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`accessModelList_${params.id}`],
    () =>
      GraphQL(accessModelQuery, {
        datasetId: params.id,
      })
  );

  useEffect(() => {
    refetch();
  }, [queryList]);

  const { mutate } = useMutation(
    (data: { accessModelId: UUID }) => GraphQL(deleteAccessModel, data),
    {
      onSuccess: () => {
        toast('Access Model Deleted Successfully');
        refetch();
      },
      onError: (err: any) => {
        toast(`Received ${err} while deleting Access model `);
      },
    }
  );

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'name',
        header: 'Name of Access Type',
      },
      {
        accessorKey: 'date',
        header: 'Date Added',
        cell: ({ row }: any) => {
          return <Text>{formatDate(row.original.date)}</Text>;
        },
      },
      {
        accessorKey: 'type',
        header: 'Permissions',
      },
      {
        header: 'DELETE',
        cell: ({ row }: any) => (
          <div className="text-center">
            <IconButton
              size="medium"
              icon={Icons.delete}
              color="interactive"
              onClick={() => mutate({ accessModelId: row.original.id })}
            >
              Delete
            </IconButton>
          </div>
        ),
      },
    ];
  };

  const generateTableData = (accessModel: any[]) => {
    return accessModel?.map((item: any) => ({
      name: item.name,
      date: item.created,
      type: toTitleCase(item.type.split('.').pop().toLowerCase()),
      id: item.id,
    }));
  };

  return (
    <div>
      {!data || isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className=" my-6 flex justify-between px-3 py-4">
            <Text>
              Showing {data.accessModelResources?.length} Access Types
            </Text>
            <Button onClick={(e) => setQueryList(false)}>
              Add Access Type
            </Button>
          </div>

          <DataTable
            columns={generateColumnData()}
            rows={generateTableData(data.accessModelResources)}
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
