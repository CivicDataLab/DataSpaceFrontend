import { graphql } from '@/gql';
import { DatasetStatus, DatasetType } from '@/gql/generated/graphql';
import type { SortField } from 'opub-ui';

import {
  formatCount,
  formatUpdated,
  joinNames,
} from '../provider-flow/table-listing';

export const DATASET_TAB_KEYS: readonly string[] = [
  DatasetStatus.Draft,
  DatasetStatus.Published,
];

export const DATASET_TABLE_STATUSES = [
  { key: DatasetStatus.Draft, label: 'Draft' },
  { key: DatasetStatus.Published, label: 'Published' },
];

export const INITIAL_DATASET_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

export const DATASET_FIELD_MAP: Record<string, string> = {
  datasetType: 'dataset_type',
  geography: 'geographies__id',
  sector: 'sectors__id',
  Tags: 'tags__value',
};

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

export const datasetTableTagsQueryDoc = graphql(`
  query DatasetTableTagOptions {
    tags {
      id
      value
    }
  }
`);

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
    files: formatCount(dataset.resourceCount ?? 0, 'file', 'files'),
    status: dataset.status,
    modified: formatUpdated(dataset.modified),
  }));
}
