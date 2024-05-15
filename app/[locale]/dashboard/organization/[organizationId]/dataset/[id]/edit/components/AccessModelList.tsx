import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Spinner, Table, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, toTitleCase } from '@/lib/utils';

interface AccessModelListProps {
  setQueryList: any;
}

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
  ];
};

const generateTableData = (accessModel: any[]) => {
  return accessModel.map((item: any) => ({
    name: item.name,
    date: item.created,
    type: toTitleCase(item.type.split('.').pop().toLowerCase()),
  }));
};

const accessModelQuery = graphql(`
  query accessModelResources($datasetId: UUID!) {
    accessModelResources(datasetId: $datasetId) {
      modelResources {
        resource {
          name
          description
          id
        }
      }
      id
      name
      description
      type
      created
      modified
    }
  }
`);

const AccessModelList: React.FC<AccessModelListProps> = ({ setQueryList }) => {
  const params = useParams();

  const { data, refetch } = useQuery([`accessModelList_${params.id}`], () =>
    GraphQL(accessModelQuery, {
      datasetId: params.id,
    })
  );

  useEffect(() => {
    refetch();
  });

  return (
    <div>
      {!data ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className=" my-6 flex justify-between px-3 py-4">
            <Text>
              Showing {data?.accessModelResources.length} Access Types
            </Text>
            <Button onClick={(e) => setQueryList(false)}>
              Add Access Type
            </Button>
          </div>

          <Table
            columns={generateColumnData()}
            rows={generateTableData(data?.accessModelResources)}
          />
        </>
      )}
    </div>
  );
};

export default AccessModelList;
