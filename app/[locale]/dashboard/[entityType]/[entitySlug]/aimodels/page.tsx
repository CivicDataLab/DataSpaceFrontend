'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  AiModelProvider,
  AiModelStatus,
  AiModelType,
} from '@/gql/generated/graphql';
import { IconCpu } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast, type ColumnFilterConfig } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  listingRowActions,
  ListingStatus,
  ListingTitle,
  ProviderListingTable,
} from '../provider-flow/ProviderListingTable';
import {
  errorMessage,
  listingEmptyLabel,
  listingOwner,
  listingQueryOptions,
  listingQuerySettled,
  sectorGeographyFilters,
  toApiFilters,
  toApiSort,
  useListingFacets,
  useProviderTable,
  useSettledStatusCounts,
} from '../provider-flow/table-listing';
import {
  AI_MODEL_FIELD_MAP,
  AI_MODEL_TAB_KEYS,
  AI_MODEL_TABLE_STATUSES,
  AIModelListingRow,
  aiModelsTableQueryDoc,
  INITIAL_AI_MODEL_SORT,
  MODEL_TYPE_FILTER_OPTIONS,
  PROVIDER_FILTER_OPTIONS,
  toAIModelRows,
} from './listing';

const deleteAIModel = graphql(`
  mutation deleteAIModel($modelId: Int!) {
    deleteAiModel(modelId: $modelId) {
      success
    }
  }
`);

const createAIModel = graphql(`
  mutation CreateAIModel($input: CreateAIModelInput!) {
    createAiModel(input: $input) {
      success
      data {
        id
        name
        displayName
        createdAt
      }
    }
  }
`);

const unpublishAIModel = graphql(`
  mutation unpublishAIModelListing($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        status
      }
    }
  }
`);

const aiModelColumns = [
  {
    accessorKey: 'displayName',
    header: 'AI Model',
    searchable: true,
    meta: { truncate: true },
    cell: ({ row }: { row: { original: AIModelListingRow } }) => (
      <ListingTitle icon={IconCpu} label={row.original.displayName} />
    ),
  },
  {
    accessorKey: 'modelType',
    header: 'Type',
    meta: { optional: true },
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    meta: { optional: true },
  },
  {
    accessorKey: 'sector',
    header: 'Sector',
    maxSize: 160,
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'geography',
    header: 'Geography',
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { optional: true },
    cell: ({ row }: { row: { original: AIModelListingRow } }) => (
      <ListingStatus
        published={row.original.status === AiModelStatus.Active}
        label={
          row.original.status === AiModelStatus.Active ? 'Published' : 'Draft'
        }
      />
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
  },
];

export default function AIModelsPage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = listingOwner(entityType, entitySlug);
  const isValidParams = ownerArgs !== null;

  const table = useProviderTable(AI_MODEL_TAB_KEYS, INITIAL_AI_MODEL_SORT);
  const facets = useListingFacets(entityType, entitySlug);

  const modelsQuery = useQuery(
    [
      'aimodels_table',
      entityType,
      entitySlug,
      table.filters,
      table.sorting,
      table.pagination,
    ],
    () =>
      GraphQL(aiModelsTableQueryDoc, ownerArgs || {}, {
        filters: toApiFilters(table.filters, AI_MODEL_FIELD_MAP),
        sortOptions: toApiSort(table.sorting, AI_MODEL_FIELD_MAP),
        limit: table.pagination.limit,
        offset: table.pagination.offset,
      }),
    {
      enabled: isValidParams,
      ...listingQueryOptions,
    }
  );

  const statusCounts = useSettledStatusCounts(
    modelsQuery.data?.aiModelsTable.statusCounts,
    listingQuerySettled(modelsQuery),
    AI_MODEL_TAB_KEYS
  );

  const deleteMutation = useMutation(
    (id: number) => GraphQL(deleteAIModel, ownerArgs || {}, { modelId: id }),
    {
      onSuccess: (result) => {
        if (!result.deleteAiModel.success) {
          toast('Error: Could not delete the AI model');
          return;
        }
        toast('Deleted AI model successfully');
        modelsQuery.refetch();
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const unpublishMutation = useMutation(
    (id: number) =>
      GraphQL(unpublishAIModel, ownerArgs || {}, {
        input: {
          id,
          status: AiModelStatus.Registered,
          isPublic: false,
          isActive: false,
        },
      }),
    {
      onSuccess: (result) => {
        if (!result.updateAiModel.success) {
          toast('Error: Could not unpublish the AI model');
          return;
        }
        toast('Unpublished AI model successfully');
        modelsQuery.refetch();
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const createMutation = useMutation(
    () =>
      GraphQL(createAIModel, ownerArgs || {}, {
        input: {
          name: `new-model-${Date.now()}`,
          displayName: 'New AI Model',
          modelType: AiModelType.TextGeneration,
          provider: AiModelProvider.Custom,
        },
      }),
    {
      onSuccess: (data) => {
        const newModelId = data.createAiModel.data?.id;
        if (
          !data.createAiModel.success ||
          !newModelId ||
          !entityType ||
          !entitySlug
        ) {
          toast('Error: Could not create the AI model');
          return;
        }
        toast('AI model created successfully!');
        router.push(
          `/dashboard/${entityType}/${entitySlug}/aimodels/edit/${newModelId}/versions`
        );
      },
      onError: (err: unknown) => {
        toast(`Error: ${errorMessage(err)}`);
      },
    }
  );

  const filterConfig: ColumnFilterConfig[] = [
    {
      columnId: 'modelType',
      type: 'select',
      options: MODEL_TYPE_FILTER_OPTIONS,
    },
    {
      columnId: 'provider',
      type: 'select',
      options: PROVIDER_FILTER_OPTIONS,
    },
    ...sectorGeographyFilters(facets),
  ];

  if (!isValidParams || !entityType || !entitySlug) {
    return null;
  }

  const rows = toAIModelRows(modelsQuery.data?.aiModelsTable.data ?? []);

  return (
    <ProviderListingTable
      title="AI Models"
      subtitle="Discover, create and manage AI models on CivicDataSpace."
      addLabel="Create AI Model"
      onAdd={() => {
        if (!createMutation.isLoading) createMutation.mutate();
      }}
      placeholder="Search AI models..."
      columns={aiModelColumns}
      rows={rows}
      sortColumns={['displayName', 'modelType', 'provider', 'updatedAt']}
      filters={filterConfig}
      statuses={AI_MODEL_TABLE_STATUSES}
      emptyLabel={listingEmptyLabel(
        table.filters,
        table.status,
        'No AI models yet'
      )}
      loading={modelsQuery.isFetching}
      loadError={modelsQuery.isError && !modelsQuery.isFetching}
      onRetry={() => modelsQuery.refetch()}
      totalRows={modelsQuery.data?.aiModelsTable.totalItemsCount ?? 0}
      statusCounts={statusCounts}
      table={table}
      getRowActions={(row: AIModelListingRow) => {
        const published = row.status === AiModelStatus.Active;
        return listingRowActions({
          published,
          title: row.displayName,
          noun: 'AI model',
          onEdit: () =>
            router.push(
              `/dashboard/${entityType}/${entitySlug}/aimodels/edit/${row.id}`
            ),
          onUnpublish: () => unpublishMutation.mutate(row.id),
          onDelete: () => deleteMutation.mutate(row.id),
        });
      }}
    />
  );
}
