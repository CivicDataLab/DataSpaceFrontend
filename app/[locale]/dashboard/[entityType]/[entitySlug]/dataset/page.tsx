'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { Button, DataTable, IconButton, Text, toast } from 'opub-ui';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { Loading } from '@/components/loading';
import { useTourTrigger } from '@/hooks/use-tour-trigger';
import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';
import { DatasetType, DatasetTypeModal } from './components/dataset-type-modal';
import { Navigation } from './components/navigate-org-datasets';

const allDatasetsQueryDoc: any = graphql(`
  query allDatasetsQuery($filters: DatasetFilter, $order: DatasetOrder) {
    datasets(filters: $filters, order: $order) {
      title
      id
      created
      modified
      datasetType
    }
  }
`);

const createDatasetMutationDoc: any = graphql(`
  mutation GenerateDatasetName($createInput: CreateDatasetInput) {
    addDataset(createInput: $createInput) {
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
        datasetType
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

export default function DatasetPage() {
  useTourTrigger(true, 1500);
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
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const AllDatasetsQuery: { data: any; isLoading: boolean; refetch: any } =
    useQuery(
      [
        `fetch_datasets_org_dashboard`,
        entityType,
        entitySlug,
        navigationTab ?? 'drafts',
      ],
      () =>
        GraphQL(allDatasetsQueryDoc, ownerArgs || {}, {
          filters: {
            status: navigationTab === 'published' ? 'PUBLISHED' : 'DRAFT',
          },
          order: { modified: 'DESC' },
        }),
      { enabled: isValidParams }
    );

  useEffect(() => {
    if (navigationTab === null || navigationTab === undefined)
      setNavigationTab('drafts');
    if (isValidParams) {
      AllDatasetsQuery.refetch();
    }
  }, [navigationTab, isValidParams, AllDatasetsQuery, setNavigationTab]);

  const DeleteDatasetMutation: {
    mutate: any;
    isLoading: boolean;
    error: any;
  } = useMutation(
    [`delete_dataset`],
    (data: { datasetId: string }) =>
      GraphQL(deleteDatasetMutationDoc, ownerArgs || {}, {
        datasetId: data.datasetId,
      }),
    {
      onSuccess: () => {
        toast(`Deleted dataset successfully`);
        if (isValidParams) {
          AllDatasetsQuery.refetch();
        }
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );
  const CreateDatasetMutation: { mutate: any; isLoading: boolean; error: any } =
    useMutation(
      (datasetType: DatasetType) =>
        GraphQL(createDatasetMutationDoc, ownerArgs || {}, {
          createInput: { datasetType },
        }),
      {
        onSuccess: (data: any) => {
          setIsTypeModalOpen(false);
          if (data.addDataset.success) {
            toast('Dataset created successfully!');
            if (isValidParams && entityType && entitySlug) {
              const datasetId = data?.addDataset?.data?.id;
              // Route to edit page - prompt datasets will show additional fields there
              router.push(
                `/dashboard/${entityType}/${entitySlug}/dataset/${datasetId}/edit/metadata`
              );
            }
          } else {
            toast('Error: ' + data.addDataset.errors.fieldErrors[0].messages[0]);
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
      GraphQL(unPublishDataset, ownerArgs || {}, { datasetId: data.datasetId }),
    {
      onSuccess: () => {
        toast(`Unpublished dataset successfully`);
        if (isValidParams) {
          AllDatasetsQuery.refetch();
        }
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  if (!isValidParams) {
    return null;
  }

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
            href={`/dashboard/${entityType}/${entitySlug}/dataset/${row.original.id}/edit/metadata`}
          >
            {row.original.title}
          </LinkButton>
        ),
    },
    {
      accessorKey: 'datasetType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Text>{row.original.datasetType === 'PROMPT' ? 'Prompt' : 'Data'}</Text>
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
        datasetType: item.datasetType,
        created: formatDate(item.created) || '',
        modified: formatDate(item.modified) || '',
      };
    });
  };

  return (
    <>
      <div className="mt-8 flex h-full flex-col">
        <Navigation
          setNavigationTab={setNavigationTab}
          options={navigationOptions}
          data-tour="sidebar"
        />

        {AllDatasetsQuery.data?.datasets.length > 0 ? (
          <div className="mt-6">
            <ActionBar
              title={
                navigationOptions.find((item) => item.selected)?.label || ''
              }
              primaryAction={{
                content: 'Add New Dataset',
                onAction: () => setIsTypeModalOpen(true),
              }}
              data-tour="create-dataset"
            />

            <DataTable
              columns={datasetsListColumns}
              rows={generateTableData(AllDatasetsQuery.data.datasets)}
              hideSelection
              hideViewSelector
              data-tour="my-datasets"
            />
          </div>
        ) : AllDatasetsQuery.isLoading ? (
          <Loading />
        ) : (
          <Content />
        )}

        {/* <Page /> */}
      </div>

      {/* Dataset Type Selection Modal */}
      <DatasetTypeModal
        open={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelect={(type: DatasetType) => CreateDatasetMutation.mutate(type)}
        isLoading={CreateDatasetMutation.isLoading}
      />
    </>
  );
}
