'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { CollaborativeInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tab, TabList, Tabs, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import StepNavigation from '../../components/StepNavigation';
import TitleBar from '../../components/title-bar';
import { EditStatusProvider, useEditStatus } from './context';

const UpdateCollaborativeTitleMutation = graphql(`
  mutation updateCollaborativeTitle($data: CollaborativeInputPartial!) {
    updateCollaborative(data: $data) {
      __typename
      id
      title
    }
  }
`);

const FetchCollaborativeTitle = graphql(`
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
  const queryClient = useQueryClient();

  const layoutList = [
    'details',
    'contributors',
    'assign',
    'usecases',
    'publish',
  ];

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const CollaborativeData = useQuery(
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

  const COLLAB_EDIT_TOAST_ID = 'collaboratives-edit-toast';

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: CollaborativeInputPartial }) =>
      GraphQL(
        UpdateCollaborativeTitleMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        toast('Collaborative updated successfully', {
          id: COLLAB_EDIT_TOAST_ID,
        });
        queryClient.invalidateQueries({
          queryKey: [`fetch_CollaborativeData_${params.id}`],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeData_details`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeDetails`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
      },
      onError: (error: unknown) => {
        toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`, { id: COLLAB_EDIT_TOAST_ID });
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
      label: 'Use Cases',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/usecases`,
      selected: pathItem === 'usecases',
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

  // Safely extract collaborative title - now using direct collaborative object
  const collaborativeTitle =
    CollaborativeData?.data?.collaborative?.title || '';

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
          {CollaborativeData.error instanceof Error
            ? CollaborativeData.error.message
            : 'Unknown error'}
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
          steps={['details', 'assign', 'usecases', 'contributors', 'publish']}
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
