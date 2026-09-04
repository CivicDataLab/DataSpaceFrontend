'use client';

import { graphql } from '@/gql';
import { Ordering, UseCaseStatus } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { Button, DataTable, Icon, IconButton, Text, toast } from 'opub-ui';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ActionBar } from '../dataset/components/action-bar';
import { Navigation } from '../dataset/components/navigate-org-datasets';

interface UseCaseListItem {
  id: string;
  title?: string | null;
  created?: string | null;
  modified?: string | null;
}

interface UseCaseTableRow {
  id: string;
  title?: string | null;
  created: string;
  modified: string;
}

const allUseCases = graphql(`
  query UseCasesData($filters: UseCaseFilter, $order: UseCaseOrder) {
    useCases(filters: $filters, order: $order) {
      title
      id
      created
      modified
    }
  }
`);

const deleteUseCase = graphql(`
  mutation deleteUseCase($useCaseId: String!) {
    deleteUseCase(useCaseId: $useCaseId)
  }
`);

const AddUseCase = graphql(`
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

const unPublishUseCase = graphql(`
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

export default function DatasetPage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;

  const isValidParams =
    typeof entityType === 'string' && typeof entitySlug === 'string';

  const ownerArgs: Record<string, string> | null = isValidParams
    ? { [entityType]: entitySlug }
    : null;

  const [navigationTab, setNavigationTab] = useQueryState('tab', parseAsString);

  const AllUseCases = useQuery(
    [`fetch_UseCases`, entityType, entitySlug, navigationTab ?? 'drafts'],
    () =>
      GraphQL(
        allUseCases,
        ownerArgs || {},
        {
          filters: {
            status: navigationTab === 'published' ? UseCaseStatus.Published : UseCaseStatus.Draft,
          },
          order: { modified: Ordering.Desc },
        }
      ),
    { enabled: isValidParams }
  );

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('drafts');
    if (isValidParams) {
      AllUseCases.refetch();
    }
  }, [navigationTab, isValidParams, setNavigationTab, AllUseCases]);

  const DeleteUseCaseMutation = useMutation(
    [`delete_Usecase`],
    (data: { id: string }) =>
      GraphQL(
        deleteUseCase,
        ownerArgs || {},
        { useCaseId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Deleted UseCase successfully`);
        if (isValidParams) {
          AllUseCases.refetch();
        }
      },
      onError: (err: unknown) => {
        toast('Error:  ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0]);
      },
    }
  );

  const CreateUseCase = useMutation(
    [`delete_Usecase`],
    () => GraphQL(AddUseCase, ownerArgs || {}),
    {
      onSuccess: (response) => {
        toast(`UseCase created successfully`);
        if (isValidParams && entityType && entitySlug) {
          const created = response.addUseCase;
          const createdId = 'id' in created ? created.id : undefined;
          router.push(
            `/dashboard/${entityType}/${entitySlug}/usecases/edit/${createdId}/details`
          );
          AllUseCases.refetch();
        }
      },
      onError: (err: unknown) => {
        toast('Error:  ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0]);
      },
    }
  );
  const UnpublishDatasetMutation = useMutation(
    [`unpublish_usecase`],
    (data: { id: string }) =>
      GraphQL(
        unPublishUseCase,
        ownerArgs || {},
        { useCaseId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Unpublished usecase successfully`);
        if (isValidParams) {
          AllUseCases.refetch();
        }
      },
      onError: (err: unknown) => {
        toast('Error:  ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0]);
      },
    }
  );

  if (!isValidParams) {
    return null;
  }

  const navigationOptions = [
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
  const datasetsListColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: { row: { original: UseCaseTableRow } }) =>
        navigationTab === 'published' ? (
          <Text
            className="line-clamp-1 max-w-[280px]"
            title={row.original.title ?? undefined}
          >
            {row.original.title}
          </Text>
        ) : (
          <LinkButton
            kind="tertiary"
            size="medium"
            href={`/dashboard/${entityType}/${entitySlug}/usecases/edit/${row.original.id}/details`}
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
      cell: ({ row }: { row: { original: UseCaseTableRow } }) =>
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

  const generateTableData = (list: UseCaseListItem[]) => {
    return list.map((item) => {
      return {
        title: item.title,
        id: item.id,
        created: formatDate(item.created ?? null) || '',
        modified: formatDate(item.modified ?? null) || '',
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

        {AllUseCases.data?.useCases && AllUseCases.data.useCases.length > 0 ? (
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
              rows={generateTableData(AllUseCases.data?.useCases ?? [])}
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
