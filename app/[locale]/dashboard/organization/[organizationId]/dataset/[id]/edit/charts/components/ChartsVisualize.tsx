import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  AggregateType,
  ChartTypes,
  ResourceChartInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  Select,
  Sheet,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { vizdata } from './data';

interface VisualizationProps {
  setType: any;
  setChartId: any;
  chartId: any;
}

const datasetResource: any = graphql(`
  query allresources($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      type
      name
      description
      schema {
        fieldName
        id
      }
    }
  }
`);

const createChart: any = graphql(`
  mutation editResourceChart($chartInput: ResourceChartInput!) {
    editResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        aggregateType
        chartType
        description
        id
        resource {
          id
          name
        }
        name
        showLegend
        xAxisLabel
        yAxisLabel
        chart
        xAxisColumn {
          id
        }
        yAxisColumn {
          id
        }
      }
    }
  }
`);

const getResourceChartDetails: any = graphql(`
  query resourceChart($chartDetailsId: UUID!) {
    resourceChart(chartDetailsId: $chartDetailsId) {
      aggregateType
      chartType
      description
      id
      name
      showLegend
      xAxisLabel
      yAxisLabel
      chart
      xAxisColumn {
        id
      }
      yAxisColumn {
        id
      }
      resource {
        id
      }
    }
  }
`);

const ChartsVisualize: React.FC<VisualizationProps> = ({
  setType,
  chartId,
  setChartId,
}) => {
  const params = useParams();
  const { data }: { data: any } = useQuery([`charts_${params.id}`], () =>
    GraphQL(datasetResource, { datasetId: params.id })
  );

  const { data: chartDetails, refetch }: { data: any; refetch: any } = useQuery(
    [`chartsdata_${params.id}`],
    () => GraphQL(getResourceChartDetails, { chartDetailsId: chartId })
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [chartData, setChartData] = useState({
    chartId: '',
    name: '',
    description: '',
    chartType: 'BAR_VERTICAL',
    resource: '',
    xAxisColumn: '',
    xAxisLabel: '',
    yAxisColumn: '',
    yAxisLabel: '',
    aggregateType: 'SUM',
    showLegend: false,
    chart: '',
  });
  const [previousChartData, setPreviousChartData] = useState(chartData);
  const [resourceSchema, setResourceSchema] = useState([]);

  useEffect(() => {
    if (chartId && chartDetails && chartDetails.resourceChart) {
      refetch();
      setChartData({
        aggregateType: chartDetails.resourceChart
          .aggregateType as AggregateType,
        chartType: chartDetails.resourceChart.chartType as ChartTypes,
        description: chartDetails.resourceChart.description,
        name: chartDetails.resourceChart.name,
        chartId: chartDetails.resourceChart.id,
        showLegend: chartDetails.resourceChart.showLegend,
        xAxisLabel: chartDetails.resourceChart.xAxisLabel,
        yAxisLabel: chartDetails.resourceChart.yAxisLabel,
        resource: chartDetails.resourceChart.resource.id,
        xAxisColumn: chartDetails.resourceChart.xAxisColumn?.id || '',
        yAxisColumn: chartDetails.resourceChart.yAxisColumn?.id || '',
        chart: chartDetails.resourceChart.chart,
      });
      setPreviousChartData({
        aggregateType: chartDetails.resourceChart
          .aggregateType as AggregateType,
        chartType: chartDetails.resourceChart.chartType as ChartTypes,
        description: chartDetails.resourceChart.description,
        name: chartDetails.resourceChart.name,
        chartId: chartDetails.resourceChart.id,
        showLegend: chartDetails.resourceChart.showLegend,
        xAxisLabel: chartDetails.resourceChart.xAxisLabel,
        yAxisLabel: chartDetails.resourceChart.yAxisLabel,
        resource: chartDetails.resourceChart.resource.id,
        xAxisColumn: chartDetails.resourceChart.xAxisColumn?.id || '',
        yAxisColumn: chartDetails.resourceChart.yAxisColumn?.id || '',
        chart: chartDetails.resourceChart.chart,
      });
    } else {
      setChartData((prevData) => ({
        ...prevData,
        resource: data?.datasetResources[0].id,
      }));
      setResourceSchema(data?.datasetResources[0].schema);
    }
  }, [data, chartDetails]);

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (chartInput: { chartInput: ResourceChartInput }) =>
      GraphQL(createChart, chartInput),
    {
      onSuccess: (res: any) => {
        toast('Resource chart Saved');

        const newChartId = res?.editResourceChart?.id;

        setChartId(newChartId);
        setPreviousChartData({
          aggregateType: res.editResourceChart.aggregateType as AggregateType,
          chartType: res.editResourceChart.chartType as ChartTypes,
          description: res.editResourceChart.description,
          name: res.editResourceChart.name,
          chartId: newChartId,
          showLegend: res.editResourceChart.showLegend,
          xAxisLabel: res.editResourceChart.xAxisLabel,
          yAxisLabel: res.editResourceChart.yAxisLabel,
          resource: res.editResourceChart.resource.id,
          xAxisColumn: res.editResourceChart.xAxisColumn.id,
          yAxisColumn: res.editResourceChart.yAxisColumn.id,
          chart: res.editResourceChart.chart,
        });
      },
      onError: (err: any) => {
        toast(`Received ${err} during resource chart saving`);
      },
    }
  );

  const handleSave = (updatedData: any) => {
    if (JSON.stringify(chartData) !== JSON.stringify(previousChartData)) {
      setPreviousChartData(updatedData);
      const inputChartId = updatedData.chartId || chartId || null;

      mutate({
        chartInput: {
          aggregateType: updatedData.aggregateType as AggregateType,
          type: updatedData.chartType as ChartTypes,
          description: updatedData.description,
          name: updatedData.name,
          chartId: inputChartId,
          showLegend: updatedData.showLegend,
          xAxisLabel: updatedData.xAxisLabel,
          yAxisLabel: updatedData.yAxisLabel,
          resource: updatedData.resource || data?.datasetResources[0].id,
          xAxisColumn: updatedData.xAxisColumn,
          yAxisColumn: updatedData.yAxisColumn,
        },
      });
    }
  };
  const handleChange = (field: string, value: any) => {
    setChartData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleResourceChange = (resourceId: string) => {
    const selectedResource = data?.datasetResources.find(
      (resource: any) => resource.id === resourceId
    );
    setResourceSchema(selectedResource?.schema || []);
    handleChange('resource', resourceId);
  };
  const chartRef = useRef<ReactECharts>(null);

  return (
    <>
      <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          <Button
            onClick={() => {
              setType('list');
              setChartId('');
            }}
            kind="tertiary"
            className="flex text-start"
          >
            <span className="flex items-center gap-2">
              <Icon source={Icons.back} color="interactive" size={24} />
              <Text color="interactive">Charts Listing</Text>
            </span>
          </Button>
          <Sheet open={isSheetOpen}>
            <Sheet.Trigger>
              <Button onClick={() => setIsSheetOpen(true)}>
                Select Charts
              </Button>
            </Sheet.Trigger>
            <Sheet.Content side="bottom">
              <div className="flex flex-col gap-6 p-10">
                <div className="flex items-center justify-between">
                  <Text variant="bodyLg">Select Charts</Text>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setType('visualize')}>
                      Visualize Data
                    </Button>
                    <Button onClick={() => setType('img')}>Add Image</Button>
                    <Button
                      kind="tertiary"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Icon source={Icons.cross} size={24} />
                    </Button>
                  </div>
                </div>
              </div>
            </Sheet.Content>
          </Sheet>
        </div>
        <Divider />
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex justify-end gap-2">
            <Text color="highlight">Auto Save </Text>
            {editMutationLoading ? (
              <Spinner />
            ) : (
              <Icon source={Icons.checkmark} />
            )}
          </div>
          <TextField
            onChange={(e) => handleChange('name', e)}
            value={chartData.name}
            label="Chart Name"
            name="name"
            required
            helpText="To know about best practices for naming Visualizations go to our User Guide"
            onBlur={() => handleSave(chartData)}
          />
          <TextField
            onChange={(e) => handleChange('description', e)}
            label="Description"
            value={chartData.description}
            name="description"
            multiline={4}
            onBlur={() => handleSave(chartData)}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Select
              name="chartType"
              value={chartData.chartType}
              options={[
                { label: 'Bar Vertical', value: 'BAR_VERTICAL' },
                { label: 'Bar Horizontal', value: 'BAR_HORIZONTAL' },
                { label: 'Column', value: 'COLUMN' },
                { label: 'Line', value: 'LINE' },
              ]}
              label="Select Chart Type"
              defaultValue={'BAR_VERTICAL'}
              // placeholder="Select"
              onBlur={() => handleSave(chartData)}
              onChange={(e) => handleChange('chartType', e)}
            />
            <Select
              name="resource"
              options={data?.datasetResources.map((resource: any) => ({
                label: resource.name,
                value: resource.id,
              }))}
              value={chartData.resource}
              defaultValue={data?.datasetResources[0].id}
              label="Select Resources"
              onBlur={() => handleSave(chartData)}
              onChange={(e) => handleResourceChange(e)}
            />
            <Select
              name="xAxisColumn"
              options={resourceSchema?.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              label="X-axis Column"
              value={chartData.xAxisColumn}
              placeholder="Select"
              onBlur={() => handleSave(chartData)}
              onChange={(e) => handleChange('xAxisColumn', e)}
            />
            <TextField
              onChange={(e) => handleChange('xAxisLabel', e)}
              label="X-axis Label"
              value={chartData.xAxisLabel}
              name="xAxisLabel"
              onBlur={() => handleSave(chartData)}
              required
            />
            <Select
              name="yAxisColumn"
              options={resourceSchema?.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              value={chartData.yAxisColumn}
              label="Y-axis Column"
              onBlur={() => handleSave(chartData)}
              placeholder="Select"
              onChange={(e) => handleChange('yAxisColumn', e)}
            />
            <TextField
              onChange={(e) => handleChange('yAxisLabel', e)}
              label="Y-axis Label"
              name="yAxisLabel"
              value={chartData.yAxisLabel}
              onBlur={() => handleSave(chartData)}
              required
            />
            <Select
              name="aggregateType"
              options={[
                { label: 'None', value: 'NONE' },
                { label: 'Sum', value: 'SUM' },
                { label: 'Average', value: 'AVERAGE' },
                { label: 'Count', value: 'COUNT' },
              ]}
              label="Aggregate"
              value={chartData.aggregateType}
              defaultValue="SUM"
              onBlur={() => handleSave(chartData)}
              onChange={(e) => handleChange('aggregateType', e)}
            />
            <div className=" pt-7">
              <Checkbox
                name="legend"
                value={chartData.showLegend.toString()}
                checked={chartData.showLegend}
                onBlur={() => handleSave(chartData)}
                onChange={(e) => handleChange('showLegend', e)}
              >
                Show Legend (Legend values will be taken from resource)
              </Checkbox>
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-6 p-8 text-center">
            <Text>Preview</Text>
            {previousChartData.chart && (
              <ReactECharts option={previousChartData.chart} ref={chartRef} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartsVisualize;
