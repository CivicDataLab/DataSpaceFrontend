'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Tab, TabList, Tabs, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import StepNavigation from '../../components/StepNavigation';
import TitleBar from '../../components/title-bar';
import { EditStatusProvider, useEditStatus } from './context';

const UpdateAIModelNameMutation: any = graphql(`
  mutation updateAIModelName($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        displayName
      }
    }
  }
`);

const FetchAIModelName: any = graphql(`
  query AIModelName($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      displayName
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

  const layoutList = ['details', 'endpoints', 'configuration', 'publish'];

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const AIModelData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_AIModelData`],
    () =>
      GraphQL(
        FetchAIModelName,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: parseInt(params.id),
          },
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { displayName: string }) =>
      GraphQL(
        UpdateAIModelNameMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            id: parseInt(params.id),
            displayName: data.displayName,
          },
        }
      ),
    {
      onSuccess: () => {
        toast('AI Model updated successfully');
        AIModelData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const links = [
    {
      label: 'Model Details',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/details`,
      selected: pathItem === 'details',
    },
    {
      label: 'Endpoints',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/endpoints`,
      selected: pathItem === 'endpoints',
    },
    {
      label: 'Configuration',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/configuration`,
      selected: pathItem === 'configuration',
    },
    {
      label: 'Publish',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/publish`,
      selected: pathItem === 'publish',
    },
  ];

  const handleTabClick = (url: string) => {
    router.replace(url);
  };

  const initialTabLabel =
    links.find((option) => option.selected)?.label || 'Model Details';

  const { status, setStatus } = useEditStatus();

  // Map our status to TitleBar's expected status
  const titleBarStatus: 'loading' | 'success' =
    status === 'saving' ? 'loading' : 'success';

  const handleStatusChange = (s: 'loading' | 'success') => {
    setStatus(s === 'loading' ? 'saving' : 'saved');
  };

  return (
    <div className="mt-8 flex h-full flex-col gap-6">
      <TitleBar
        label={'AI MODEL NAME'}
        title={AIModelData?.data?.aiModels[0]?.displayName}
        goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/aimodels`}
        onSave={(e) => mutate({ displayName: e })}
        loading={editMutationLoading}
        status={titleBarStatus}
        setStatus={handleStatusChange}
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
          steps={['details', 'endpoints', 'configuration', 'publish']}
        />
      </div>
    </div>
  );
};

const EditAIModel = ({ children }: { children: React.ReactNode }) => {
  return (
    <EditStatusProvider>
      <TabsAndChildren>{children}</TabsAndChildren>
    </EditStatusProvider>
  );
};

export default EditAIModel;
