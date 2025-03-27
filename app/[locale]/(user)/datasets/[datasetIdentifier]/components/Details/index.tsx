import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { renderGeoJSON } from '@/geo_json/render_geojson';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
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

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const DetailsQuery: any = graphql(`
  query ChartDetailsQuery($datasetId: UUID!) {
    getChartData(datasetId: $datasetId) {
      __typename
      ... on TypeResourceChart {
        chartType
        description
        id
        name
        chart {
          options
        }
      }
      ... on TypeResourceChartImage {
        name
        id
        description
        image {
          name
          path
          url
        }
      }
    }
  }
`);

interface DetailsProps {
  setShowcharts: (vars: boolean) => void;
}

const Details: React.FC<DetailsProps> = ({ setShowcharts }) => {
  const params = useParams();
  const chartRef = useRef<ReactECharts>(null);

  const { data, isLoading }: { data: any; isLoading: any } = useQuery(
    [`chartDetails_${params.id}`],
    () => GraphQL(DetailsQuery, {}, { datasetId: params.datasetIdentifier })
  );

  useEffect(() => {
    if (data && data?.getChartData.length <= 0) {
      setShowcharts(false);
    }
  }, [data]);

  const renderChart = (item: any) => {
    if (item.chartType === 'ASSAM_DISTRICT' || item.chartType === 'ASSAM_RC') {
      // Register the map
      echarts.registerMap(
        item.chartType.toLowerCase(),
        renderGeoJSON(item.chartType.toLowerCase())
      );
    }

    return <ReactECharts option={item?.chart?.options} ref={chartRef} />;
  };

  const [isexpanded, setIsexpanded] = useState(false);
  const toggleDescription = () => setIsexpanded(!isexpanded);

  return (
    <div className=" flex w-full flex-col gap-4 p-2">
      {isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : data?.getChartData?.length > 0 ? (
        <>
          <div className="relative w-full ">
            <Carousel className="w-full">
              <div className=" px-12">
                <CarouselContent className="flex-grow">
                  {data?.getChartData.map((item: any, index: any) => (
                    <CarouselItem key={index} className="m-auto">
                      <div className="w-full border-2 border-solid border-baseGraySlateSolid4 bg-surfaceDefault p-6 text-center shadow-basicLg max-sm:p-2">
                        <div className="lg:p-10">
                          {item.__typename === 'TypeResourceChart' &&
                          item?.chart?.options ? (
                            renderChart(item)
                          ) : (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/chart_image/${item.id}`}
                              alt={''}
                              width={300}
                              height={300}
                              unoptimized
                            />
                          )}
                          {/* Call the renderChart function */}
                        </div>
                        <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
                          <div className="flex flex-col gap-1 py-2 text-start">
                            <Text className="font-semi-bold">{item.name}</Text>
                            <Text className=" hidden lg:block">
                              {item.description.length > 260 && !isexpanded
                                ? `${item.description.slice(0, 260)}...`
                                : item.description}
                              {item.description.length > 260 && (
                                <Button
                                  kind="tertiary"
                                  size="slim"
                                  onClick={toggleDescription}
                                  className="text-blue-600 w-fit"
                                >
                                  {isexpanded ? 'See Less' : 'See More'}
                                </Button>
                              )}
                            </Text>
                          </div>
                          <div className="flex gap-2">
                            <Button kind="secondary" className="p-2">
                              <Icon
                                source={Icons.diagonal}
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
                <CarouselPrevious className=" bg-secondaryOrange" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <CarouselNext className=" bg-secondaryOrange" />
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
