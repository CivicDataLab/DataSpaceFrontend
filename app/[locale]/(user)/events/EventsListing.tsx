'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { fetchData } from '@/fetch';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  CheckboxGroup,
  Pill,
  SearchInput,
  Select,
  Text,
  Tray,
} from 'opub-ui';

import Styles from '../datasets/dataset.module.scss';
import { cn } from '@/lib/utils';

import { EventCard } from './EventCard';
import {
  EVENT_PAGE_SIZE,
  eventListingHref,
  eventSearchQuery,
  hasEventFilters,
  parseEventListing,
  type EventListingQuery,
  type EventOwner,
  type EventSearchResponse,
  type EventSort,
  type EventTimeframe,
} from './listing';

const WHEN_OPTIONS = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
];

const OWNER_OPTIONS = [
  { label: 'Organisation', value: 'false' },
  { label: 'Individual', value: 'true' },
];

const SORT_OPTIONS = [
  { label: 'Start date', value: 'start_date:asc' },
  { label: 'Latest first', value: 'start_date:desc' },
  { label: 'Name', value: 'alphabetical:asc' },
  { label: 'Recently updated', value: 'recent:desc' },
];

export function EventsListing() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listing = parseEventListing(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const requestKey = eventSearchQuery(listing);
  const { data, isLoading, isError } = useQuery(
    ['event-search', requestKey],
    () => fetchData('event', requestKey) as Promise<EventSearchResponse>,
    { keepPreviousData: true }
  );

  const go = (next: Partial<EventListingQuery>) => {
    router.push(eventListingHref(pathname, listing, next));
  };

  const locations = Object.keys(data?.aggregations?.location ?? {}).sort((a, b) =>
    a.localeCompare(b)
  );
  const events = data?.results ?? [];
  const total = data?.total ?? 0;
  const sortValue = `${listing.sort}:${listing.order}`;

  const activeFilters = [
    ...listing.locations.map((value) => ({
      key: `location-${value}`,
      label: value,
      remove: () =>
        go({ locations: listing.locations.filter((item) => item !== value) }),
    })),
    ...(listing.timeframe
      ? [
          {
            key: 'timeframe',
            label: listing.timeframe === 'upcoming' ? 'Upcoming' : 'Past',
            remove: () => go({ timeframe: '' }),
          },
        ]
      : []),
    ...(listing.owner
      ? [
          {
            key: 'owner',
            label: listing.owner === 'true' ? 'Individual' : 'Organisation',
            remove: () => go({ owner: '' }),
          },
        ]
      : []),
  ];

  const filterPanel = (onClose?: () => void) => (
    <EventFilters
      listing={listing}
      locations={locations}
      onTimeframe={(timeframe) => go({ timeframe })}
      onLocations={(next) => go({ locations: next })}
      onOwner={(owner) => go({ owner })}
      onReset={() =>
        go({
          q: '',
          locations: [],
          timeframe: '',
          owner: '',
          sort: 'start_date',
          order: 'asc',
          page: 1,
        })
      }
      onClose={onClose}
    />
  );

  return (
    <div className="flex gap-5">
      <div className="hidden min-w-64 max-w-64 lg:block">{filterPanel()}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-5 lg:flex-nowrap">
          <div className="w-full">
            <SearchInput
              key={listing.q}
              label="Search"
              name="event-search"
              className={cn(Styles.Search)}
              placeholder="Search events"
              defaultValue={listing.q}
              onSubmit={(value) => go({ q: value })}
              onClear={() => go({ q: '' })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              label="Sort"
              labelHidden
              name="event-sort"
              value={
                SORT_OPTIONS.some((item) => item.value === sortValue)
                  ? sortValue
                  : 'start_date:asc'
              }
              options={SORT_OPTIONS}
              onChange={(value) => {
                const [sort, order] = String(value).split(':');
                go({
                  sort: isEventSort(sort) ? sort : 'start_date',
                  order: order === 'desc' ? 'desc' : 'asc',
                });
              }}
            />
            <Tray
              size="narrow"
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              trigger={
                <Button
                  kind="secondary"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  Filter
                </Button>
              }
            >
              {filterPanel(() => setFiltersOpen(false))}
            </Tray>
          </div>
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Pill key={filter.key} onRemove={filter.remove}>
                {filter.label}
              </Pill>
            ))}
          </div>
        ) : null}

        {isError ? (
          <Text>Events could not be loaded. Try again in a moment.</Text>
        ) : isLoading && !data ? (
          <Text color="subdued">Loading events…</Text>
        ) : events.length === 0 ? (
          <Text color="subdued">
            {hasEventFilters(listing) ? 'No events match your search.' : 'No events yet.'}
          </Text>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  coverUrl={event.cover_url?.trim() || null}
                />
              ))}
            </div>
            {total > EVENT_PAGE_SIZE ? (
              <div className="flex items-center justify-end gap-3">
                <Button
                  kind="tertiary"
                  disabled={listing.page <= 1}
                  onClick={() => go({ page: listing.page - 1 })}
                >
                  Previous
                </Button>
                <Text variant="bodyMd">
                  Page {listing.page} of {Math.max(1, Math.ceil(total / EVENT_PAGE_SIZE))}
                </Text>
                <Button
                  kind="tertiary"
                  disabled={listing.page >= Math.ceil(total / EVENT_PAGE_SIZE)}
                  onClick={() => go({ page: listing.page + 1 })}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function isEventSort(value: string): value is EventSort {
  return value === 'start_date' || value === 'alphabetical' || value === 'recent';
}

function EventFilters({
  listing,
  locations,
  onTimeframe,
  onLocations,
  onOwner,
  onReset,
  onClose,
}: {
  listing: EventListingQuery;
  locations: string[];
  onTimeframe: (timeframe: EventTimeframe) => void;
  onLocations: (locations: string[]) => void;
  onOwner: (owner: EventOwner) => void;
  onReset: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="rounded-4 bg-surfaceDefault px-4 py-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <Text variant="headingMd" className="uppercase text-primaryText">
          Filters
        </Text>
        <div className="flex items-center gap-2">
          <Button kind="tertiary" onClick={onReset}>
            Reset
          </Button>
          {onClose ? (
            <Button kind="tertiary" onClick={onClose}>
              Close
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <FilterGroup
          title="When"
          name="event-when"
          options={WHEN_OPTIONS}
          value={listing.timeframe ? [listing.timeframe] : []}
          onChange={(values) => {
            const picked =
              values.find((value) => value !== listing.timeframe) ?? values[0] ?? '';
            onTimeframe(picked === 'upcoming' || picked === 'past' ? picked : '');
          }}
        />
        {locations.length ? (
          <FilterGroup
            title="Location"
            name="event-location"
            options={locations.map((location) => ({
              label: location,
              value: location,
            }))}
            value={listing.locations}
            onChange={onLocations}
          />
        ) : null}
        <FilterGroup
          title="Host"
          name="event-owner"
          options={OWNER_OPTIONS}
          value={listing.owner ? [listing.owner] : []}
          onChange={(values) => {
            const picked =
              values.find((value) => value !== listing.owner) ?? values[0] ?? '';
            onOwner(picked === 'true' || picked === 'false' ? picked : '');
          }}
        />
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  name,
  options,
  value,
  onChange,
}: {
  title: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  value: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <Accordion type="single" collapsible defaultValue={name} className="w-full">
      <AccordionItem value={name} className="border-surfaceDefault">
        <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-[#1F5F8D1A] px-3 py-[10px] hover:no-underline">
          <Text fontWeight="medium">{title}</Text>
        </AccordionTrigger>
        <AccordionContent className="flex w-full flex-col bg-surfaceDefault px-3 pb-0 pt-2">
          <CheckboxGroup
            name={name}
            options={options}
            title={undefined}
            value={value}
            onChange={(values) => onChange(values as string[])}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
