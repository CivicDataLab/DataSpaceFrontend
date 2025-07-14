import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import LoadingPage from '@/app/[locale]/dashboard/loading';
import { graphql } from '@/gql';
import { ChartTypes } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import {
  Button,
  Dialog,
  Label,
  Popover,
  Select,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import TitleBar from '../../../components/title-bar';
import { datasetResource } from '../../queries';

interface YAxisColumnItem {
  fieldName: string;
  label: string;
  color: string;
}
interface ChartFilters {
  column: string;
  operator: string;
  value: string;
}

interface ChartOptions {
  aggregateType?: string;
  regionColumn?: string;
  showLegend: boolean;
  timeColumn?: string;
  valueColumn?: string;
  xAxisColumn?: string;
  xAxisLabel?: string;
  yAxisColumn?: YAxisColumnItem[];
  yAxisLabel?: string;
  stacked?: boolean;
  orientation?: string;
}

interface ResourceSchema {
  fieldName: string;
  id: string;
  format: string;
}

interface Dataset {
  id: string;
  title: string;
}

interface Resource {
  id: string;
  name: string;
  schema: ResourceSchema[];
}

interface ChartData {
  chartId: string;
  description?: string;
  filters: any[];
  name: string;
  options: ChartOptions;
  resource: Resource;
  type: ChartTypes;
  chart: any;
  dataset: Dataset;
}

interface ResourceChartInput {
  chartId: string;
  description: string;
  filters: ChartFilters[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
}

const getAllDatasetsListwithResourcesDoc: any = graphql(`
  query getAllDatasetsForDropdown {
    datasets {
      id
      title
      slug
      resources {
        id
        name
      }
    }
  }
`);

const getResourceChartForViz: any = graphql(`
  query getResourceChartForViz($chartDetailsId: UUID!) {
    resourceChart(chartDetailsId: $chartDetailsId) {
      name
      chartType
      chart {
        height
        width
        options
        renderer
      }
      chartOptions {
        aggregateType
        allowMultiSeries
        orientation
        regionColumn {
          fieldName
          format
        }
        showLegend
        stacked
        timeColumn {
          id
          fieldName
          format
        }
        valueColumn {
          id
          fieldName
          format
        }
        xAxisColumn {
          id
          fieldName
          format
        }
        xAxisLabel
        yAxisColumn {
          color
          field {
            id
            fieldName
            format
          }
          label
          valueMapping {
            key
            value
          }
        }
        yAxisLabel
      }
      chartFilters {
        column {
          id
          fieldName
        }
        operator
        value
      }
      dataset {
        id
        title
      }
      resource {
        id
        name
        schema {
          fieldName
          id
          format
        }
      }
    }
  }
`);

const saveEditResourceChartDoc: any = graphql(`
  mutation saveEditResourceChart($chartInput: ResourceChartInput!) {
    editResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        id
      }
    }
  }
`);

const publishResourceChartDoc: any = graphql(`
  mutation publishResourceChart($chartId: UUID!) {
    publishResourceChart(chartId: $chartId)
  }
`);

const ChartGenVizPreview = ({ params }: { params: any }) => {
  type TabValue = 'DATA' | 'CUSTOMIZE';
  const [selectedTab, setSelectedTab] = useState<TabValue>('DATA');

  const [selectedDataset, setSelectedDataset] = useState<any>('');

  const [editYaxisPopOverOpen, setEditYaxisPopOverOpen] = useState(false);
  const [addYaxisPopOverOpen, setAddYaxisPopOverOpen] = useState(false);

  const [xAxisLabelInput, setXAxisLabelInput] = useState('');
  const [yAxisLabelInput, setYAxisLabelInput] = useState('');

  const [chartData, setChartData] = useState<ChartData>({
    chartId: '',
    description: '',
    filters: [
      {
        column: '',
        operator: '==',
        value: '',
      },
    ],
    name: '',
    options: {
      aggregateType: 'SUM',
      showLegend: true,
      xAxisColumn: '',
      xAxisLabel: '',
      yAxisColumn: [{ fieldName: '', label: '', color: '#000000' }],
      yAxisLabel: '',
      regionColumn: '',
      valueColumn: '',
      timeColumn: '',
    },
    dataset: {
      id: '',
      title: '',
    },
    resource: {
      id: '',
      name: '',
      schema: [],
    },
    type: ChartTypes.Bar,
    chart: {},
  });

  const chartTypesOptions: any = [
    {
      label: 'BAR',
      value: 'BAR',
      icon: 'chartBar',
    },
    {
      label: 'LINE',
      value: 'LINE',
      icon: 'chartLine',
    },
    {
      label: 'TREEMAP',
      value: 'TREEMAP',
      icon: 'chartTreeMap',
    },
    {
      label: 'BIG NUMBER',
      value: 'BIG_NUMBER',
      icon: 'chartBigNumber',
    },
    {
      label: 'MAP',
      value: 'MAP',
      icon: 'chartMap',
    },
    {
      label: 'MAP POLYGON',
      value: 'MAP_POLYGON',
      icon: 'chartMapPolygon',
    },
  ];

  const handleTabClick = (item: { label: string; id: TabValue }) => {
    setSelectedTab(item.id);
  };

  const getAllDatasetsWithResourcesRes: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
    isError: boolean;
  } = useQuery([`allDatasetsListwithResourcesForCharts`], () =>
    GraphQL(
      getAllDatasetsListwithResourcesDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      []
    )
  );

  const chartDetailsRes: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
    isError: boolean;
  } = useQuery([`chartDetailsForViz`], () =>
    GraphQL(
      getResourceChartForViz,
      {
        [params.entityType]: params.entitySlug,
      },
      {
        chartDetailsId: params.chartID,
      }
    )
  );

  useEffect(() => {
    if (chartDetailsRes?.data?.resourceChart) {
      const chartRes = chartDetailsRes?.data?.resourceChart;

      console.log('chartData updated :::::::::', chartRes);

      setChartData({
        chartId: params.chartID,
        name: chartRes?.name,
        // description: chartDetailsRes?.data?.resourceChart?.description,
        filters:
          chartRes?.chartFilters?.length > 0
            ? chartRes?.chartFilters.map((filter: any) => ({
                column: filter.column,
                operator: filter.operator,
                value: filter.value,
              }))
            : [{ column: '', operator: '==', value: '' }],
        options: {
          aggregateType: chartRes?.chartOptions?.aggregateType,
          showLegend: chartRes?.chartOptions?.showLegend ?? true,
          xAxisColumn: chartRes?.chartOptions?.xAxisColumn?.id,
          xAxisLabel: chartRes?.chartOptions?.xAxisLabel,
          yAxisColumn: chartRes?.chartOptions?.yAxisColumn?.map((col: any) => ({
            fieldName: col.field.id,
            label: col.label,
            color: col.color,
          })),
          yAxisLabel: chartRes?.chartOptions?.yAxisLabel,
          regionColumn: chartRes?.chartOptions?.regionColumn?.id,
          timeColumn: chartRes?.chartOptions?.timeColumn,
          valueColumn: chartRes?.chartOptions?.valueColumn?.id,
          stacked: chartRes?.chartOptions?.stacked,
          orientation: chartRes?.chartOptions?.orientation,
        },
        resource: {
          id: chartRes?.resource?.id,
          name: chartRes?.resource?.name,
          schema: chartRes?.resource?.schema.map((schema: any) => ({
            fieldName: schema.fieldName,
            id: schema.id,
            format: schema.format,
          })),
        },
        dataset: {
          id: chartRes?.dataset?.id,
          title: chartRes?.dataset?.title,
        },
        type: chartRes?.chartType as ChartTypes,
        chart: chartRes?.chart,
      });
    }
  }, [chartDetailsRes.data, params.chartID]);

  useEffect(() => {
    if (chartDetailsRes?.data?.resourceChart?.resource) {
      setSelectedDataset(
        getAllDatasetsWithResourcesRes?.data?.datasets?.find(
          (ds: any) =>
            ds.id === chartDetailsRes?.data?.resourceChart?.dataset?.id
        ).id || {}
      );
    }
  }, [chartDetailsRes.data, getAllDatasetsWithResourcesRes.data]);

  const editResourceChartMutation: {
    mutate: any;
    isLoading: any;
  } = useMutation(
    (data: { chartInput: ResourceChartInput }) =>
      GraphQL(
        saveEditResourceChartDoc,
        { [params.entityType]: params.entitySlug },
        data
      ),
    {
      onSuccess: () => {
        chartDetailsRes.refetch();
        toast('Resource Chart Updated Successfully');
      },
      onError: (err: any) => {
        toast(`Received ${err} while updating resource chart`);
      },
    }
  );

  const chartRef = useRef<ReactECharts>(null);

  const publishResourceChartMutation: {
    mutate: any;
    isLoading: any;
  } = useMutation(
    (data: { chartId: string }) =>
      GraphQL(
        publishResourceChartDoc,
        { [params.entityType]: params.entitySlug },
        data
      ),
    {
      onSuccess: () => {
        toast('Resource Chart Published Successfully');
      },
      onError: (err: any) => {
        toast(`Received ${err} while publishing resource chart`);
      },
    }
  );

  const handleSave = (field: string, value: any) => {
    console.log('Saving chart data :::::::::::::', field, value);

    switch (field) {
      case 'chartName':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            name: value,
            options: chartData.options,
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'resource':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: value,
            name: chartData.name,
            options: chartData.options,
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'chartType':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            type: value,
            options: chartData.options,
            filters: chartData.filters,
          },
        });
        toast('Chart Type Updated Successfully');
        break;

      case 'xAxisColumn':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              xAxisColumn: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'addYAxisColumn':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              yAxisColumn:
                chartData.options.yAxisColumn === undefined
                  ? [value]
                  : [...chartData.options.yAxisColumn, value],
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'removeYAxisColumn':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              yAxisColumn:
                chartData.options.yAxisColumn?.filter(
                  (col: any) => col.fieldName !== value
                ) ?? [],
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'editYAxisColumn':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              yAxisColumn:
                chartData.options.yAxisColumn?.map((col: any, indx: number) => {
                  if (indx === value.index) {
                    delete value.index;
                    return value;
                  }
                  return col;
                }) ?? [],
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'aggregateType':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              aggregateType: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'xAxisLabel':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              xAxisLabel: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'yAxisLabel':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              yAxisLabel: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'stacked':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              stacked: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'orientation':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              orientation: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'showLegend':
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            options: {
              ...chartData.options,
              showLegend: value,
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });

        break;

      default:
        break;
    }
  };

  const handlePublishChart = () => {
    // console.log(
    //   chartData.resource.id,
    //   chartData.options.xAxisColumn,
    //   chartData.options.yAxisColumn
    // );

    if (
      chartData.resource.id &&
      chartData.options.xAxisColumn !== '' &&
      chartData.options.yAxisColumn !== undefined &&
      chartData.options.yAxisColumn?.length > 0
    ) {
      publishResourceChartMutation.mutate({
        chartId: params.chartID,
      });
    } else {
      toast('Failed to publish chart. Chart is not valid');
    }
  };

  return (
    <div>
      {chartDetailsRes.isError ? (
        <>Error Loading the Page</>
      ) : chartDetailsRes.isLoading ? (
        <LoadingPage />
      ) : (
        <div>
          <TitleBar
            label={'CHART NAME'}
            title={chartDetailsRes?.data?.resourceChart?.name}
            goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/charts`}
            onSave={(val: any) => {
              handleSave('chartName', val);
            }}
            loading={editResourceChartMutation.isLoading}
            status={editResourceChartMutation.isLoading ? 'loading' : 'success'}
            setStatus={() => {}}
          />

          <div className="border-t-2 border-solid border-greyExtralight pt-8">
            <div className="flex flex-row justify-center gap-6">
              <div className="flex flex-[7] justify-center">
                <div className="w-full rounded-4 border-1 border-solid border-greyExtralight object-contain">
                  {chartData.chart?.options &&
                  Object.keys(chartData.chart?.options).length > 0 ? (
                    <ReactECharts
                      option={chartData.chart?.options}
                      ref={chartRef}
                    />
                  ) : (
                    <div className="h-full w-full">
                      <Text variant="bodyLg">No Chart Data</Text>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-[3] flex-col rounded-4 border-2 border-solid border-greyExtralight p-3">
                <Tabs value={selectedTab}>
                  <TabList fitted border>
                    <Tab
                      theme="dataSpace"
                      value="DATA"
                      onClick={() =>
                        handleTabClick({ label: 'DATA', id: 'DATA' })
                      }
                    >
                      DATA
                    </Tab>
                    <Tab
                      theme="dataSpace"
                      value="CUSTOMIZE"
                      onClick={() =>
                        handleTabClick({ label: 'CUSTOMIZE', id: 'CUSTOMIZE' })
                      }
                    >
                      CUSTOMIZE
                    </Tab>
                  </TabList>
                </Tabs>

                {selectedTab === 'DATA' ? (
                  <div className="my-4 flex flex-col gap-6">
                    {/* Dataset */}
                    <Select
                      name="selectDataset"
                      label="Select Dataset"
                      options={getAllDatasetsWithResourcesRes?.data?.datasets?.map(
                        (item: any) => {
                          return {
                            label: item.title,
                            value: item.id,
                          };
                        }
                      )}
                      required
                      defaultValue={chartData?.dataset?.id}
                      onChange={(e) => {
                        if (
                          getAllDatasetsWithResourcesRes?.data?.datasets?.find(
                            (ds: any) => ds.id === e
                          )?.resources?.length > 0
                        ) {
                          setSelectedDataset(e);
                          handleSave(
                            'resource',
                            getAllDatasetsWithResourcesRes?.data?.datasets?.find(
                              (ds: any) => ds.id === e
                            )?.resources[0].id
                          );
                        } else {
                          toast.error('No Resources found for this dataset');
                        }
                      }}
                    />

                    {/* Resource */}
                    <Select
                      name="selectResource"
                      label="Select Resource"
                      options={getAllDatasetsWithResourcesRes?.data?.datasets
                        ?.find((ds: any) => ds.id === selectedDataset)
                        ?.resources?.map((item: any) => {
                          return {
                            label: item.name,
                            value: item.id,
                          };
                        })}
                      defaultValue={chartData?.resource?.id || ''}
                      onChange={(e) => {
                        console.log('selectResource :::::::::', e);

                        handleSave('resource', e);
                      }}
                      required
                    />

                    {/* Chart Type */}
                    <Select
                      name="selectChartType"
                      label="Select Chart Type"
                      options={chartTypesOptions}
                      required
                      value={chartData?.type}
                      onChange={(e) => {
                        handleSave('chartType', e);
                      }}
                    />

                    {/* X-axis column */}
                    <Select
                      name="selectXAxisColumn"
                      label="X-axis column"
                      options={chartData?.resource?.schema?.map((item: any) => {
                        return {
                          label: item.fieldName,
                          value: item.id,
                        };
                      })}
                      value={chartData.options?.xAxisColumn}
                      onChange={(e) => {
                        handleSave('xAxisColumn', e);
                      }}
                      required
                    />

                    {/* Y-axis columns */}
                    <div>
                      <Label>Y-axis columns</Label>

                      <div className="mt-1 flex flex-col gap-2">
                        {chartData.options?.yAxisColumn?.map(
                          (columnItem: any, colIndex: number) => (
                            <div key={columnItem.fieldName}>
                              <div className="flex flex-row items-center gap-1 rounded-2 border-2 border-solid border-greyExtralight p-2">
                                <Button
                                  kind="tertiary"
                                  size="slim"
                                  className="mx-1 rounded-l-2 rounded-r-0 border-solid border-greyExtralight bg-greyExtralight"
                                  icon={<Icons.cross size={20} />}
                                  onClick={() => {
                                    handleSave(
                                      'removeYAxisColumn',
                                      columnItem.fieldName
                                    );
                                  }}
                                />

                                <Popover
                                  open={editYaxisPopOverOpen}
                                  onOpenChange={setEditYaxisPopOverOpen}
                                >
                                  <Popover.Trigger>
                                    <Button
                                      kind="tertiary"
                                      size="slim"
                                      className="mx-1 w-full justify-start rounded-l-0 rounded-r-2 border-solid border-greyExtralight bg-greyExtralight text-textDefault"
                                    >
                                      {
                                        chartDetailsRes?.data?.resourceChart?.resource?.schema?.find(
                                          (item: any) =>
                                            item.id === columnItem.fieldName
                                        )?.fieldName
                                      }
                                    </Button>
                                  </Popover.Trigger>
                                  <Popover.Content>
                                    <YaxisColumnForm
                                      yAxisOptions={chartDetailsRes?.data?.resourceChart?.resource?.schema?.map(
                                        (item: any) => {
                                          return {
                                            label: item.fieldName,
                                            value: item.id,
                                          };
                                        }
                                      )}
                                      column={columnItem.fieldName}
                                      columnLabel={columnItem.label}
                                      columnColor={columnItem.color}
                                      onSubmit={(e) => {
                                        handleSave('editYAxisColumn', {
                                          index: colIndex,
                                          ...e,
                                        });
                                        setEditYaxisPopOverOpen(false);
                                      }}
                                      onCancel={() => {
                                        setEditYaxisPopOverOpen(false);
                                      }}
                                    />
                                  </Popover.Content>
                                </Popover>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="mx-2 flex flex-col justify-center">
                        <Popover
                          open={addYaxisPopOverOpen}
                          onOpenChange={setAddYaxisPopOverOpen}
                        >
                          <Popover.Trigger>
                            <Button
                              kind="tertiary"
                              size="medium"
                              icon={<Icons.plus />}
                              className="my-1 justify-end rounded-2 border-1 border-solid border-greyExtralight bg-greyExtralight"
                            />
                          </Popover.Trigger>
                          <Popover.Content>
                            <YaxisColumnForm
                              yAxisOptions={chartDetailsRes?.data?.resourceChart?.resource?.schema?.map(
                                (item: any) => {
                                  return {
                                    label: item.fieldName,
                                    value: item.id,
                                  };
                                }
                              )}
                              column={''}
                              columnLabel={''}
                              columnColor={''}
                              onSubmit={(e) => {
                                console.log(
                                  'addYAxisColumn :::::::::',
                                  e,
                                  chartData.options.yAxisColumn
                                );
                                if (
                                  chartData.options.yAxisColumn === undefined ||
                                  chartData.options.yAxisColumn?.findIndex(
                                    (item: any) =>
                                      item.fieldName === e.fieldName
                                  ) === -1
                                ) {
                                  handleSave('addYAxisColumn', e);
                                  setAddYaxisPopOverOpen(false);
                                } else {
                                  setAddYaxisPopOverOpen(false);
                                  toast('Column already exists');
                                }
                              }}
                              onCancel={() => {
                                setAddYaxisPopOverOpen(false);
                              }}
                            />
                          </Popover.Content>
                        </Popover>
                      </div>
                    </div>

                    {/* Aggregate Type */}
                    <Select
                      name="selectAggregateType"
                      label="Aggregate Type"
                      options={[
                        { label: 'None', value: 'NONE' },
                        { label: 'Sum', value: 'SUM' },
                        { label: 'Average', value: 'AVERAGE' },
                        { label: 'Count', value: 'COUNT' },
                      ]}
                      value={chartData?.options?.aggregateType}
                      onChange={(e) => {
                        handleSave('aggregateType', e);
                      }}
                      required
                    />
                  </div>
                ) : (
                  <div className="my-4 flex flex-col gap-6">
                    <TextField
                      label="X Axis Label"
                      name="xAxisLabel"
                      defaultValue={chartData?.options?.xAxisLabel}
                      onChange={(e) => {
                        setXAxisLabelInput(e);
                      }}
                      onBlur={() => {
                        handleSave('xAxisLabel', xAxisLabelInput);
                      }}
                    />
                    <TextField
                      label="Y Axis Label"
                      name="yAxisLabel"
                      defaultValue={chartData?.options?.yAxisLabel}
                      onChange={(e) => {
                        setYAxisLabelInput(e);
                      }}
                      onBlur={() => {
                        handleSave('yAxisLabel', yAxisLabelInput);
                      }}
                    />
                    {chartData.type === 'BAR' && (
                      <div className="flex flex-row items-center gap-2">
                        <Text>Grouped</Text>
                        <Switch
                          name="stackedSwitch"
                          defaultChecked={chartData?.options?.stacked}
                          onCheckedChange={(e) => {
                            handleSave('stacked', e);
                          }}
                        />
                        <Text>Stacked</Text>
                      </div>
                    )}

                    {chartData.type === 'BAR' && (
                      <Select
                        label="Orientation"
                        name="orientation"
                        options={[
                          { label: 'Horizontal', value: 'HORIZONTAL' },
                          { label: 'Vertical', value: 'VERTICAL' },
                        ]}
                        defaultValue={chartData?.options?.orientation}
                        onChange={(e) => {
                          handleSave('orientation', e);
                        }}
                        required
                      />
                    )}

                    <Switch
                      label="Show Legend"
                      name="showLegend"
                      defaultChecked={chartData?.options?.showLegend}
                      onCheckedChange={(e) => {
                        handleSave('showLegend', e);
                      }}
                    />
                  </div>
                )}

                <Button
                  kind="primary"
                  className="my-1 rounded-2"
                  loading={publishResourceChartMutation.isLoading}
                  disabled={publishResourceChartMutation.isLoading}
                  onClick={() => handlePublishChart()}
                >
                  Publish Chart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartGenVizPreview;

const YaxisColumnForm = ({
  yAxisOptions,
  column,
  columnLabel,
  columnColor,
  onSubmit,
  onCancel,
}: {
  yAxisOptions: Array<any>;
  column: any;
  columnLabel: any;
  columnColor: any;
  onSubmit: (e: any) => void;
  onCancel: () => void;
}) => {
  const [yAxisColumn, setYAxisColumn] = useState(column);
  const [yAxisColumnLabel, setYAxisColumnLabel] = useState(columnLabel);
  const [yAxisColumnColor, setYAxisColumnColor] = useState(columnColor);

  return (
    <div className="flex w-full min-w-full flex-col gap-1 p-8">
      {/* Y axis Column */}
      <Select
        name="selectYAxisColumn"
        label="Column"
        options={yAxisOptions}
        value={yAxisColumn}
        onChange={(e) => {
          setYAxisColumn(e);
        }}
      />

      {/* Label for specific element */}
      <TextField
        name="selectYAxisColumnLabel"
        label="Label"
        value={yAxisColumnLabel}
        onChange={(e) => {
          setYAxisColumnLabel(e);
        }}
      />

      {/* Color for specific element */}
      <TextField
        name="selectYAxisColumnColor"
        label="Color"
        value={yAxisColumnColor}
        onChange={(e) => {
          setYAxisColumnColor(e);
        }}
      />

      <div className="mt-1 flex flex-row justify-between gap-8">
        <Button
          kind="secondary"
          size="slim"
          className="rounded-2 border-1 border-solid border-greyExtralight"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          kind="primary"
          size="slim"
          className="rounded-2 border-1 border-solid border-greyExtralight"
          onClick={() => {
            onSubmit({
              fieldName: yAxisColumn,
              label: yAxisColumnLabel,
              color: yAxisColumnColor,
            });
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
