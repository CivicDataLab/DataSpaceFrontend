'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseStatus } from '@/gql/generated/graphql';
import { IconBulb, IconFolderStats } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  FolderKanbanIcon,
  LucideFolderKanban,
} from 'lucide-react';
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
  toApiSort,
  useListingFacets,
  useProviderTable,
  useSettledStatusCounts,
} from '../provider-flow/table-listing';
import {
  INITIAL_USE_CASE_SORT,
  RUNNING_STATUS_FILTER_OPTIONS,
  toUseCaseRows,
  USE_CASE_FIELD_MAP,
  USE_CASE_TAB_KEYS,
  USE_CASE_TABLE_STATUSES,
  UseCaseListingRow,
  useCasesTableQueryDoc,
} from './listing';

const deleteUseCase = graphql(`
  mutation deleteUseCase($useCaseId: String!) {
    deleteUseCase(useCaseId: $useCaseId)
  }
`);

export const AddUseCase = graphql(`
  mutation Addusecase {
    addUseCase {
      __typename
      ... on TypeUseCase {
        id
        created
      }
    }
  }
`);

const unpublishUseCase = graphql(`
  mutation unPublishUseCaseMutation($useCaseId: String!) {
    unpublishUseCase(useCaseId: $useCaseId) {
      __typename
      ... on TypeUseCase {
        id
        title
        created
      }
    }
  }
`);

const useCaseColumns = [
  {
    accessorKey: 'title',
    header: 'Use Case',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: { row: { original: UseCaseListingRow } }) => (
      <ListingTitle icon={IconFolderStats} label={row.original.title} />
    ),
  },
  {
    accessorKey: 'runningStatus',
    header: 'Running Status',
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
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'datasets',
    header: 'Datasets',
    meta: { optional: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: { row: { original: UseCaseListingRow } }) => (
      <ListingStatus
        published={row.original.status === UseCaseStatus.Published}
        label={
          row.original.status === UseCaseStatus.Published
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

export default function UseCasesPage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = listingOwner(entityType, entitySlug);
  const isValidParams = ownerArgs !== null;

  const table = useProviderTable(USE_CASE_TAB_KEYS, INITIAL_USE_CASE_SORT);
  const facets = useListingFacets(entityType, entitySlug);

  const useCasesQuery = useQuery(
    [
      'usecases_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(useCasesTableQueryDoc, ownerArgs || {}, {
        filters: toApiFilters(table.filters, USE_CASE_FIELD_MAP),
        sortOptions: toApiSort(table.sorting, USE_CASE_FIELD_MAP),
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const statusCounts = useSettledStatusCounts(
    useCasesQuery.data?.useCasesTable.statusCounts,
    listingQuerySettled(useCasesQuery),
    USE_CASE_TAB_KEYS
  );

  const deleteMutation = useMutation(
    (id: string) => GraphQL(deleteUseCase, ownerArgs || {}, { useCaseId: id }),
    {
      onSuccess: (result) => {
        if (!result.deleteUseCase) {
          toast('Error: Could not delete the use case');
          return;
        }
        toast('Deleted use case successfully');
        useCasesQuery.refetch();
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const unpublishMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishUseCase, ownerArgs || {}, { useCaseId: id }),
    {
      onSuccess: (result) => {
        if (result.unpublishUseCase.__typename !== 'TypeUseCase') {
          toast('Error: Could not unpublish the use case');
          return;
        }
        toast('Unpublished use case successfully');
        useCasesQuery.refetch();
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const createMutation = useMutation(
    () => GraphQL(AddUseCase, ownerArgs || {}),
    {
      onSuccess: (response) => {
        const created = response.addUseCase;
        const createdId = 'id' in created ? created.id : undefined;
        if (!createdId || !entityType || !entitySlug) {
          toast('Error: Could not create the use case');
          return;
        }
        toast('Use case created successfully!');
        router.push(
          `/dashboard/${entityType}/${entitySlug}/usecases/edit/${createdId}/builder`
        );
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const filterConfig: ColumnFilterConfig[] = [
    {
      columnId: 'runningStatus',
      type: 'select',
      options: RUNNING_STATUS_FILTER_OPTIONS,
    },
    ...sectorGeographyFilters(facets),
  ];

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const rows = toUseCaseRows(useCasesQuery.data?.useCasesTable.data ?? []);

  return (
    <ProviderListingTable
      title="Use Cases"
      subtitle="Discover, create and manage use cases on CivicDataSpace."
      addLabel="Create Use Case"
      onAdd={() => {
        if (!createMutation.isLoading) createMutation.mutate();
      }}
      placeholder="Search use cases..."
      columns={useCaseColumns}
      rows={rows}
      sortColumns={['title', 'modified']}
      filters={filterConfig}
      statuses={USE_CASE_TABLE_STATUSES}
      emptyLabel={listingEmptyLabel(
        table.filters,
        table.status,
        'No use cases yet'
      )}
      loading={useCasesQuery.isFetching}
      loadError={useCasesQuery.isError && !useCasesQuery.isFetching}
      onRetry={() => useCasesQuery.refetch()}
      totalRows={useCasesQuery.data?.useCasesTable.totalItemsCount ?? 0}
      statusCounts={statusCounts}
      table={table}
      getRowActions={(row: UseCaseListingRow) => {
        const published = row.status === UseCaseStatus.Published;
        return listingRowActions({
          published,
          title: row.title,
          noun: 'use case',
          onEdit: () =>
            router.push(
              `/dashboard/${entityType}/${entitySlug}/usecases/edit/${row.id}`
            ),
          onUnpublish: () => unpublishMutation.mutate(row.id),
          onDelete: () => deleteMutation.mutate(row.id),
        });
      }}
    />
  );
}
