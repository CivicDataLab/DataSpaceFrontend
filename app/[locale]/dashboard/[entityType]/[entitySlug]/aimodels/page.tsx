'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'next-usequerystate';
import { Button, DataTable, Icon, IconButton, Text, toast } from 'opub-ui';
import { twMerge } from 'tailwind-merge';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { ActionBar } from '../dataset/components/action-bar';
import { Navigation } from '../dataset/components/navigate-org-datasets';

const allAIModels: any = graphql(`
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

const deleteAIModel: any = graphql(`
  mutation deleteAIModel($modelId: Int!) {
    deleteAiModel(modelId: $modelId) {
      success
    }
  }
`);

const createAIModel: any = graphql(`
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

export default function AIModelsPage({
  params,
}: {
  params: { entityType: string; entitySlug: string };
}) {
  const router = useRouter();

  const [navigationTab, setNavigationTab] = useQueryState('tab', parseAsString);

  let navigationOptions = [
    {
      label: 'Registered',
      url: `registered`,
      selected: navigationTab === 'registered',
    },
    {
      label: 'Active',
      url: `active`,
      selected: navigationTab === 'active',
    },
    {
      label: 'Approved',
      url: `approved`,
      selected: navigationTab === 'approved',
    },
  ];

  const AllAIModels: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_AIModels`, navigationTab],
    () =>
      GraphQL(
        allAIModels,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            status:
              navigationTab === 'active'
                ? 'ACTIVE'
                : navigationTab === 'approved'
                  ? 'APPROVED'
                  : 'REGISTERED',
          },
          order: { updatedAt: 'DESC' },
        }
      )
  );

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('registered');
    AllAIModels.refetch();
  }, [navigationTab]);

  const DeleteAIModelMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_AIModel`],
    (data: { id: number }) =>
      GraphQL(
        deleteAIModel,
        {
          [params.entityType]: params.entitySlug,
        },
        { modelId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Deleted AI Model successfully`);
        AllAIModels.refetch();
      },
      onError: (err: any) => {
        toast('Error: ' + err.message.split(':')[0]);
      },
    }
  );

  const CreateAIModel: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`create_AIModel`],
    () =>
      GraphQL(
        createAIModel,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            name: 'new-model',
            displayName: 'New Model',
            description: 'A new AI model',
            modelType: 'TEXT_GENERATION',
            provider: 'CUSTOM',
          },
        }
      ),
    {
      onSuccess: (response: any) => {
        toast(`AI Model created successfully`);
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${response.createAiModel.data.id}/details`
        );
        AllAIModels.refetch();
      },
      onError: (err: any) => {
        toast('Error: ' + err.message.split(':')[0]);
      },
    }
  );

  const modelsListColumns = [
    {
      accessorKey: 'displayName',
      header: 'Display Name',
      cell: ({ row }: any) => (
        <LinkButton
          kind="tertiary"
          size="medium"
          href={`/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${row.original.id}/details`}
        >
          <span className="line-clamp-1 max-w-[280px]">
            {row.original.displayName}
          </span>
        </LinkButton>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Model Name',
      cell: ({ row }: any) => (
        <Text className="line-clamp-1 max-w-[200px]" title={row.original.name}>
          {row.original.name}
        </Text>
      ),
    },
    {
      accessorKey: 'modelType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Text className="text-xs">{row.original.modelType}</Text>
      ),
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row }: any) => (
        <Text className="text-xs">{row.original.provider}</Text>
      ),
    },
    { accessorKey: 'createdAt', header: 'Date Created' },
    { accessorKey: 'updatedAt', header: 'Last Updated' },
    {
      accessorKey: 'delete',
      header: 'Delete',
      cell: ({ row }: any) => (
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

  const generateTableData = (list: Array<any>) => {
    return list.map((item: any) => {
      return {
        id: item.id,
        displayName: item.displayName,
        name: item.name,
        modelType: item.modelType,
        provider: item.provider,
        status: item.status,
        createdAt: formatDate(item.createdAt),
        updatedAt: formatDate(item.updatedAt),
      };
    });
  };

  return (
    <>
      <div className="mt-8 flex h-full flex-col">
        <Navigation
          setNavigationTab={setNavigationTab}
          options={navigationOptions}
        />

        {AllAIModels.data?.aiModels.length > 0 ? (
          <div className="mt-6">
            <ActionBar
              title={
                navigationOptions.find((item) => item.selected)?.label || ''
              }
              primaryAction={{
                content: 'Add New AI Model',
                onAction: () => CreateAIModel.mutate(),
              }}
            />

            <DataTable
              columns={modelsListColumns}
              rows={generateTableData(AllAIModels.data.aiModels)}
              hideSelection
              hideViewSelector
            />
          </div>
        ) : AllAIModels.isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="flex h-full w-full grow flex-col items-center justify-center">
              <div className={twMerge('h-100 flex flex-col items-center gap-4')}>
                <Icon
                  source={Icons.light}
                  color="interactive"
                  stroke={1}
                  size={80}
                />
                <Text variant="headingSm" color="subdued">
                  You have not added any AI models yet.
                </Text>
                <Button onClick={() => CreateAIModel.mutate()}>
                  Add New AI Model
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
