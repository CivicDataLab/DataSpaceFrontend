import React from 'react';
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Icon,
  Text,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { Icons } from '@/components/icons';

const Details = () => {
  const barOptions = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        name: 'Sales',
        color: 'rgb(55,162,218)',
      },
    ],
  };
  return (
    <>
      <div className="w-full py-4">
        <Carousel className="flex w-full items-center">
          <CarouselPrevious />
          <CarouselContent>
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <CarouselItem key={index}>
                {/* <div className=" w-full border-2 border-solid border-baseRedSolid9 p-56 text-center max-sm:p-20">
                  <span className="text-4xl font-semibold ">{index + 1}</span>
                </div> */}
                <div className=" w-full border-2 border-solid border-baseGraySlateSolid4 p-6 text-center shadow-shadowLayer max-sm:p-2">
                  <div className="lg:p-10">
                    <BarChart options={barOptions} height={'450px'} />
                  </div>
                  <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
                    <div className=" flex flex-col gap-1 py-2 text-start">
                      <Text className=" font-semi-bold">
                        Monthly Precipitation levels in Guwahati in 2011
                      </Text>
                      <Text>
                        This chart shows the precipitation levels (in
                        millimetres) in the city of Guwahati, Assam, India. Sum
                        of precipitation is mapped out for each month for the
                        year 2011
                      </Text>
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
    </>
  );
};

export default Details;
