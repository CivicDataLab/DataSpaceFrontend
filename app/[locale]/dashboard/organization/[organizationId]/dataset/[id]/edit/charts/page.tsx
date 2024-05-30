'use client';

import React from 'react';
import { parseAsString, useQueryState } from 'next-usequerystate';

import ChartsImage from '../components/ChartsImage';
import ChartsList from '../components/ChartsList';
import ChartsVisualize from '../components/ChartsVisualize';

const Charts = () => {
  const [type, setType] = useQueryState(
    'type',
    parseAsString.withDefault('list')
  );
  return (
    <div className=" mt-6">
      {type === 'list' ? (
        <ChartsList setType={setType} type={type} />
      ) : type === 'visualize' ? (
        <ChartsVisualize setType={setType} />
      ) : (
        <ChartsImage setType={setType} />
      )}
    </div>
  );
};

export default Charts;
