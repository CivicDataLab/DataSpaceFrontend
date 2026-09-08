import React from 'react';
import { Button, Text } from 'opub-ui';

import { viewOptions } from '../constants';

export type ChartConfig = {
  xAxis?: string;
  yAxis?: string;
  average?: boolean;
};

export type Item = {
  id: number;
  name: string;
  chart: {
    label: string;
    value: viewOptions;
    data: ChartConfig;
  };
};

export const ListItem = ({
  item,
  setAddedItems,
  handleEditClick,
}: {
  item: Item;
  setAddedItems: React.Dispatch<React.SetStateAction<Item[]>>;
  handleEditClick: (arg: Item) => void;
}) => {
  return (
    <div className="flex items-start justify-between rounded-2 border-1 border-solid border-borderDefault bg-surfaceDefault p-6">
      <div className="flex flex-col gap-1">
        <Text variant="headingMd">{item.name}</Text>
        <Text variant="bodyMd">{item.chart.label}</Text>
      </div>
      <div className="flex gap-2">
        <Button
          variant="interactive"
          size="slim"
          kind="secondary"
          onClick={() => handleEditClick(item)}
        >
          Edit
        </Button>
        <Button
          variant="critical"
          size="slim"
          kind="secondary"
          onClick={() => {
            setAddedItems((prev) =>
              prev.filter((prevItem) => prevItem.id !== item.id)
            );
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
