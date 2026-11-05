'use client';

import { useParams, useRouter } from 'next/navigation';
import { IconCalendarEvent } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  listingRowActions,
  ListingStatus,
  ListingTitle,
  ProviderListingTable,
} from '../provider-flow/ProviderListingTable';
import {
  listingEmptyLabel,
  listingQueryOptions,
  listingQuerySettled,
  toApiFilters,
  toApiSort,
  useProviderTable,
  useSettledStatusCounts,
} from '../provider-flow/table-listing';
import {
  EVENT_FIELD_MAP,
  EVENT_TAB_KEYS,
  EVENT_TABLE_STATUSES,
  INITIAL_EVENT_SORT,
  toEventRows,
  type EventListingRow,
} from './listing';
import { entityHeaders, errorText, EventStatus, mutationMessage } from './model';
import {
  createEventMutation,
  deleteEventMutation,
  eventsTableQuery,
  unpublishEventMutation,
} from './queries';

const eventColumns = [
  {
    accessorKey: 'name',
    header: 'Event',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: { row: { original: EventListingRow } }) => (
      <ListingTitle icon={IconCalendarEvent} label={row.original.name} />
    ),
  },
  {
    accessorKey: 'location',
    header: 'Location',
    meta: { truncate: true },
  },
  {
    accessorKey: 'startDate',
    header: 'Start date',
  },
  {
    accessorKey: 'endDate',
    header: 'End date',
    meta: { optional: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: { row: { original: EventListingRow } }) => (
      <ListingStatus
        published={row.original.status === EventStatus.Published}
        label={
          row.original.status === EventStatus.Published ? 'Published' : 'Draft'
        }
      />
    ),
  },
  {
    accessorKey: 'modified',
    header: 'Last Updated',
  },
];

export default function EventsPage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs =
    entityType && entitySlug ? entityHeaders(entityType, entitySlug) : null;
  const isValidParams = Boolean(entityType && entitySlug);

  const table = useProviderTable(EVENT_TAB_KEYS, INITIAL_EVENT_SORT);

  const eventsQuery = useQuery(
    [
      'events_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(eventsTableQuery, ownerArgs || {}, {
        filters: toApiFilters(table.filters, EVENT_FIELD_MAP),
        sortOptions: toApiSort(table.sorting, EVENT_FIELD_MAP),
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const statusCounts = useSettledStatusCounts(
    eventsQuery.data?.eventsTable.statusCounts,
    listingQuerySettled(eventsQuery),
    EVENT_TAB_KEYS
  );

  const deleteMutation = useMutation(
    (id: string) =>
      GraphQL(deleteEventMutation, ownerArgs || {}, { eventId: id }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.deleteEvent,
          'Could not delete the event.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Deleted event successfully');
        eventsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not delete the event.'));
      },
    }
  );

  const unpublishMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishEventMutation, ownerArgs || {}, { eventId: id }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.unpublishEvent,
          'Could not unpublish the event.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Unpublished event successfully');
        eventsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not unpublish the event.'));
      },
    }
  );

  const createMutation = useMutation(
    () => GraphQL(createEventMutation, ownerArgs || {}, { input: {} }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.createEvent,
          'Could not create the event.'
        );
        const id = result.createEvent?.data?.id;
        if (message || !id || !entityType || !entitySlug) {
          toast(message || 'Could not create the event.');
          return;
        }
        toast('Event created successfully!');
        router.push(
          `/dashboard/${entityType}/${entitySlug}/events/edit/${id}/details`
        );
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not create the event.'));
      },
    }
  );

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const rows = toEventRows(eventsQuery.data?.eventsTable.data ?? []);

  return (
    <ProviderListingTable
      title="Events"
      subtitle="Create and publish events with a Luma embed."
      addLabel="Create Event"
      onAdd={() => {
        if (!createMutation.isLoading) createMutation.mutate();
      }}
      placeholder="Search events..."
      columns={eventColumns}
      rows={rows}
      sortColumns={['name', 'startDate', 'modified']}
      filters={[]}
      statuses={EVENT_TABLE_STATUSES}
      emptyLabel={listingEmptyLabel(table.filters, table.status, 'No events yet')}
      loading={eventsQuery.isFetching}
      loadError={eventsQuery.isError && !eventsQuery.isFetching}
      onRetry={() => eventsQuery.refetch()}
      totalRows={eventsQuery.data?.eventsTable.totalItemsCount ?? 0}
      statusCounts={statusCounts}
      table={table}
      getRowActions={(row: EventListingRow) => {
        const published = row.status === EventStatus.Published;
        return listingRowActions({
          published,
          title: row.name,
          noun: 'event',
          onEdit: () =>
            router.push(
              `/dashboard/${entityType}/${entitySlug}/events/edit/${row.id}/details`
            ),
          onUnpublish: () => unpublishMutation.mutate(row.id),
          onDelete: () => deleteMutation.mutate(row.id),
        });
      }}
    />
  );
}
