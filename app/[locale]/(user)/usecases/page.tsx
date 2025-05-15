'use client';

import Image from 'next/image';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import Styles from '../page.module.scss';

const useCasesListQueryDoc: any = graphql(`
  query UseCasesList($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
      summary
      slug
      datasetCount
      logo {
        path
      }
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
      publishers {
        logo {
          path
        }
        name
      }
      sectors {
        id
        name
      }
      created
      modified
      website
      contactEmail
    }
  }
`);

const UseCasesListingPage = () => {
  const getUseCasesList: {
    data: any;
    isLoading: boolean;
    error: any;
    isError: boolean;
  } = useQuery([`useCases_list_page`], () =>
    GraphQL(
      useCasesListQueryDoc,
      {},
      {
        filters: { status: 'PUBLISHED' },
      }
    )
  );
  

  return (
    <main className="bg-baseGraySlateSolid2">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Use Cases' },
        ]}
      />
      <div className=" bg-primaryBlue ">
        <div className="container flex flex-col-reverse justify-center gap-8 p-10 lg:flex-row ">
          <div className="flex flex-col justify-center gap-6">
            <Text variant="heading3xl" className=" text-surfaceDefault">
              Our Use Cases
            </Text>
            <Text
              variant="headingLg"
              fontWeight="regular"
              className=" text-surfaceDefault"
            >
              By Use case we mean any specific sector or domain data led
              interventions that can be applied to address some of the most
              pressing concerns from hyper-local to the global level
              simultaneously.
            </Text>
          </div>
          <Image
            src={'/Usecase_illustration.png'}
            width={600}
            height={316}
            alt={'Usecase Illustration'}
            className=" m-auto h-auto w-full"
          />
        </div>
      </div>
      <div className="container p-6 py-20 lg:p-10">
        <div>
          <Text variant="heading3xl">Explore Use Cases</Text>
        </div>
        {getUseCasesList.isLoading ? (
          <div className=" mt-8 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div
            className={cn(
              'grid w-full grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3',
              Styles.Card
            )}
          >
            {getUseCasesList &&
              getUseCasesList?.data?.useCases.length > 0 &&
              getUseCasesList?.data?.useCases.map((item: any, index: any) => (
                <Card
                  title={item.title}
                  key={index}
                  href={`/usecases/${item.id}`}
                  metadataContent={[
                    {
                      icon: Icons.calendar,
                      label: 'Date',
                      value: formatDate(item.modified),
                    },
                    {
                      icon: Icons.globe,
                      label: 'Geography',
                      value: item.metadata?.find(
                        (meta: any) => meta.metadataItem?.label === 'Geography'
                      )?.value,
                    },
                  ]}
                  footerContent={[
                    {
                      icon: `/Sectors/${item?.sectors[0]?.name}.svg`,
                      label: 'Sectors',
                    },
                    { icon: '/fallback.svg', label: 'Published by' },
                  ]}
                  imageUrl={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo?.path.replace('/code/files/', '')}`}
                  description={item.summary}
                  iconColor="warning"
                  variation={'collapsed'}
                />
              ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default UseCasesListingPage;
