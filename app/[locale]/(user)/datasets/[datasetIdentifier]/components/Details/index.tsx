import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Icon,
  Spinner,
  Text,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const charts: any = graphql(`
  query chartsData($datasetId: UUID!) {
    chartsDetails(datasetId: $datasetId) {
      aggregateType
      chartType
      description
      id
      name
      showLegend
      xAxisLabel
      yAxisLabel
      chart
    }
  }
`);

const Details = () => {
  const params = useParams();

  const {
    data,
    isLoading,
    refetch,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`chartdata_${params.datasetIdentifier}`],
    () =>
      GraphQL(charts, {
        datasetId: params.datasetIdentifier,
      })
  );

  return (
    <div className="mb-8 flex w-full flex-col gap-4 p-2">
      {isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : data?.chartsDetails?.length > 0 ? (
        <>
          <Text variant="bodyLg" className="mx-6 lg:mx-0">
            Visualizations
          </Text>
          <div className="relative w-full ">
            <Carousel className="w-full">
              <div className=" px-12">
                <CarouselContent className="flex-grow">
                  {data?.chartsDetails.map((item: any, index: any) => (
                    <CarouselItem key={index} className="m-auto">
                      <div className="w-full border-2 border-solid border-baseGraySlateSolid4 bg-surfaceDefault p-6 text-center shadow-basicLg max-sm:p-2">
                        <div className="lg:p-10">
                          <BarChart options={item.chart} height={'450px'} />
                        </div>
                        <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
                          <div className="flex flex-col gap-1 py-2 text-start">
                            <Text className="font-semi-bold">{item.name}</Text>
                            <Text>{item.description}</Text>
                          </div>
                          <div className="flex gap-2">
                            <Button kind="secondary" className="p-2">
                              <Icon
                                source={Icons.share}
                                size={20}
                                color="default"
                              />
                            </Button>
                            <Link
                              href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/chart/${item.id}`}
                              target="_blank"
                              className="flex justify-center"
                            >
                              <Button kind="secondary" className="p-2">
                                <Icon
                                  source={Icons.download}
                                  size={20}
                                  color="default"
                                />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
              <div className="absolute inset-y-0 left-0 flex  items-center">
                <CarouselPrevious />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default Details;
