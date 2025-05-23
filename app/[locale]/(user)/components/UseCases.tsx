'use client';

import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Spinner,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Styles from './datasets.module.scss';

const useCasesListDoc: any = graphql(`
  query TopUseCases(
    $filters: UseCaseFilter
    $pagination: OffsetPaginationInput
  ) {
    useCases(filters: $filters, pagination: $pagination) {
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
  } = useQuery([`useCases_list`], () =>
    GraphQL(
      useCasesListDoc,
      {},
      {
        filters: { status: 'PUBLISHED' },
        pagination: { limit: 6 },
      }
    )
  );
  const router = useRouter();

  return (
    <div className=" container pt-10 md:px-8 lg:pt-20">
      <div className="flex flex-col gap-2 md:px-12 px-4 lg:px-12 ">
        <Text variant="heading3xl">Recent UseCases</Text>
        <div className="flex flex-wrap justify-between gap-2 ">
          <Text variant="headingLg" fontWeight="medium">
            Recently updated and trending Use Cases on Asia-Pacific Climate Data
            Collaborative{' '}
          </Text>
          <Button
            kind="primary"
            className=" bg-secondaryOrange text-basePureBlack"
            onClick={() => {
              router.push('/usecases');
            }}
          >
            Explore all Use Cases
          </Button>
        </div>
      </div>
      <div className='mt-12'>
        <Carousel className="flex w-full justify-between">
          <CarouselPrevious />

          {getUseCasesList.isLoading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : (
            <CarouselContent className="p-4 ">
              {getUseCasesList &&
                getUseCasesList?.data?.useCases.length > 0 &&
                getUseCasesList?.data?.useCases.map((item: any, index: any) => (
                  <CarouselItem
                    key={item.id}
                    className={cn(
                      'h-2/4 basis-full pl-4 sm:basis-1/2  lg:basis-1/3',
                      Styles.UseCaseList
                    )}
                  >
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
                            (meta: any) =>
                              meta.metadataItem?.label === 'Geography'
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
                  </CarouselItem>
                ))}
            </CarouselContent>
          )}
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default UseCasesListingPage;
