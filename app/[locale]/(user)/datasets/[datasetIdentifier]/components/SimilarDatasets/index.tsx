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

const similarDatasetQuery: any = graphql(`
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

interface Props {
  showCharts: boolean;
}

const SimilarDatasets: React.FC<Props> = ({ showCharts }) => {
  const params = useParams();

  const SimilatDatasetdetails: { data: any; isLoading: any } = useQuery(
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

  console.log(SimilatDatasetdetails?.data?.getDataset);

  return (
    <div className="py-4 md:py-10 lg:py-20">
      {SimilatDatasetdetails.isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div
            className={`flex flex-col gap-1  ${showCharts ? 'lg:px-10' : 'lg:px-0'}`}
          >
            <Text variant="headingXl">Similar Datasets</Text>
            <Text variant="bodyLg">Similar Datasets that you may like </Text>
          </div>
          <div className=" mt-3 px-2">
            <Carousel className="flex  w-full justify-between">
              <CarouselPrevious />

              <CarouselContent className="p-4">
                {SimilatDatasetdetails?.data?.getDataset &&
                  SimilatDatasetdetails?.data?.getDataset.similarDatasets.map(
                    (item: any) => (
                      <CarouselItem
                        key={item.id}
                        className={cn(
                          'h-2/4 basis-full pl-4 sm:basis-1/2  lg:basis-1/3',
                          Styles.List
                        )}
                      >
                        {' '}
                        <Card
                          title={item.title}
                          description={item.description}
                          metadataContent={[
                            {
                              icon: Icons.calendar,
                              label: 'Date',
                              value: '19 July 2024',
                            },
                            {
                              icon: Icons.download,
                              label: 'Download',
                              value: item.downloadCount.toString(),
                            },
                            {
                              icon: Icons.globe,
                              label: 'Geography',
                              value: 'India',
                            },
                          ]}
                          tag={item.tags}
                          formats={item.formats}
                          footerContent={[
                            {
                              icon: `/Sectors/${item.sectors[0].name}.svg`,
                              label: 'Sectors',
                            },
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
                        />
                      </CarouselItem>
                    )
                  )}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
          ;
        </>
      )}
    </div>
  );
};

export default SimilarDatasets;
