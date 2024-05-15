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
import { getReourceDoc } from './EditResource';

export const ResourceListView = () => {

  const params = useParams();

  const {
    data,
    refetch,
    isLoading: isPending,
  } = useQuery([`list_resources`], () => GraphQL(getReourceDoc), {
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const table = {
    columns: [
      {
        accessorKey: 'name_of_resource',
        header: 'NAME OF RESOURCE',
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
    <>
      {isPending ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Spinner size={40} />
        </div>
      ) : (
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
      )}
    </>
  );
};
