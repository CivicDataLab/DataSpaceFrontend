'use client';

import { useState } from 'react';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import type {
  ColumnFilterConfig,
  FilterField,
  SortField,
  TablePaginationState,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';

export const TABLE_PAGE_SIZE = 10 as const;

export const EMPTY_CELL = '—';

export const listingQueryOptions = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  keepPreviousData: true,
};

export const datasetTableSectorsQueryDoc = graphql(`
  query DatasetTableSectorOptions {
    sectors {
      id
      name
    }
  }
`);

export const datasetTableGeographiesQueryDoc = graphql(`
  query DatasetTableGeographyOptions {
    geographies {
      id
      name
    }
  }
`);

export function optionList(items: Array<{ label: string; value: string }>) {
  return [...items].sort((left, right) =>
    left.label.localeCompare(right.label)
  );
}

export function labelFromValue(value: string, labels?: Record<string, string>) {
  if (labels?.[value]) return labels[value];
  return value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function enumOptions(
  values: readonly string[],
  labels?: Record<string, string>
) {
  return optionList(
    values.map((value) => ({
      value,
      label: labelFromValue(value, labels),
    }))
  );
}

export function statusFilter(
  status: string,
  tabKeys: readonly string[]
): FilterField {
  if (tabKeys.includes(status)) {
    return { field: 'status', condition: 'exact', value: status };
  }

  return { field: 'status', condition: 'in', value: tabKeys.join(',') };
}

export function withStatusFilter(
  filters: FilterField[],
  status: string,
  tabKeys: readonly string[]
): FilterField[] {
  return [
    ...filters.filter((filter) => filter.field !== 'status'),
    statusFilter(status, tabKeys),
  ];
}

export function toApiFilters(
  filters: FilterField[],
  fieldMap: Record<string, string>
) {
  return filters
    .filter((filter) => filter.value.trim())
    .map((filter) => ({
      field: fieldMap[filter.field] ?? filter.field,
      condition: filter.condition,
      value: filter.value,
    }));
}

export function toApiSort(
  sorting: SortField[],
  fieldMap: Record<string, string>
) {
  return sorting.map((sort) => ({
    field: fieldMap[sort.field] ?? sort.field,
    direction: sort.direction,
  }));
}

export function toStatusCounts(
  counts: Array<{ status: string; count: number }> | undefined,
  tabKeys: readonly string[]
): Record<string, number> {
  const result: Record<string, number> = { all: 0 };
  for (const key of tabKeys) {
    const count = counts?.find((item) => item.status === key)?.count ?? 0;
    result[key] = count;
    result.all += count;
  }
  return result;
}

export function listingQuerySettled(query: {
  data?: unknown;
  isFetching: boolean;
  isPreviousData?: boolean;
}) {
  return Boolean(query.data) && !query.isFetching && !query.isPreviousData;
}

function sameStatusCounts(
  left?: Record<string, number>,
  right?: Record<string, number>
) {
  if (!left || !right) return false;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (left[key] !== right[key]) return false;
  }
  return true;
}

export function useSettledStatusCounts(
  counts: Array<{ status: string; count: number }> | undefined,
  ready: boolean,
  tabKeys: readonly string[]
) {
  const settled = ready ? toStatusCounts(counts, tabKeys) : undefined;
  const [statusCounts, setStatusCounts] = useState(settled);
  if (settled && !sameStatusCounts(statusCounts, settled)) {
    setStatusCounts(settled);
  }
  return statusCounts;
}

export function hasListingFilters(filters: FilterField[], status: string) {
  if (status !== 'all') return true;
  return filters.some(
    (filter) => filter.field !== 'status' && filter.value.trim()
  );
}

export function listingEmptyLabel(
  filters: FilterField[],
  status: string,
  empty: string
) {
  return hasListingFilters(filters, status)
    ? 'No records match your filters'
    : empty;
}

export function sectorGeographyFilters(facets: {
  sectors: Array<{ label: string; value: string }>;
  geographies: Array<{ label: string; value: string }>;
}): ColumnFilterConfig[] {
  return [
    {
      columnId: 'geography',
      type: 'select',
      options: facets.geographies,
    },
    {
      columnId: 'sector',
      type: 'multiSelect',
      options: facets.sectors,
    },
  ];
}

export function useProviderTable(
  tabKeys: readonly string[],
  initialSort: SortField[]
) {
  const [filters, setFilters] = useState<FilterField[]>(() =>
    withStatusFilter([], 'all', tabKeys)
  );
  const [sorting, setSorting] = useState<SortField[]>(initialSort);
  const [pagination, setPagination] = useState<TablePaginationState>({
    limit: TABLE_PAGE_SIZE,
    offset: 0,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const selectStatus = (nextStatus: string) => {
    setStatus(nextStatus);
    setFilters((current) => withStatusFilter(current, nextStatus, tabKeys));
  };

  const onFiltersChange = (next: FilterField[]) => {
    const exact = next.find(
      (filter) => filter.field === 'status' && filter.condition === 'exact'
    );
    const nextStatus =
      exact && tabKeys.includes(exact.value) ? exact.value : status;
    setStatus(nextStatus);
    setFilters(withStatusFilter(next, nextStatus, tabKeys));
  };

  return {
    filters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    search,
    setSearch,
    status,
    selectStatus,
    onFiltersChange,
  };
}

export function useListingFacets(entityType?: string, entitySlug?: string) {
  const enabled =
    typeof entityType === 'string' && typeof entitySlug === 'string';
  const ownerArgs = enabled ? { [entityType]: entitySlug } : {};

  const sectorsQuery = useQuery(
    ['listing_table_sectors', entityType, entitySlug],
    () => GraphQL(datasetTableSectorsQueryDoc, ownerArgs),
    { enabled }
  );
  const geographiesQuery = useQuery(
    ['listing_table_geographies', entityType, entitySlug],
    () => GraphQL(datasetTableGeographiesQueryDoc, ownerArgs),
    { enabled }
  );

  return {
    sectors: optionList(
      (sectorsQuery.data?.sectors ?? []).map((sector) => ({
        label: sector.name,
        value: String(sector.id),
      }))
    ),
    geographies: optionList(
      (geographiesQuery.data?.geographies ?? []).map((geography) => ({
        label: geography.name,
        value: String(geography.id),
      }))
    ),
  };
}

type NamedValue = { name?: string | null };

export function joinNames(values: NamedValue[] | null | undefined) {
  const names = (values ?? [])
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : EMPTY_CELL;
}

export function formatUpdated(value?: string | null) {
  if (!value) return EMPTY_CELL;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_CELL;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCount(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export function errorMessage(err: unknown) {
  return typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string'
    ? err.message.split(':')[0]
    : 'Unknown error';
}

export function listingOwner(entityType?: string, entitySlug?: string) {
  if (typeof entityType !== 'string' || typeof entitySlug !== 'string') {
    return null;
  }
  return { [entityType]: entitySlug };
}
