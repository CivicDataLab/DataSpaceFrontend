'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'next-usequerystate';
import { Button, DataTable, IconButton, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';
import { Navigation } from './components/navigate-org-datasets';

const allDatasetsQueryDoc: any = graphql(`
  query allDatasetsQuery($filters: DatasetFilter, $order: DatasetOrder) {
    datasets(filters: $filters, order: $order) {
      title
      id
      created
      modified
    }
  }
`);

const createDatasetMutationDoc: any = graphql(`
  mutation GenerateDatasetName {
    addDataset {
      success
      errors {
        fieldErrors {
          messages
        }
      }
      data {
        id
        title
        created
      }
    }
  }
`);

const deleteDatasetMutationDoc: any = graphql(`
  mutation deleteDatasetMutation($datasetId: UUID!) {
    deleteDataset(datasetId: $datasetId)
  }
`);

const unPublishDataset: any = graphql(`
  mutation unPublishDatasetMutation($datasetId: UUID!) {
    unPublishDataset(datasetId: $datasetId) {
      __typename
      ... on TypeDataset {
        id
        title
        created
      }
    }
  }
`);

export default function DatasetPage({
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

  const AllDatasetsQuery: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`fetch_datasets_org_dashboard`], () =>
      GraphQL(
        allDatasetsQueryDoc,
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
    AllDatasetsQuery.refetch();
  }, [navigationTab]);

  const DeleteDatasetMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_dataset`],
    (data: { datasetId: string }) =>
      GraphQL(
        deleteDatasetMutationDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { datasetId: data.datasetId }
      ),
    {
      onSuccess: () => {
        toast(`Deleted dataset successfully`);
        AllDatasetsQuery.refetch();
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );
  const CreateDatasetMutation: { mutate: any; isLoading: boolean; error: any } =
    useMutation(
      () =>
        GraphQL(
          createDatasetMutationDoc,
          {
            [params.entityType]: params.entitySlug,
          },
          []
        ),
      {
        onSuccess: (data: any) => {
          if (data.addDataset.success) {
            toast('Dataset created successfully!');

            router.push(
              `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${data?.addDataset?.data?.id}/edit/metadata`
            );
          } else {
            toast(
              'Error: ' + data.addDataset.errors.fieldErrors[0].messages[0]
            );
          }
        },
      }
    );
  const UnpublishDatasetMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`unpublish_dataset`],
    (data: { datasetId: string }) =>
      GraphQL(
        unPublishDataset,
        {
          [params.entityType]: params.entitySlug,
        },
        { datasetId: data.datasetId }
      ),
    {
      onSuccess: () => {
        toast(`Unpublished dataset successfully`);
        AllDatasetsQuery.refetch();
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
          <Text title={row.original.title}>{row.original.title}</Text>
        ) : (
          <LinkButton
            kind="tertiary"
            size="medium"
            href={`/dashboard/${params.entityType}/${params.entitySlug}/dataset/${row.original.id}/edit/metadata`}
          >
            {row.original.title}
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
                datasetId: row.original?.id,
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
              DeleteDatasetMutation.mutate({
                datasetId: row.original?.id,
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

        {AllDatasetsQuery.data?.datasets.length > 0 ? (
          <div className="mt-6">
            <ActionBar
              title={
                navigationOptions.find((item) => item.selected)?.label || ''
              }
              primaryAction={{
                content: 'Add New Dataset',
                onAction: () => CreateDatasetMutation.mutate(),
              }}
            />

            <DataTable
              columns={datasetsListColumns}
              rows={generateTableData(AllDatasetsQuery.data.datasets)}
              hideSelection
              hideViewSelector
            />
          </div>
        ) : AllDatasetsQuery.isLoading ? (
          <Loading />
        ) : (
          <Content params={params} />
        )}

        {/* <Page /> */}
      </div>
    </>
  );
}
