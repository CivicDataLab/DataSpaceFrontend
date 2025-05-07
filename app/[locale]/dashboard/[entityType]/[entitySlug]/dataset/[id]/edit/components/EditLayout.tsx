'use client';

import { graphql } from '@/gql';
import { UpdateDatasetInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  Tab,
  TabList,
  Tabs,
  toast
} from 'opub-ui';
import { ReactNode, useEffect, useState } from 'react';

import { GraphQL } from '@/lib/api';
import TitleBar from '../../../../components/title-bar';
import { useDatasetEditStatus } from '../context';

const datasetQueryDoc: any = graphql(`
  query datasetTitleQuery($filters: DatasetFilter) {
    datasets(filters: $filters) {
      id
      title
      created
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

const layoutList = ['metadata', 'access', 'charts', 'resources', 'publish'];

export function EditLayout({ children, params }: LayoutProps) {
  // const { data } = useQuery([`dataset_layout_${params.id}`], () =>
  //   GraphQL(datasetQueryDoc, { dataset_id: Number(params.id) })
  // );

  const pathName = usePathname();
  const routerParams = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const [editMode, setEditMode] = useState(false);

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
      onSuccess: (data: any) => {
        // queryClient.invalidateQueries({
        //   queryKey: [`create_dataset_${'52'}`],
        // });

        setEditMode(false);

        getDatasetTitleRes.refetch();
      },
      onError: (err: any) => {
        toast(err.message.split(':')[0]);
      },
    }
  );

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const { status, setStatus } = useDatasetEditStatus();

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
          onSave={(e) =>
            updateDatasetTitleMutation.mutate({
              updateDatasetInput: {
                dataset: routerParams.id,
                title: e.title,
                tags: [],
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
          />
        </div>
        <div className="bg-surface border-l-divider rounded-tl-none  my-6  flex-grow">
          {children}
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
}: {
  id: string;
  pathItem: string;
  organization: string;
  entityType: string;
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
      label: 'Resources',
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
    {
      label: 'Charts',
      id: 'charts',
      url: `/dashboard/${entityType}/${organization}/dataset/${id}/edit/charts?type=list`,
      // selected: pathItem === 'charts',
    },

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
    url: string;
    // selected: boolean;
  }) => {
    if (item.label !== selectedTab) {
      setSelectedTab(item.label);
      router.replace(item.url);
    }
  };

  useEffect(() => {
    setSelectedTab(pathItem); // Update selected tab on path change
  }, [pathItem]);

  return (
    <div>
      <Tabs value={selectedTab}>
        <TabList fitted>
          {links.map((item, index) => (
            <Tab
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
