'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { CollaborativeStatus } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
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
  COLLABORATIVE_FIELD_MAP,
  COLLABORATIVE_TAB_KEYS,
  COLLABORATIVE_TABLE_STATUSES,
  CollaborativeListingRow,
  collaborativesTableQueryDoc,
  INITIAL_COLLABORATIVE_SORT,
  toCollaborativeRows,
} from './listing';

const deleteCollaborative = graphql(`
  mutation deleteCollaborative($collaborativeId: String!) {
    deleteCollaborative(collaborativeId: $collaborativeId)
  }
`);

const addCollaborative = graphql(`
  mutation AddCollaborative {
    addCollaborative {
      __typename
      ... on TypeCollaborative {
        id
        created
      }
    }
  }
`);

const unpublishCollaborative = graphql(`
  mutation unPublishCollaborativeMutation($collaborativeId: String!) {
    unpublishCollaborative(collaborativeId: $collaborativeId) {
      __typename
      ... on TypeCollaborative {
        id
        title
        created
      }
    }
  }
`);

const collaborativeColumns = [
  {
    accessorKey: 'title',
    header: 'Collaborative',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: { row: { original: CollaborativeListingRow } }) => (
      <ListingTitle icon={Icons.userList} label={row.original.title} />
    ),
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
    accessorKey: 'useCases',
    header: 'Use Cases',
    meta: { optional: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: { row: { original: CollaborativeListingRow } }) => (
      <ListingStatus
        published={row.original.status === CollaborativeStatus.Published}
        label={
          row.original.status === CollaborativeStatus.Published
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

export default function CollaborativePage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = listingOwner(entityType, entitySlug);
  const isValidParams = ownerArgs !== null;

  const table = useProviderTable(
    COLLABORATIVE_TAB_KEYS,
    INITIAL_COLLABORATIVE_SORT
  );
  const facets = useListingFacets(entityType, entitySlug);

  const collaborativesQuery = useQuery(
    [
      'collaboratives_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(collaborativesTableQueryDoc, ownerArgs || {}, {
        filters: toApiFilters(table.filters, COLLABORATIVE_FIELD_MAP),
        sortOptions: toApiSort(table.sorting, COLLABORATIVE_FIELD_MAP),
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const statusCounts = useSettledStatusCounts(
    collaborativesQuery.data?.collaborativesTable.statusCounts,
    listingQuerySettled(collaborativesQuery),
    COLLABORATIVE_TAB_KEYS
  );

  const deleteMutation = useMutation(
    (id: string) =>
      GraphQL(deleteCollaborative, ownerArgs || {}, { collaborativeId: id }),
    {
      onSuccess: (result) => {
        if (!result.deleteCollaborative) {
          toast('Error: Could not delete the collaborative');
          return;
        }
        toast('Deleted collaborative successfully');
        collaborativesQuery.refetch();
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const unpublishMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishCollaborative, ownerArgs || {}, {
        collaborativeId: id,
      }),
    {
      onSuccess: (result) => {
        if (result.unpublishCollaborative.__typename !== 'TypeCollaborative') {
          toast('Error: Could not unpublish the collaborative');
          return;
        }
        toast('Unpublished collaborative successfully');
        collaborativesQuery.refetch();
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const createMutation = useMutation(
    () => GraphQL(addCollaborative, ownerArgs || {}),
    {
      onSuccess: (response) => {
        const created = response.addCollaborative;
        const createdId = 'id' in created ? created.id : undefined;
        if (!createdId || !entityType || !entitySlug) {
          toast('Error: Could not create the collaborative');
          return;
        }
        toast('Collaborative created successfully!');
        router.push(
          `/dashboard/${entityType}/${entitySlug}/collaboratives/edit/${createdId}`
        );
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const filterConfig = sectorGeographyFilters(facets);

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const rows = toCollaborativeRows(
    collaborativesQuery.data?.collaborativesTable.data ?? []
  );

  return (
    <ProviderListingTable
      title="Collaboratives"
      subtitle="Discover, create and manage collaboratives on CivicDataSpace."
      addLabel="Create Collaborative"
      onAdd={() => {
        if (!createMutation.isLoading) createMutation.mutate();
      }}
      placeholder="Search collaboratives..."
      columns={collaborativeColumns}
      rows={rows}
      sortColumns={['title', 'modified']}
      filters={filterConfig}
      statuses={COLLABORATIVE_TABLE_STATUSES}
      emptyLabel={listingEmptyLabel(
        table.filters,
        table.status,
        'No collaboratives yet'
      )}
      loading={collaborativesQuery.isFetching}
      loadError={collaborativesQuery.isError && !collaborativesQuery.isFetching}
      onRetry={() => collaborativesQuery.refetch()}
      totalRows={
        collaborativesQuery.data?.collaborativesTable.totalItemsCount ?? 0
      }
      statusCounts={statusCounts}
      table={table}
      getRowActions={(row: CollaborativeListingRow) => {
        const published = row.status === CollaborativeStatus.Published;
        return listingRowActions({
          published,
          title: row.title,
          noun: 'collaborative',
          onEdit: () =>
            router.push(
              `/dashboard/${entityType}/${entitySlug}/collaboratives/edit/${row.id}`
            ),
          onUnpublish: () => unpublishMutation.mutate(row.id),
          onDelete: () => deleteMutation.mutate(row.id),
        });
      }}
    />
  );
}
