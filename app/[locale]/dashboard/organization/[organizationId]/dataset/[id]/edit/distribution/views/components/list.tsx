import { Button, Text } from 'opub-ui';

import { viewOptions } from '../constants';

export type Item = {
  id: number;
  name: string;
  chart: {
    label: string;
    value: viewOptions;
    data: object;
  };
};

export const ListItem = ({
  item,
  setAddedItems,
  handleEditClick,
}: {
  item: Item;
  setAddedItems: (arg: any) => void;
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
            setAddedItems((prev: any) =>
              prev.filter((prevItem: any) => prevItem.id !== item.id)
            );
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
