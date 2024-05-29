'use client';

import React from 'react';
import { Button, Text } from 'opub-ui';

const Charts = () => {
  return (
    <div className=" mt-6">
      <div className="flex flex-col items-center gap-6">
        <Text>* Adding Visualizations is Optional and can be skipped.</Text>
        <Text>
          ** Visualizations will appear separately in the Visualizations tab of
          the dataset details. They are not a part of any Access type.
        </Text>

        <Button className=" w-60">Visualize Data</Button>
        <Button className=" w-60">Add Image</Button>
      </div>
      <div></div>
    </div>
  );
};

export default Charts;
