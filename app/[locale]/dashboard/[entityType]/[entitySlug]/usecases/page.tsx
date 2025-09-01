'use client';

import { useEffect, use } from 'react';
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

const allUseCases: any = graphql(`
  query UseCasesData($filters: UseCaseFilter, $order: UseCaseOrder) {
    useCases(filters: $filters, order: $order) {
      title
      id
      created
      modified
    }
  }
`);

const deleteUseCase: any = graphql(`
  mutation deleteUseCase($useCaseId: String!) {
    deleteUseCase(useCaseId: $useCaseId)
  }
`);

const AddUseCase: any = graphql(`
  mutation Addusecase {
    addUseCase {
      __typename
      ... on TypeUseCase {
        id
        created
      }
    }
  }
`);

const unPublishUseCase: any = graphql(`
  mutation unPublishUseCaseMutation($useCaseId: String!) {
    unpublishUseCase(useCaseId: $useCaseId) {
      __typename
      ... on TypeUseCase {
        id
        title
        created
      }
    }
  }
`);

export default function DatasetPage(
  props: {
    params: Promise<{ entityType: string; entitySlug: string }>;
  }
) {
  const params = use(props.params);
  const router = useRouter();

  const [navigationTab, setNavigationTab] = useQueryState('tab', parseAsString);

  let navigationOptions = [
    {
      label: 'Drafts',
      url: `drafts`,
      selected: navigationTab === 'drafts',
    },
    {
      label: 'Published',
      url: `published`,
      selected: navigationTab === 'published',
    },
  ];

  const AllUseCases: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UseCases`],
    () =>
      GraphQL(
        allUseCases,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            status: navigationTab === 'published' ? 'PUBLISHED' : 'DRAFT',
          },
          order: { modified: 'DESC' },
        }
      )
  );

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('drafts');
    AllUseCases.refetch();
  }, [navigationTab]);

  const DeleteUseCaseMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_Usecase`],
    (data: { id: string }) =>
      GraphQL(
        deleteUseCase,
        {
          [params.entityType]: params.entitySlug,
        },
        { useCaseId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Deleted UseCase successfully`);
        AllUseCases.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const CreateUseCase: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_Usecase`],
    () =>
      GraphQL(
        AddUseCase,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      ),
    {
      onSuccess: (response: any) => {
        toast(`UseCase created successfully`);
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${response.addUseCase.id}/details`
        );
        AllUseCases.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );
  const UnpublishDatasetMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`unpublish_usecase`],
    (data: { id: string }) =>
      GraphQL(
        unPublishUseCase,
        {
          [params.entityType]: params.entitySlug,
        },
        { useCaseId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Unpublished usecase successfully`);
        AllUseCases.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );
  const datasetsListColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: any) =>
        navigationTab === 'published' ? (
          <Text
            className="line-clamp-1 max-w-[280px]"
            title={row.original.title}
          >
            {row.original.title}
          </Text>
        ) : (
          <LinkButton
            kind="tertiary"
            size="medium"
            href={`/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${row.original.id}/details`}
          >
            <span className="line-clamp-1 max-w-[280px]">
              {row.original.title}
            </span>
          </LinkButton>
        ),
    },
    { accessorKey: 'created', header: 'Date Created' },
    { accessorKey: 'modified', header: 'Date Modified' },
    {
      accessorKey: 'delete',
      header: 'Delete',
      cell: ({ row }: any) =>
        navigationTab === 'published' ? (
          <Button
            size="medium"
            kind="tertiary"
            onClick={() => {
              UnpublishDatasetMutation.mutate({
                id: row.original?.id,
              });
            }}
          >
            Unpublish
          </Button>
        ) : (
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="interactive"
            onClick={() => {
              DeleteUseCaseMutation.mutate({
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
    return list.map((item) => {
      return {
        title: item.title,
        id: item.id,
        created: formatDate(item.created),
        modified: formatDate(item.modified),
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

        {AllUseCases.data?.useCases.length > 0 ? (
          <div className="mt-6">
            <ActionBar
              title={
                navigationOptions.find((item) => item.selected)?.label || ''
              }
              primaryAction={{
                content: 'Add New UseCase',
                onAction: () => CreateUseCase.mutate(),
              }}
            />

            <DataTable
              columns={datasetsListColumns}
              rows={generateTableData(AllUseCases.data.useCases)}
              hideSelection
              hideViewSelector
            />
          </div>
        ) : AllUseCases.isLoading ? (
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
                {navigationTab === 'drafts' ? (
                  <>
                    <Text variant="headingSm" color="subdued">
                      You have not added any usecase yet.
                    </Text>
                    <Button onClick={() => CreateUseCase.mutate()}>
                      Add New UseCase
                    </Button>
                  </>
                ) : (
                  <Text variant="headingSm" color="subdued">
                    No Published UseCases yet.
                  </Text>
                )}
              </div>
            </div>
          </>
        )}

        {/* <Page /> */}
      </div>
    </>
  );
}
