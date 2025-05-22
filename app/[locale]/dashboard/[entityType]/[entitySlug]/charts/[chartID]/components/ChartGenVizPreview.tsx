import { useState } from 'react';
import Image from 'next/image';
import { Select, Tab, TabList, Tabs } from 'opub-ui';

import TitleBar from '../../../components/title-bar';

const ChartGenVizPreview = ({ params }: { params: any }) => {
  type TabValue = 'DATA' | 'CUSTOMIZE';
  const [selectedTab, setSelectedTab] = useState<TabValue>('DATA');

  const handleTabClick = (item: { label: string; id: TabValue }) => {
    setSelectedTab(item.id);
  };

  return (
    <div>
      <TitleBar
        label={'Chart Name'}
        title={'Placeholder'}
        goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/charts`}
        onSave={(val: any) => {
          console.log(val);
        }}
        loading={false}
        status={'success'}
        setStatus={() => {}}
      />

      <div className="border-t-2 border-solid border-greyExtralight pt-8">
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
      </div>
    </div>
  );
};

export default ChartGenVizPreview;
