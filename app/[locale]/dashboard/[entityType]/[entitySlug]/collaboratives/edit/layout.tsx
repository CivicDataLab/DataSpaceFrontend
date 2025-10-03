'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { CollaborativeInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tab, TabList, Tabs, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import StepNavigation from '../../components/StepNavigation';
import TitleBar from '../../components/title-bar';
import { EditStatusProvider, useEditStatus } from './context';

const UpdateCollaborativeTitleMutation: any = graphql(`
  mutation updateCollaborativeTitle($data: CollaborativeInputPartial!) {
    updateCollaborative(data: $data) {
      __typename
      id
      title
    }
  }
`);

const FetchCollaborativeTitle: any = graphql(`
  query CollaborativeTitle($pk: ID!) {
    collaborative(pk: $pk) {
      id
      title
    }
  }
`);

const TabsAndChildren = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const layoutList = [
    'details',
    'contributors',
    'assign',
    'publish',
  ];

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const CollaborativeData: { data: any; isLoading: boolean; error: any; refetch: any } = useQuery(
    [`fetch_CollaborativeData_${params.id}`],
    () =>
      GraphQL(
        FetchCollaborativeTitle,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          pk: params.id,
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: CollaborativeInputPartial }) =>
      GraphQL(UpdateCollaborativeTitleMutation, {
        [params.entityType]: params.entitySlug,
      }, data),
    {
      onSuccess: () => {
        toast('Collaborative updated successfully');
        // Optionally, reset form or perform other actions
        CollaborativeData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const links = [
    {
      label: 'Collaborative Details',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/details`,
      selected: pathItem === 'details',
    },
    {
      label: 'Datasets',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/assign`,
      selected: pathItem === 'assign',
    },
    {
      label: 'Contributors',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/contributors`,
      selected: pathItem === 'contributors',
    },
    {
      label: 'Publish',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/publish`,
      selected: pathItem === 'publish',
    },
  ];

  const handleTabClick = (url: string) => {
    router.replace(url); // Navigate to the selected tab
  };

  const initialTabLabel =
    links.find((option) => option.selected)?.label || 'Collaborative Details';

  const { status, setStatus } = useEditStatus();

  // Debug logging
  console.log('Layout - params:', params);
  console.log('Layout - CollaborativeData:', CollaborativeData);
  console.log('Layout - isLoading:', CollaborativeData.isLoading);
  console.log('Layout - error:', CollaborativeData.error);
  console.log('Layout - data:', CollaborativeData.data);

  // Safely extract collaborative title - now using direct collaborative object
  const collaborativeTitle = CollaborativeData?.data?.collaborative?.title || '';

  console.log('Layout - collaborativeTitle:', collaborativeTitle);

  // Show loading state while fetching
  if (CollaborativeData.isLoading) {
    return (
      <div className="mt-8 flex h-full items-center justify-center">
        <div>Loading collaborative data...</div>
      </div>
    );
  }

  // Show error state if query failed
  if (CollaborativeData.error) {
    console.error('Collaborative query error:', CollaborativeData.error);
    return (
      <div className="mt-8 flex h-full flex-col items-center justify-center gap-4">
        <div className="text-red-600">Error loading collaborative data</div>
        <div className="text-sm text-gray-600">
          {CollaborativeData.error?.message || 'Unknown error'}
        </div>
        <div className="text-xs text-gray-500">
          Check console for details. ID: {params.id}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex h-full flex-col gap-6">
      <TitleBar
        label={'COLLABORATIVE NAME'}
        title={collaborativeTitle}
        goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/collaboratives`}
        onSave={(e) => mutate({ data: { title: e, id: params.id.toString() } })}
        loading={editMutationLoading}
        status={status}
        setStatus={setStatus}
      />
      <Tabs
        value={initialTabLabel}
        onValueChange={(newValue) =>
          handleTabClick(
            links.find((link) => link.label === newValue)?.url || ''
          )
        }
      >
        <TabList fitted border>
          {links.map((item, index) => (
            <Tab
              theme="dataSpace"
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
      <div className="">{children}</div>
      <div className="my-6">
        <StepNavigation
          steps={['details', 'assign', 'contributors', 'publish']}
        />
      </div>
    </div>
  );
};

const EditCollaborative = ({ children }: { children: React.ReactNode }) => {
  return (
    <EditStatusProvider>
      <TabsAndChildren>{children}</TabsAndChildren>
    </EditStatusProvider>
  );
};

export default EditCollaborative;
