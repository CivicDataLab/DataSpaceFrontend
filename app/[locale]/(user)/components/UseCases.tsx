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
import { UseCaseListingSkeleton } from '@/components/loading';

const useCasesListDoc: any = graphql(`
  query TopUseCases(
    $filters: UseCaseFilter
    $pagination: OffsetPaginationInput
  ) {
    publishedUseCases(filters: $filters, pagination: $pagination) {
      id
      title
      summary
      slug
      datasetCount
      isIndividualUsecase
      user {
        fullName
        profilePicture {
          url
        }
      }
      organization {
        name
        logo {
          url
        }
      }
      logo {
        path
      }
      geographies {
        id
        name
        code
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
      <div className="flex items-center flex-wrap justify-between gap-4 lg:gap-2 px-4 md:px-12 lg:px-12 ">
        <div className="flex flex-col gap-2">
          <Text variant="headingXl">Recent UseCases</Text>
          <Text variant="bodyLg" fontWeight="medium">
            Explore freshly updated data use cases gaining momentum across
            CivicDataSpace
          </Text>
        </div>
        <div>
          <Button
            kind="primary"
            className=" bg-secondaryOrange text-basePureBlack"
            onClick={() => {
              router.push('/usecases');
            }}
          >
            <Text variant="bodyLg" fontWeight="semibold">
              Explore all Use Cases
            </Text>
          </Button>
        </div>
      </div>
      <div className="mt-6 lg:mt-12">
        <Carousel className="flex w-full justify-between">
          <CarouselPrevious />

          {getUseCasesList.isLoading ? (   
           <UseCaseListingSkeleton 
              cardCount={3}  
              cardsOnly={true}  
            />      
          ) : (
            <CarouselContent className="p-4 ">
              {getUseCasesList &&
                getUseCasesList?.data?.publishedUseCases.length > 0 &&
                getUseCasesList?.data?.publishedUseCases.map(
                  (item: any, index: any) => (
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
                            value: item.geographies?.length > 0
                              ? item.geographies.map((geo: any) => geo.name).join(', ')
                              : 'Not specified',
                          },
                        ]}
                        footerContent={[
                          {
                            icon: `/Sectors/${item?.sectors[0]?.name}.svg`,
                            label: 'Sectors',
                          },
                          {
                            icon: item.isIndividualUsecase
                              ? item?.user?.profilePicture
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profilePicture.url}`
                                : '/profile.png'
                              : item?.organization?.logo
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo.url}`
                                : '/org.png',
                            label: 'Published by',
                          },
                        ]}
                        imageUrl={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo?.path.replace('/code/files/', '')}`}
                        description={item.summary}
                        iconColor="warning"
                        variation={'collapsed'}
                      />
                    </CarouselItem>
                  )
                )}
            </CarouselContent>
          )}
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default UseCasesListingPage;
