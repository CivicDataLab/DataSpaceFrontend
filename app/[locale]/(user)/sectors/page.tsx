'use client';

import Image from 'next/image';
import Link from 'next/link';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Divider, SearchInput, Select, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import { ErrorPage } from '@/components/error';
import { Loading } from '@/components/loading';
import { cn } from '@/lib/utils';
import Styles from '../datasets/dataset.module.scss';


const sectorsListQueryDoc: any = graphql(`
  query SectorsList {
    sectors {
      id
      name
      description
      slug
      datasetCount
    }
  }
`);

const SectorsListingPage = () => {
  const getSectorsList: {
    data: any;
    isLoading: boolean;
    error: any;
    isError: boolean;
  } = useQuery([`sectors_list_page`], () =>
    GraphQL(
      sectorsListQueryDoc,
      {
        // Entity Headers if present
      },
      []
    )
  );

  return (
    <main className="bg-baseGraySlateSolid2">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Sectors' },
        ]}
      />
      <>
        {getSectorsList.isLoading ? (
          <Loading />
        ) : getSectorsList.data?.sectors.length > 0 ? (
          <>
            <div className="w-full">
              <div className=" bg-primaryBlue">
                <div className="m-auto flex w-11/12 flex-col-reverse  items-center gap-8  p-6 lg:flex-row ">
                  <div className="flex flex-col gap-6 ">
                    <Text variant="heading3xl" color="onBgDefault">
                      Our Sectors
                    </Text>
                    <Text
                      variant="headingLg"
                      color="onBgDefault"
                      fontWeight="regular"
                    >
                      We try to enables our users to create and participate in
                      sectoral data collaboratives, amplifying the reach and
                      impact of high-value datasets and sectoral use cases at
                      various levels, including national, sub-national, and
                      regional.
                    </Text>{' '}
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
              <div className=" m-auto my-10 flex w-11/12 flex-col gap-5 p-6 lg:gap-10">
                <div className="flex w-full flex-col justify-center gap-6">
                  <Text variant="heading3xl">Explore Sectors</Text>
                  <div className="flex flex-wrap gap-6 lg:flex-nowrap">
                    <SearchInput
                      label={''}
                      className={cn('w-full',Styles.Search)}                     
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
                        name="select"
                        options={[
                          {
                            label: 'Recent',
                            value: 'recent',
                          },
                          {
                            label: 'Alphabetical',
                            value: 'alphabetical',
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                  {getSectorsList.data?.sectors.map((sectors: any) => (
                    <Link href={`/sectors/${sectors.slug}`} key={sectors.id}>
                      <div className="flex w-full items-center gap-5 rounded-4 bg-surfaceDefault p-7 shadow-card">
                        <div className="flex gap-4">
                          <Image
                            src={'/obi.jpg'}
                            width={80}
                            height={80}
                            alt={'Sectors Logo'}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-3">
                          <div className='flex flex-col gap-2'>
                            <Text
                              variant="headingLg"
                              fontWeight="semibold"
                                                          >
                              {sectors.name}
                            </Text>
                            <Divider />
                          </div>
                          <div className="flex gap-1">
                            <Text
                              variant="bodyMd"
                              fontWeight="bold"
                              className=" text-primaryBlue"
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
              </div>
            </div>
          </>
        ) : getSectorsList.isError ? (
          <ErrorPage />
        ) : (
          <></>
        )}
      </>
    </main>
  );
};

export default SectorsListingPage;
