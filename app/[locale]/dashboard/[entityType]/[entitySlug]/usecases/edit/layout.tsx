'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tab, TabList, Tabs, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import TitleBar from '../../components/title-bar';
import { EditStatusProvider, useEditStatus } from './context';

const UpdateUseCaseTitleMutation: any = graphql(`
  mutation updateUseCaseTitle($data: UseCaseInputPartial!) {
    updateUseCase(data: $data) {
      __typename
      id
      title
    }
  }
`);

const FetchUseCaseTitle: any = graphql(`
  query UseCaseTitle($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
    }
  }
`);

const TabsAndChildren = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams();

  const layoutList = ['details', 'contributors', 'assign', 'publish'];

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });
  const UseCaseData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UseCaseData`],
    () =>
      GraphQL(
        FetchUseCaseTitle,
        {},
        {
          filters: {
            id: params.id,
          },
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );
  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: UseCaseInputPartial }) =>
      GraphQL(UpdateUseCaseTitleMutation, {}, data),
    {
      onSuccess: () => {
        toast('Use case updated successfully');
        // Optionally, reset form or perform other actions
        UseCaseData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const links = [
    {
      label: 'Use Case Details',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/details`,
      selected: pathItem === 'details',
    },
    {
      label: 'Datasets',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/assign`,
      selected: pathItem === 'assign',
    },
    {
      label: 'Contributors',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/contributors`,
      selected: pathItem === 'contributors',
    },
    {
      label: 'Publish',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/publish`,
      selected: pathItem === 'publish',
    },
  ];

  const handleTabClick = (url: string) => {
    router.replace(url); // Navigate to the selected tab
  };

  const initialTabLabel =
    links.find((option) => option.selected)?.label || 'Details';

  const { status, setStatus } = useEditStatus();

  return (
    <div className="mt-8 flex h-full flex-col gap-6">
      <TitleBar
        label={'USE CASE NAME'}
        title={UseCaseData?.data?.useCases[0]?.title}
        goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/usecases`}
        onSave={(e) => mutate({ data: { title: e, id: params.id.toString() } })}
        loading={editMutationLoading}
        status={status}
        setStatus={setStatus}
      />
      <Tabs defaultValue={initialTabLabel}>
        <TabList fitted>
          {links.map((item, index) => (
            <Tab
              value={item.label}
              key={index}
              onClick={() => handleTabClick(item.url)}
              className="uppercase"
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <div className="bg-surface border-l-divider rounded-tl-none flex-grow">
        {children}
      </div>
    </div>
  );
};

const EditUseCase = ({ children }: { children: React.ReactNode }) => {
  return (
    <EditStatusProvider>
      <TabsAndChildren>{children}</TabsAndChildren>
    </EditStatusProvider>
  );
};

export default EditUseCase;
