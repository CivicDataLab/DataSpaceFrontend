import { graphql } from '@/gql';
import { DatasetStatus, DatasetType } from '@/gql/generated/graphql';
import type { FilterField, SortField } from 'opub-ui';

export const DATASET_TABLE_PAGE_SIZE = 10;

export const DATASET_TABLE_STATUSES = [
  { key: DatasetStatus.Draft, label: 'Draft' },
  { key: DatasetStatus.Published, label: 'Published' },
];

export const INITIAL_DATASET_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

export const datasetsTableQueryDoc = graphql(`
  query DatasetsTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    datasetsTable(
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
        title
        datasetType
        status
        modified
        resourceCount
        sectors {
          name
        }
        geographies {
          name
        }
      }
    }
  }
`);

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

export const datasetTableTagsQueryDoc = graphql(`
  query DatasetTableTagOptions {
    tags {
      id
      value
    }
  }
`);

const API_FILTER_FIELDS: Record<string, string> = {
  datasetType: 'dataset_type',
  geography: 'geographies__id',
  sector: 'sectors__id',
  Tags: 'tags__value',
};

export const DATASET_TYPE_FILTER_OPTIONS = [
  { label: 'Dataset', value: DatasetType.Data },
  { label: 'Prompt dataset', value: DatasetType.Prompt },
];

export type DatasetListingRow = {
  id: string;
  title: string;
  datasetType: string;
  sector: string;
  geography: string;
  files: string;
  status: DatasetStatus;
  modified: string;
};

type NamedValue = { name?: string | null };

type DatasetTableRecord = {
  id: string;
  title: string;
  datasetType: DatasetType;
  status: DatasetStatus;
  modified: string;
  resourceCount: number;
  sectors: NamedValue[];
  geographies: NamedValue[];
};

export function statusFilter(status: string): FilterField {
  if (status === DatasetStatus.Draft || status === DatasetStatus.Published) {
    return { field: 'status', condition: 'exact', value: status };
  }

  return {
    field: 'status',
    condition: 'in',
    value: `${DatasetStatus.Draft},${DatasetStatus.Published}`,
  };
}

export function withStatusFilter(
  filters: FilterField[],
  status: string
): FilterField[] {
  return [
    ...filters.filter((filter) => filter.field !== 'status'),
    statusFilter(status),
  ];
}

export function toApiFilters(filters: FilterField[]) {
  return filters
    .filter((filter) => filter.value.trim())
    .map((filter) => ({
      field: API_FILTER_FIELDS[filter.field] ?? filter.field,
      condition: filter.condition,
      value: filter.value,
    }));
}

export function toStatusCounts(
  counts: Array<{ status: string; count: number }> | undefined
): Record<string, number> {
  const draft =
    counts?.find((item) => item.status === DatasetStatus.Draft)?.count ?? 0;
  const published =
    counts?.find((item) => item.status === DatasetStatus.Published)?.count ?? 0;

  return {
    all: draft + published,
    [DatasetStatus.Draft]: draft,
    [DatasetStatus.Published]: published,
  };
}

export function hasListingFilters(filters: FilterField[], status: string) {
  if (status !== 'all') return true;
  return filters.some(
    (filter) => filter.field !== 'status' && filter.value.trim()
  );
}

function joinNames(values: NamedValue[] | null | undefined) {
  const names = (values ?? [])
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : '—';
}

export function formatUpdated(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatFileCount(count: number) {
  return count === 1 ? '1 file' : `${count} files`;
}

export function toListingRows(
  datasets: DatasetTableRecord[]
): DatasetListingRow[] {
  return datasets.map((dataset) => ({
    id: dataset.id,
    title: dataset.title,
    datasetType:
      dataset.datasetType === DatasetType.Prompt ? 'Prompt dataset' : 'Dataset',
    sector: joinNames(dataset.sectors),
    geography: joinNames(dataset.geographies),
    files: formatFileCount(dataset.resourceCount ?? 0),
    status: dataset.status,
    modified: formatUpdated(dataset.modified),
  }));
}
