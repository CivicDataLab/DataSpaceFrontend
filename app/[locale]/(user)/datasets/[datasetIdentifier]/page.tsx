'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Icon,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  Text,
  Tray,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import AccessModels from './components/AccessModels';
import Details from './components/Details';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Resources from './components/Resources';

const datasetQuery = graphql(`
  query datasets($filters: DatasetFilter) {
    datasets(filters: $filters) {
      tags {
        id
        value
      }
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
      label: 'Details',
      value: 'details',
      component: <Details />,
    },
    ...(process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true'
      ? [
          {
            label: 'Access Models',
            value: 'accessmodels',
            component: <AccessModels />,
          },
        ]
      : []),
    {
      label: 'Resources',
      value: 'resources',
      component: <Resources />,
    },
  ];

  const [activeTab, setActiveTab] = useState('details'); // State to manage active tab
  const CarouselInfo = [
    {
      image: '/c1.png',
      title: 'Know your High Court Judges (Khoj) Datasets - Justice Hub',
      tag: 'Blog',
    },
    {
      image: '/c1.png',
      title: 'Know your High Court Judges (Khoj) Datasets - Justice Hub',
      tag: 'News Article',
    },
    {
      image: '/og.png',
      title: 'Know your High Court Judges (Khoj) Datasets - Justice Hub',
      tag: 'REsearch Paper',
    },
    {
      image: '/c1.png',
      title: 'Know your High Court Judges (Khoj) Datasets - Justice Hub',
      tag: 'Blog',
    },
    {
      image: '/c1.png',
      title: 'Know your High Court Judges (Khoj) Datasets - Justice Hub',
      tag: 'News Article',
    },
    {
      image: '/og.png',
      title: 'Know your High Court Judges (Khoj) Datasets - Justice Hub',
      tag: 'REsearch Paper',
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
        <div className="w-full flex-grow  py-10 lg:w-9/12">
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
        <div className=" hidden flex-col gap-8 border-l-2 border-solid border-baseGraySlateSolid3 py-6 pl-7 lg:flex lg:w-1/5">
          {isLoading ? (
            <div className=" mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              <Metadata data={data && data?.datasets[0]} />
            </div>
          )}
        </div>
      </div>
      {activeTab === 'details' && (
        <>
          <div className="mx-6 grid py-10 md:px-10 lg:px-10">
            <Text className=" font-semi-bold" variant="heading2xl">
              Other things related to the dataset
            </Text>
            <Text>
              Blogs, research papers, etc which have used this dataset
            </Text>
          </div>
          <div style={{ width: '90vw' }} className="mx-6 md:px-4 lg:px-4">
            <Carousel className="mt-7 flex  items-center  ">
              <CarouselPrevious />
              <CarouselContent>
                {CarouselInfo.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3 "
                  >
                    <div className="flex w-fit flex-col gap-6 rounded-2 border-2 border-solid border-baseGraySlateSolid4 p-4  shadow-basicLg">
                      <Image
                        width={200}
                        height={160}
                        src={item.image}
                        style={{
                          width: '100%',
                          height: '190px',
                        }}
                        alt="blog Logo"
                        className=" object-cover  "
                      />
                      <div className="flex  flex-col gap-2">
                        <Text className=" font-semi-bold">{item.title}</Text>
                        <div className="w-fit">
                          <Tag>{item.tag}</Tag>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
          <div className="mx-6 grid py-10 md:px-10 lg:px-10">
            <Text className=" font-semi-bold" variant="heading2xl">
              Similar Datasets{' '}
            </Text>
            <Text>Other datasets you might be interested in </Text>
            <div
              className="mt-11 flex  flex-wrap gap-8"
              style={{ width: '90vw' }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="  max-w-96 rounded-2  p-4 shadow-basicLg "
                >
                  <Text className="font-semi-bold">
                    Uttar Pradesh - Agriculture and Rural Development culture
                    and Rural Development
                  </Text>
                  <div className="mt-3 flex justify-between rounded-2 bg-baseGraySlateSolid6 p-2">
                    <Text>Agriculture</Text>
                    <Text>by OGD</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default DatasetDetailsPage;
