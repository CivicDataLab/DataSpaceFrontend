'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { Tab, TabList, Tabs, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import StepNavigation from '../../components/StepNavigation';
import TitleBar from '../../components/title-bar';
import { EditStatusProvider, useEditStatus } from './context';

const UpdateAIModelNameMutation = graphql(`
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

const FetchAIModelName = graphql(`
  query AIModelName($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      displayName
      status
      isPublic
    }
  }
`);

const TabsAndChildren = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();

  const layoutList = ['details', 'versions', 'publish'];

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const AIModelData = useQuery(
    [
      `fetch_AIModelData`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
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
  const AIMODEL_TITLE_SUCCESS_TOAST_ID = 'aimodel-title-save-success';
  const AIMODEL_TITLE_ERROR_TOAST_ID = 'aimodel-title-save-error';

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
        toast('AI Model updated successfully',{id: AIMODEL_TITLE_SUCCESS_TOAST_ID});
        AIModelData.refetch();
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_AIModelForPublish`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_AIModelDetails`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
      },
      onError: (error: unknown) => {
        toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,{id: AIMODEL_TITLE_ERROR_TOAST_ID});
      },
    }
  );

  const sourceTab = searchParams.get('tab');

  const goBackURL =
    sourceTab === 'active'
      ? `/dashboard/${params.entityType}/${params.entitySlug}/aimodels?tab=active`
      : `/dashboard/${params.entityType}/${params.entitySlug}/aimodels`;

  const links = [
    {
      label: 'Metadata',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/details`,
      selected: pathItem === 'details',
    },
    {
      label: 'Version',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/versions`,
      selected: pathItem === 'versions',
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
        title={AIModelData?.data?.aiModels?.[0]?.displayName ?? ''}
        goBackURL={goBackURL}
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
          steps={['details', 'versions', 'publish']}
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
