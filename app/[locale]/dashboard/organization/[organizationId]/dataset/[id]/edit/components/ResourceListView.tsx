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

export const ResourceListView = () => {
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

    rows: [
      {
        name_of_resource: 'name_of_resource',
        type: 'type',
        date_added: 'date_added',
        id: 'id',
      },
      {
        name_of_resource: 'name_of_resource',
        type: 'type',
        date_added: 'date_added',
        id: 'id',
      },
      {
        name_of_resource: 'name_of_resource',
        type: 'type',
        date_added: 'date_added',
        id: 'id',
      },
    ],
  };

  const filteredColumns = table.columns.filter(
    (column) => column.accessorKey !== 'id'
  );

  return (
    <>
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
    </>
  );
};
