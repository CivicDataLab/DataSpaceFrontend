'use client';

import Image from 'next/image';
import Link from 'next/link';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import { ErrorPage } from '@/components/error';
import { Loading } from '@/components/loading';

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
            <div className="flex h-screen w-full flex-col gap-2 px-28 pt-10">
              <Text variant="heading3xl" as="h1">
                Sectors
              </Text>
              <div className="flex flex-wrap justify-between pt-8">
                {getSectorsList.data?.sectors.map((sectors: any) => (
                  <Link href={`/sectors/${sectors.slug}`} key={sectors.id}>
                    <div className="md::w-72 mb-7 flex flex-row items-center gap-3 rounded-2 border-borderDefault bg-basePureWhite p-3 shadow-basicLg sm:w-72 lg:w-72 xl:w-72">
                      <div className="flex items-center justify-center rounded-1 bg-baseGraySlateSolid2 p-2">
                        <Image
                          src={'/obi.jpg'}
                          width={40}
                          height={40}
                          alt={'Sectors Logo'}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Text variant="bodyMd" fontWeight="semibold">
                          {sectors.name}
                        </Text>
                        <Text>{sectors.datasetCount} Dataset(s)</Text>
                      </div>
                    </div>
                  </Link>
                ))}
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
