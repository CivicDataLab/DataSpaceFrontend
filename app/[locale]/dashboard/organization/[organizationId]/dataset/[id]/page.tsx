'use client';

import React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { usePRouter } from '@/hooks/use-prouter';
import { Divider, Icon, Tab, TabList, TabPanel, Tabs, Text } from 'opub-ui';

import { testDataset } from '@/config/dashboard';
import { Icons } from '@/components/icons';
import { InProgress } from '@/components/in-progress';
import { ActionBar } from '../components/action-bar';
import { UploadResource } from '../components/upload-resources';

export default function Page({ params }: { params: { id: string } }) {
  const router = usePRouter();
  // React.useEffect(() => {
  //   router.prefetch(`/dashboard/dataset/${params.id}/edit`);
  // }, []);

  // get demo data

  const param = useParams<{ organizationId: string }>();

  const DATASET_INFO = {
    title: 'Untitled',
    timestamp: '20 March 2023 - 10:30AM',
  };

  const TabsList = [
    {
      value: 'Resources',
      label: 'Resources',
      component: <UploadResource />,
    },
    {
      value: 'Access Models',
      label: 'Access Models',
      component: <UploadResource />,
    },
    {
      value: 'Dataset Metadata',
      label: 'Dataset Metadata',
      component: <UploadResource />,
    },
    {
      value: 'Publish',
      label: 'Publish',
      component: <UploadResource />,
    },
  ];
  // const data = testDataset[params.id];
  // if (!data) {
  //   notFound();
  // }

  return (
    <div className="flex h-full flex-col">
      {/* <ActionBar
        title={data.name}
        primaryAction={{
          content: 'Add New Dataset',
          onAction: () => router.push(`/dashboard/dataset/${params.id}/edit`),
        }}
      /> */}
      <div className="flex justify-between py-5">
        <div className="flex items-center gap-4">
          <Text variant="headingSm" color="subdued">
            DATASET NAME :
            <b>
              {DATASET_INFO.title} - {DATASET_INFO.timestamp}
            </b>
          </Text>
          <Text
            variant="headingSm"
            className="flex items-center"
            color="interactive"
          >
            <Icon source={Icons.pencil} size={16} color="interactive" />
            edit
          </Text>
        </div>
        <Link href={`/dashboard/organization/${param.organizationId}/dataset`}>
          <Text className="flex gap-1" color="interactive">
            Go back to Drafts{' '}
            <Icon source={Icons.cross} size={20} color="interactive" />
          </Text>
        </Link>
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
          {TabsList.map((item, index) => (
            <TabPanel value={item.value} key={index}>
              {item.component}
            </TabPanel>
          ))}
        </Tabs>
      </div>
      {/* <InProgress /> */}
    </div>
  );
}
