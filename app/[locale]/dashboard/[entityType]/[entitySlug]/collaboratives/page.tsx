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

const allCollaboratives: any = graphql(`
  query CollaborativesData($filters: CollaborativeFilter, $order: CollaborativeOrder) {
    collaboratives(filters: $filters, order: $order) {
      title
      id
      created
      modified
    }
  }
`);

const deleteCollaborative: any = graphql(`
  mutation deleteCollaborative($collaborativeId: String!) {
    deleteCollaborative(collaborativeId: $collaborativeId)
  }
`);

const AddCollaborative: any = graphql(`
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

const unPublishCollaborative: any = graphql(`
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

export default function CollaborativePage({
  params,
}: {
  params: { entityType: string; entitySlug: string };
}) {
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

  const AllCollaboratives: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_Collaboratives`],
    () =>
      GraphQL(
        allCollaboratives,
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
    AllCollaboratives.refetch();
  }, [navigationTab]);

  const DeleteCollaborativeMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_Collaborative`],
    (data: { id: string }) =>
      GraphQL(
        deleteCollaborative,
        {
          [params.entityType]: params.entitySlug,
        },
        { collaborativeId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Deleted Collaborative successfully`);
        AllCollaboratives.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const CreateCollaborative: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`create_Collaborative`],
    () =>
      GraphQL(
        AddCollaborative,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      ),
    {
      onSuccess: (response: any) => {
        toast(`Collaborative created successfully`);
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${response.addCollaborative.id}/details`
        );
        AllCollaboratives.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const UnpublishCollaborativeMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`unpublish_collaborative`],
    (data: { id: string }) =>
      GraphQL(
        unPublishCollaborative,
        {
          [params.entityType]: params.entitySlug,
        },
        { collaborativeId: data.id }
      ),
    {
      onSuccess: () => {
        toast(`Unpublished collaborative successfully`);
        AllCollaboratives.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const collaborativesListColumns = [
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
            href={`/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${row.original.id}/details`}
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

        {AllCollaboratives.data?.collaboratives.length > 0 ? (
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
              rows={generateTableData(AllCollaboratives.data.collaboratives)}
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
