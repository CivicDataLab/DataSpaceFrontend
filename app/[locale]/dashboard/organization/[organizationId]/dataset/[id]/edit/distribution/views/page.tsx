'use client';

import React from 'react';
import { IconBrackets } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Dialog,
  FormLayout,
  Icon,
  Label,
  Select,
  Switch,
  Text,
  TextField,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { data, DISTRIBUTION_VIEW_OPTIONS, type viewOptions } from './constants';

type Item = {
  id: number;
  name: string;
  chart: {
    label: string;
    value: viewOptions;
  };
  data: any;
};
export default function Views() {
  const [viewName, setViewName] = React.useState('');
  const [error, setError] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [addedItems, setAddedItems] = React.useState<Item[]>([]);
  const [viewEdit, setViewEdit] = React.useState<Item | null>(null);

  function handleCreateView() {
    if (!viewName) {
      setError('View name is required');
      return;
    }

    setError('');
    setModalOpen(true);
  }

  function handleEditClick(item: Item) {
    setViewEdit(item);
    setModalOpen(true);
  }

  return (
    <div>
      <Text variant="headingMd">Views</Text>
      <Text variant="bodyMd" className="mt-2 block">
        Select the view you want to display for the distribution. You can select
        the view and then customize the options for the view below.
      </Text>

      <div className="mt-4">
        <TextField
          name="view-name"
          label="Name"
          value={viewName}
          onChange={setViewName}
          error={error}
          connectedRight={
            <Button onClick={handleCreateView} variant="interactive">
              Create View
            </Button>
          }
        />
        <ViewDialog
          open={modalOpen}
          name={viewName}
          data={data}
          setOpen={setModalOpen}
          setAddedItems={setAddedItems}
          viewData={viewEdit}
          setViewEdit={setViewEdit}
        />
      </div>

      <div className="mt-12">
        {addedItems && addedItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {addedItems.map((item) => (
              <ListItem
                item={item}
                key={item.id}
                setAddedItems={setAddedItems}
                handleEditClick={handleEditClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

const Bar = ({ type, ...props }: { type: string; [x: string]: any }) => {
  const data = props[0];
  const chartData = props[1];
  const setChartData = props[2];

  const [xAxis, setXAxis] = React.useState('');
  const [yAxis, setYAxis] = React.useState('');
  const [average, setAverage] = React.useState(false);

  React.useEffect(() => {
    setXAxis(chartData?.xAxis);
    setYAxis(chartData?.yAxis);
    setAverage(chartData?.average);
  }, [chartData]);

  const options = React.useMemo(() => {
    const labels = data.map((item: { [x: string]: any }) => item[xAxis]);
    const values = data.map((item: { [x: string]: any }) => item[yAxis]);

    const averageObj: {
      [x: string]: number;
    } = {};

    new Set(labels).forEach((label: any) => {
      const filteredValues = data
        .filter((item: { [x: string]: any }) => item[xAxis] === label)
        .map((item: { [x: string]: any }) => item[yAxis]);

      let sum = 0;
      for (let i = 0; i < filteredValues.length; i++) {
        sum += filteredValues[i];
      }
      averageObj[label] = Math.floor(sum / filteredValues.length);
    });

    return {
      series: [
        {
          data: average ? Object.values(averageObj) : values,
          type: 'bar',
        },
      ],
      [type === 'vertical' ? 'xAxis' : 'yAxis']: {
        data: average ? Object.keys(averageObj) : labels,
        type: 'category',
      },
      [type === 'vertical' ? 'yAxis' : 'xAxis']: {
        type: 'value',
      },
    };
  }, [xAxis, yAxis, data, type, average]);

  return (
    <div>
      <div className="flex flex-wrap items-start gap-4">
        <Combobox
          name="x-axis"
          label="X Axis"
          selectedValue={xAxis}
          onChange={(e) => {
            setXAxis(e);
            setChartData((prev: any) => ({ ...prev, xAxis: e }));
          }}
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Combobox
          name="y-axis"
          label="Y Axis"
          selectedValue={yAxis}
          onChange={(e) => {
            setYAxis(e);
            setChartData((prev: any) => ({ ...prev, yAxis: e }));
          }}
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Label>
          Average
          <div className="mt-2">
            <Switch
              checked={average}
              onCheckedChange={(checked) => {
                setAverage(checked);
                setChartData((prev: any) => ({ ...prev, average: checked }));
              }}
            />
          </div>
        </Label>
      </div>
      <div className="mt-8">
        <Text variant="headingSm" className="mb-2 inline-block">
          Preview
        </Text>
        <BarChart options={options} />
      </div>
    </div>
  );
};

const ViewDialog = ({
  data,
  open,
  name,
  setOpen,
  setAddedItems,
  viewData,
  setViewEdit,
}: {
  data: any;
  open: boolean;
  name: string;
  setOpen: (arg: boolean) => void;
  setAddedItems: (arg: any) => void;
  viewData: Item | null;
  setViewEdit: (arg: Item | null) => void;
}) => {
  const [viewName, setViewName] = React.useState('');
  const [viewChart, setViewChart] = React.useState<viewOptions>('bar-vertical');
  const [chartData, setChartData] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open === true) {
      if (viewData) {
        setViewName(viewData.name);
        setViewChart(viewData.chart.value);
        setChartData(viewData.data);
      } else {
        setViewName(name);
        setViewChart('bar-vertical');
        setChartData(null);
      }
    }
  }, [viewData, open, name]);

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(e) => {
          setChartData(null);
          setOpen(e);

          if (!e) {
            setViewEdit(null);
          }
        }}
      >
        <Dialog.Content title="View Details" fullScreen>
          <FormLayout>
            <TextField
              name="view-name"
              label="Name"
              value={viewName}
              onChange={setViewName}
              error={error}
            />
            <Select
              name="view-type"
              label="Type"
              options={DISTRIBUTION_VIEW_OPTIONS}
              value={viewChart}
              onChange={(e) => {
                setViewChart(e as viewOptions);
              }}
            />
            <div className="mt-4">
              {getViewOptions(viewChart, data, chartData, setChartData)}
            </div>
          </FormLayout>

          <div className="flex justify-end gap-2">
            <Button
              kind="secondary"
              onClick={() => {
                setViewEdit(null);
                setOpen(false);
              }}
              variant="interactive"
            >
              Cancel
            </Button>
            <Button
              variant="interactive"
              onClick={() => {
                const newItem = {
                  data: {
                    ...chartData,
                  },
                  chart: {
                    label:
                      DISTRIBUTION_VIEW_OPTIONS.find(
                        (e) => e.value === viewChart
                      )?.label || viewChart,
                    value: viewChart,
                  },
                  id: viewData ? viewData.id : Date.now(),
                  name: viewName,
                };
                setViewEdit(null);

                if (viewData) {
                  setAddedItems((prev: any) =>
                    prev.map((item: any) =>
                      item.id === viewData.id ? newItem : item
                    )
                  );
                } else {
                  setAddedItems((prev: any) => [...prev, newItem]);
                }
                setViewName('');
                setOpen(false);
              }}
            >
              {viewData ? 'Update' : 'Save'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

const ListItem = ({
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

const EmptyState = () => {
  return (
    <section className="flex flex-col items-center">
      <Icon source={IconBrackets} size={48} color="default" />
      <Text as="h3" variant="headingXl" className="mt-4">
        No Views Added
      </Text>
      <Text variant="bodyMd" className="mt-2 block">
        Create a new view for the resource
      </Text>
    </section>
  );
};

function getViewOptions(view: viewOptions, ...props: any) {
  switch (view) {
    case 'bar-vertical':
      return <Bar {...props} type="vertical" />;
    case 'bar-horizontal':
      return <Bar {...props} type="horizontal" />;
  }
}
