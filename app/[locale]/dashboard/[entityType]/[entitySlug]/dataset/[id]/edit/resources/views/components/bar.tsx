import React from 'react';
import { Combobox, Label, Switch, Text } from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { ChartConfig } from './list';

type ChartRow = Record<string, string | number>;

interface BarProps {
  type: string;
  data: ChartRow[];
  chartData: ChartConfig | null;
  setChartData: React.Dispatch<React.SetStateAction<ChartConfig | null>>;
  setOptions: React.Dispatch<React.SetStateAction<Record<string, unknown> | null>>;
}

export const Bar = ({
  type,
  data,
  chartData,
  setChartData,
  setOptions,
}: BarProps) => {
  const [xAxis, setXAxis] = React.useState(chartData?.xAxis ?? '');
  const [yAxis, setYAxis] = React.useState(chartData?.yAxis ?? '');
  const [average, setAverage] = React.useState(chartData?.average ?? false);
  const [prevChartData, setPrevChartData] = React.useState(chartData);
  if (chartData !== prevChartData) {
    setPrevChartData(chartData);
    setXAxis(chartData?.xAxis ?? '');
    setYAxis(chartData?.yAxis ?? '');
    setAverage(chartData?.average ?? false);
  }

  const options = React.useMemo(() => {
    const labels = data.map((item) => item[xAxis]);
    const values = data.map((item) => item[yAxis]);

    const averageObj: {
      [x: string]: number;
    } = {};

    new Set(labels).forEach((label) => {
      const key = String(label);
      const filteredValues = data
        .filter((item) => item[xAxis] === label)
        .map((item) => item[yAxis]);

      let sum = 0;
      for (let i = 0; i < filteredValues.length; i++) {
        const numericValue = Number(filteredValues[i]);
        sum += Number.isNaN(numericValue) ? 0 : numericValue;
      }
      averageObj[key] = Math.floor(sum / filteredValues.length);
    });

    const nameTextStyle = {
      align: 'right',
      verticalAlign: 'top',
      padding: [30, 0, 0, 0],
    };

    const newOption = {
      series: [
        {
          data: average ? Object.values(averageObj) : values,
          type: 'bar',
        },
      ],
      [type === 'vertical' ? 'xAxis' : 'yAxis']: {
        data: average ? Object.keys(averageObj) : labels,
        type: 'category',
        name: xAxis,
        nameTextStyle: type === 'vertical' ? nameTextStyle : {},
      },
      [type === 'vertical' ? 'yAxis' : 'xAxis']: {
        type: 'value',
        name: yAxis,
        nameTextStyle: type === 'horizontal' ? nameTextStyle : {},
      },
      grid: {
        containLabel: true,
        left: '5%',
        right: '5%',
      },
    };

    return newOption;
  }, [xAxis, yAxis, data, type, average]);

  const [prevOptions, setPrevOptions] = React.useState<typeof options | null>(
    null
  );
  if (options !== prevOptions) {
    setPrevOptions(options);
    setOptions(options);
  }

  const comboboxString = (value: { value: string }[] | string) =>
    typeof value === 'string' ? value : value[0]?.value ?? '';

  return (
    <div>
      <div className="flex flex-wrap items-start gap-4">
        <Combobox
          name="x-axis"
          label="X Axis"
          selectedValue={xAxis}
          required
          requiredIndicator={true}
          error="X Axis is required"
          onChange={(e) => {
            const next = comboboxString(e);
            setXAxis(next);
            setChartData((prev) => ({ ...prev, xAxis: next }));
          }}
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Combobox
          name="y-axis"
          label="Y Axis"
          selectedValue={yAxis}
          required
          requiredIndicator={true}
          error="Y Axis is required"
          onChange={(e) => {
            const next = comboboxString(e);
            setYAxis(next);
            setChartData((prev) => ({ ...prev, yAxis: next }));
          }}
          list={Object.keys(data[0]).map((key) => ({ label: key, value: key }))}
        />
        <Label>
          Average
          <div className="mt-2">
            <Switch
              name="average"
              checked={average}
              onCheckedChange={(checked) => {
                setAverage(checked);
                setChartData((prev) => ({ ...prev, average: checked }));
              }}
            />
          </div>
        </Label>
      </div>
      <div className="mt-8 w-full">
        <Text variant="headingSm" className="mb-2 inline-block">
          Preview
        </Text>
        <BarChart options={options} />
      </div>
    </div>
  );
};
