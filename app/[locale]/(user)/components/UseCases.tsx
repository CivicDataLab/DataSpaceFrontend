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
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { UseCaseListingSkeleton } from '@/components/loading';
import { stripMarkdown } from '../search/components/UnifiedListingComponent';
import Styles from './datasets.module.scss';

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
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-12 lg:gap-2 lg:px-12 ">
        <div className="flex flex-col gap-2">
          <Text variant="headingXl">Recent UseCases</Text>
          <Text variant="bodyLg" fontWeight="medium">
            Explore freshly updated data use cases gaining momentum across
            CivicDataSpace
          </Text>
        </div>
        <div>
          <Button
            kind="tertiary"
            className="shadow-none border-none bg-transparent px-0 text-primaryText hover:underline"
            onClick={() => {
              router.push('/usecases');
            }}
          >
            <span className="flex items-center gap-2">
              <Text variant="bodyLg" fontWeight="semibold" color="inherit">
                Explore all Use Cases
              </Text>
              <Icons.arrowRight size={18} />
            </span>
          </Button>
        </div>
      </div>
      <div className="mt-6 lg:mt-12">
        <Carousel className="flex w-full justify-between">
          <CarouselPrevious />

          {getUseCasesList.isLoading ? (
            <UseCaseListingSkeleton cardCount={3} cardsOnly={true} />
          ) : (
            <CarouselContent className="items-stretch  p-4">
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
                            icon: Icons.calendarEvent as any,
                            label: 'Date',
                            value: formatDate(item.modified) || '',
                            stroke: 1.2,
                          },
                          {
                            icon: Icons.worldPin as any,
                            label: 'Geography',
                            value:
                              item.geographies?.length > 0
                                ? item.geographies
                                    .map((geo: any) => geo.name)
                                    .join(', ')
                                : '',
                            stroke: 1.2,
                          },
                        ]}
                        leftFooterChips={[
                          {
                            icon: `/Sectors/${item?.sectors[0]?.name}.svg` as any,
                            label: 'Sectors',
                          },
                        ]}
                        rightFooterChips={[
                          {
                            icon: item.isIndividualUsecase
                              ? (item?.user?.profilePicture as any)
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profilePicture.url}`
                                : '/profile.png'
                              : item?.organization?.logo
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo.url}`
                                : ('/org.png' as any),
                            label: 'Published by',
                          },
                        ]}
                        imageUrl={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo?.path.replace('/code/files/', '')}`}
                        description={stripMarkdown(item.summary)}
                        iconColor="metadata"
                        variation={'collapsed'}
                        // type={[
                        //   {
                        //     label: 'Use Case',
                        //     fillColor: '#fff',
                        //     borderColor: '#000',
                        //   },
                        // ]}
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
