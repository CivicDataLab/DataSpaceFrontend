import React from 'react';
import { Checkbox, Select, TextField } from 'opub-ui';

interface ChartOptions {
  aggregateType: string;
  regionColumn?: string;
  showLegend: boolean;
  timeColumn?: string;
  valueColumn?: string;
  xAxisColumn: string;
  xAxisLabel: string;
  yAxisColumn: any[];
  yAxisLabel: string;
}

interface ChartData {
  chartId: string;
  description: string;
  filters: any[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: string;
  chart: any;
}

interface ResourceSchema {
  fieldName: string;
  id: string;
}

interface Resource {
  id: string;
  name: string;
}

interface ResourceData {
  datasetResources: Resource[];
}

interface ChartFormProps {
  chartData: ChartData;
  resourceData: ResourceData;
  resourceSchema: ResourceSchema[];
  handleChange: (field: string, value: any) => void;
  handleResourceChange: (value: string) => void;
  handleSave: (data: ChartData) => void;
}

const ChartForm: React.FC<ChartFormProps> = ({
  chartData,
  resourceData,
  resourceSchema,
  handleChange,
  handleResourceChange,
  handleSave,
}) => {
  return (
    <div>
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
          value={chartData.type}
          options={[
            { label: 'Bar Vertical', value: 'BAR_VERTICAL' },
            { label: 'Bar Horizontal', value: 'BAR_HORIZONTAL' },
            {
              label: 'GROUPED_BAR_VERTICAL',
              value: 'GROUPED_BAR_VERTICAL',
            },
            {
              label: ' GROUPED_BAR_HORIZONTAL',
              value: 'GROUPED_BAR_HORIZONTAL',
            },
            { label: 'Line', value: 'LINE' },
            { label: 'Assam District', value: 'ASSAM_DISTRICT' },
            { label: 'ASSAM RC', value: 'ASSAM_RC' },
          ]}
          label="Select Chart Type"
          defaultValue={'BAR_VERTICAL'}
          // placeholder="Select"
          onBlur={() => handleSave(chartData)}
          onChange={(e) => handleChange('chartType', e)}
        />
        <Select
          name="resource"
          options={resourceData?.datasetResources.map((resource: any) => ({
            label: resource.name,
            value: resource.id,
          }))}
          value={chartData?.resource}
          defaultValue={resourceData?.datasetResources[0]?.id}
          label="Select Resources"
          onBlur={() => handleSave(chartData)}
          onChange={(e) => handleResourceChange(e)}
        />
        {chartData.type !== 'ASSAM_DISTRICT' &&
        chartData.type !== 'ASSAM_RC' ? (
          <>
            <Select
              name="xAxisColumn"
              options={resourceSchema?.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              label="X-axis Column"
              value={chartData.options.xAxisColumn}
              placeholder="Select"
              onBlur={() => handleSave(chartData)}
              onChange={(e) => handleChange('xAxisColumn', e)}
            />
            <TextField
              onChange={(e) => handleChange('xAxisLabel', e)}
              label="X-axis Label"
              value={chartData.options.xAxisLabel}
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
              // value={chartData?.options?.yAxisColumn[0]}
              label="Y-axis Column"
              onBlur={() => handleSave(chartData)}
              placeholder="Select"
              onChange={(e) => handleChange('yAxisColumn', e)}
            />
            <TextField
              onChange={(e) => handleChange('yAxisLabel', e)}
              label="Y-axis Label"
              name="yAxisLabel"
              value={chartData.options.yAxisLabel}
              onBlur={() => handleSave(chartData)}
              required
            />
          </>
        ) : (
          <>
            <Select
              name="regionColumn"
              options={resourceSchema?.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              label="Region Column"
              value={chartData.options.regionColumn}
              placeholder="Select"
              onBlur={() => handleSave(chartData)}
              onChange={(e) => handleChange('regionColumn', e)}
            />
            <Select
              name="valueColumn"
              options={resourceSchema?.map((field: any) => ({
                label: field.fieldName,
                value: field.id,
              }))}
              value={chartData.options.valueColumn}
              label="Value Column"
              onBlur={() => handleSave(chartData)}
              placeholder="Select"
              onChange={(e) => handleChange('valueColumn', e)}
            />
          </>
        )}
        <Select
          name="aggregateType"
          options={[
            { label: 'None', value: 'NONE' },
            { label: 'Sum', value: 'SUM' },
            { label: 'Average', value: 'AVERAGE' },
            { label: 'Count', value: 'COUNT' },
          ]}
          label="Aggregate"
          value={chartData?.options?.aggregateType}
          defaultValue="SUM"
          onBlur={() => handleSave(chartData)}
          onChange={(e) => handleChange('aggregateType', e)}
        />
        <div className=" pt-7">
          <Checkbox
            name="legend"
            value={chartData?.options?.showLegend?.toString()}
            // checked={chartData?.options?.showLegend}
            onBlur={() => handleSave(chartData)}
            onChange={(e) => handleChange('showLegend', e)}
          >
            Show Legend (Legend values will be taken from resource)
          </Checkbox>
        </div>
      </div>
    </div>
  );
};

export default ChartForm;
