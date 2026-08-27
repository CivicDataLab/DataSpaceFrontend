'use client';

import { graphql } from '@/gql';
import { UpdateDatasetInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Tab, TabList, Tabs, toast } from 'opub-ui';
import { ReactNode, useEffect, useState } from 'react';

import { GraphQL } from '@/lib/api';
import StepNavigation from '../../../../components/StepNavigation';
import TitleBar from '../../../../components/title-bar';
import { useDatasetEditStatus } from '../context';

const datasetQueryDoc: any = graphql(`
  query datasetTitleQuery($filters: DatasetFilter) {
    datasets(filters: $filters) {
      id
      title
      created
      datasetType
    }
  }
`);

const updateDatasetTitleMutationDoc: any = graphql(`
  mutation SaveTitle($updateDatasetInput: UpdateDatasetInput!) {
    updateDataset(updateDatasetInput: $updateDatasetInput) {
      __typename
      ... on TypeDataset {
        id
        title
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

interface LayoutProps {
  children?: ReactNode;
  params: { id: string };
}

const layoutList = ['metadata', 'resources', 'publish'];

export function EditLayout({ children, params }: LayoutProps) {
  const DATASET_TITLE_SAVE_ERROR_TOAST_ID = 'dataset-title-save-error';
  const getErrorMessage = (
    err: any,
    fallback: string
  ) =>
    typeof err?.message === 'string' && err.message.trim()
      ? err.message.trim()
      : fallback;

  // const { data } = useQuery([`dataset_layout_${params.id}`], () =>
  //   GraphQL(datasetQueryDoc, { dataset_id: Number(params.id) })
  // );

  const pathName = usePathname();
  const routerParams = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const [, setEditMode] = useState(false);

  const getDatasetTitleRes: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`dataset_title_${routerParams.id}`], () =>
      GraphQL(
        datasetQueryDoc,
        {
          [routerParams.entityType]: routerParams.entitySlug,
        },
        {
          filters: {
            id: routerParams.id,
          },
        }
      )
    );

  const updateDatasetTitleMutation = useMutation(
    (data: { updateDatasetInput: UpdateDatasetInput }) =>
      GraphQL(
        updateDatasetTitleMutationDoc,
        {
          [routerParams.entityType]: routerParams.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        // queryClient.invalidateQueries({
        //   queryKey: [`create_dataset_${'52'}`],
        // });

        setEditMode(false);

        getDatasetTitleRes.refetch();
      },
      onError: (err: any) => {
        toast(getErrorMessage(err, 'Unable to update dataset title right now.'), {
          id: DATASET_TITLE_SAVE_ERROR_TOAST_ID,
        });
      },
    }
  );

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const { status, setStatus, runBeforeNavigateHandler } = useDatasetEditStatus();

  // if not from the layoutList, return children
  if (!pathItem) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full flex-col lg:mt-8">
      {getDatasetTitleRes.isLoading ? (
        <></>
      ) : (
        <TitleBar
          label={'DATASET NAME'}
          title={getDatasetTitleRes?.data?.datasets[0]?.title}
          goBackURL={`/dashboard/${routerParams.entityType}/${routerParams.entitySlug}/dataset`}
          onSave={(val) =>
            updateDatasetTitleMutation.mutate({
              updateDatasetInput: {
                dataset: routerParams.id,
                title: val,
              },
            })
          }
          loading={updateDatasetTitleMutation.isLoading}
          status={status}
          setStatus={setStatus}
        />
      )}
      <div className="lg:flex-column mt-4 flex flex-col">
        <div>
          <Navigation
            id={params.id}
            pathItem={pathItem}
            organization={routerParams.entitySlug.toString()}
            entityType={routerParams.entityType.toString()}
            isPromptDataset={getDatasetTitleRes?.data?.datasets?.[0]?.datasetType === 'PROMPT'}
          />
        </div>
        <div className="bg-surface border-l-divider rounded-tl-none  my-6  flex-grow">
          {children}
        </div>
      <div>
        <StepNavigation
          steps={['metadata', 'resources', 'publish']}
          onBeforeNavigate={runBeforeNavigateHandler}
        />
      </div>
      </div>
    </div>
  );
}

const Navigation = ({
  id,
  pathItem,
  organization,
  entityType,
  isPromptDataset,
}: {
  id: string;
  pathItem: string;
  organization: string;
  entityType: string;
  isPromptDataset?: boolean;
}) => {
  const router = useRouter();

  let links = [
    {
      label: 'Metadata',
      id: 'metadata',
      url: `/dashboard/${entityType}/${organization}/dataset/${id}/edit/metadata`,
      // selected: pathItem === 'metadata',
    },
    {
      label: isPromptDataset ? 'Prompt Files' : 'Data Files',
      id: 'resources',
      url: `/dashboard/${entityType}/${organization}/dataset/${id}/edit/resources`,
      // selected: pathItem === 'resources',
    },
    ...(process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true'
      ? [
          {
            label: 'Access Models',
            id: 'access',
            url: `/dashboard/${entityType}/${organization}/dataset/${id}/edit/access?list=true`,
            // selected: pathItem === 'access',
          },
        ]
      : []),
    // {
    //   label: 'Charts',
    //   id: 'charts',
    //   url: `/dashboard/${entityType}/${organization}/dataset/${id}/edit/charts?type=list`,
    //   // selected: pathItem === 'charts',
    // },

    {
      label: 'Publish',
      id: 'publish',
      url: `/dashboard/${entityType}/${organization}/dataset/${id}/edit/publish`,
      // selected: pathItem === 'publish',
    },
  ];

  const [selectedTab, setSelectedTab] = useState(pathItem || 'distributions');

  const handleTabClick = (item: {
    label: string;
    id: string;
    url: string;
    // selected: boolean;
  }) => {
    if (item.id !== selectedTab) {
      setSelectedTab(item.id);
      router.replace(item.url);
    }
  };

  useEffect(() => {
    setSelectedTab(pathItem); // Update selected tab on path change
  }, [pathItem]);

  return (
    <div>
      <Tabs value={selectedTab}>
        <TabList fitted border>
          {links.map((item, index) => (
            <Tab
              theme="dataSpace"
              value={item.id}
              key={index}
              onClick={() => handleTabClick(item)}
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  );
};
