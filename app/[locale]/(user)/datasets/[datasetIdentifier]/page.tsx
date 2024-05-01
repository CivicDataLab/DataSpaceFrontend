'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Icon, Tab, TabList, TabPanel, Tabs, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { data } from '../data';
import AccessModels from './components/AccessModels';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Resources from './components/Resources';
import Visualization from './components/Visualizations';

const DatasetDetailsPage = () => {
  const DatasetInfo = data[1];
  const [open, setOpen] = useState(false);
  const primaryDataRef = useRef<HTMLDivElement>(null); // Explicitly specify the type of ref
  const [primaryDataHeight, setPrimaryDataHeight] = useState(0);

  useEffect(() => {
    if (primaryDataRef.current) {
      const height = primaryDataRef.current.clientHeight;
      setPrimaryDataHeight(height);
    }
  }, [primaryDataRef]);

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
    {
      label: 'Visualizations',
      value: 'visualizations',
      component: <Visualization data={data[1].visualization} />,
    },
  ];

  return (
    <main className=" bg-surfaceDefault">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/datasets', label: 'Dataset Listing' },
          { href: '#', label: 'Dataset Details' },
        ]}
      />
      <div className="flex w-full gap-7 md:px-10 lg:px-10">
        <div className="w-full py-11  lg:w-9/12">
          <div className="mx-6 block flex flex-col gap-5  ">
            <div ref={primaryDataRef} className="flex flex-col gap-4">
              <PrimaryData data={DatasetInfo} />
            </div>
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
        <div className="hidden flex-col gap-8 border-l-2 border-solid border-baseGraySlateSolid3 pl-7 pt-6 lg:flex lg:w-1/5">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image
              src={'/visualization.svg'}
              width={primaryDataHeight + 60}
              height={primaryDataHeight + 40} // Set height dynamically
              alt={'Organization Logo'}
              // sizes="100vw"
              // style={{ width: '80%' }}
            />
            <Link className="text-actionPrimaryInteractivePressed" href={'#'}>
              Visualizations
            </Link>
          </div>
          <div>
            <Metadata data={DatasetInfo} />
          </div>
          <div className=" mx-auto">
            <Image width={200} height={200} src={'/obi.jpg'} alt="Org Logo" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default DatasetDetailsPage;
