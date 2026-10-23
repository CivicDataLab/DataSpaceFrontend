'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  DatasetStatus,
  DatasetType as GqlDatasetType,
} from '@/gql/generated/graphql';
import { useTourTrigger } from '@/hooks/use-tour-trigger';
import { IconFileText } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast, type ColumnFilterConfig } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  listingRowActions,
  ListingStatus,
  ListingTitle,
  ProviderListingTable,
} from '../provider-flow/ProviderListingTable';
import {
  errorMessage,
  listingEmptyLabel,
  listingOwner,
  listingQueryOptions,
  listingQuerySettled,
  sectorGeographyFilters,
  toApiFilters,
  useListingFacets,
  useProviderTable,
  useSettledStatusCounts,
} from '../provider-flow/table-listing';
import { DatasetType, DatasetTypeModal } from './components/dataset-type-modal';
import {
  DATASET_FIELD_MAP,
  DATASET_TAB_KEYS,
  DATASET_TABLE_STATUSES,
  DATASET_TYPE_FILTER_OPTIONS,
  DatasetListingRow,
  datasetsTableQueryDoc,
  INITIAL_DATASET_SORT,
  toListingRows,
} from './listing';

const createDatasetMutationDoc = graphql(`
  mutation GenerateDatasetName($createInput: CreateDatasetInput) {
    addDataset(createInput: $createInput) {
      success
      errors {
        fieldErrors {
          messages
        }
      }
      data {
        id
        title
        created
        datasetType
      }
    }
  }
`);

const deleteDatasetMutationDoc = graphql(`
  mutation deleteDatasetMutation($datasetId: UUID!) {
    deleteDataset(datasetId: $datasetId)
  }
`);

const unpublishDatasetMutationDoc = graphql(`
  mutation unPublishDatasetMutation($datasetId: UUID!) {
    unPublishDataset(datasetId: $datasetId) {
      __typename
      ... on TypeDataset {
        id
        title
      }
    }
  }
`);

interface DatasetTableCell {
  row: { original: DatasetListingRow };
}

const datasetColumns = [
  {
    accessorKey: 'title',
    header: 'Dataset',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: DatasetTableCell) => (
      <ListingTitle icon={IconFileText} label={row.original.title} />
    ),
  },
  {
    accessorKey: 'datasetType',
    header: 'Dataset Type',
    meta: { optional: true },
  },
  {
    accessorKey: 'sector',
    header: 'Sector',
    maxSize: 160,
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'geography',
    header: 'Geography',
    maxSize: 160,
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'files',
    header: 'Files',
    meta: { optional: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: DatasetTableCell) => (
      <ListingStatus
        published={row.original.status === DatasetStatus.Published}
        label={
          row.original.status === DatasetStatus.Published
            ? 'Published'
            : 'Draft'
        }
      />
    ),
  },
  {
    accessorKey: 'modified',
    header: 'Last Updated',
  },
];

export default function DatasetPage() {
  useTourTrigger(true, 1500);
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = listingOwner(entityType, entitySlug);
  const isValidParams = ownerArgs !== null;

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const table = useProviderTable(DATASET_TAB_KEYS, INITIAL_DATASET_SORT);
  const facets = useListingFacets(entityType, entitySlug);

  const datasetsQuery = useQuery(
    [
      'datasets_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(datasetsTableQueryDoc, ownerArgs || {}, {
        filters: toApiFilters(table.filters, DATASET_FIELD_MAP),
        sortOptions: table.sorting,
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const statusCounts = useSettledStatusCounts(
    datasetsQuery.data?.datasetsTable.statusCounts,
    listingQuerySettled(datasetsQuery),
    DATASET_TAB_KEYS
  );

  const deleteDatasetMutation = useMutation(
    ['delete_dataset'],
    (data: { datasetId: string }) =>
      GraphQL(deleteDatasetMutationDoc, ownerArgs || {}, {
        datasetId: data.datasetId,
      }),
    {
      onSuccess: () => {
        toast('Deleted dataset successfully');
        datasetsQuery.refetch();
      },
      onError: (err: unknown) => {
        toast('Error:  ' + errorMessage(err));
      },
    }
  );

  const unpublishDatasetMutation = useMutation(
    ['unpublish_dataset'],
    (data: { datasetId: string }) =>
      GraphQL(unpublishDatasetMutationDoc, ownerArgs || {}, {
        datasetId: data.datasetId,
      }),
    {
      onSuccess: () => {
        toast('Unpublished dataset successfully');
        datasetsQuery.refetch();
      },
      onError: (err: unknown) => {
        toast('Error:  ' + errorMessage(err));
      },
    }
  );

  const createDatasetMutation = useMutation(
    (datasetType: GqlDatasetType) =>
      GraphQL(createDatasetMutationDoc, ownerArgs || {}, {
        createInput: { datasetType },
      }),
    {
      onSuccess: (data) => {
        setIsTypeModalOpen(false);
        if (data.addDataset.success) {
          toast('Dataset created successfully!');
          if (isValidParams && entityType && entitySlug) {
            const datasetId = data?.addDataset?.data?.id;
            router.push(
              `/dashboard/${entityType}/${entitySlug}/dataset/${datasetId}/edit/resources`
            );
          }
        } else {
          const message =
            data.addDataset.errors?.fieldErrors?.[0]?.messages[0] ??
            'Unable to create dataset';
          toast('Error: ' + message);
        }
      },
    }
  );

  const filterConfig: ColumnFilterConfig[] = [
    {
      columnId: 'datasetType',
      type: 'select',
      options: DATASET_TYPE_FILTER_OPTIONS,
    },
    ...sectorGeographyFilters(facets),
  ];

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const rows = toListingRows(datasetsQuery.data?.datasetsTable.data ?? []);

  return (
    <>
      <ProviderListingTable
        title="Datasets"
        subtitle="Discover, create and manage datasets on CivicDataSpace."
        addLabel="Create Dataset"
        onAdd={() => setIsTypeModalOpen(true)}
        placeholder="Search datasets..."
        columns={datasetColumns}
        rows={rows}
        sortColumns={['title', 'modified']}
        filters={filterConfig}
        statuses={DATASET_TABLE_STATUSES}
        emptyLabel={listingEmptyLabel(
          table.filters,
          table.status,
          'No datasets yet'
        )}
        loading={datasetsQuery.isFetching}
        loadError={datasetsQuery.isError && !datasetsQuery.isFetching}
        onRetry={() => datasetsQuery.refetch()}
        totalRows={datasetsQuery.data?.datasetsTable.totalItemsCount ?? 0}
        statusCounts={statusCounts}
        table={table}
        tourId="my-datasets"
        getRowActions={(row: DatasetListingRow) =>
          listingRowActions({
            published: row.status === DatasetStatus.Published,
            title: row.title,
            noun: 'dataset',
            onEdit: () =>
              router.push(
                `/dashboard/${entityType}/${entitySlug}/dataset/${row.id}/edit`
              ),
            onUnpublish: () =>
              unpublishDatasetMutation.mutate({ datasetId: row.id }),
            onDelete: () => deleteDatasetMutation.mutate({ datasetId: row.id }),
          })
        }
      />

      <DatasetTypeModal
        open={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelect={(type: DatasetType) =>
          createDatasetMutation.mutate(
            type === 'PROMPT' ? GqlDatasetType.Prompt : GqlDatasetType.Data
          )
        }
        isLoading={createDatasetMutation.isLoading}
      />
    </>
  );
}
