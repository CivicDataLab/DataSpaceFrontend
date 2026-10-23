import { graphql } from '@/gql';
import { PublicationStatus } from '@/gql/generated/graphql';
import type { SortField } from 'opub-ui';

import {
  formatUpdated,
  joinNames,
  labelFromValue,
  optionList,
} from '../provider-flow/table-listing';
import { LICENSE_OPTIONS } from './model';

export const PUBLICATION_TAB_KEYS: readonly string[] = [
  PublicationStatus.Draft,
  PublicationStatus.Published,
];

export const PUBLICATION_TABLE_STATUSES = [
  { key: PublicationStatus.Draft, label: 'Draft' },
  { key: PublicationStatus.Published, label: 'Published' },
];

export const INITIAL_PUBLICATION_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

export const PUBLICATION_FIELD_MAP: Record<string, string> = {
  resourceType: 'resource_type',
  geography: 'geographies__id',
  sector: 'sectors__id',
};

const LICENSE_LABELS = Object.fromEntries(
  LICENSE_OPTIONS.map((option) => [option.value, option.label])
);

export const LICENSE_FILTER_OPTIONS = optionList(
  LICENSE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  }))
);

export const publicationsTableQueryDoc = graphql(`
  query PublicationsTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    publicationsTable(
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
        license
        modified
        resourceType {
          id
          name
        }
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

export const publicationResourceTypesQueryDoc = graphql(`
  query PublicationTableResourceTypes {
    resourceTypes {
      id
      name
      isActive
    }
  }
`);

export type PublicationListingRow = {
  id: string;
  title: string;
  resourceType: string;
  license: string;
  sector: string;
  geography: string;
  status: string;
  modified: string;
};

type PublicationTableRecord = {
  id: string;
  title?: string | null;
  status: string;
  license: string;
  modified: string;
  resourceType?: { name?: string | null } | null;
  sectors?: Array<{ name?: string | null }> | null;
  geographies?: Array<{ name?: string | null }> | null;
};

export function toPublicationRows(
  publications: PublicationTableRecord[]
): PublicationListingRow[] {
  return publications.map((publication) => ({
    id: publication.id,
    title: publication.title?.trim() || 'Untitled Publication',
    resourceType: publication.resourceType?.name?.trim() || '—',
    license: labelFromValue(publication.license, LICENSE_LABELS),
    sector: joinNames(publication.sectors),
    geography: joinNames(publication.geographies),
    status: publication.status,
    modified: formatUpdated(publication.modified),
  }));
}
