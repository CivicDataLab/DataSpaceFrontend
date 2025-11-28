'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { SearchInput, Spinner, Tag, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import Styles from '../page.module.scss';
import { useTourTrigger } from '@/hooks/use-tour-trigger';

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

// const tagsInfo: any = graphql(`
//   query TagsData {
//     tags {
//       id
//       value
//     }
//   }
// `);

export const Content = () => {
  const router = useRouter();
  
  // Enable tour for first-time users
  useTourTrigger(true, 1500);
  
  const Stats: { data: any; isLoading: any } = useQuery([`statsDetails`], () =>
    GraphQL(statsInfo, {}, [])
  );
  // const Tags: { data: any; isLoading: any } = useQuery([`tagDetails`], () =>
  //   GraphQL(tagsInfo, {}, [])
  // );

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
    // {
    //   label: 'Users',
    //   count: Stats?.data?.stats?.totalUsers,
    // },
    {
      label: 'Organizations',
      count: Stats?.data?.stats?.totalOrganizations,
      link: '/publishers',
    },
  ];

  const Sectors = [
    'Public Finance',
    'Law And Justice',
    'Climate Action',
    'Urban Development',
    'Gender',
    'Coastal',
    'Disaster Risk Reduction',
    'Child Rights'
  ];

  return (
    <main className="bg-primaryBlue py-6 md:px-8 md:py-10 lg:py-20">
      <div className="container flex items-center justify-around gap-20 px-10 md:px-12 lg:px-8 ">
        <div className="flex flex-col gap-11 lg:w-[49%]">
          <div className="flex flex-col gap-2">
            <Text variant="heading3xl" color="onBgDefault">
              An Open-Source Platform for Collaborative Data-Driven Change
            </Text>
             <Text variant="headingLg" color="onBgDefault">
              Share datasets, knowledge resources, and AI use-cases for data changemakers.
            </Text>
          </div>
          {Stats.isLoading ? (
            <div className=" flex w-fit justify-center rounded-2 bg-surfaceDefault p-4">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 md:gap-0 lg:gap-0 ">
              {Metrics.map((item, index) => (
                <Link 
                  key={`${item.label}_${index}`} 
                  href={item.link}
                  data-tour={index === 0 ? 'datasets-link' : index === 1 ? 'usecases-link' : index === 2 ? 'publishers-link' : undefined}
                >
                  <div
                    key={index}
                    className="flex flex-col border-x-[1px] border-solid border-tertiaryAccent px-4"
                  >
                    <Text
                      variant="heading3xl"
                      className=" text-secondaryOrange"
                    >
                      {item.count}
                    </Text>
                    <Text color="onBgDefault" className=" w-20 ">
                      {item.label}
                    </Text>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
          <div className="flex flex-wrap gap-4">
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
          </div>
        </div>
        <div className=" hidden lg:block">
          <Image
            src="/homepage_illustration.png"
            width={500}
            height={400}
            alt="illustration"
          />
        </div>
      </div>
    </main>
  );
};
