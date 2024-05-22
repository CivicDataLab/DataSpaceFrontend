'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'next-usequerystate';
import { DataTable, IconButton, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';
import { Navigation } from './components/navigate-org-datasets';

const allDatasetsQueryDoc: any = graphql(`
  query allDatasetsQuery($filters: DatasetFilter) {
    datasets(filters: $filters) {
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
      __typename
      ... on TypeDataset {
        id
        created
      }
      ... on OperationInfo {
        messages {
          kind
          message
        }
      }
    }
  }
`);

const deleteDatasetMutationDoc: any = graphql(`
  mutation deleteDatasetMutation($datasetId: UUID!) {
    deleteDataset(datasetId: $datasetId)
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
      label: 'Under Moderation',
      url: `under-moderation`,
      selected: navigationTab === 'under-moderation',
    },
    {
      label: 'Needs Review',
      url: `needs-review`,
      selected: navigationTab === 'needs-review',
    },
    {
      label: 'Published',
      url: `published`,
      selected: navigationTab === 'published',
    },
  ];

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('drafts');
  }, [navigationTab]);

  const AllDatasetsQuery: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`fetch_datasets_org_dashboard`], () =>
      GraphQL(allDatasetsQueryDoc, [])
    );

  const DeleteDatasetMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_dataset`],
    (data: { datasetId: string }) =>
      GraphQL(deleteDatasetMutationDoc, { datasetId: data.datasetId }),
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
    useMutation(() => GraphQL(createDatasetMutationDoc, []), {
      onSuccess: (data: any) => {
        router.push(
          `/dashboard/organization/${params.organizationId}/dataset/${data?.addDataset?.id}/edit/resources`
        );
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    });

  const datasetsListColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: any) => (
        <LinkButton
          kind="tertiary"
          size="medium"
          href={`/dashboard/organization/${params.organizationId}/dataset/${row.original.id}/edit/resources`}
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
      cell: ({ row }: any) => (
        <IconButton
          size="medium"
          icon={Icons.delete}
          color="interactive"
          onClick={() =>
            DeleteDatasetMutation.mutate({
              datasetId: row.original?.dataset?.id,
            })
          }
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
          <Content />
        )}

        {/* <Page /> */}
      </div>
    </>
  );
}
