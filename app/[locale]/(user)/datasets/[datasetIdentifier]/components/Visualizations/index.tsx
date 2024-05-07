import React from 'react';
import { Button, Text } from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

interface VisualizationProps {
  data: any;
}

const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  const barOptions1 = {
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
  const barOptions2 = {
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
        color: 'rgb(95, 217, 188)',
      },
    ],
  };
  const barOptions3 = {
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
        color: 'rgb(208, 138, 208)',
      },
    ],
  };
  const barOptions4 = {
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
        color: 'rgb(166, 89, 120)',
      },
    ],
  };
  return (
    <div className="">
      {data.map((item: any, index: any) => (
        <div
          className="my-4 flex flex-col gap-4 rounded-2 p-6 shadow-basicDeep"
          key={index}
        >
          <Text variant="headingMd">{item.title}</Text>
          <Text>{item.description}</Text>
          <Button className="h-fit w-fit" kind="secondary">
            Download
          </Button>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BarChart options={barOptions1} height={'280px'} />
            <BarChart options={barOptions2} height={'280px'} />
            <BarChart options={barOptions3} height={'280px'} />
            <BarChart options={barOptions4} height={'280px'} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Visualization;
