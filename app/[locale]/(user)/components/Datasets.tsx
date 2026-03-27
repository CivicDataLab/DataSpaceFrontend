'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
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

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { DatasetListingSkeleton } from '@/components/loading';
import { stripMarkdown } from '../search/components/UnifiedListingComponent';
import Styles from './datasets.module.scss';

interface Bucket {
  key: string;
  doc_count: number;
}
interface Aggregation {
  buckets: Bucket[];
}

interface Aggregations {
  [key: string]: Aggregation;
}

const Datasets = () => {
  const [facets, setFacets] = useState<{
    results: any[];
    total: number;
    aggregations: Aggregations;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchDatasets('?sort=recent&size=5&page=1&sort=recent')
      .then((res) => {
        setFacets(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const router = useRouter();

  return (
    <div className=" container py-10 md:px-8 lg:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-12 lg:gap-2 lg:px-12 ">
        <div className="flex flex-col gap-2">
          <Text variant="headingXl">Popular Datasets</Text>
          <Text variant="bodyLg" fontWeight="medium">
            Discover high-impact datasets that are helping users power research,
            analysis, and action.
          </Text>
          {/* #TODO*/}
        </div>
        <div>
          <Button
            kind="tertiary"
            className="shadow-none border-none bg-transparent px-0 text-primaryText hover:underline"
            onClick={() => {
              router.push('/datasets');
            }}
          >
            <span className="flex items-center gap-2">
              <Text variant="bodyLg" fontWeight="semibold" color="inherit">
                Explore all Datasets
              </Text>
              <Icons.arrowRight size={18} />
            </span>
          </Button>
        </div>
      </div>
      <div className="mt-6 lg:mt-12">
        <Carousel className="flex  w-full justify-between">
          <CarouselPrevious />

          <CarouselContent className="p-4">
            {isLoading ? (
              <DatasetListingSkeleton cardCount={4} cardsOnly={true} />
            ) : (
              facets?.results?.map((item: any) => {
                const geographies =
                  Array.isArray(item.geographies) && item.geographies.length > 0
                    ? item.geographies
                        .map((geo: any) =>
                          typeof geo === 'string' ? geo : geo?.name
                        )
                        .filter(Boolean)
                    : [];

                return (
                  <CarouselItem
                    key={item.id}
                    className={cn(
                      'h-2/4 basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4',
                      Styles.List
                    )}
                  >
                    {' '}
                    <Card
                      title={item.title}
                      description={stripMarkdown(item.description)}
                      metadataContent={[
                        {
                          icon: Icons.calendarEvent as any,
                          label: 'Date',
                          value: new Date(item.modified).toLocaleDateString(
                            'en-US',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          ),
                          stroke: 1.2,
                        },
                        {
                          icon: Icons.fileDownload as any,
                          label: 'Download',
                          value: item.download_count || 0,
                          stroke: 1.2,
                        },
                        {
                          icon: Icons.worldPin,
                          label: 'Geography',
                          value:
                            geographies.length > 0
                              ? geographies.join(', ')
                              : '',
                          stroke: 1.2,
                        },
                      ]}
                      tag={item.tags}
                      formats={item.formats}
                      leftFooterChips={[
                        {
                          icon: `/Sectors/${item.sectors[0]}.svg`,
                          label: 'Sectors',
                        },
                      ]}
                      rightFooterChips={[
                        {
                          icon: item.is_individual_dataset
                            ? item?.user?.profile_picture
                              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profile_picture}`
                              : '/profile.png'
                            : item?.organization?.logo
                              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo}`
                              : '/org.png',
                          label: 'Published by',
                        },
                      ]}
                      variation={'collapsed'}
                      iconColor="metadata"
                      href={`/datasets/${item.id}`}
                      withViewButton={false}
                      // type={[
                      //   {
                      //     label: 'Dataset',
                      //     fillColor: '#fff',
                      //     borderColor: '#000',
                      //   },
                      // ]}
                    />
                  </CarouselItem>
                );
              })
            )}
          </CarouselContent>
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default Datasets;
