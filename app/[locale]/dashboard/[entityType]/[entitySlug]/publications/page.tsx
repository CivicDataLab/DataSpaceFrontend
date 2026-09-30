'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { Button, DataTable, Icon, IconButton, Text, toast } from 'opub-ui';
import { twMerge } from 'tailwind-merge';

import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ActionBar } from '../dataset/components/action-bar';
import { Navigation } from '../dataset/components/navigate-org-datasets';
import { errorText, mutationMessage } from './model';
import {
  createPublicationMutation,
  deletePublicationMutation,
  publicationListQuery,
  unpublishPublicationMutation,
} from './queries';

interface PublicationListItem {
  id: string;
  title?: string | null;
  status?: string | null;
  created?: string | null;
  modified?: string | null;
}

export default function PublicationsPage() {
  const router = useRouter();
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const isValidParams =
    typeof entityType === 'string' && typeof entitySlug === 'string';
  const ownerArgs = isValidParams ? { [entityType]: entitySlug } : {};
  const [navigationTab, setNavigationTab] = useQueryState('tab', parseAsString);

  const listQuery = useQuery(
    ['dashboard_publications', entityType, entitySlug, navigationTab ?? 'drafts'],
    () =>
      GraphQL(publicationListQuery, ownerArgs, {
        pagination: { limit: 100, offset: 0 },
      }),
    { enabled: isValidParams }
  );

  useEffect(() => {
    if (navigationTab == null) setNavigationTab('drafts');
  }, [navigationTab, setNavigationTab]);

  const deleteMutation = useMutation(
    (id: string) => GraphQL(deletePublicationMutation, ownerArgs, { publicationId: id }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.deletePublication,
          'Could not delete the publication.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Publication deleted');
        void listQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not delete the publication.'));
      },
    }
  );

  const unpublishMutation = useMutation(
    (id: string) =>
      GraphQL(unpublishPublicationMutation, ownerArgs, { publicationId: id }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.unpublishPublication,
          'Could not unpublish the publication.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Publication unpublished');
        void listQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not unpublish the publication.'));
      },
    }
  );

  const createMutation = useMutation(
    () =>
      GraphQL(createPublicationMutation, ownerArgs, {
        input: {},
      }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.createPublication,
          'Could not create the publication.'
        );
        const id = result.createPublication?.data?.id;
        if (message || !id || !entityType || !entitySlug) {
          toast(message || 'Could not create the publication.');
          return;
        }
        toast('Publication created successfully');
        void listQuery.refetch();
        router.push(
          `/dashboard/${entityType}/${entitySlug}/publications/edit/${id}/files`
        );
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not create the publication.'));
      },
    }
  );

  if (!isValidParams) return null;

  const navigationOptions = [
    { label: 'Drafts', url: 'drafts', selected: navigationTab !== 'published' },
    {
      label: 'Published',
      url: 'published',
      selected: navigationTab === 'published',
    },
  ];
  const publishedTab = navigationTab === 'published';
  const rows = (listQuery.data?.publications ?? []).filter((item) =>
    publishedTab
      ? item.status === 'PUBLISHED'
      : item.status !== 'PUBLISHED'
  );

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: { row: { original: PublicationListItem } }) =>
        publishedTab ? (
          <Text className="line-clamp-1 max-w-[280px]" title={row.original.title ?? undefined}>
            {row.original.title}
          </Text>
        ) : (
          <LinkButton
            kind="tertiary"
            size="medium"
            href={`/dashboard/${entityType}/${entitySlug}/publications/edit/${row.original.id}/files`}
          >
            <span className="line-clamp-1 max-w-[280px]">
              {row.original.title || 'Untitled Publication'}
            </span>
          </LinkButton>
        ),
    },
    { accessorKey: 'created', header: 'Date Created' },
    { accessorKey: 'modified', header: 'Date Modified' },
    {
      accessorKey: 'delete',
      header: publishedTab ? 'Unpublish' : 'Delete',
      cell: ({ row }: { row: { original: PublicationListItem } }) =>
        publishedTab ? (
          <Button
            size="medium"
            kind="tertiary"
            onClick={() => unpublishMutation.mutate(row.original.id)}
          >
            Unpublish
          </Button>
        ) : (
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="interactive"
            onClick={() => deleteMutation.mutate(row.original.id)}
          >
            Delete
          </IconButton>
        ),
    },
  ];

  const tableRows = rows.map((item) => ({
    title: item.title,
    id: item.id,
    status: item.status,
    created: formatDate(item.created ?? null) || '',
    modified: formatDate(item.modified ?? null) || '',
  }));

  return (
    <div className="mt-8 flex h-full flex-col">
      <Navigation
        setNavigationTab={setNavigationTab}
        options={navigationOptions}
      />
      {rows.length > 0 ? (
        <div className="mt-6">
          <ActionBar
            title={publishedTab ? 'Published' : 'Drafts'}
            isLoading={createMutation.isLoading}
            primaryAction={{
              content: 'Add New Publication',
              onAction: () => createMutation.mutate(),
            }}
          />
          <DataTable columns={columns} rows={tableRows} hideSelection hideViewSelector />
        </div>
      ) : listQuery.isLoading ? (
        <Loading />
      ) : (
        <div className="flex h-full w-full grow flex-col items-center justify-center">
          <div className={twMerge('h-100 flex flex-col items-center gap-4')}>
            <Icon source={Icons.publication} color="interactive" stroke={1} size={80} />
            {publishedTab ? (
              <Text variant="headingSm" color="subdued">
                No published publications yet.
              </Text>
            ) : (
              <>
                <Text variant="headingSm" color="subdued">
                  You have not added any publication yet.
                </Text>
                <Button
                  loading={createMutation.isLoading}
                  onClick={() => createMutation.mutate()}
                >
                  Add New Publication
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
