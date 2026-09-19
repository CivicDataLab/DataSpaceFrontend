import { graphql } from '@/gql';

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

export function isRichTextEmpty(html?: string | null): boolean {
  if (!html) return true;
  return html.replace(/<(.|\n)*?>/g, '').trim().length === 0;
}

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
