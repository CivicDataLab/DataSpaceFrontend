'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  DatasetStatus,
  DatasetType as GqlDatasetType,
} from '@/gql/generated/graphql';
import { useTourTrigger } from '@/hooks/use-tour-trigger';
import {
  IconEyeOff,
  IconFile,
  IconFileText,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Badge,
  DataTable,
  Icon,
  Text,
  toast,
  type ColumnFilterConfig,
  type DataTableRowAction,
  type FilterField,
  type SortField,
  type TablePaginationState,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { DatasetType, DatasetTypeModal } from './components/dataset-type-modal';
import {
  DATASET_TABLE_PAGE_SIZE,
  DATASET_TABLE_STATUSES,
  DATASET_TYPE_FILTER_OPTIONS,
  DatasetListingRow,
  datasetsTableQueryDoc,
  datasetTableGeographiesQueryDoc,
  datasetTableSectorsQueryDoc,
  datasetTableTagsQueryDoc,
  hasListingFilters,
  INITIAL_DATASET_SORT,
  toApiFilters,
  toListingRows,
  toStatusCounts,
  withStatusFilter,
} from './listing';
import styles from './listing.module.scss';

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

const columnContentTypes = [
  'text',
  'text',
  'text',
  'text',
  'text',
  'text',
  'text',
] as const;

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
      <span className="flex w-full min-w-0 items-center gap-2">
        <span className="inline-flex shrink-0">
          <Icon source={IconFileText} color="subdued" size={18} />
        </span>
        <Text className="min-w-0 truncate" title={row.original.title}>
          {row.original.title}
        </Text>
      </span>
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
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'geography',
    header: 'Geography',
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
      <Badge
        status={
          row.original.status === DatasetStatus.Published
            ? 'success'
            : 'warning'
        }
      >
        {row.original.status === DatasetStatus.Published
          ? 'Published'
          : 'Draft'}
      </Badge>
    ),
  },
  {
    accessorKey: 'modified',
    header: 'Last Updated',
  },
];

function optionList(
  items: Array<{ label: string; value: string }>
): Array<{ label: string; value: string }> {
  return [...items].sort((left, right) =>
    left.label.localeCompare(right.label)
  );
}

function errorMessage(err: unknown) {
  return typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string'
    ? err.message.split(':')[0]
    : 'Unknown error';
}

export default function DatasetPage() {
  useTourTrigger(true, 1500);
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;

  const isValidParams =
    typeof entityType === 'string' && typeof entitySlug === 'string';

  const ownerArgs: Record<string, string> | null = isValidParams
    ? { [entityType]: entitySlug }
    : null;

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterField[]>(() =>
    withStatusFilter([], 'all')
  );
  const [sorting, setSorting] = useState<SortField[]>(INITIAL_DATASET_SORT);
  const [pagination, setPagination] = useState<TablePaginationState>({
    limit: DATASET_TABLE_PAGE_SIZE,
    offset: 0,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const datasetsQuery = useQuery(
    ['datasets_table', entityType, entitySlug, filters, sorting, pagination],
    () =>
      GraphQL(datasetsTableQueryDoc, ownerArgs || {}, {
        filters: toApiFilters(filters),
        sortOptions: sorting,
        limit: pagination.limit,
        offset: pagination.offset,
      }),
    {
      enabled: isValidParams,
      staleTime: 0,
      refetchOnMount: 'always',
    }
  );

  const sectorsQuery = useQuery(
    ['dataset_table_sectors', entityType, entitySlug],
    () => GraphQL(datasetTableSectorsQueryDoc, ownerArgs || {}),
    { enabled: isValidParams }
  );
  const geographiesQuery = useQuery(
    ['dataset_table_geographies', entityType, entitySlug],
    () => GraphQL(datasetTableGeographiesQueryDoc, ownerArgs || {}),
    { enabled: isValidParams }
  );
  const tagsQuery = useQuery(
    ['dataset_table_tags', entityType, entitySlug],
    () => GraphQL(datasetTableTagsQueryDoc, ownerArgs || {}),
    { enabled: isValidParams }
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

  const selectStatus = (nextStatus: string) => {
    setStatus(nextStatus);
    setFilters((current) => withStatusFilter(current, nextStatus));
  };

  const filterConfig: ColumnFilterConfig[] = [
    {
      columnId: 'datasetType',
      type: 'select',
      options: DATASET_TYPE_FILTER_OPTIONS,
    },
    {
      columnId: 'geography',
      type: 'select',
      options: optionList(
        (geographiesQuery.data?.geographies ?? []).map((geography) => ({
          label: geography.name,
          value: geography.id,
        }))
      ),
    },
    {
      columnId: 'sector',
      type: 'multiSelect',
      options: optionList(
        (sectorsQuery.data?.sectors ?? []).map((sector) => ({
          label: sector.name,
          value: String(sector.id),
        }))
      ),
    },
    // {
    //   columnId: 'Tags',
    //   type: 'multiSelect',
    //   options: optionList(
    //     (tagsQuery.data?.tags ?? []).map((tag) => ({
    //       label: tag.value,
    //       value: tag.value,
    //     }))
    //   ),
    // },
  ];

  const rows = toListingRows(datasetsQuery.data?.datasetsTable.data ?? []);
  const emptyLabel = hasListingFilters(filters, status)
    ? 'No records match your filters'
    : 'No datasets yet';

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  return (
    <>
      <div className={`flex h-full flex-col md:mt-5 lg:mt-2 ${styles.listing}`}>
        <DataTable
          columnContentTypes={[...columnContentTypes]}
          columns={datasetColumns}
          rows={rows}
          hideSelection
          style={{
            borderRadius: '20px',
          }}
          withServer
          title="Datasets"
          subtitle="Discover, create and manage datasets on CivicDataSpace."
          addLabel="Create Dataset"
          onAdd={() => setIsTypeModalOpen(true)}
          placeholder="Search datasets..."
          sortColumns={['title', 'modified']}
          filters={filterConfig}
          statuses={DATASET_TABLE_STATUSES}
          defaultRowCount={DATASET_TABLE_PAGE_SIZE}
          labels={{ empty: emptyLabel }}
          loading={datasetsQuery.isFetching}
          loadError={datasetsQuery.isError && !datasetsQuery.isFetching}
          onRetry={() => datasetsQuery.refetch()}
          totalRows={datasetsQuery.data?.datasetsTable.totalItemsCount ?? 0}
          statusCounts={toStatusCounts(
            datasetsQuery.data?.datasetsTable.statusCounts
          )}
          searchState={search}
          onSearchChange={setSearch}
          statusState={status}
          onStatusChange={selectStatus}
          filterState={filters}
          sortingState={sorting}
          paginationState={pagination}
          onFiltersChange={(next) => {
            const exact = next.find(
              (filter) =>
                filter.field === 'status' && filter.condition === 'exact'
            );
            const nextStatus =
              exact?.value === DatasetStatus.Draft ||
              exact?.value === DatasetStatus.Published
                ? exact.value
                : status;
            setStatus(nextStatus);
            setFilters(withStatusFilter(next, nextStatus));
          }}
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          getRowActions={(row: DatasetListingRow): DataTableRowAction[] => {
            const actions: DataTableRowAction[] = [];
            const isPublished = row.status === DatasetStatus.Published;

            if (isPublished) {
              actions.push({
                key: 'unpublish',
                icon: IconEyeOff,
                color: 'critical',
                label: `Unpublish`,
                onClick: () =>
                  unpublishDatasetMutation.mutate({ datasetId: row.id }),
                alert: {
                  title: 'Unpublish dataset?',
                  children: `Unpublishing "${row.title}" will move it back to draft.`,
                },
              });
            } else {
              actions.push({
                key: 'edit',
                icon: IconPencil,
                label: `Edit ${row.title}`,
                onClick: () =>
                  router.push(
                    `/dashboard/${entityType}/${entitySlug}/dataset/${row.id}/edit`
                  ),
              });
            }
            actions.push({
              key: 'delete',
              icon: IconTrash,
              label: `Delete`,
              destructive: true,
              onClick: () =>
                deleteDatasetMutation.mutate({ datasetId: row.id }),
              alert: {
                title: 'Delete dataset?',
                children: `Deleting "${row.title}" will permanently remove it. This action cannot be undone.`,
              },
            });
            return actions;
          }}
          data-tour="my-datasets"
        />
      </div>

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
