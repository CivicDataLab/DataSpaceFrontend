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

const categoriesListQueryDoc: any = graphql(`
  query CategoriesList {
    categories {
      id
      name
      description
      slug
      datasetCount
    }
  }
`);

const CategoriesListingPage = () => {
  const getCategoriesList: {
    data: any;
    isLoading: boolean;
    error: any;
    isError: boolean;
  } = useQuery([`categories_list_page`], () =>
    GraphQL(
      categoriesListQueryDoc,
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
          { href: '#', label: 'Categories' },
        ]}
      />
      <>
        {getCategoriesList.isLoading ? (
          <Loading />
        ) : getCategoriesList.data?.categories.length > 0 ? (
          <>
            <div className="flex h-screen w-full flex-col gap-2 px-28 pt-10">
              <Text variant="heading3xl" as="h1">
                Categories
              </Text>
              <div className="flex flex-wrap justify-between pt-8">
                {getCategoriesList.data?.categories.map((category: any) => (
                  <Link href={`/categories/${category.slug}`} key={category.id}>
                    <div className="md::w-72 mb-7 flex flex-row items-center gap-3 rounded-2 border-borderDefault bg-basePureWhite p-3 shadow-basicLg sm:w-72 lg:w-72 xl:w-72">
                      <div className="flex items-center justify-center rounded-1 bg-baseGraySlateSolid2 p-2">
                        <Image
                          src={'/obi.jpg'}
                          width={40}
                          height={40}
                          alt={'Category Logo'}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Text variant="bodyMd" fontWeight="semibold">
                          {category.name}
                        </Text>
                        <Text>{category.datasetCount} Dataset(s)</Text>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : getCategoriesList.isError ? (
          <ErrorPage />
        ) : (
          <></>
        )}
      </>
    </main>
  );
};

export default CategoriesListingPage;
