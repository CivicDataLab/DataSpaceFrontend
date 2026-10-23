import { graphql } from '@/gql';
import { CollaborativeStatus } from '@/gql/generated/graphql';
import type { SortField } from 'opub-ui';

import {
  formatCount,
  formatUpdated,
  joinNames,
} from '../provider-flow/table-listing';

export const COLLABORATIVE_TAB_KEYS: readonly string[] = [
  CollaborativeStatus.Draft,
  CollaborativeStatus.Published,
];

export const COLLABORATIVE_TABLE_STATUSES = [
  { key: CollaborativeStatus.Draft, label: 'Draft' },
  { key: CollaborativeStatus.Published, label: 'Published' },
];

export const INITIAL_COLLABORATIVE_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

export const COLLABORATIVE_FIELD_MAP: Record<string, string> = {
  geography: 'geographies__id',
  sector: 'sectors__id',
};

export const collaborativesTableQueryDoc = graphql(`
  query CollaborativesTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    collaborativesTable(
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
        modified
        useCaseCount
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

export type CollaborativeListingRow = {
  id: string;
  title: string;
  sector: string;
  geography: string;
  useCases: string;
  status: string;
  modified: string;
};

type CollaborativeTableRecord = {
  id: string;
  title?: string | null;
  status: string;
  modified: string;
  useCaseCount: number;
  sectors?: Array<{ name?: string | null }> | null;
  geographies?: Array<{ name?: string | null }> | null;
};

export function toCollaborativeRows(
  collaboratives: CollaborativeTableRecord[]
): CollaborativeListingRow[] {
  return collaboratives.map((collaborative) => ({
    id: collaborative.id,
    title: collaborative.title?.trim() || 'Untitled Collaborative',
    sector: joinNames(collaborative.sectors),
    geography: joinNames(collaborative.geographies),
    useCases: formatCount(
      collaborative.useCaseCount ?? 0,
      'use case',
      'use cases'
    ),
    status: collaborative.status,
    modified: formatUpdated(collaborative.modified),
  }));
}
