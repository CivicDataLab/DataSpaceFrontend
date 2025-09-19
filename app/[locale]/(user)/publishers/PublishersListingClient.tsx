'use client';

import { useState } from 'react';
import Image from 'next/image';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, ButtonGroup, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, generateJsonLd } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import PublisherCard from './PublisherCard';

const getAllPublishers: any = graphql(`
  query PublishersList {
    getPublishers {
      __typename
      ... on TypeOrganization {
        name
        id
        description
        logo {
          url
        }
        membersCount
        publishedUseCasesCount
        publishedDatasetsCount
      }
      ... on TypeUser {
        fullName
        id
        bio
        profilePicture {
          url
        }
        publishedUseCasesCount
        publishedDatasetsCount
      }
    }
  }
`);

const PublishersListingPage = () => {
  const [type, setType] = useState<'all' | 'org' | 'pub'>('all');
  const Details: {
    data: any;
    isLoading: boolean;
    isError: boolean;
    refetch: any;
  } = useQuery(['publishers_list_page'], () =>
    GraphQL(getAllPublishers, {}, [])
  );

  type PublisherType = 'all' | 'org' | 'pub';
  const publisherButtons: { key: PublisherType; label: string }[] = [
    { key: 'all', label: 'All Publishers' },
    { key: 'org', label: 'Organizations' },
    { key: 'pub', label: 'Individual Publishers' },
  ];

  const filteredPublishers = Details?.data?.getPublishers?.filter(
    (publisher: any) => {
      if (type === 'all') return true;
      if (type === 'pub') return publisher.__typename === 'TypeUser';
      if (type === 'org') return publisher.__typename === 'TypeOrganization';
      return false;
    }
  );

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: Details?.data?.getPublishers?.title,
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers`,
    description: Details?.data?.getPublishers?.description,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <main>
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            { href: '#', label: 'Publishers' },
          ]}
        />
        <>
          <>
            <div className="w-full">
              <div className=" bg-primaryBlue">
                <div className=" container flex flex-col-reverse items-center gap-8 py-10 lg:flex-row ">
                  <div className="flex flex-col gap-5 ">
                    <Text
                      variant="heading2xl"
                      fontWeight="bold"
                      color="onBgDefault"
                    >
                      Our Publishers{' '}
                    </Text>
                    <Text
                      variant="headingLg"
                      color="onBgDefault"
                      fontWeight="regular"
                      className=" leading-3 lg:leading-5"
                    >
                      Meet the data providers powering CivicDataSpace — explore
                      individual and organizational publishers across domains
                      who are opening up data for impact and transparency.
                    </Text>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-3 ">
                    <Image
                      src={'/s2.png'}
                      alt={'s1'}
                      width={130}
                      height={100}
                      className="h-auto w-[80px] sm:w-[100px] md:w-[120px] lg:w-[130px]"
                      priority
                    />
                    <Image
                      src={'/s4.png'}
                      alt={'s1'}
                      width={232}
                      height={100}
                      className="h-auto w-[140px] sm:w-[180px] md:w-[200px] lg:w-[230px]"
                      priority
                    />
                    <Image
                      src={'/s1.png'}
                      alt={'s1'}
                      width={130}
                      height={100}
                      className="h-auto w-[80px] sm:w-[100px] md:w-[120px] lg:w-[130px]"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="container flex flex-col gap-4 py-10 lg:gap-6">
                <Text variant="heading2xl" fontWeight="bold">
                  Explore Publishers
                </Text>
                <div>
                  <ButtonGroup>
                    <div className="flex flex-wrap gap-4">
                      {publisherButtons.map((btn) => (
                        <Button
                          key={btn.key}
                          onClick={() => setType(btn.key)}
                          className={cn(
                            ' w-72 rounded-full py-3',
                            type === btn.key
                              ? 'bg-tertiaryAccent'
                              : 'border-1 border-solid border-tertiaryAccent bg-surfaceDefault'
                          )}
                        >
                          <Text variant="headingLg" fontWeight="semibold">
                            {btn.label}
                          </Text>
                        </Button>
                      ))}
                    </div>
                  </ButtonGroup>
                </div>
                {Details.isLoading ? (
                  <div className="m-4 flex justify-center">
                    <Spinner />
                  </div>
                ) : (
                  Details.data &&
                  Details.data.getPublishers.length > 0 && (
                    <PublisherCard data={filteredPublishers} />
                  )
                )}
              </div>
            </div>
          </>
        </>
      </main>
    </>
  );
};

export default PublishersListingPage;
