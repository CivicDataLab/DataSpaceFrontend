'use client';

import React from 'react';
import { IconBrackets } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Dialog,
  FormLayout,
  Icon,
  Select,
  Switch,
  Text,
  TextField,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { data, DISTRIBUTION_VIEW_OPTIONS, type viewOptions } from './constants';

const addedItems = [
  {
    name: 'View 1',
    chart: {
      label: 'Bar Vertical',
      value: 'bar-vertical',
    },
    options: {
      x: 'name',
      y: 'value',
    },
  },
  {
    name: 'View 2',
    chart: {
      label: 'Bar Horizontal',
      value: 'bar-horizontal',
    },
    options: {
      x: 'name',
      y: 'value',
    },
  },
];
export default function Views() {
  const [viewName, setViewName] = React.useState('');
  const [error, setError] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [view, setView] = React.useState<viewOptions>('bar-vertical');

  function handleCreateView() {
    if (!viewName) {
      setError('View name is required');
      return;
    }

    setError('');
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
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <Dialog.Content title="View Details">
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
                value={view}
                onChange={(e) => setView(e as viewOptions)}
              />
              <div className="mt-4">{getViewOptions(view, data)}</div>
            </FormLayout>

            <div className="flex justify-end gap-2">
              <Button
                kind="secondary"
                onClick={() => setModalOpen(false)}
                variant="interactive"
              >
                Cancel
              </Button>
              <Button variant="interactive">Save</Button>
            </div>
          </Dialog.Content>
        </Dialog>
      </div>

      <div className="mt-12">
        {addedItems?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {addedItems.map((item) => (
              <ListItem
                label={item.name}
                value={item.chart.label}
                key={item.name}
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

const ListItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start justify-between rounded-2 border-1 border-solid border-borderDefault bg-surfaceDefault p-6">
      <div className="flex flex-col gap-1">
        <Text variant="headingMd">{label}</Text>
        <Text variant="bodyMd">{value}</Text>
      </div>
      <div className="flex gap-2">
        <Button variant="interactive" size="slim" kind="secondary">
          Edit
        </Button>
        <Button variant="critical" size="slim" kind="secondary">
          Delete
        </Button>
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <section className="flex flex-col items-center">
      {/* @ts-expect-error fix icon component */}
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

const Bar = ({ type, ...props }: { type: string; [x: string]: any }) => {
  const data = props[0];
  const [xAxis, setXAxis] = React.useState('');
  const [yAxis, setYAxis] = React.useState('');
  const [average, setAverage] = React.useState(false);

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
      <div className="flex flex-wrap items-center gap-4">
        <Combobox
          name="x-axis"
          label="X Axis"
          selectedValue={xAxis}
          onChange={setXAxis}
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Combobox
          name="y-axis"
          label="Y Axis"
          selectedValue={yAxis}
          onChange={setYAxis}
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Switch label="Average" onCheckedChange={setAverage} />
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

function getViewOptions(view: viewOptions, ...props: any) {
  switch (view) {
    case 'bar-vertical':
      return <Bar {...props} type="vertical" />;
    case 'bar-horizontal':
      return <Bar {...props} type="horizontal" />;
  }
}
