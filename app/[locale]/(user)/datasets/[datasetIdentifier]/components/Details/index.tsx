import React from 'react';
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
  console.log(data);

  return (
    <>
      {data?.chartsDetails.length > 0 || !isLoading ? (
        <div className="w-full py-4">
          <Carousel className="flex w-full items-center">
            <CarouselPrevious />
            <CarouselContent>
              {data?.chartsDetails.map((item: any, index: any) => (
                <CarouselItem key={index} className=" m-auto">
                  <div className=" w-full border-2 border-solid border-baseGraySlateSolid4 p-6 text-center  shadow-basicLg max-sm:p-2">
                    <div className=" lg:p-10">
                      <BarChart options={item.chart} height={'450px'} />
                    </div>
                    <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
                      <div className=" flex flex-col gap-1 py-2 text-start">
                        <Text className=" font-semi-bold">{item.name}</Text>
                        <Text>{item.description}</Text>
                      </div>
                      <div className="flex gap-2">
                        <Button kind="secondary" className="p-2">
                          <Icon
                            source={Icons.arrowDiagonal}
                            size={20}
                            color="default"
                          />
                        </Button>

                        <Button kind="secondary" className="p-2">
                          <Icon
                            source={Icons.verticalDots}
                            size={20}
                            color="default"
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext />
          </Carousel>
        </div>
      ) : (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      )}
    </>
  );
};

export default Details;
