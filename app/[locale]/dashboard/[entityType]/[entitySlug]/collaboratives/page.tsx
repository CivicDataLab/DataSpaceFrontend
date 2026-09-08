'use client';

import { graphql } from '@/gql';
import { CollaborativeStatus, Ordering } from '@/gql/generated/graphql';
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

interface CollaborativeListItem {
  id: string;
  title?: string | null;
  created?: string | null;
  modified?: string | null;
}

interface CollaborativeTableRow {
  id: string;
  title?: string | null;
  created: string;
  modified: string;
}

const allCollaboratives = graphql(`
  query CollaborativesData(
    $filters: CollaborativeFilter
    $order: CollaborativeOrder
  ) {
    collaboratives(filters: $filters, order: $order) {
      title
      id
      created
      modified
    }
  }
`);

const deleteCollaborative = graphql(`
  mutation deleteCollaborative($collaborativeId: String!) {
    deleteCollaborative(collaborativeId: $collaborativeId)
  }
`);

const AddCollaborative = graphql(`
  mutation AddCollaborative {
    addCollaborative {
      __typename
      ... on TypeCollaborative {
        id
        created
      }
    }
  }
`);

const unPublishCollaborative = graphql(`
  mutation unPublishCollaborativeMutation($collaborativeId: String!) {
    unpublishCollaborative(collaborativeId: $collaborativeId) {
      __typename
      ... on TypeCollaborative {
        id
        title
        created
      }
    }
  }
`);

export default function CollaborativePage() {
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

  const AllCollaboratives =
    useQuery(
      [
        'fetch_Collaboratives',
        entityType,
        entitySlug,
        navigationTab ?? 'drafts',
      ],
      () =>
        GraphQL(allCollaboratives, ownerArgs || {}, {
          filters: {
            status: navigationTab === 'published' ? CollaborativeStatus.Published : CollaborativeStatus.Draft,
          },
          order: { modified: Ordering.Desc },
        }),
      { enabled: isValidParams }
    );

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('drafts');
    if (isValidParams) {
      AllCollaboratives.refetch();
    }
  }, [navigationTab, isValidParams, AllCollaboratives, setNavigationTab]);

  const COLLAB_LIST_TOAST_ID = 'collaboratives-list-toast';

  const DeleteCollaborativeMutation = useMutation(
    [`delete_Collaborative`],
    (data: { id: string }) =>
      GraphQL(deleteCollaborative, ownerArgs || {}, {
        collaborativeId: data.id,
      }),
    {
      onSuccess: () => {
        toast(`Deleted Collaborative successfully`, { id: COLLAB_LIST_TOAST_ID });
        if (isValidParams) {
          AllCollaboratives.refetch();
        }
      },
      onError: (err: unknown) => {
        toast('Error:  ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0], { id: COLLAB_LIST_TOAST_ID });
      },
    }
  );

  const CreateCollaborative = useMutation(
    [`create_Collaborative`],
    () => GraphQL(AddCollaborative, ownerArgs || {}),
    {
      onSuccess: (response) => {
        toast(`Collaborative created successfully`, { id: COLLAB_LIST_TOAST_ID });
        if (isValidParams && entityType && entitySlug) {
          const created = response.addCollaborative;
          const createdId = 'id' in created ? created.id : undefined;
          router.push(
            `/dashboard/${entityType}/${entitySlug}/collaboratives/edit/${createdId}/details`
          );
          AllCollaboratives.refetch();
        }
      },
      onError: (err: unknown) => {
        toast('Error:  ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0], { id: COLLAB_LIST_TOAST_ID });
      },
    }
  );

  const UnpublishCollaborativeMutation = useMutation(
    [`unpublish_collaborative`],
    (data: { id: string }) =>
      GraphQL(unPublishCollaborative, ownerArgs || {}, {
        collaborativeId: data.id,
      }),
    {
      onSuccess: () => {
        toast(`Unpublished collaborative successfully`, { id: COLLAB_LIST_TOAST_ID });
        if (isValidParams) {
          AllCollaboratives.refetch();
        }
      },
      onError: (err: unknown) => {
        toast('Error:  ' + (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : String(err)).split(':')[0], { id: COLLAB_LIST_TOAST_ID });
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

  const collaborativesListColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: { row: { original: CollaborativeTableRow } }) =>
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
            href={`/dashboard/${entityType}/${entitySlug}/collaboratives/edit/${row.original.id}/details`}
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
      cell: ({ row }: { row: { original: CollaborativeTableRow } }) =>
        navigationTab === 'published' ? (
          <Button
            size="medium"
            kind="tertiary"
            onClick={() => {
              UnpublishCollaborativeMutation.mutate({
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
              DeleteCollaborativeMutation.mutate({
                id: row.original?.id,
              });
            }}
          >
            Delete
          </IconButton>
        ),
    },
  ];

  const generateTableData = (list: CollaborativeListItem[]) => {
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

        {AllCollaboratives.data?.collaboratives && AllCollaboratives.data.collaboratives.length > 0 ? (
          <div className="mt-6">
            <ActionBar
              title={
                navigationOptions.find((item) => item.selected)?.label || ''
              }
              primaryAction={{
                content: 'Add New Collaborative',
                onAction: () => CreateCollaborative.mutate(),
              }}
            />

            <DataTable
              columns={collaborativesListColumns}
              rows={generateTableData(AllCollaboratives.data?.collaboratives ?? [])}
              hideSelection
              hideViewSelector
            />
          </div>
        ) : AllCollaboratives.isLoading ? (
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
                      You have not added any collaborative yet.
                    </Text>
                    <Button onClick={() => CreateCollaborative.mutate()}>
                      Add New Collaborative
                    </Button>
                  </>
                ) : (
                  <Text variant="headingSm" color="subdued">
                    No Published Collaboratives yet.
                  </Text>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
