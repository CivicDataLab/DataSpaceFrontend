'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { UpdateDatasetInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Divider,
  Form,
  FormLayout,
  Icon,
  Input,
  Spinner,
  Tab,
  TabList,
  Tabs,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

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
  children?: React.ReactNode;
  params: { id: string };
}

const layoutList = ['metadata', 'access', 'charts', 'resources', 'publish'];

export function EditLayout({ children, params }: LayoutProps) {
  // const { data } = useQuery([`dataset_layout_${params.id}`], () =>
  //   GraphQL(datasetQueryDoc, { dataset_id: Number(params.id) })
  // );

  const pathName = usePathname();
  const routerParams = useParams();

  const [editMode, setEditMode] = useState(false);

  const orgParams = useParams<{ organizationId: string }>();

  const getDatasetTitleRes: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`dataset_title_${routerParams.id}`], () =>
      GraphQL(datasetQueryDoc, {
        filters: {
          id: routerParams.id,
        },
      })
    );

  const updateDatasetTitleMutation = useMutation(
    (data: { updateDatasetInput: UpdateDatasetInput }) =>
      GraphQL(updateDatasetTitleMutationDoc, data),
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

  // if not from the layoutList, return children
  if (!pathItem) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full flex-col lg:mt-8">
      {getDatasetTitleRes.isLoading ? (
        <div className="flex flex-row items-center justify-center">
          <Spinner size={24} />
        </div>
      ) : (
        <Header
          dataset={getDatasetTitleRes?.data?.datasets[0]}
          orgId={orgParams.organizationId}
          saveTitle={updateDatasetTitleMutation.mutate}
          editMode={editMode}
          setEditMode={setEditMode}
        />
      )}
      <div className="lg:flex-column mt-4 flex flex-col">
        <div>
          <Navigation
            id={params.id}
            pathItem={pathItem}
            organization={routerParams.organizationId.toString()}
          />
        </div>
        <div className="bg-surface shadow-card border-l-divider rounded-tl-none  my-6  flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}

const Header = ({ dataset, orgId, saveTitle, editMode, setEditMode }: any) => {
  return (
    <>
      <div className="mb-3 flex flex-wrap-reverse items-center justify-between gap-4 md:gap-4 lg:flex-nowrap lg:gap-12">
        {!editMode ? (
          <div className="flex items-center gap-4">
            <Text variant="headingSm" color="subdued">
              DATASET NAME : <b>{dataset?.title}</b>
            </Text>
            <Button
              kind="tertiary"
              icon={
                <Icon source={Icons.pencil} size={16} color="interactive" />
              }
              onClick={() => setEditMode(true)}
            >
              edit
            </Button>
          </div>
        ) : (
          <div className="flex-grow">
            <Form
              onSubmit={(values: any) =>
                saveTitle({
                  updateDatasetInput: {
                    dataset: dataset.id,
                    title: values.title,
                    description: '',
                    tags: [],
                  },
                })
              }
            >
              <FormLayout>
                <div className="flex flex-wrap items-center gap-4">
                  <Text variant="headingSm" color="subdued">
                    DATASET NAME :
                  </Text>
                  <div className="flex-grow">
                    <Input
                      name="title"
                      labelHidden
                      label="Datset Title"
                      defaultValue={
                        dataset?.title !== ''
                          ? dataset?.title
                          : `Untitled - ${new Date(
                              dataset?.created
                            ).toLocaleDateString('en-IN', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}`
                      }
                    />
                  </div>
                  <div className="flex flex-row gap-4">
                    <Button submit kind="primary">
                      Save
                    </Button>

                    <Button kind="tertiary" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </FormLayout>
            </Form>
          </div>
        )}

        <Link href={`/dashboard/organization/${orgId}/dataset`}>
          <Text className="flex gap-1" color="interactive">
            Go back to Drafts{' '}
            <Icon source={Icons.cross} size={20} color="interactive" />
          </Text>
        </Link>
      </div>
      <Divider />
    </>
  );
};

const Navigation = ({
  id,
  pathItem,
  organization,
}: {
  id: string;
  pathItem: string;
  organization: string;
}) => {
  let links = [
    {
      label: 'Resources',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/resources`,
      selected: pathItem === 'resources',
    },
    ...(process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true'
      ? [
          {
            label: 'Access Models',
            url: `/dashboard/organization/${organization}/dataset/${id}/edit/access?list=true`,
            selected: pathItem === 'access',
          },
        ]
      : []),
    {
      label: 'Charts',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/charts?type=list`,
      selected: pathItem === 'charts',
    },
    {
      label: 'Metadata',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/metadata`,
      selected: pathItem === 'metadata',
    },
    {
      label: 'Publish',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/publish`,
      selected: pathItem === 'publish',
    },
  ];

  const router = useRouter();

  const handleTabClick = (url: string) => {
    router.replace(url);
  };

  const initialTabLabel =
    links.find((option) => option.selected)?.label || 'Distributions';

  return (
    <div>
      <Tabs defaultValue={initialTabLabel}>
        <TabList fitted>
          {links.map((item, index) => (
            <Tab
              value={item.label}
              key={index}
              onClick={() => handleTabClick(item.url)}
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  );
};
