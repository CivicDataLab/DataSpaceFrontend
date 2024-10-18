'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'next-usequerystate';
import { DataTable, IconButton, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { ActionBar } from '../../dashboard/organization/[organizationId]/dataset/components/action-bar';
import { Navigation } from '../../dashboard/organization/[organizationId]/dataset/components/navigate-org-datasets';
import { Content } from './components/Content';

const allUseCases: any = graphql(`
  query UseCasesData {
    useCases {
      title
      id
      created
      modified
    }
  }
`);

const deleteUseCase: any = graphql(`
  mutation deleteUseCase($data: NodeInput!) {
    deleteUseCase(data: $data) {
      __typename
      id
    }
  }
`);

export default function DatasetPage({
  params,
}: {
  params: { organizationId: string };
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

  const AllUseCases: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UseCases`],
    () => GraphQL(allUseCases, []),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
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
    (data: { id: string }) => GraphQL(deleteUseCase, { data: { id: data.id } }),
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

  const datasetsListColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
      // cell: ({ row }: any) => (
      // <LinkButton
      //   kind="tertiary"
      //   size="medium"
      //   href={`/dashboard/organization/${params.organizationId}/dataset/${row.original.id}/edit/resources`}
      // >
      // {row.original.title}
      // </LinkButton>
      // ),
    },
    { accessorKey: 'created', header: 'Date Created' },
    { accessorKey: 'modified', header: 'Date Modified' },
    {
      accessorKey: 'delete',
      header: 'Delete',
      cell: ({ row }: any) => {
        // Log the row for debugging purposes

        return (
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="interactive"
            onClick={() => {
              // Assuming DeleteUseCaseMutation is properly set up
              DeleteUseCaseMutation.mutate({
                id: row.original?.id,
              });
            }}
          >
            Delete
          </IconButton>
        );
      },
    },
  ];

  const generateTableData = (list: Array<any>) => {
    return list.map((item) => {
      return {
        title: item.title,
        id: item.id,
        created: new Date(item.created).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        modified: new Date(item.modified).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
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
                onAction: () => router.push(`/`),
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
          <Content params={params} />
        )}

        {/* <Page /> */}
      </div>
    </>
  );
}
