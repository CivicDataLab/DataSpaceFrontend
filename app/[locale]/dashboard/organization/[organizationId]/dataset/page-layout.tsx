'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Divider,
  Icon,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';

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

export const Page = () => {
  const params = useParams();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    () => GraphQL(createDatasetMutationDoc, []),
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({
          queryKey: [`create_dataset_${'52'}`],
        });

        router.push(
          `/dashboard/organization/${params.organizationId}/dataset/${data?.addDataset?.id}/edit/distribution`
        );
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const DATASET_INFO = {
    title: 'Untitled',
    timestamp: '20 March 2023 - 10:30AM',
  };

  const TabsList = [
    {
      value: 'Resources',
      label: 'Resources',
    },
    {
      value: 'Access Models',
      label: 'Access Models',
    },
    {
      value: 'Dataset Metadata',
      label: 'Dataset Metadata',
    },
    {
      value: 'Publish',
      label: 'Publish',
    },
  ];

  // React.useEffect(() => {
  //   router.prefetch('/dashboard/dataset/new');
  // }, []);

  return (
    <>
      {/* <ActionBar
        title="My Datasets"
        primaryAction={{
          content: 'Add New Dataset',
          onAction: () => {
            mutate();
          },
        }}
        isLoading={isLoading}
      /> */}
      <div className="flex justify-between py-5">
        <div className="flex items-center gap-4">
          <Text variant="headingSm" color="subdued">
            DATASET NAME : {DATASET_INFO.title} - {DATASET_INFO.timestamp}
          </Text>
          <Text variant="headingSm" className="flex items-center gap-1" color="interactive">
            <Icon
              source={Icons.datasetSettings}
              size={16}
              color="interactive"
            />
            edit
          </Text>
        </div>

        <Text className="flex gap-1" color="interactive">
          Go back to Drafts{' '}
          <Icon source={Icons.cross} size={20} color="interactive" />
        </Text>
      </div>
      <Divider />

      <div className="mt-5">
        <Tabs defaultValue="Resources">
          <TabList fitted>
            {TabsList.map((item, index) => (
              <Tab value={item.value} key={index}>
                {item.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </div>

      <Content />
    </>
  );
};
