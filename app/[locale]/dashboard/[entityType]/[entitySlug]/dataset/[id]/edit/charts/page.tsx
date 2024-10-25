'use client';

import React from 'react';
import { parseAsString, useQueryState } from 'next-usequerystate';

import ChartsImage from './components/ChartsImage';
import ChartsList from './components/ChartsList';
import ChartsVisualize from './components/ChartsVisualize';

const Charts = () => {
  const [type, setType] = useQueryState(
    'type',
    parseAsString.withDefault('list')
  );

  const [chartId, setChartId] = useQueryState('id', parseAsString);
  const [imageId, setImageId] = useQueryState('id', parseAsString);

  return (
    <div className=" mt-6">
      {type === 'list' ? (
        <ChartsList
          setType={setType}
          type={type}
          setChartId={setChartId}
          setImageId={setImageId}
        />
      ) : type === 'visualize' ? (
        <ChartsVisualize
          setType={setType}
          chartId={chartId}
          setChartId={setChartId}
        />
      ) : (
        <ChartsImage
          setType={setType}
          imageId={imageId}
          setImageId={setImageId}
        />
      )}
    </div>
  );
};

export default Charts;
