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

const statsInfo: any = graphql(`
  query StatsList {
    stats {
      totalUsers
      totalPublishedDatasets
      totalPublishers
      totalPublishedUsecases
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
    },
    {
      label: 'Use Cases',
      count: Stats?.data?.stats?.totalPublishedUsecases,
    },

    {
      label: 'Publishers',
      count: Stats?.data?.stats?.totalPublishers,
    },
    {
      label: 'Users',
      count: Stats?.data?.stats?.totalUsers,
    },
  ];

  const Sectors = [
    'Budgets',
    'Child Rights',
    'Disaster Risk Reduction',
    'Climate Finance',
    'Law And Justice',
    'Urban Development',
  ];
  return (
    <main className="bg-primaryBlue py-6 md:px-8 md:py-10 lg:py-20">
      <div className="container flex items-center justify-around gap-20 px-10 md:px-12 lg:px-8 ">
        <div className="flex flex-col gap-11 lg:w-[49%]">
          <div className="flex flex-col">
            <Text variant="heading3xl" color="onBgDefault">
              Collaborate to advance
            </Text>
            <Text
              variant="heading3xl"
              color="onBgDefault"
              className=" text-tertiaryAccent"
            >
              Data-driven Impact and Action
            </Text>
            <Text variant="heading3xl" color="onBgDefault">
              with CivicDataLab{' '}
            </Text>
          </div>
          {Stats.isLoading ? (
            <div className=" flex w-fit justify-center rounded-2 bg-surfaceDefault p-4">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 md:gap-0 lg:gap-0 ">
              {Metrics.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col border-x-[1px] border-solid border-tertiaryAccent px-4"
                >
                  <Text variant="heading3xl" className=" text-secondaryOrange">
                    {item.count}
                  </Text>
                  <Text color="onBgDefault" className=" w-20 ">
                    {item.label}
                  </Text>
                </div>
              ))}
            </div>
          )}
          <div className="w-full">
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
