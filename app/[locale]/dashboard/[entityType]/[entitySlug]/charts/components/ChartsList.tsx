'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { ChartStatus } from '@/gql/generated/graphql';
import { IconChartBar } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast, type ColumnFilterConfig } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  listingRowActions,
  ListingStatus,
  ListingTitle,
  ProviderListingTable,
} from '../../provider-flow/ProviderListingTable';
import {
  errorMessage,
  listingEmptyLabel,
  listingQueryOptions,
  listingQuerySettled,
  toApiSort,
  useProviderTable,
  useSettledStatusCounts,
} from '../../provider-flow/table-listing';
import {
  CHART_TAB_KEYS,
  CHART_TABLE_STATUSES,
  CHART_TYPE_FILTER_OPTIONS,
  ChartListingRow,
  chartsTableQueryDoc,
  chartTableDatasetsQueryDoc,
  datasetFilterOptions,
  INITIAL_CHART_SORT,
  toChartApiFilters,
  toChartRows,
} from '../listing';
import { chartsBasePath } from '../wizard/model';

const deleteResourceChart = graphql(`
  mutation deleteResourceChart($chartId: UUID!) {
    deleteResourceChart(chartId: $chartId)
  }
`);

const deleteResourceChartImage = graphql(`
  mutation deleteResourceChartImage($resourceChartImageId: UUID!) {
    deleteResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);

const unpublishResourceChart = graphql(`
  mutation unpublishResourceChartListing($chartId: UUID!) {
    unpublishResourceChart(chartId: $chartId)
  }
`);

const unpublishResourceChartImage = graphql(`
  mutation unpublishResourceChartImageListing($resourceChartImageId: UUID!) {
    unpublishResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);

const chartColumns = [
  {
    accessorKey: 'name',
    header: 'Chart',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: { row: { original: ChartListingRow } }) => (
      <ListingTitle icon={IconChartBar} label={row.original.name} />
    ),
  },
  {
    accessorKey: 'dataset',
    header: 'Dataset',
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'chartType',
    header: 'Type',
    meta: { optional: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: { row: { original: ChartListingRow } }) => (
      <ListingStatus
        published={row.original.status === ChartStatus.Published}
        label={
          row.original.status === ChartStatus.Published ? 'Published' : 'Draft'
        }
      />
    ),
  },
  {
    accessorKey: 'modified',
    header: 'Last Updated',
  },
];

function chartOwner(entityType?: string, entitySlug?: string) {
  if (typeof entityType !== 'string' || typeof entitySlug !== 'string') {
    return null;
  }
  if (entityType === 'self') return {};
  return { [entityType]: entitySlug };
}

const ChartsList = () => {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = chartOwner(entityType, entitySlug);
  const isValidParams = ownerArgs !== null;

  const table = useProviderTable(CHART_TAB_KEYS, INITIAL_CHART_SORT);

  const chartsQuery = useQuery(
    [
      'charts_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(chartsTableQueryDoc, ownerArgs || {}, {
        filters: toChartApiFilters(table.filters),
        sortOptions: toApiSort(table.sorting, {}),
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const datasetsQuery = useQuery(
    ['chart_table_datasets', entityType, entitySlug],
    () => GraphQL(chartTableDatasetsQueryDoc, ownerArgs || {}),
    { enabled: isValidParams }
  );

  const statusCounts = useSettledStatusCounts(
    chartsQuery.data?.chartsTable.statusCounts,
    listingQuerySettled(chartsQuery),
    CHART_TAB_KEYS
  );

  const deleteChartMutation = useMutation(
    (id: string) => GraphQL(deleteResourceChart, ownerArgs || {}, { chartId: id }),
    {
      onSuccess: () => {
        toast('Deleted chart successfully');
        chartsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(`Could not delete the chart. ${errorMessage(error)}`);
      },
    }
  );

  const deleteImageMutation = useMutation(
    (id: string) =>
      GraphQL(deleteResourceChartImage, ownerArgs || {}, {
        resourceChartImageId: id,
      }),
    {
      onSuccess: () => {
        toast('Deleted chart successfully');
        chartsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(`Could not delete the chart. ${errorMessage(error)}`);
      },
    }
  );

  const unpublishChartMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishResourceChart, ownerArgs || {}, { chartId: id }),
    {
      onSuccess: () => {
        toast('Unpublished chart successfully');
        chartsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(`Could not unpublish the chart. ${errorMessage(error)}`);
      },
    }
  );

  const unpublishImageMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishResourceChartImage, ownerArgs || {}, {
        resourceChartImageId: id,
      }),
    {
      onSuccess: () => {
        toast('Unpublished chart successfully');
        chartsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(`Could not unpublish the chart. ${errorMessage(error)}`);
      },
    }
  );

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const chartsBase = chartsBasePath(entityType, entitySlug);
  const rows = toChartRows(chartsQuery.data?.chartsTable.data ?? []);
  const filterConfig: ColumnFilterConfig[] = [
    {
      columnId: 'dataset',
      type: 'select',
      options: datasetFilterOptions(datasetsQuery.data?.datasets),
    },
    {
      columnId: 'chartType',
      type: 'select',
      options: CHART_TYPE_FILTER_OPTIONS,
    },
  ];

  return (
    <ProviderListingTable
      title="Charts"
      subtitle="Create and manage charts and chart images."
      addLabel="Add Chart"
      onAdd={() => router.push(`${chartsBase}/new`)}
      placeholder="Search charts..."
      columns={chartColumns}
      rows={rows}
      sortColumns={['name', 'modified']}
      filters={filterConfig}
      statuses={CHART_TABLE_STATUSES}
      emptyLabel={listingEmptyLabel(table.filters, table.status, 'No charts yet')}
      loading={chartsQuery.isFetching}
      loadError={chartsQuery.isError && !chartsQuery.isFetching}
      onRetry={() => chartsQuery.refetch()}
      totalRows={chartsQuery.data?.chartsTable.totalItemsCount ?? 0}
      statusCounts={statusCounts}
      table={table}
      getRowActions={(row: ChartListingRow) => {
        const published = row.status === ChartStatus.Published;
        const isImage = row.kind === 'TypeResourceChartImage';
        return listingRowActions({
          published,
          title: row.name,
          noun: 'chart',
          onEdit: () =>
            router.push(
              isImage
                ? `${chartsBase}/image/${row.id}/edit/build`
                : `${chartsBase}/${row.id}/edit/build`
            ),
          onUnpublish: () =>
            isImage
              ? unpublishImageMutation.mutate(row.id)
              : unpublishChartMutation.mutate(row.id),
          onDelete: () =>
            isImage
              ? deleteImageMutation.mutate(row.id)
              : deleteChartMutation.mutate(row.id),
        });
      }}
    />
  );
};

export default ChartsList;
