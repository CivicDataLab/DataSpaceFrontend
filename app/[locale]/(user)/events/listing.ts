export const EVENT_PAGE_SIZE = 9;

export type EventTimeframe = '' | 'upcoming' | 'past';
export type EventOwner = '' | 'true' | 'false';
export type EventSort = 'start_date' | 'alphabetical' | 'recent';
export type EventSortOrder = 'asc' | 'desc';

export type EventListingQuery = {
  q: string;
  locations: string[];
  timeframe: EventTimeframe;
  owner: EventOwner;
  sort: EventSort;
  order: EventSortOrder;
  page: number;
};

export type EventSearchHit = {
  id: string;
  name?: string | null;
  url_slug?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_individual_event?: boolean | null;
  cover_url?: string | null;
  organization?: { name?: string | null; logo?: string | null } | null;
  user?: {
    name?: string | null;
    profile_picture?: string | null;
  } | null;
};

export type EventSearchResponse = {
  results: EventSearchHit[];
  total: number;
  aggregations?: {
    location?: Record<string, number>;
    is_individual_event?: Record<string, number>;
  };
};

type SearchParamValue = string | string[] | undefined;

function first(value: SearchParamValue) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function locationsFrom(value: SearchParamValue) {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return raw
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseEventListing(
  params: Record<string, SearchParamValue> | URLSearchParams
): EventListingQuery {
  const read = (key: string): SearchParamValue =>
    params instanceof URLSearchParams ? params.getAll(key) : params[key];
  const timeframe = first(read('timeframe'));
  const owner = first(read('is_individual_event'));
  const sort = first(read('sort'));
  const order = first(read('order'));
  const page = Number(first(read('page')));

  return {
    q: first(read('query')),
    locations: locationsFrom(read('location')),
    timeframe: timeframe === 'upcoming' || timeframe === 'past' ? timeframe : '',
    owner: owner === 'true' || owner === 'false' ? owner : '',
    sort:
      sort === 'alphabetical' || sort === 'recent' || sort === 'start_date'
        ? sort
        : 'start_date',
    order: order === 'desc' ? 'desc' : 'asc',
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : 1,
  };
}

export function hasEventFilters(listing: EventListingQuery) {
  return Boolean(
    listing.q || listing.locations.length || listing.timeframe || listing.owner
  );
}

/** Query string for `GET /api/search/event/`, including the leading `?`. */
export function eventSearchQuery(listing: EventListingQuery) {
  const params = new URLSearchParams();
  params.set('page', String(listing.page));
  params.set('size', String(EVENT_PAGE_SIZE));
  params.set('sort', listing.sort);
  params.set('order', listing.order);
  if (listing.q) params.set('query', listing.q);
  if (listing.locations.length) params.set('location', listing.locations.join(','));
  if (listing.timeframe) params.set('timeframe', listing.timeframe);
  if (listing.owner) params.set('is_individual_event', listing.owner);
  return `?${params.toString()}`;
}

export function eventListingHref(
  pathname: string,
  current: EventListingQuery,
  next: Partial<EventListingQuery>
) {
  const resetsPage =
    next.q !== undefined ||
    next.locations !== undefined ||
    next.timeframe !== undefined ||
    next.owner !== undefined ||
    next.sort !== undefined ||
    next.order !== undefined;
  const listing: EventListingQuery = {
    ...current,
    ...next,
    page: next.page ?? (resetsPage ? 1 : current.page),
  };
  const params = new URLSearchParams();
  if (listing.q) params.set('query', listing.q);
  if (listing.locations.length) params.set('location', listing.locations.join(','));
  if (listing.timeframe) params.set('timeframe', listing.timeframe);
  if (listing.owner) params.set('is_individual_event', listing.owner);
  if (listing.sort !== 'start_date') params.set('sort', listing.sort);
  if (listing.order !== 'asc') params.set('order', listing.order);
  if (listing.page > 1) params.set('page', String(listing.page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
