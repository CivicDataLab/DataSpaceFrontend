import React from 'react';
import { ChartTypes } from '@/gql/generated/graphql';
import { Button, Checkbox, Select, TextField } from 'opub-ui';

import { ChartData, ResourceData, ResourceSchema } from '../types';

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
  const isAssamChart =
    chartData.type === ChartTypes.AssamDistrict ||
    chartData.type === ChartTypes.AssamRc;
  const isGroupedChart =
    chartData.type === ChartTypes.GroupedBarVertical ||
    chartData.type === ChartTypes.GroupedBarHorizontal;
  const isBarOrLineChart =
    chartData.type === ChartTypes.BarVertical ||
    chartData.type === ChartTypes.BarHorizontal ||
    chartData.type === ChartTypes.Line ||
    chartData.type === ChartTypes.Multiline;

  const handleYAxisColumnChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newYAxisColumns = [...chartData.options.yAxisColumn];
    newYAxisColumns[index] = {
      ...newYAxisColumns[index],
      [field]: value,
    };
    handleChange('options', {
      ...chartData.options,
      yAxisColumn: newYAxisColumns,
    });
  };

  const addYAxisColumn = () => {
    const newYAxisColumns = [
      ...(chartData.options.yAxisColumn ?? []),
      { fieldName: '', label: '', color: '' },
    ];
    handleChange('options', {
      ...chartData.options,
      yAxisColumn: newYAxisColumns,
    });
  };

  const removeYAxisColumn = (index: number) => {
    const newYAxisColumns = chartData.options.yAxisColumn.filter(
      (_, i) => i !== index
    );
    handleChange('options', {
      ...chartData.options,
      yAxisColumn: newYAxisColumns,
    });
  };

console.log(chartData, "data");

  return (
    <div className="flex flex-col gap-4">
      <TextField
        onChange={(e) => handleChange('name', e)}
        label="Name"
        value={chartData.name}
        name="name"
        onBlur={() => handleSave(chartData)}
        required
      />
      <TextField
        onChange={(e) => handleChange('description', e)}
        label="Description"
        value={chartData.description}
        name="description"
        onBlur={() => handleSave(chartData)}
        required
      />
      <Select
        name="type"
        options={Object.values(ChartTypes).map((type) => ({
          label: type,
          value: type,
        }))}
        label="Chart Type"
        value={chartData.type}
        onBlur={() => handleSave(chartData)}
        onChange={(e) => handleChange('type', e)}
        placeholder="Select"
      />
      <Select
        name="resource"
        options={resourceData?.datasetResources?.map((resource) => ({
          label: resource.name,
          value: resource.id,
        }))}
        label="Resource"
        value={chartData.resource}
        onBlur={() => handleSave(chartData)}
        onChange={handleResourceChange}
        placeholder="Select"
      />
      <Checkbox
        name="legend"
        value={chartData.options.showLegend?.toString()}
        checked={chartData.options.showLegend}
        onBlur={() => handleSave(chartData)}
        onChange={(e) =>
          handleChange('options', {
            ...chartData.options,
            showLegend: e,
          })
        }
      >
        Show Legend
      </Checkbox>

      {!isAssamChart && (
        <>
          <Select
            name="xAxisColumn"
            options={resourceSchema?.map((field) => ({
              label: field.fieldName,
              value: field.id,
            }))}
            label="X-axis Column"
            value={chartData.options.xAxisColumn}
            onBlur={() => handleSave(chartData)}
            onChange={(e) =>
              handleChange('options', {
                ...chartData.options,
                xAxisColumn: e,
              })
            }
            placeholder="Select"
          />
          <TextField
            onChange={(e) =>
              handleChange('options', {
                ...chartData.options,
                xAxisLabel: e,
              })
            }
            label="X-axis Label"
            value={chartData.options.xAxisLabel}
            name="xAxisLabel"
            onBlur={() => handleSave(chartData)}
            required
          />
          <TextField
            onChange={(e) =>
              handleChange('options', {
                ...chartData.options,
                yAxisLabel: e,
              })
            }
            label="Y-axis Label"
            value={chartData.options.yAxisLabel}
            name="yAxisLabel"
            onBlur={() => handleSave(chartData)}
            required
          />

          {(isBarOrLineChart || isGroupedChart) && (
            <div className="flex flex-col gap-4">
              {chartData?.options?.yAxisColumn?.map((column, index) => (
                <div key={index} className="flex items-end gap-4">
                  <Select
                    name={`yAxisColumn-${index}`}
                    options={resourceSchema?.map((field) => ({
                      label: field.fieldName,
                      value: field.id,
                    }))}
                    label="Y-axis Column"
                    value={column.fieldName}
                    onChange={(e) =>
                      handleYAxisColumnChange(index, 'fieldName', e)
                    }
                    onBlur={() => handleSave(chartData)}
                    placeholder="Select"
                  />
                  <TextField
                    name={`yAxisLabel-${index}`}
                    label="Label"
                    value={column.label}
                    onChange={(e) => handleYAxisColumnChange(index, 'label', e)}
                    onBlur={() => handleSave(chartData)}
                  />
                  <input
                    name={`yAxisColor-${index}`}
                    type="Color"
                    value={column.color}
                    onChange={(e: any) => {
                      handleYAxisColumnChange(index, 'color', e.target.value);
                    }}
                    onBlur={() => handleSave(chartData)}
                  />
                  {isGroupedChart && index > 0 && (
                    <Button onClick={() => removeYAxisColumn(index)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              {isGroupedChart && (
                <Button onClick={addYAxisColumn}>Add Y-axis Column</Button>
              )}
            </div>
          )}
        </>
      )}

      {isAssamChart && (
        <>
          <Select
            name="regionColumn"
            options={resourceSchema?.map((field) => ({
              label: field.fieldName,
              value: field.id,
            }))}
            label="Region Column"
            value={chartData.options.regionColumn}
            onBlur={() => handleSave(chartData)}
            onChange={(e) =>
              handleChange('options', {
                ...chartData.options,
                regionColumn: e,
              })
            }
            placeholder="Select"
          />
          <Select
            name="valueColumn"
            options={resourceSchema?.map((field) => ({
              label: field.fieldName,
              value: field.id,
            }))}
            label="Value Column"
            value={chartData.options.valueColumn}
            onBlur={() => handleSave(chartData)}
            onChange={(e) =>
              handleChange('options', {
                ...chartData.options,
                valueColumn: e,
              })
            }
            placeholder="Select"
          />
        </>
      )}
    </div>
  );
};

export default ChartForm;
