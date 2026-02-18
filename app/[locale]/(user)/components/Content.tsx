'use client';

import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchInput, Spinner, Text } from 'opub-ui';

import { useTourTrigger } from '@/hooks/use-tour-trigger';
import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import Styles from '../page.module.scss';

const statsInfo: any = graphql(`
  query StatsList {
    stats {
      totalUsers
      totalPublishedDatasets
      totalPublishers
      totalPublishedUsecases
      totalOrganizations
    }
  }
`);


export const Content = () => {
  const router = useRouter();
  
  // Enable tour for first-time users
  useTourTrigger(true, 1500);
  
  const Stats: { data: any; isLoading: any } = useQuery([`statsDetails`], () =>
    GraphQL(statsInfo, {}, [])
  );

  const handleSearch = (value: string) => {
    if (value) {
      router.push(`/datasets?query=${encodeURIComponent(value)}`);
    }
  };
  const Metrics = [
    {
      label: 'Datasets',
      count: Stats?.data?.stats?.totalPublishedDatasets,
      link: '/datasets',
    },
    {
      label: 'Use Cases',
      count: Stats?.data?.stats?.totalPublishedUsecases,
      link: '/usecases',
    },

    {
      label: 'Publishers',
      count: Stats?.data?.stats?.totalPublishers,
      link: '/publishers',
    },
    {
      label: 'Organizations',
      count: Stats?.data?.stats?.totalOrganizations,
      link: '/publishers',
    },
  ];


  return (
    <main className="container py-10 md:px-8 lg:py-20">
      <div className="flex justify-around gap-8 px-4 md:px-12 lg:px-12">
        <div className="flex flex-col gap-11 lg:w-[60%]">
          <div className="flex flex-col gap-2">
            <Text variant="heading3xl" color="onBgDefault" className='text-textOnBGDefault1'>
              An Open-Source Platform for Collaborative Data-Driven Change
            </Text>
             <Text variant="headingLg" color="onBgDefault" className='text-textOnBGDefault2'>
              Share datasets, knowledge resources, and AI use-cases for data changemakers.
            </Text>
          </div>
          <div className="w-full" data-tour="search-bar">
            <SearchInput
              className={cn(Styles.Search)}
              onSubmit={handleSearch}
              label={''}
              placeholder="Search for any data"
              name={''}
              withButton
            />
          </div>
          {Stats.isLoading ? (
            <div className="flex w-fit justify-center rounded-2 bg-surfaceDefault p-4">
              <Spinner />
            </div>
          ) : (
            <div className="flex w-full flex-wrap items-center gap-4 md:flex-nowrap md:gap-5">
              {Metrics.map((item, index) => (
                <Link
                  key={`${item.label}_${index}`}
                  href={item.link}
                  className="w-[177px] md:basis-[177px]"
                  data-tour={
                    index === 0
                      ? 'datasets-link'
                      : index === 1
                        ? 'usecases-link'
                        : index === 2
                          ? 'publishers-link'
                          : undefined
                  }
                >
                  <div className="flex h-[100px] flex-col justify-center rounded-[8px] bg-surfaceStats px-10 py-10 text-center">
                    <Text variant="heading3xl" className="text-primaryBlue">
                      {item.count}
                    </Text>
                    <Text
                      color="onBgDefault"
                      fontWeight="semibold"
                      className="uppercase text-xs text-textSurfaceStats"
                    >
                      {item.label}
                    </Text>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* <div className="flex flex-wrap gap-4">
            {Sectors.map((item, index) => (
              <div key={index}>
                <Tag
                  variation="outlined"
                  textColor="var(--surface-default)"
                  borderColor="var(--orange-secondary-color)"
                >
                  <Link href={`/datasets?sectors=${item}`} target="_blank">
                    <Text fontWeight="semibold" color="onBgDefault">
                      {item}
                    </Text>
                  </Link>
                </Tag>
              </div>
            ))}
          </div> */}
        </div>
        <div className=" hidden lg:block">
          <Image
            src="/hero-image.svg"
            width={354}
            height={275}
            alt="illustration"
          />
        </div>
      </div>
    </main>
  );
};
