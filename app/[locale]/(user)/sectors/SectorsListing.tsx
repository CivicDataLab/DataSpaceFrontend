'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { graphql } from '@/gql';
import {
  Ordering,
  SectorOrder,
  SectorsListsQuery,
} from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { Divider, SearchInput, Select, Spinner, Text, Tooltip } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, generateJsonLd } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { ErrorPage } from '@/components/error';
import JsonLd from '@/components/JsonLd';
import Styles from '../datasets/dataset.module.scss';
import { SectorListingSkeleton } from '@/components/loading';

const sectorsListQueryDoc: any = graphql(`
  query SectorsLists($order: SectorOrder, $filters: SectorFilter) {
    activeSectors(order: $order, filters: $filters) {
      id
      name
      description
      slug
      datasetCount
    }
  }
`);

const SectorsListing = () => {
  const [sort, setSort] = useState<SectorOrder>({ name: Ordering.Asc });
  const [searchText, setSearchText] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<SectorsListsQuery>(
    ['sectors_list_page', sort],
    () =>
      GraphQL(
        sectorsListQueryDoc,
        {},
        { filters: searchText ? { search: searchText } : {}, order: sort }
      ) as Promise<SectorsListsQuery>
  );

  function capitalizeWords(name: any) {
    return name
      .split('-')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('+');
  }

  useEffect(() => {
    refetch();
  }, [searchText]);

  const handleSortChange = (e: string) => {
    const [field, direction] = e.split('_');
    const formattedSort: SectorOrder = {
      [field]: direction.toUpperCase() as Ordering,
    };
    setSort(formattedSort);
  };

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CivicDataLab',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/sectors`,
    description:
      'Browse datasets and real-world use cases across key sectors like Climate Action, Gender Equality, Law and Justice, and Urban Development. Discover insights that drive data-informed governance and civic innovation.',
  });

  return (
    <main>
      <JsonLd json={jsonLd} />
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Sectors' },
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
                    Our Sectors
                  </Text>
                  <Text
                    variant="headingLg"
                    color="onBgDefault"
                    fontWeight="regular"
                    className="leading-3 lg:leading-5"
                  >
                    Browse our thematic sectors - from disaster risk reduction
                    to open budgets - to discover curated datasets and use cases
                    driving data-informed decisions across fields.
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
                    src={'/s3.png'}
                    alt={'s1'}
                    width={230}
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
            <div className="container flex flex-col gap-5 pb-20 pt-10 lg:gap-10">
              <div>
                <Text variant="heading2xl" fontWeight="bold">
                  Explore Sectors
                </Text>
                <div className="mt-6 flex w-full flex-col justify-center gap-6">
                  <div className="flex flex-wrap gap-6 lg:flex-nowrap">
                    <SearchInput
                      label={''}
                      className={cn('w-full', Styles.Search)}
                      onSubmit={(e) => {
                        setSearchText(e);
                      }}
                      onClear={() => {
                        setSearchText('');
                      }}
                      name={'Start typing to search for any sector'}
                    />
                    <div className="flex items-center gap-2">
                      <Text
                        variant="bodyLg"
                        fontWeight="semibold"
                        className="whitespace-nowrap text-secondaryOrange"
                      >
                        Sort :
                      </Text>
                      <Select
                        label=""
                        labelInline
                        name="sort-select"
                        options={[
                          {
                            label: 'Name Asc',
                            value: 'name_asc',
                          },
                          {
                            label: 'Name Desc',
                            value: 'name_desc',
                          },
                          {
                            label: 'Dataset Count Asc',
                            value: 'datasetCount_asc',
                          },
                          {
                            label: 'Dataset Count Desc',
                            value: 'datasetCount_desc',
                          },
                        ]}
                        onChange={(e: any) => {
                          handleSortChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isLoading ? (
                 <SectorListingSkeleton cardCount={9} />
              ) : data && data?.activeSectors?.length > 0 ? (
                <>
                  <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {data?.activeSectors.map((sectors: any) => (
                      <Link
                        href={`/sectors/${sectors.slug}?sectors=${capitalizeWords(sectors.slug)}`}
                        key={sectors.id}
                        className="h-full" // Ensure link takes full height
                      >
                        <div className="flex h-full min-h-[140px] w-full items-center gap-5 rounded-4 bg-surfaceDefault p-7 shadow-card transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                          <div className="flex flex-shrink-0 gap-4">
                            <Image
                              src={`/Sectors/${sectors.name}.svg`}
                              width={80}
                              height={80}
                              alt={'Sectors Logo'}
                              className="h-20 w-20 object-contain" // Ensure consistent image sizing
                            />
                          </div>
                          <div className="flex w-full min-w-0 flex-col justify-between h-full gap-3">
                            {' '}
                            {/* min-w-0 prevents text overflow */}
                            <div className="flex flex-col gap-2">
                             <Tooltip content={sectors.name}>
                                <Text
                                variant="headingLg"
                                fontWeight="semibold"
                                className="line-clamp-1 text-ellipsis overflow-hidden"
                              >
                                {sectors.name}
                              </Text>
                              </Tooltip>
                              <Divider className="h-[2px] bg-greyExtralight" />
                            </div>
                            <div className="flex gap-1">
                              {' '}
                              {/* mt-auto pushes to bottom */}
                              <Text
                                variant="bodyMd"
                                fontWeight="bold"
                                className="text-primaryBlue"
                              >
                                {sectors.datasetCount}
                              </Text>
                              <Text variant="bodyMd">Datasets</Text>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : isError ? (
                <ErrorPage />
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      </>
    </main>
  );
};

export default SectorsListing;
