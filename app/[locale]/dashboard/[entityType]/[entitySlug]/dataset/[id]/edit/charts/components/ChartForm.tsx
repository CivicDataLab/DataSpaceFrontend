import React, { useEffect } from 'react';
import { ChartTypes } from '@/gql/generated/graphql';
import { Button, Checkbox, Select, Text, TextField } from 'opub-ui';
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

  useEffect(() => {
    if (
      !chartData.options.yAxisColumn ||
      chartData.options.yAxisColumn.length === 0
    ) {
      handleChange('options', {
        ...chartData.options,
        yAxisColumn: [{ fieldName: '', label: '', color: '' }],
      });
    }
  }, [chartData.options.yAxisColumn]);

  

  // useEffect(() => {
  //   if (
  //     !chartData.filters ||
  //     chartData.filters.length === 0
  //   ) {
  //     handleChange('filters', {
  //       ...chartData,
  //       // filters: [{ column: '', operator: '==', value: '' }],
  //     });
  //   }
  // }, [chartData.filters]);

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

  // const handlefilterColumnChange = (
  //   index: number,
  //   field: string,
  //   value: any
  // ) => {
  //   const currentFilters = Array.isArray(chartData.filters) ? chartData.filters : [];
  //   const newFiltersColumns = [...currentFilters];
  //   newFiltersColumns[index] = {
  //     ...newFiltersColumns[index],
  //     [field]: value,
  //   };
  //   handleChange('filters', newFiltersColumns); // Changed this line
  // };
  // const addFilterColumn = () => {
  //   const currentFilters = Array.isArray(chartData.filters) ? chartData.filters : [];
  //   const newFiltersColumns = [
  //     ...currentFilters,
  //     { column: '', operator: '==', value: '' },
  //   ];
  //   handleChange('filters', newFiltersColumns);
  // };

  // const removeFilterColumn = (index: number) => {
  //   const currentFilters = Array.isArray(chartData.filters) ? chartData.filters : [];
  //   const newFiltersColumns = currentFilters.filter((_, i) => i !== index);
  //   handleChange('filters', newFiltersColumns);
  // };
  const updateChartData = (field: string, value: any) => {
    if (field === 'type') {
      const newData = {
        ...chartData,
        type: value,
        options: {
          ...chartData.options,
          yAxisColumn:
            chartData.options.yAxisColumn.length > 0
              ? chartData.options.yAxisColumn
              : [{ fieldName: '', label: '', color: '' }],
        },
      };
      handleChange(field, value);
      handleSave(newData); // Pass the new data directly
    } else {
      const newData = {
        ...chartData,
        [field]: value,
      };
      handleChange(field, value);
      handleSave(newData);
    }
  };

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
        onChange={(e) => updateChartData('type', e)}
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
      <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-2">
        <Select
          name="aggregateType"
          options={[
            { label: 'None', value: 'NONE' },
            { label: 'Sum', value: 'SUM' },
            { label: 'Average', value: 'AVERAGE' },
            { label: 'Count', value: 'COUNT' },
          ]}
          label="Aggregate"
          value={chartData.options.aggregateType}
          defaultValue="SUM"
          onBlur={() => handleSave(chartData)}
          onChange={(e) =>
            handleChange('options', { ...chartData.options, aggregateType: e })
          }
        />
        <div className=" m-0 lg:ml-6 lg:mt-6">
          <Checkbox
            name="legend"
            value={chartData.options.showLegend?.toString()}
            checked={chartData.options.showLegend ?? true}
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
        </div>
      </div>
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
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
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
          </div>

          {(isBarOrLineChart || isGroupedChart) && (
            <div className="flex flex-row flex-wrap justify-between  gap-4">
              <div className="flex flex-col gap-4 ">
                {chartData?.options?.yAxisColumn?.map((column, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-4 lg:flex-nowrap"
                  >
                    <Select
                      name={`yAxisColumn-${index}`}
                      options={resourceSchema
                        ?.filter(
                          (field) => field.format.toUpperCase() === 'INTEGER'
                        )
                        .map((field) => ({
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
                      onChange={(e) =>
                        handleYAxisColumnChange(index, 'label', e)
                      }
                      onBlur={() => handleSave(chartData)}
                    />
                    <div className=" flex flex-col gap-1">
                      <Text>Color</Text>
                      <input
                        name={`yAxisColor-${index}`}
                        type="Color"
                        className=" h-9"
                        value={column.color || '#000000'}
                        onChange={(e: any) => {
                          handleYAxisColumnChange(
                            index,
                            'color',
                            e.target.value
                          );
                        }}
                        onBlur={() => handleSave(chartData)}
                      />
                    </div>
                    {isGroupedChart && index > 0 && (
                      <Button onClick={() => removeYAxisColumn(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {isGroupedChart && (
                <Button className="mt-4 h-fit w-fit" onClick={addYAxisColumn}>
                  Add Y-axis Column
                </Button>
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

      {/* <div className="flex flex-row flex-wrap justify-between  gap-4">
        <div className="flex flex-col gap-4 ">
        {Array.isArray(chartData?.filters) && chartData?.filters?.map((column, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-4 lg:flex-nowrap"
            >
              <Select
                name={`Column-${index}`}
                options={resourceSchema.map((field) => ({
                  label: field.fieldName,
                  value: field.id,
                }))}
                label="Column"
                className={`w-36`} 
                value={column.fieldName}
                onChange={(e) => handlefilterColumnChange(index, 'column', e)}
                onBlur={() => handleSave(chartData)}
                placeholder="Select"
              />
              <Select
                name={`operator-${index}`}
                className={`w-36`} 
                options={[
                  { label: 'Equal to', value: '==' },
                  { label: 'Not Equal to', value: '!=' },
                  { label: 'Less than', value: '<' },
                  { label: 'Greater than', value: '>' },
                  { label: 'In', value: 'in' },
                  { label: 'Not In', value: 'not in' },
                  { label: 'Less than or Equal to', value: '<=' },
                  { label: 'Greater than or Equal to', value: '>=' },

                ]}
                label="Operator"
                value={column.operator}
                defaultValue="Equal to"
                onChange={(e) => handlefilterColumnChange(index, 'operator', e)}
                onBlur={() => handleSave(chartData)}
              />

              <TextField
                name={`Value-${index}`}
                value={column.value}
                label="Value"
                onChange={(e: any) => {
                  handlefilterColumnChange(index, 'value', e);
                }}
                onBlur={() => handleSave(chartData)}
              />
              { index > 0 && (
                <Button onClick={() => removeFilterColumn(index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        { (
          <Button className="mt-4 h-fit w-fit" onClick={addFilterColumn}>
            Add Filter Column
          </Button>
        )}
      </div> */}
    </div>
  );
};

export default ChartForm;
