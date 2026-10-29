import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import gql from 'graphql-tag';

function operation<TData, TVariables extends Record<string, unknown>>(
  source: string
) {
  return gql(source) as TypedDocumentNode<TData, TVariables>;
}

export type EventRecord = {
  id: string;
  name?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  lumaEmbed?: {
    src: string;
    width?: string | null;
    height?: string | null;
    style?: string | null;
    title?: string | null;
    allow?: string | null;
    allowfullscreen?: boolean | null;
    frameborder?: string | null;
    referrerpolicy?: string | null;
    loading?: string | null;
  } | null;
  status?: string | null;
  modified?: string | null;
  publicId?: string | null;
  urlSlug?: string | null;
};

type MutationErrors = {
  nonFieldErrors?: Array<string | null> | null;
  fieldErrors?: Array<{
    field?: string | null;
    messages?: Array<string | null> | null;
  } | null> | null;
};

type MutationPayload<T> = {
  success?: boolean | null;
  errors?: MutationErrors | null;
  data?: T | null;
};

export type EventInput = {
  name: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  lumaEmbed: string | null;
};

export const eventsTableQuery = operation<
  {
    eventsTable: {
      totalItemsCount: number;
      statusCounts: Array<{ status: string; count: number }>;
      data: EventRecord[];
    };
  },
  {
    filters?: Array<{ field: string; condition: string; value: string }>;
    sortOptions?: Array<{ field: string; direction: string }>;
    limit: number;
    offset: number;
  }
>(`
  query EventsTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    eventsTable(
      filters: $filters
      sortOptions: $sortOptions
      limit: $limit
      offset: $offset
    ) {
      totalItemsCount
      statusCounts {
        status
        count
      }
      data {
        id
        name
        location
        startDate
        endDate
        status
        modified
      }
    }
  }
`);

export const eventEditorQuery = operation<
  { event?: EventRecord | null },
  { eventId: string }
>(`
  query eventEditor($eventId: UUID!) {
    event(eventId: $eventId) {
      id
      name
      location
      startDate
      endDate
      lumaEmbed {
        src
        width
        height
        style
        title
        allow
        allowfullscreen
        frameborder
        referrerpolicy
        loading
      }
      status
      modified
      publicId
      urlSlug
    }
  }
`);

export const createEventMutation = operation<
  { createEvent: MutationPayload<{ id: string }> },
  { input: Record<string, never> }
>(`
  mutation createEventWizard($input: CreateEventInput!) {
    createEvent(input: $input) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
      }
    }
  }
`);

export const updateEventMutation = operation<
  { updateEvent: MutationPayload<{ id: string; name?: string | null }> },
  { input: EventInput & { id: string } }
>(`
  mutation updateEventWizard($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
        name
      }
    }
  }
`);

export const publishEventMutation = operation<
  { publishEvent: MutationPayload<{ id: string; status?: string | null }> },
  { eventId: string }
>(`
  mutation publishEventWizard($eventId: UUID!) {
    publishEvent(eventId: $eventId) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
        status
      }
    }
  }
`);

export const unpublishEventMutation = operation<
  { unpublishEvent: MutationPayload<{ id: string; status?: string | null }> },
  { eventId: string }
>(`
  mutation unpublishEventWizard($eventId: UUID!) {
    unpublishEvent(eventId: $eventId) {
      success
      errors {
        nonFieldErrors
      }
      data {
        id
        status
      }
    }
  }
`);

export const deleteEventMutation = operation<
  { deleteEvent: MutationPayload<boolean> },
  { eventId: string }
>(`
  mutation deleteEventWizard($eventId: UUID!) {
    deleteEvent(eventId: $eventId) {
      success
      errors {
        nonFieldErrors
      }
    }
  }
`);
