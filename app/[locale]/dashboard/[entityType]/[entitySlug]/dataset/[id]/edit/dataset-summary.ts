import { graphql } from '@/gql';

import { isRichTextEmpty } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/provider-flow/rich-text';

export const datasetSummaryQueryDoc = graphql(`
  query datasetTitleQuery($filters: DatasetFilter) {
    datasets(filters: $filters) {
      id
      title
      created
      datasetType
      description
      license
      tags {
        id
      }
      sectors {
        id
      }
      resources {
        id
      }
    }
  }
`);

export type DatasetEditStep = 'resources' | 'metadata' | 'publish';

export function isDatasetMetadataComplete(dataset: {
  title?: string | null;
  description?: string | null;
  license?: string | null;
  tags?: unknown[] | null;
  sectors?: unknown[] | null;
}): boolean {
  return (
    Boolean(dataset.title?.trim()) &&
    !isRichTextEmpty(dataset.description) &&
    (dataset.sectors?.length ?? 0) > 0 &&
    (dataset.tags?.length ?? 0) > 0 &&
    Boolean(dataset.license)
  );
}

export function firstIncompleteDatasetEditStep(dataset: {
  title?: string | null;
  description?: string | null;
  license?: string | null;
  tags?: unknown[] | null;
  sectors?: unknown[] | null;
  resources?: unknown[] | null;
}): DatasetEditStep {
  if ((dataset.resources?.length ?? 0) === 0) return 'resources';
  if (!isDatasetMetadataComplete(dataset)) return 'metadata';
  return 'publish';
}
