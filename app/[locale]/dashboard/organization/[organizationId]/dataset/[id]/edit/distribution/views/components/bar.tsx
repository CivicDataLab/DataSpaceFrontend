import React from 'react';
import { Combobox, Label, Switch, Text } from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

export const Bar = ({ type, ...props }: { type: string; [x: string]: any }) => {
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
              name="average"
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
