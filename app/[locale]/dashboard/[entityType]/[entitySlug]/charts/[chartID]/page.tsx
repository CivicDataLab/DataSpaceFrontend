'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Select, Tab, TabList, Tabs, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import TitleBar from '../../components/title-bar';

const getResourceChartImageDetailsDoc: any = graphql(`
  query getResourceChartImageDetails($imageId: UUID!) {
    resourceChartImage(imageId: $imageId) {
      description
      dataset {
        id
        title
        slug
      }
      id
      name
      image {
        name
        path
        size
        url
        width
        height
      }
      status
    }
  }
`);

const ChartDetails = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    chartID: string;
  }>();

  const searchParams = useSearchParams();

  const chartPreviewType = searchParams.get('type');

  const getResourceChartDetailsRes: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
    isError: boolean;
  } = useQuery([`getResourceChartImageDetails_${params.chartID}`], () =>
    GraphQL(
      getResourceChartImageDetailsDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      {
        imageId: params.chartID,
      }
    )
  );

  return (
    <div>
      <TitleBar
        label={'Chart Name'}
        title={'Chart name from the server'}
        goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/charts`}
        onSave={(val: any) => {
          console.log(val);
        }}
        loading={false}
        status={'success'}
        setStatus={() => {}}
      />

      <div className="border-t-2 border-solid border-greyExtralight pt-8">
        {chartPreviewType === 'TypeResourceChartImage' ? (
          <ChartImagePreview />
        ) : (
          <ChartGenPreview />
        )}
      </div>
    </div>
  );
};

export default ChartDetails;

const ChartImagePreview = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Image
        src=""
        alt="Chart Image"
        width={500}
        height={500}
        className="rounded-4 border-1 border-solid border-greyExtralight"
      />
      <Button kind="primary">Publish Chart</Button>
    </div>
  );
};

const ChartGenPreview = () => {
  type TabValue = 'DATA' | 'CUSTOMIZE';
  const [selectedTab, setSelectedTab] = useState<TabValue>('DATA');

  const handleTabClick = (item: { label: string; id: TabValue }) => {
    setSelectedTab(item.id);
  };

  return (
    <div className="flex flex-row justify-center gap-6">
      <div className="flex flex-[7] justify-center">
        <Image
          src=""
          alt="Chart Image"
          className="w-full rounded-4 border-1 border-solid border-greyExtralight object-contain"
        />
      </div>
      <div className="flex flex-[3] flex-col rounded-4 border-2 border-solid border-greyExtralight p-3">
        <Tabs value={selectedTab}>
          <TabList fitted border>
            <Tab
              theme="dataSpace"
              value="DATA"
              onClick={() => handleTabClick({ label: 'DATA', id: 'DATA' })}
            >
              DATA
            </Tab>
            <Tab
              theme="dataSpace"
              value="CUSTOMIZE"
              onClick={() =>
                handleTabClick({ label: 'CUSTOMIZE', id: 'CUSTOMIZE' })
              }
            >
              CUSTOMIZE
            </Tab>
          </TabList>
        </Tabs>

        {selectedTab === 'DATA' ? (
          <div>
            <Select
              name="selectDataset"
              label="Select Dataset"
              options={[]}
              required
            />
            <Select
              name="selectResource"
              label="Select Resource"
              options={[]}
              required
            />
            <Select
              name="selectChartType"
              label="Select Chart Type"
              options={[]}
              required
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};
