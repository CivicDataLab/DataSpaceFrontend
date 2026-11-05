import type { SortField } from 'opub-ui';

import { formatUpdated } from '../provider-flow/table-listing';
import { EventStatus, formatEventDate } from './model';
import type { EventRecord } from './queries';

export const EVENT_TAB_KEYS: readonly string[] = [
  EventStatus.Draft,
  EventStatus.Published,
];

export const EVENT_TABLE_STATUSES = [
  { key: EventStatus.Draft, label: 'Draft' },
  { key: EventStatus.Published, label: 'Published' },
];

export const INITIAL_EVENT_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

export const EVENT_FIELD_MAP: Record<string, string> = {
  startDate: 'start_date',
  endDate: 'end_date',
};

export type EventListingRow = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  modified: string;
};

export function toEventRows(events: EventRecord[]): EventListingRow[] {
  return events.map((event) => ({
    id: event.id,
    name: event.name?.trim() || 'Untitled event',
    location: event.location?.trim() || '—',
    startDate: formatEventDate(event.startDate),
    endDate: formatEventDate(event.endDate),
    status: event.status ?? EventStatus.Draft,
    modified: formatUpdated(event.modified),
  }));
}
