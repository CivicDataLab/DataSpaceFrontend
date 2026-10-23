'use client';

import { useParams, useRouter } from 'next/navigation';
import { PublicationStatus } from '@/gql/generated/graphql';
import { IconFileDescription } from '@tabler/icons-react';
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
  listingEmptyLabel,
  listingOwner,
  listingQueryOptions,
  listingQuerySettled,
  optionList,
  sectorGeographyFilters,
  toApiFilters,
  toApiSort,
  useListingFacets,
  useProviderTable,
  useSettledStatusCounts,
} from '../provider-flow/table-listing';
import {
  INITIAL_PUBLICATION_SORT,
  LICENSE_FILTER_OPTIONS,
  PUBLICATION_FIELD_MAP,
  PUBLICATION_TAB_KEYS,
  PUBLICATION_TABLE_STATUSES,
  PublicationListingRow,
  publicationResourceTypesQueryDoc,
  publicationsTableQueryDoc,
  toPublicationRows,
} from './listing';
import { errorText, mutationMessage } from './model';
import {
  createPublicationMutation,
  deletePublicationMutation,
  unpublishPublicationMutation,
} from './queries';

const publicationColumns = [
  {
    accessorKey: 'title',
    header: 'Publication',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: { row: { original: PublicationListingRow } }) => (
      <ListingTitle icon={IconFileDescription} label={row.original.title} />
    ),
  },
  {
    accessorKey: 'resourceType',
    header: 'Type',
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'license',
    header: 'License',
    meta: { optional: true, truncate: true },
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
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: { row: { original: PublicationListingRow } }) => (
      <ListingStatus
        published={row.original.status === PublicationStatus.Published}
        label={
          row.original.status === PublicationStatus.Published
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

export default function PublicationsPage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = listingOwner(entityType, entitySlug);
  const isValidParams = ownerArgs !== null;

  const table = useProviderTable(
    PUBLICATION_TAB_KEYS,
    INITIAL_PUBLICATION_SORT
  );
  const facets = useListingFacets(entityType, entitySlug);

  const publicationsQuery = useQuery(
    [
      'publications_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(publicationsTableQueryDoc, ownerArgs || {}, {
        filters: toApiFilters(table.filters, PUBLICATION_FIELD_MAP),
        sortOptions: toApiSort(table.sorting, PUBLICATION_FIELD_MAP),
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const resourceTypesQuery = useQuery(
    ['publication_table_resource_types'],
    () => GraphQL(publicationResourceTypesQueryDoc, ownerArgs || {}),
    { enabled: isValidParams }
  );

  const statusCounts = useSettledStatusCounts(
    publicationsQuery.data?.publicationsTable.statusCounts,
    listingQuerySettled(publicationsQuery),
    PUBLICATION_TAB_KEYS
  );

  const deleteMutation = useMutation(
    (id: string) =>
      GraphQL(deletePublicationMutation, ownerArgs || {}, {
        publicationId: id,
      }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.deletePublication,
          'Could not delete the publication.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Deleted publication successfully');
        publicationsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not delete the publication.'));
      },
    }
  );

  const unpublishMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishPublicationMutation, ownerArgs || {}, {
        publicationId: id,
      }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.unpublishPublication,
          'Could not unpublish the publication.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Unpublished publication successfully');
        publicationsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not unpublish the publication.'));
      },
    }
  );

  const createMutation = useMutation(
    () => GraphQL(createPublicationMutation, ownerArgs || {}, { input: {} }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.createPublication,
          'Could not create the publication.'
        );
        const id = result.createPublication?.data?.id;
        if (message || !id || !entityType || !entitySlug) {
          toast(message || 'Could not create the publication.');
          return;
        }
        toast('Publication created successfully!');
        router.push(
          `/dashboard/${entityType}/${entitySlug}/publications/edit/${id}/files`
        );
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not create the publication.'));
      },
    }
  );

  const filterConfig: ColumnFilterConfig[] = [
    {
      columnId: 'resourceType',
      type: 'select',
      options: optionList(
        (resourceTypesQuery.data?.resourceTypes ?? [])
          .filter((type) => type.isActive)
          .map((type) => ({
            label: type.name,
            value: String(type.id),
          }))
      ),
    },
    {
      columnId: 'license',
      type: 'select',
      options: LICENSE_FILTER_OPTIONS,
    },
    ...sectorGeographyFilters(facets),
  ];

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const rows = toPublicationRows(
    publicationsQuery.data?.publicationsTable.data ?? []
  );

  return (
    <ProviderListingTable
      title="Publications"
      subtitle="Discover, create and manage publications on CivicDataSpace."
      addLabel="Create Publication"
      onAdd={() => {
        if (!createMutation.isLoading) createMutation.mutate();
      }}
      placeholder="Search publications..."
      columns={publicationColumns}
      rows={rows}
      sortColumns={['title', 'modified']}
      filters={filterConfig}
      statuses={PUBLICATION_TABLE_STATUSES}
      emptyLabel={listingEmptyLabel(
        table.filters,
        table.status,
        'No publications yet'
      )}
      loading={publicationsQuery.isFetching}
      loadError={publicationsQuery.isError && !publicationsQuery.isFetching}
      onRetry={() => publicationsQuery.refetch()}
      totalRows={publicationsQuery.data?.publicationsTable.totalItemsCount ?? 0}
      statusCounts={statusCounts}
      table={table}
      getRowActions={(row: PublicationListingRow) => {
        const published = row.status === PublicationStatus.Published;
        return listingRowActions({
          published,
          title: row.title,
          noun: 'publication',
          onEdit: () =>
            router.push(
              `/dashboard/${entityType}/${entitySlug}/publications/edit/${row.id}/files`
            ),
          onUnpublish: () => unpublishMutation.mutate(row.id),
          onDelete: () => deleteMutation.mutate(row.id),
        });
      }}
    />
  );
}
