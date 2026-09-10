import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
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
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Styles from './similarDatasets.module.scss';

const similarDatasetQuery = graphql(`
  query getSimilarDataset($datasetId: UUID!) {
    getDataset(datasetId: $datasetId) {
      id
      title
      similarDatasets {
        downloadCount
        id
        title
        tags {
          id
          value
        }
        description
        created
        modified
        isIndividualDataset
        user {
          fullName
          id
          profilePicture {
            url
          }
        }
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          value
        }
        geographies {
          name
        }
        license
        resources {
          id
          created
          modified
          type
          name
          description
        }
        organization {
          name
          logo {
            url
          }
          slug
          id
        }
        sectors {
          name
        }
        formats
      }
    }
  }
`);

const SimilarDatasets: React.FC = () => {
  const params = useParams();

  const SimilatDatasetdetails = useQuery(
    [`similar_datasets_${params.datasetIdentifier}`],
    () =>
      GraphQL(
        similarDatasetQuery,
        {
          // Entity Headers if present
        },
        { datasetId: params.datasetIdentifier }
      )
  );

  return (
    <div className="py-4 md:py-10 lg:py-10">
      {SimilatDatasetdetails.isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className={`flex flex-col gap-1 `}>
            <Text variant="headingXl">Similar Datasets</Text>
            <Text variant="bodyLg">Similar Datasets that you may like </Text>
          </div>
          <div className=" mt-3 px-2">
            <Carousel className="flex  w-full justify-between">
              <CarouselPrevious />

              <CarouselContent className="p-4">
                {SimilatDatasetdetails?.data?.getDataset &&
                  SimilatDatasetdetails?.data?.getDataset.similarDatasets.map(
                    (item) => {
                      const geographies =
                        Array.isArray(item.geographies) &&
                        item.geographies.length > 0
                          ? item.geographies
                              .map((geo) =>
                                typeof geo === 'string' ? geo : geo?.name
                              )
                              .filter(Boolean)
                          : null;

                      const dateMeta = {
                        icon: Icons.calendarEvent,
                        label: 'Date',
                        value: '19 July 2024',
                        stroke: 1.2,
                      };
                      const downloadMeta = {
                        icon: Icons.fileDownload,
                        label: 'Download',
                        value: item.downloadCount.toString(),
                        stroke: 1.2,
                      };
                      const metadataContent =
                        geographies && geographies.length > 0
                          ? ([
                              dateMeta,
                              downloadMeta,
                              {
                                icon: Icons.worldPin,
                                label: 'Geography',
                                value: geographies.join(', '),
                                stroke: 1.2,
                              },
                            ] as const)
                          : ([dateMeta, downloadMeta] as const);

                      return (
                        <CarouselItem
                          key={item.id}
                          className={cn(
                            'h-2/4 basis-full pl-4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3',
                            Styles.List
                          )}
                        >
                          {' '}
                          <Card
                            title={item.title}
                            // description={stripMarkdown(item.description || '')}
                            metadataContent={metadataContent}
                            tag={item.tags.map((t) => t.value)}
                            formats={item.formats}
                            leftFooterChips={[
                              {
                                icon: `/Sectors/${item.sectors[0]?.name}.svg`,
                                label: 'Sectors',
                              },
                            ]}
                            rightFooterChips={[
                              {
                                icon: item.isIndividualDataset
                                  ? item?.user?.profilePicture
                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profilePicture.url}`
                                    : '/profile.png'
                                  : item?.organization?.logo
                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo.url}`
                                    : '/org.png',
                                label: 'Published by',
                              },
                            ]}
                            variation={'collapsed'}
                            iconColor="warning"
                            href={`/datasets/${item.id}`}
                            withViewButton={false}
                          />
                        </CarouselItem>
                      );
                    }
                  )}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
        </>
      )}
    </div>
  );
};

export default SimilarDatasets;
