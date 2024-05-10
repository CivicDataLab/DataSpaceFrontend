'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Icon,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tray,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { data as datainfo } from '../data';
import AccessModels from './components/AccessModels';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Resources from './components/Resources';
import Visualization from './components/Visualizations';

const datasetQuery = graphql(`
  query datasets($filters: DatasetFilter) {
    datasets(filters: $filters) {
      tags
      id
      title
      description
      created
      modified
      metadata {
        metadataItem {
          id
          label
        }
        value
      }
      resources {
        id
        created
        modified
        type
        name
        description
      }
    }
  }
`);

const DatasetDetailsPage = () => {
  const [open, setOpen] = useState(false);
  const primaryDataRef = useRef<HTMLDivElement>(null); // Explicitly specify the type of ref
  const [primaryDataHeight, setPrimaryDataHeight] = useState(0);

  const params = useParams();

  const { data, isLoading } = useQuery([`${params.datasetIdentifier}`], () =>
    GraphQL(datasetQuery, { filters: { id: params.datasetIdentifier } })
  );

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
      component: <Resources />,
    },
    {
      label: 'Access Models',
      value: 'accessmodels',
      component: <AccessModels />,
    },
    {
      label: 'Visualizations',
      value: 'visualizations',
      component: <Visualization data={datainfo[1].visualization} />,
    },
  ];
  const [activeTab, setActiveTab] = useState('resources'); // State to manage active tab

  const barOptions = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        name: 'Sales',
        color: 'rgb(55,162,218)',
      },
    ],
  };

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
        <div className="w-full flex-grow  py-11 lg:w-9/12">
          <div className="mx-6 block flex flex-col gap-5  ">
            <div ref={primaryDataRef} className="flex flex-col gap-4">
              {isLoading ? (
                <div className=" mt-8 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <PrimaryData data={data && data?.datasets[0]} />
              )}
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
                {isLoading ? (
                  <div className=" mt-8 flex justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <Metadata
                    data={data && data?.datasets[0]}
                    setOpen={setOpen}
                  />
                )}
              </Tray>
            </div>
            <div className="mt-5">
              <Tabs defaultValue={activeTab} key={activeTab}>
                <TabList fitted>
                  {TabsList.map((item, index) => (
                    <Tab
                      value={item.value}
                      key={index}
                      onClick={(e) => setActiveTab(item.value)} // Update active tab on click
                    >
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
            <BarChart options={barOptions} height={'250px'} />
            <Button
              kind="tertiary"
              onClick={() => setActiveTab('visualizations')}
            >
              Visualizations
            </Button>
          </div>
          {isLoading ? (
            <div className=" mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              <Metadata data={data && data?.datasets[0]} />
            </div>
          )}

          <div className=" mx-auto">
            <Image width={200} height={200} src={'/obi.jpg'} alt="Org Logo" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default DatasetDetailsPage;
