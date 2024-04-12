'use client';

import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Combobox, Divider, Select, Table, Text } from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { data, DISTRIBUTION_VIEW_OPTIONS } from './constants';

type viewOptions = 'table' | 'bar';

export default function Views() {
  const [view, setView] = React.useState<viewOptions>('bar');

  return (
    <div>
      <Text variant="headingMd">Views</Text>
      <Divider className="my-2" />

      <div>
        <Select
          label="Select View"
          name="select-view"
          className="max-w-40"
          onChange={(e) => setView(e as viewOptions)}
          value={view}
          options={DISTRIBUTION_VIEW_OPTIONS}
        />
        <div className="mt-4">
          <Text variant="headingSm">Select options</Text>
          <Divider className="my-2 max-w-64" />
          {getViewOptions(view)}
        </div>
      </div>
    </div>
  );
}

const BarOptions = () => {
  const [chartData, setChartData] = React.useState(null);

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <Combobox
          name="x-axis"
          label="X Axis"
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Combobox
          name="y-axis"
          label="Y Axis"
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
      </div>
      <BarChart
        options={{
          series: [
            {
              data: [120, 200, 150, 80, 70, 110, 130],
              type: 'bar',
            },
          ],
          xAxis: {
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            type: 'category',
          },
          yAxis: {
            type: 'value',
          },
        }}
      />
    </div>
  );
};

const TableOptions = () => {
  const [selectedColumns, setSelectedColumns] = React.useState<
    {
      label: string;
      value: string;
    }[]
  >(() => {
    return Object.keys(data[0]).map((key) => ({ label: key, value: key }));
  });

  const columnContentTypes: Array<'text' | 'numeric'> = [
    'text',
    'text',
    'numeric',
    'numeric',
    'numeric',
    'text',
  ];

  type TableOptions = keyof (typeof data)[0];

  const columnHelper = createColumnHelper<TableOptions>();

  const columns = selectedColumns.map((column: any) => {
    return columnHelper.accessor(column.label, {
      header: column.label,
    });
  });

  function handleChange(e: any) {
    setSelectedColumns(e);
  }

  return (
    <div>
      <Combobox
        name="table-columns"
        label="Select Columns"
        list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        selectedValue={selectedColumns}
        onChange={handleChange}
        displaySelected
      />
      <div className="mt-8">
        <Text variant="headingSm" className="mb-2 inline-block">
          Preview
        </Text>

        <Table
          columns={columns}
          columnContentTypes={columnContentTypes}
          rows={data}
        />
      </div>
    </div>
  );
};

function getViewOptions(view: viewOptions) {
  switch (view) {
    case 'bar':
      return <BarOptions />;
    case 'table':
      return <TableOptions />;
  }
}
