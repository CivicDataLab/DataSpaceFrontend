import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from 'next-usequerystate';
import { DataTable, IconButton, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';

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
          console.log(info);
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
      data?.resource
        .filter((item: any) => item.dataset.pk === params.id)
        .map((item: any) => ({
          name_of_resource: item.name,
          type: item.type,
          date_added: formatDate(item.created),
          id: item.id,
        })) || [],
  };

  const filteredColumns = table.columns.filter(
    (column) => column.accessorKey !== 'id'
  );

  return (
    <div className="mt-3">
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
