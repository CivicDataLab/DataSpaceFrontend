import { UUID } from 'crypto';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, IconButton, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface AccessModelListProps {
  setList: any;
  list: any;
  setAccessModelId: any;
}

const accessModelQuery: any = graphql(`
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
  setList,
  list,
  setAccessModelId,
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
  }, [list]);

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
        cell: ({ row }: any) => (
          <Link
            href={''}
            onClick={() => {
              setAccessModelId(row.original.id);
              setList(false);
            }}
          >
            <span className=" underline">{row.original.name}</span>
          </Link>
        ),
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
          <div className="flex items-center justify-between p-4">
            <Text>
              Showing {data.accessModelResources?.length} Access Types
            </Text>
            <Button onClick={(e) => setList(false)}>Add Access Type</Button>
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
