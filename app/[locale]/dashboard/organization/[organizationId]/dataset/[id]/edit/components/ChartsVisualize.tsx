import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  Select,
  Sheet,
  Text,
  TextField,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

interface VisualizationProps {
  setType: any;
}

const datasetResource: any = graphql(`
  query allresources($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      created
      modified
      type
      name
      description
      schema {
        fieldName
        id
        format
        description
      }
    }
  }
`);

const ChartsVisualize: React.FC<VisualizationProps> = ({ setType }) => {
  const params = useParams();
  const { data, isLoading }: { data: any; isLoading: boolean } = useQuery(
    [`charts_${params.id}`],
    () => GraphQL(datasetResource, { datasetId: params.id })
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [chartData, setChartData] = useState({
    name: '',
    description: '',
    chartType: '',
    resource: '',
    xAxisColumn: '',
    xAxisLabel: '',
    yAxisColumn: '',
    yAxisLabel: '',
    aggregate: '',
    showLegend: false,
  });
  const [previousChartData, setPreviousChartData] = useState(chartData);
  const [resourceSchema, setResourceSchema] = useState([]);

  const saveChartData = () => {
    // Implement your save logic here
    console.log('Autosaving chart data...', chartData);
    setPreviousChartData(chartData);
  };

  useEffect(() => {
    const hasChanges =
      JSON.stringify(chartData) !== JSON.stringify(previousChartData);
    if (hasChanges) {
      saveChartData();
    }
  }, [chartData]);

  const handleInputChange = (field: string, value: any) => {
    setChartData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleResourceChange = (resourceId: string) => {
    const selectedResource = data.datasetResources.find(
      (resource: any) => resource.id === resourceId
    );
    setResourceSchema(selectedResource.schema);
    handleInputChange('resource', resourceId);
  };

  return (
    <>
      <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          <Button
            onClick={() => setType('list')}
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
          <TextField
            onChange={(e) => handleInputChange('name', e)}
            label="Chart Name"
            name="name"
            required
            helpText="To know about best practices for naming Visualizations go to our User Guide"
          />
          <TextField
            onChange={(e) => handleInputChange('description', e)}
            label="Description"
            name="description"
            multiline={4}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Select
              name="chartType"
              options={[
                { label: 'Bar Vertical', value: 'BARV' },
                { label: 'Bar Horizontal', value: 'BARH' },
                { label: 'Column', value: 'COLUMN' },
                { label: 'Line', value: 'LINE' },
              ]}
              label="Select Chart Type"
              placeholder="Select"
              onChange={(e) => handleInputChange('chartType', e)}
            />
            <Select
              name="resource"
              options={data?.datasetResources.map((resource: any) => ({
                label: resource.name,
                value: resource.id,
              }))}
              label="Select Resources"
              placeholder="Select"
              onChange={(e) => handleResourceChange(e)}
            />
            <Select
              name="xAxisColumn"
              options={resourceSchema.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              label="X-axis Column"
              placeholder="Select"
              onChange={(e) => handleInputChange('xAxisColumn', e)}
              helpText="Select the column which will be mapped on the X-axis"
            />
            <TextField
              onChange={(e) => handleInputChange('xAxisLabel', e)}
              label="X-axis Label"
              name="xAxisLabel"
              required
            />
            <Select
              name="yAxisColumn"
              options={resourceSchema.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              label="Y-axis Column"
              placeholder="Select"
              onChange={(e) => handleInputChange('yAxisColumn', e)}
              helpText="Select the column which will be mapped on the Y-axis"
            />
            <TextField
              onChange={(e) => handleInputChange('yAxisLabel', e)}
              label="Y-axis Label"
              name="yAxisLabel"
              required
            />
            <Select
              name="aggregate"
              options={[
                { label: 'Sum', value: 'SUM' },
                { label: 'Average', value: 'AVERAGE' },
                { label: 'Count', value: 'COUNT' },
              ]}
              label="Aggregate"
              placeholder="Select"
              onChange={(e) => handleInputChange('aggregate', e)}
            />
            <Checkbox
              name="legend"
              checked={chartData.showLegend}
              onChange={(e) => handleInputChange('showLegend', e)}
            >
              Show Legend (Legend values will be taken from resource)
            </Checkbox>
          </div>
          <div className="mb-6 p-8 text-center">
            <Text>Preview</Text>
            <BarChart
              height="400px"
              options={{
                xAxis: {
                  type: 'category',
                  data: ['Mon'],
                },
                yAxis: {
                  type: 'value',
                },
                series: [
                  {
                    data: [120],
                    type: 'bar',
                    name: 'Sales',
                    color: 'rgb(55,162,218)',
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartsVisualize;
