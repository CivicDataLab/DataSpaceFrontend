'use client';

import React, { useState } from 'react';
import { Button, Icon, Tab, TabList, TabPanel, Tabs, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { data } from '../data';
import AccessModels from './components/AccessModels';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Resources from './components/Resources';

const DatasetDetailsPage = () => {
  const DatasetInfo = data[1];
  const [open, setOpen] = useState(false);

  const TabsList = [
    {
      label: 'Resources',
      value: 'resources',
      component: <Resources data={data[1].resources} />,
    },
    {
      label: 'Access Models',
      value: 'accessmodels',
      component: <AccessModels data={data[1].accessModels} />,
    },
  ];
  return (
    <main className="mx-5 flex gap-8">
      <div className="w-full bg-surfaceDefault py-5 shadow-basicMd lg:w-9/12">
        {' '}
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            { href: '/datasets', label: 'Dataset Listing' },
            { href: '#', label: 'Dataset Details' },
          ]}
        />
        <div className="mx-6 block flex flex-col gap-5 py-6 md:mx-14 lg:mx-14">
          <PrimaryData data={DatasetInfo} />
          <div
            className="sm:block md:block lg:hidden"
            title="About the Dataset"
          >
            <Tray
              size="narrow"
              open={open}
              onOpenChange={setOpen}
              trigger={
                <>
                  <Button
                    kind="tertiary"
                    className="lg:hidden"
                    onClick={(e) => setOpen(true)}
                  >
                    <Icon source={Icons.info} size={24} color="default" />
                  </Button>
                </>
              }
            >
              <Metadata data={DatasetInfo} setOpen={setOpen} />
            </Tray>
          </div>
          <div className="mt-5">
            <Tabs defaultValue="resources">
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
        </div>
      </div>
      <div className="hidden pt-16 lg:block">
        <Metadata data={DatasetInfo} />
      </div>
    </main>
  );
};

export default DatasetDetailsPage;
