import { graphql } from '@/gql';
import {
  ApiUseCaseRunningStatusEnum,
  UseCaseStatus,
} from '@/gql/generated/graphql';
import type { SortField } from 'opub-ui';

import {
  enumOptions,
  formatCount,
  formatUpdated,
  joinNames,
  labelFromValue,
} from '../provider-flow/table-listing';

export const USE_CASE_TAB_KEYS: readonly string[] = [
  UseCaseStatus.Draft,
  UseCaseStatus.Published,
];

export const USE_CASE_TABLE_STATUSES = [
  { key: UseCaseStatus.Draft, label: 'Draft' },
  { key: UseCaseStatus.Published, label: 'Published' },
];

export const INITIAL_USE_CASE_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

export const USE_CASE_FIELD_MAP: Record<string, string> = {
  runningStatus: 'running_status',
  geography: 'geographies__id',
  sector: 'sectors__id',
};

const RUNNING_STATUS_LABELS: Record<string, string> = {
  [ApiUseCaseRunningStatusEnum.Cancelled]: 'Cancelled',
  [ApiUseCaseRunningStatusEnum.Completed]: 'Completed',
  [ApiUseCaseRunningStatusEnum.Initiated]: 'Initiated',
  [ApiUseCaseRunningStatusEnum.OnGoing]: 'Ongoing',
  [ApiUseCaseRunningStatusEnum.OnHold]: 'On hold',
};

export const RUNNING_STATUS_FILTER_OPTIONS = enumOptions(
  Object.values(ApiUseCaseRunningStatusEnum),
  RUNNING_STATUS_LABELS
);

export const useCasesTableQueryDoc = graphql(`
  query UseCasesTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    useCasesTable(
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
        status
        runningStatus
        modified
        datasetCount
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

export type UseCaseListingRow = {
  id: string;
  title: string;
  runningStatus: string;
  sector: string;
  geography: string;
  datasets: string;
  status: string;
  modified: string;
};

type UseCaseTableRecord = {
  id: string;
  title?: string | null;
  status: string;
  runningStatus: string;
  modified: string;
  datasetCount: number;
  sectors?: Array<{ name?: string | null }> | null;
  geographies?: Array<{ name?: string | null }> | null;
};

export function toUseCaseRows(
  useCases: UseCaseTableRecord[]
): UseCaseListingRow[] {
  return useCases.map((useCase) => ({
    id: useCase.id,
    title: useCase.title?.trim() || 'Untitled Use Case',
    runningStatus: labelFromValue(useCase.runningStatus, RUNNING_STATUS_LABELS),
    sector: joinNames(useCase.sectors),
    geography: joinNames(useCase.geographies),
    datasets: formatCount(useCase.datasetCount ?? 0, 'dataset', 'datasets'),
    status: useCase.status,
    modified: formatUpdated(useCase.modified),
  }));
}
