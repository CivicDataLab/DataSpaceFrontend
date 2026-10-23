import { graphql } from '@/gql';
import {
  AiModelProvider,
  AiModelStatus,
  AiModelType,
} from '@/gql/generated/graphql';
import type { SortField } from 'opub-ui';

import {
  enumOptions,
  formatUpdated,
  joinNames,
  labelFromValue,
} from '../provider-flow/table-listing';

export const AI_MODEL_TAB_KEYS: readonly string[] = [
  AiModelStatus.Registered,
  AiModelStatus.Active,
];

export const AI_MODEL_TABLE_STATUSES = [
  { key: AiModelStatus.Registered, label: 'Draft' },
  { key: AiModelStatus.Active, label: 'Published' },
];

export const INITIAL_AI_MODEL_SORT: SortField[] = [
  { field: 'updatedAt', direction: 'desc' },
];

export const AI_MODEL_FIELD_MAP: Record<string, string> = {
  displayName: 'display_name',
  modelType: 'model_type',
  geography: 'geographies__id',
  sector: 'sectors__id',
  updatedAt: 'updated_at',
};

const PROVIDER_LABELS: Record<string, string> = {
  [AiModelProvider.Custom]: 'Custom',
  [AiModelProvider.Huggingface]: 'Hugging Face',
  [AiModelProvider.LlamaCustom]: 'Llama Custom',
  [AiModelProvider.LlamaOllama]: 'Ollama',
  [AiModelProvider.LlamaReplicate]: 'Replicate',
  [AiModelProvider.LlamaTogether]: 'Together',
  [AiModelProvider.Openai]: 'OpenAI',
};

export const MODEL_TYPE_FILTER_OPTIONS = enumOptions(
  Object.values(AiModelType)
);

export const PROVIDER_FILTER_OPTIONS = enumOptions(
  Object.values(AiModelProvider),
  PROVIDER_LABELS
);

export const aiModelsTableQueryDoc = graphql(`
  query AIModelsTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    aiModelsTable(
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
        displayName
        modelType
        provider
        status
        updatedAt
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

export type AIModelListingRow = {
  id: number;
  displayName: string;
  modelType: string;
  provider: string;
  sector: string;
  geography: string;
  status: string;
  updatedAt: string;
};

type AIModelTableRecord = {
  id: number;
  displayName: string;
  modelType: string;
  provider: string;
  status: string;
  updatedAt: string;
  sectors?: Array<{ name?: string | null }> | null;
  geographies?: Array<{ name?: string | null }> | null;
};

export function toAIModelRows(
  models: AIModelTableRecord[]
): AIModelListingRow[] {
  return models.map((model) => ({
    id: model.id,
    displayName: model.displayName?.trim() || 'Untitled AI Model',
    modelType: labelFromValue(model.modelType),
    provider: labelFromValue(model.provider, PROVIDER_LABELS),
    sector: joinNames(model.sectors),
    geography: joinNames(model.geographies),
    status: model.status,
    updatedAt: formatUpdated(model.updatedAt),
  }));
}
