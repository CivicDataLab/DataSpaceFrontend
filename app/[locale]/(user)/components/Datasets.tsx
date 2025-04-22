'use client';

import React, { useEffect, useState } from 'react';
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
  Spinner,
  Text,
} from 'opub-ui';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
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
    <div className=" container pt-10 lg:pt-20 md:px-8">
      <div className="flex flex-col gap-2 p-3  lg:p-0 md:p-0 ">
        <Text variant="heading3xl">Recent Datasets</Text>
        <div className="flex flex-wrap justify-between gap-2 ">
          <Text variant="headingLg" fontWeight="medium">
            Recently updated and trending Datasets on CivicDataSpace
          </Text>
          <Button
            kind="primary"
            className=" bg-secondaryOrange text-basePureBlack"
            onClick={() => {
              router.push('/datasets');
            }}
          >
            Explore all Datasets
          </Button>
        </div>
      </div>
      <div className="mt-10 ">
        <Carousel className="flex  w-full justify-between">
          <CarouselPrevious />

          <CarouselContent className="p-4 ">
            {isLoading ? (
              <div className="p-8">
                <Spinner />
              </div>
            ) : (
              facets &&
              facets.results.map((item: any) => (
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
                        value: item.download_count.toString(),
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
                        icon: `/Sectors/${item.sectors[0]}.svg`,
                        label: 'Sectors',
                      },
                      { icon: '/fallback.svg', label: 'Published by' },
                    ]}
                    variation={'collapsed'}
                    iconColor="warning"
                    href={`/datasets/${item.id}`}
                  />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default Datasets;
