import React from 'react';
import { Button, Dialog, Form, FormLayout, Input, Select } from 'opub-ui';

import { DISTRIBUTION_VIEW_OPTIONS, viewOptions } from '../constants';
import { Bar } from './bar';
import { ChartConfig, Item } from './list';

type ChartRow = Record<string, string | number>;

export const ViewDialog = ({
  data,
  open,
  name,
  setOpen,
  setAddedItems,
  viewData,
  setViewEdit,
}: {
  data: ChartRow[];
  open: boolean;
  name: string;
  setOpen: (arg: boolean) => void;
  setAddedItems: React.Dispatch<React.SetStateAction<Item[]>>;
  viewData: Item | null;
  setViewEdit: (arg: Item | null) => void;
}) => {
  const [viewName, setViewName] = React.useState('');
  const [viewChart, setViewChart] = React.useState<viewOptions>('bar-vertical');
  const [chartData, setChartData] = React.useState<ChartConfig | null>(null);
  const [options, setOptions] = React.useState<Record<string, unknown> | null>(
    null
  );
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevViewData, setPrevViewData] = React.useState(viewData);
  const [prevName, setPrevName] = React.useState(name);
  if (open !== prevOpen || viewData !== prevViewData || name !== prevName) {
    setPrevOpen(open);
    setPrevViewData(viewData);
    setPrevName(name);
    if (open === true) {
      if (viewData) {
        setViewName(viewData.name);
        setViewChart(viewData.chart.value);
        setChartData(viewData.chart.data);
      } else {
        setViewName(name);
        setViewChart('bar-vertical');
        setChartData(null);
      }
    }
  }

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
          <Form
            formOptions={{
              defaultValues: {
                'view-name': viewName,
                'view-type': viewChart,
                'x-axis': chartData?.xAxis,
                'y-axis': chartData?.yAxis,
                average: chartData?.average,
              },
            }}
            resetValues={{
              'view-name': '',
              'view-type': '',
              'x-axis': '',
              'y-axis': '',
              average: false,
            }}
            onSubmit={() => {
              const newItem = {
                chart: {
                  label:
                    DISTRIBUTION_VIEW_OPTIONS.find((e) => e.value === viewChart)
                      ?.label || viewChart,
                  value: viewChart,
                  data: {
                    ...chartData,
                  },
                },
                id: viewData ? viewData.id : Date.now(),
                name: viewName,
                options,
              };
              setViewEdit(null);

              if (viewData) {
                setAddedItems((prev) =>
                  prev.map((item) =>
                    item.id === viewData.id ? newItem : item
                  )
                );
              } else {
                setAddedItems((prev) => [...prev, newItem]);
              }
              setViewName('');
              setOpen(false);
            }}
          >
            <FormLayout>
              <Input
                name="view-name"
                label="Name"
                value={viewName}
                onChange={setViewName}
                required
                requiredIndicator={true}
                error="View name is required"
              />
              <Select
                name="view-type"
                label="Type"
                options={DISTRIBUTION_VIEW_OPTIONS}
                required
                requiredIndicator={true}
                error="View type is required"
                value={viewChart}
                onChange={(e) => {
                  setViewChart(e as viewOptions);
                }}
              />
              <div className="mt-4">
                {getViewOptions(
                  viewChart,
                  data,
                  chartData,
                  setChartData,
                  setOptions
                )}
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
              <Button variant="interactive" submit>
                {viewData ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

function getViewOptions(
  view: viewOptions,
  data: ChartRow[],
  chartData: ChartConfig | null,
  setChartData: React.Dispatch<React.SetStateAction<ChartConfig | null>>,
  setOptions: React.Dispatch<React.SetStateAction<Record<string, unknown> | null>>
) {
  switch (view) {
    case 'bar-vertical':
      return (
        <Bar
          type="vertical"
          data={data}
          chartData={chartData}
          setChartData={setChartData}
          setOptions={setOptions}
        />
      );
    case 'bar-horizontal':
      return (
        <Bar
          type="horizontal"
          data={data}
          chartData={chartData}
          setChartData={setChartData}
          setOptions={setOptions}
        />
      );
  }
}
