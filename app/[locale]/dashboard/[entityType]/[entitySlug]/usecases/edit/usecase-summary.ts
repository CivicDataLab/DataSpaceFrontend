import { graphql } from '@/gql';

import {
  hasContentBlocks,
  parseUseCaseContent,
} from './content-document';

export const useCaseWizardSummaryQuery = graphql(`
  query UseCaseWizardSummary($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
      summary
      slug
      logo {
        name
        path
        url
      }
      sectors {
        id
      }
      sdgs {
        id
      }
    }
  }
`);

export type UseCaseEditStep = 'builder' | 'connect' | 'publish';

export function isUseCaseBuilderComplete(useCase: {
  title?: string | null;
  logo?: unknown;
}): boolean {
  return Boolean(useCase.title?.trim()) && useCase.logo != null;
}

export function isUseCaseConnectComplete(useCase: {
  sectors?: unknown[] | null;
  sdgs?: unknown[] | null;
}): boolean {
  return (useCase.sectors?.length ?? 0) > 0 && (useCase.sdgs?.length ?? 0) > 0;
}

export function firstIncompleteUseCaseEditStep(useCase: {
  title?: string | null;
  summary?: string | null;
  logo?: unknown;
  sectors?: unknown[] | null;
  sdgs?: unknown[] | null;
}): UseCaseEditStep {
  if (!isUseCaseBuilderComplete(useCase)) return 'builder';
  if (!isUseCaseConnectComplete(useCase)) return 'connect';
  return 'publish';
}

export function useCaseHasContent(summary?: string | null): boolean {
  return hasContentBlocks(parseUseCaseContent(summary));
}
