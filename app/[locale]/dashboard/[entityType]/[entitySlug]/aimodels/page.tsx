'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  AiModelProvider,
  AiModelStatus,
  AiModelType,
  Ordering,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { Button, DataTable, Icon, IconButton, Text, toast } from 'opub-ui';
import { twMerge } from 'tailwind-merge';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { ActionBar } from '../dataset/components/action-bar';
import { Navigation } from '../dataset/components/navigate-org-datasets';

interface AIModelListItem {
  id: number;
  displayName: string;
  name: string;
  modelType: string;
  provider: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AIModelTableRow {
  id: number;
  displayName: string;
  name: string;
  modelType: string;
  provider: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const allAIModels = graphql(`
  query AIModelsData($filters: AIModelFilter, $order: AIModelOrder) {
    aiModels(filters: $filters, order: $order) {
      id
      displayName
      name
      modelType
      provider
      status
      createdAt
      updatedAt
    }
  }
`);

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

const AIMODELS_ACTION_TOAST_ID = 'aimodels-list-action-toast';

export default function AIModelsPage({
  params,
}: {
  params: Promise<{ entityType: string; entitySlug: string }>;
}) {
  const { entityType, entitySlug } = use(params) as {
    entityType: string;
    entitySlug: string;
  };
  const router = useRouter();

  const [navigationTab, setNavigationTab] = useQueryState('tab', parseAsString);

  const navigationOptions = [
    {
      label: 'Draft',
      url: `draft`,
      selected: navigationTab === 'draft',
    },
    {
      label: 'Published',
      url: `published`,
      selected: navigationTab === 'published',
    },
    // {
    //   label: 'Approved',
    //   url: `approved`,
    //   selected: navigationTab === 'approved',
    // },
  ];

  const AllAIModels = useQuery(
    [`fetch_AIModels`, navigationTab],
    () =>
      GraphQL(
        allAIModels,
        {
          [entityType]: entitySlug,
        },
        {
          filters: {
            status:
              navigationTab === 'published'
                ? AiModelStatus.Active
                : navigationTab === 'draft'
                  ? AiModelStatus.Registered
                  : AiModelStatus.Approved,
          },
          order: { updatedAt: Ordering.Desc },
        }
      )
  );

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('draft');
    AllAIModels.refetch();
  }, [AllAIModels, navigationTab, setNavigationTab]);

  const DeleteAIModelMutation = useMutation(
    [`delete_AIModel`],
    (data: { id: number }) =>
      GraphQL(
        deleteAIModel,
        {
          [entityType]: entitySlug,
        },
        { modelId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Deleted AI Model successfully`, {
          id: AIMODELS_ACTION_TOAST_ID,
        });
        AllAIModels.refetch();
      },
      onError: (err: unknown) => {
        toast('Error: ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0], {
          id: AIMODELS_ACTION_TOAST_ID,
        });
      },
    }
  );

  const CreateAIModelMutation = useMutation(
    [`create_AIModel`],
    () =>
      GraphQL(
        createAIModel,
        {
          [entityType]: entitySlug,
        },
        {
          input: {
            name: `new-model-${Date.now()}`,
            displayName: 'New AI Model',
            modelType: AiModelType.TextGeneration,
            provider: AiModelProvider.Custom,
          },
        }
      ),
    {
      onSuccess: (data) => {
        const newModelId = data.createAiModel.data?.id;
        toast(`Created AI Model successfully`, {
          id: AIMODELS_ACTION_TOAST_ID,
        });
        router.push(
          `/dashboard/${entityType}/${entitySlug}/aimodels/edit/${newModelId}/details`
        );
      },
      onError: (err: unknown) => {
        toast('Error: ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0], {
          id: AIMODELS_ACTION_TOAST_ID,
        });
      },
    }
  );

  const handleCreateNewModel = () => {
    CreateAIModelMutation.mutate();
  };

  const modelsListColumns = [
    {
      accessorKey: 'displayName',
      header: 'Display Name',
      cell: ({ row }: { row: { original: AIModelTableRow } }) => (
        <LinkButton
          kind="tertiary"
          size="medium"
          href={`/dashboard/${entityType}/${entitySlug}/aimodels/edit/${row.original.id}/details?tab=${navigationTab ?? 'draft'}`}
        >
          <span className="line-clamp-1 max-w-[280px]">
            {row.original.displayName}
          </span>
        </LinkButton>
      ),
    },
    // {
    //   accessorKey: 'name',
    //   header: 'Model Name',
    //   cell: ({ row }: { row: { original: AIModelTableRow } }) => (
    //     <Text className="line-clamp-1 max-w-[200px]" title={row.original.name}>
    //       {row.original.name}
    //     </Text>
    //   ),
    // },
    {
      accessorKey: 'modelType',
      header: 'Type',
      cell: ({ row }: { row: { original: AIModelTableRow } }) => (
        <Text className="text-xs">{row.original.modelType}</Text>
      ),
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row }: { row: { original: AIModelTableRow } }) => (
        <Text className="text-xs">{row.original.provider}</Text>
      ),
    },
    { accessorKey: 'createdAt', header: 'Date Created' },
    { accessorKey: 'updatedAt', header: 'Last Updated' },
    {
      accessorKey: 'delete',
      header: 'Delete',
      cell: ({ row }: { row: { original: AIModelTableRow } }) => (
        <IconButton
          size="medium"
          icon={Icons.delete}
          color="interactive"
          onClick={() => {
            DeleteAIModelMutation.mutate({
              id: row.original?.id,
            });
          }}
        >
          Delete
        </IconButton>
      ),
    },
  ];

  const generateTableData = (list: AIModelListItem[]) => {
    return list.map((item) => {
      return {
        id: item.id,
        displayName: item.displayName,
        name: item.name,
        modelType: item.modelType,
        provider: item.provider,
        status: item.status,
        createdAt: formatDate(item.createdAt ?? null) || '',
        updatedAt: formatDate(item.updatedAt ?? null) || '',
      };
    });
  };

  return (
    <>
      <div className="mt-8 flex h-full flex-col">
        <Navigation
          setNavigationTab={setNavigationTab}
          options={navigationOptions}
          currentValue={navigationTab ?? 'draft'}
        />

        {AllAIModels.data?.aiModels && AllAIModels.data.aiModels.length > 0 ? (
          <div className="mt-6">
            <ActionBar
              title={
                navigationOptions.find((item) => item.selected)?.label || ''
              }
              primaryAction={{
                content: 'Add New AI Model',
                onAction: handleCreateNewModel,
              }}
            />

            <DataTable
              columns={modelsListColumns}
              rows={generateTableData(AllAIModels.data?.aiModels ?? [])}
              hideSelection
              hideViewSelector
            />
          </div>
        ) : AllAIModels.isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="flex h-full w-full grow flex-col items-center justify-center">
              <div
                className={twMerge('h-100 flex flex-col items-center gap-4')}
              >
                <Icon
                  source={Icons.light}
                  color="interactive"
                  stroke={1}
                  size={80}
                />
                <Text variant="headingSm" color="subdued">
                  You have not added any AI models yet.
                </Text>
                <Button onClick={handleCreateNewModel}>Add New AI Model</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
