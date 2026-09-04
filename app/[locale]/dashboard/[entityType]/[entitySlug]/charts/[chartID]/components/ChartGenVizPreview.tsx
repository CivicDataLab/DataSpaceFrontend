import { useRef, useState } from 'react';
import LoadingPage from '@/app/[locale]/dashboard/loading';
import { graphql } from '@/gql';
import { ChartTypes } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import {
  Button,
  Form,
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

interface ChartPreview {
  options?: Record<string, unknown>;
  height?: string;
  width?: string;
  renderer?: string;
}

interface ChartData {
  chartId: string;
  description?: string;
  filters: ChartFilters[];
  name: string;
  options: ChartOptions;
  resource: Resource;
  type: ChartTypes;
  chart: ChartPreview;
  dataset: Dataset;
}

interface ResourceChartInput {
  chartId: string;
  description?: string;
  filters: ChartFilters[];
  name?: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
}

type HandleSaveValue =
  | string
  | boolean
  | ChartTypes
  | YAxisColumnItem
  | (YAxisColumnItem & { index: number });

function isChartType(value: HandleSaveValue): value is ChartTypes {
  return (
    typeof value === 'string' &&
    (Object.values(ChartTypes) as string[]).includes(value)
  );
}

function isYAxisColumnItem(value: HandleSaveValue): value is YAxisColumnItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fieldName' in value &&
    'label' in value &&
    'color' in value &&
    !('index' in value)
  );
}

function isYAxisColumnEdit(
  value: HandleSaveValue
): value is YAxisColumnItem & { index: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fieldName' in value &&
    'label' in value &&
    'color' in value &&
    'index' in value &&
    typeof value.index === 'number'
  );
}

interface SelectOption {
  label: string;
  value: string;
}

interface DatasetWithResources {
  id: string;
  title: string;
  resources?: Array<{ id: string; name: string }>;
}

const getAllDatasetsListwithResourcesDoc = graphql(`
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

const getResourceChartForViz = graphql(`
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

const saveEditResourceChartDoc = graphql(`
  mutation saveEditResourceChart($chartInput: ResourceChartInput!) {
    editResourceChart(chartInput: $chartInput) {
      __typename
      ... on TypeResourceChart {
        id
      }
    }
  }
`);

const publishResourceChartDoc = graphql(`
  mutation publishResourceChart($chartId: UUID!) {
    publishResourceChart(chartId: $chartId)
  }
`);

interface ResourceChartSource {
  name?: string | null;
  chartFilters?: Array<{
    column?: { id?: string | null } | null;
    operator: string;
    value: string;
  }> | null;
  chartOptions?: {
    aggregateType?: string | null;
    showLegend?: boolean | null;
    xAxisColumn?: { id?: string | null } | null;
    xAxisLabel?: string | null;
    yAxisColumn?: Array<{
      field?: { id?: string | null } | null;
      label?: string | null;
      color?: string | null;
    }> | null;
    yAxisLabel?: string | null;
    regionColumn?: { id?: string | null } | object | null;
    timeColumn?: { id?: string | null } | null;
    valueColumn?: { id?: string | null } | null;
    stacked?: boolean | null;
    orientation?: string | null;
  } | null;
  resource?: {
    id?: string | null;
    name?: string | null;
    schema?: Array<{
      fieldName: string;
      id: string;
      format: string;
    }> | null;
  } | null;
  dataset?: {
    id?: string | null;
    title?: string | null;
  } | null;
  chartType?: ChartTypes | null;
  chart?: ChartPreview | null;
}

function mapResourceChartToFormData(
  chartRes: ResourceChartSource,
  chartId: string
): ChartData {
  return {
    chartId,
    name: chartRes.name ?? '',
    filters:
      chartRes.chartFilters && chartRes.chartFilters.length > 0
        ? chartRes.chartFilters.map((filter) => ({
            column: filter.column?.id ?? '',
            operator: filter.operator,
            value: filter.value,
          }))
        : [{ column: '', operator: '==', value: '' }],
    options: {
      aggregateType: chartRes.chartOptions?.aggregateType ?? undefined,
      showLegend: chartRes.chartOptions?.showLegend ?? true,
      xAxisColumn: chartRes.chartOptions?.xAxisColumn?.id ?? undefined,
      xAxisLabel: chartRes.chartOptions?.xAxisLabel ?? undefined,
      yAxisColumn: chartRes.chartOptions?.yAxisColumn?.map((col) => ({
        fieldName: col.field?.id ?? '',
        label: col.label ?? '',
        color: col.color ?? '',
      })),
      yAxisLabel: chartRes.chartOptions?.yAxisLabel ?? undefined,
      regionColumn:
        chartRes.chartOptions?.regionColumn &&
        'id' in chartRes.chartOptions.regionColumn
          ? String(chartRes.chartOptions.regionColumn.id)
          : undefined,
      timeColumn: chartRes.chartOptions?.timeColumn?.id ?? undefined,
      valueColumn: chartRes.chartOptions?.valueColumn?.id ?? undefined,
      stacked: chartRes.chartOptions?.stacked ?? undefined,
      orientation: chartRes.chartOptions?.orientation ?? undefined,
    },
    resource: {
      id: chartRes.resource?.id ?? '',
      name: chartRes.resource?.name ?? '',
      schema:
        chartRes.resource?.schema?.map((schema) => ({
          fieldName: schema.fieldName,
          id: schema.id,
          format: schema.format,
        })) ?? [],
    },
    dataset: {
      id: chartRes.dataset?.id ?? '',
      title: chartRes.dataset?.title ?? '',
    },
    type: chartRes.chartType ?? ChartTypes.Bar,
    chart: chartRes.chart ?? {},
  };
}

const ChartGenVizPreview = ({
  params,
}: {
  params: { entityType: string; entitySlug: string; chartID: string };
}) => {
  type TabValue = 'DATA' | 'CUSTOMIZE';
  const [selectedTab, setSelectedTab] = useState<TabValue>('DATA');

  const [selectedDataset, setSelectedDataset] = useState('');

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

  const chartTypesOptions = [
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

  const getAllDatasetsWithResourcesRes = useQuery(
    [`allDatasetsListwithResourcesForCharts`],
    () =>
      GraphQL(getAllDatasetsListwithResourcesDoc, {
        [params.entityType]: params.entitySlug,
      })
  );

  const chartDetailsRes = useQuery(
    [`chartDetailsForViz-${JSON.stringify(chartData)}`],
    () =>
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

  const [prevChartDetailsData, setPrevChartDetailsData] = useState(
    chartDetailsRes.data
  );
  const [prevDatasetsData, setPrevDatasetsData] = useState(
    getAllDatasetsWithResourcesRes.data
  );
  if (
    chartDetailsRes.data !== prevChartDetailsData ||
    getAllDatasetsWithResourcesRes.data !== prevDatasetsData
  ) {
    setPrevChartDetailsData(chartDetailsRes.data);
    setPrevDatasetsData(getAllDatasetsWithResourcesRes.data);
    const chartRes = chartDetailsRes.data?.resourceChart;
    if (chartRes) {
      setChartData(mapResourceChartToFormData(chartRes, params.chartID));
    }
    if (chartRes?.resource) {
      setSelectedDataset(
        getAllDatasetsWithResourcesRes.data?.datasets?.find(
          (ds) => ds.id === chartRes.dataset?.id
        )?.id ?? ''
      );
    }
  }

  const editResourceChartMutation = useMutation(
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
      onError: (err: unknown) => {
        toast(`Received ${String(err)} while updating resource chart`);
      },
    }
  );

  const chartRef = useRef<ReactECharts>(null);

  const publishResourceChartMutation = useMutation(
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
      onError: (err: unknown) => {
        toast(`Received ${String(err)} while publishing resource chart`);
      },
    }
  );

  const handleSave = (field: string, value: HandleSaveValue) => {
    console.log('Saving chart data :::::::::::::', field, value);

    switch (field) {
      case 'chartName':
        if (typeof value !== 'string') break;
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
        if (typeof value !== 'string') break;
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: value,
            name: chartData.name,
            options: {
              ...chartData.options,
              xAxisColumn: '',
              yAxisColumn: [],
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'chartType':
        if (!isChartType(value)) break;
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            type: value,
            options: chartData.options,
            filters: chartData.filters,
            name: chartData.name,
          },
        });
        toast('Chart Type Updated Successfully');
        break;

      case 'xAxisColumn':
        if (typeof value !== 'string') break;
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
            name: chartData.name,
          },
        });
        break;

      case 'addYAxisColumn':
        if (!isYAxisColumnItem(value)) break;
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
            name: chartData.name,
          },
        });
        break;

      case 'removeYAxisColumn':
        if (typeof value !== 'string') break;
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            name: chartData.name,
            options: {
              ...chartData.options,
              yAxisColumn:
                chartData.options.yAxisColumn?.filter(
                  (col) => col.fieldName !== value
                ) ?? [],
            },
            type: chartData.type,
            filters: chartData.filters,
          },
        });
        break;

      case 'editYAxisColumn':
        if (!isYAxisColumnEdit(value)) break;
        editResourceChartMutation.mutate({
          chartInput: {
            chartId: params.chartID,
            resource: chartData.resource.id,
            name: chartData.name,
            options: {
              ...chartData.options,
              yAxisColumn:
                chartData.options.yAxisColumn?.map((col, indx: number) => {
                  if (indx === value.index) {
                    return {
                      fieldName: value.fieldName,
                      label: value.label,
                      color: value.color,
                    };
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
        if (typeof value !== 'string') break;
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
            name: chartData.name,
          },
        });
        break;

      case 'xAxisLabel':
        if (typeof value !== 'string') break;
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
            name: chartData.name,
          },
        });
        break;

      case 'yAxisLabel':
        if (typeof value !== 'string') break;
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
            name: chartData.name,
          },
        });
        break;

      case 'stacked':
        if (typeof value !== 'boolean') break;
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
            name: chartData.name,
          },
        });
        break;

      case 'orientation':
        if (typeof value !== 'string') break;
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
            name: chartData.name,
          },
        });
        break;

      case 'showLegend':
        if (typeof value !== 'boolean') break;
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
            name: chartData.name,
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
            onSave={(val) => {
              handleSave('chartName', val);
            }}
            loading={editResourceChartMutation.isLoading}
            status={editResourceChartMutation.isLoading ? 'loading' : 'success'}
            setStatus={() => {}}
          />

          <div className="border-t-2 border-solid border-greyExtralight pt-8">
            <div className="flex flex-row justify-center gap-6">
              {/* Chart Preview */}
              <div className="flex-[7]">
                {chartData.chart?.options &&
                Object.keys(chartData.chart?.options).length > 0 ? (
                  <div className="sticky top-36 w-full items-center rounded-4 border-1 border-solid border-greyExtralight">
                    <ReactECharts
                      option={chartData.chart?.options}
                      ref={chartRef}
                    />
                  </div>
                ) : (
                  <div className="sticky top-36 flex w-full items-center justify-center">
                    <Text variant="bodyLg">No Valid Chart Data</Text>
                  </div>
                )}
              </div>

              {/* Chart Customization */}
              <div className="flex h-full flex-[3] flex-col rounded-4 border-2 border-solid border-greyExtralight p-3">
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
                      options={
                        getAllDatasetsWithResourcesRes?.data?.datasets?.map(
                          (item) => {
                            const option: SelectOption = {
                              label: item.title,
                              value: String(item.id),
                            };
                            return option;
                          }
                        ) ?? []
                      }
                      required
                      requiredIndicator={true}
                      defaultValue={chartData?.dataset?.id}
                      onChange={(e) => {
                        const dataset =
                          getAllDatasetsWithResourcesRes?.data?.datasets?.find(
                            (ds) => ds.id === e
                          );
                        const firstResourceId = dataset?.resources?.[0]?.id;
                        if (
                          (dataset?.resources?.length ?? 0) > 0 &&
                          firstResourceId
                        ) {
                          setSelectedDataset(e);
                          handleSave('resource', String(firstResourceId));
                        } else {
                          toast.error('No Resources found for this dataset');
                        }
                      }}
                    />

                    {/* Resource */}
                    <Select
                      name="selectResource"
                      label="Select Resource"
                      options={
                        getAllDatasetsWithResourcesRes?.data?.datasets
                          ?.find(
                            (ds: DatasetWithResources) =>
                              ds.id === selectedDataset
                          )
                          ?.resources?.map((item) => {
                            const option: SelectOption = {
                              label: item.name,
                              value: String(item.id),
                            };
                            return option;
                          }) ?? []
                      }
                      defaultValue={chartData?.resource?.id || ''}
                      onChange={(e) => {
                        console.log('selectResource :::::::::', e);

                        handleSave('resource', e);
                      }}
                      required
                      requiredIndicator={true}
                    />

                    {/* Chart Type */}
                    <Select
                      name="selectChartType"
                      label="Select Chart Type"
                      options={chartTypesOptions}
                      required
                      requiredIndicator={true}
                      value={chartData?.type}
                      onChange={(e) => {
                        handleSave('chartType', e);
                      }}
                    />

                    {/* X-axis column */}
                    <Select
                      name="selectXAxisColumn"
                      label="X-axis column"
                      options={
                        chartData?.resource?.schema?.map((item) => {
                          const option: SelectOption = {
                            label: item.fieldName,
                            value: item.id,
                          };
                          return option;
                        }) ?? []
                      }
                      value={chartData.options?.xAxisColumn}
                      onChange={(e) => {
                        handleSave('xAxisColumn', e);
                      }}
                      required
                      requiredIndicator={true}
                    />

                    {/* Y-axis columns */}
                    <div>
                      <Label>Y-axis columns</Label>

                      <div className="mt-1 flex flex-col gap-2">
                        {chartData.options?.yAxisColumn?.map(
                          (columnItem, colIndex: number) => (
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
                                          (item: ResourceSchema) =>
                                            item.id === columnItem.fieldName
                                        )?.fieldName
                                      }
                                    </Button>
                                  </Popover.Trigger>
                                  <Popover.Content>
                                    <YaxisColumnForm
                                      yAxisOptions={
                                        chartDetailsRes?.data?.resourceChart?.resource?.schema?.map(
                                          (item: ResourceSchema) => {
                                            const option: SelectOption = {
                                              label: item.fieldName,
                                              value: item.id,
                                            };
                                            return option;
                                          }
                                        ) ?? []
                                      }
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
                              yAxisOptions={
                                chartDetailsRes?.data?.resourceChart?.resource?.schema?.map(
                                  (item: ResourceSchema) => {
                                    const option: SelectOption = {
                                      label: item.fieldName,
                                      value: item.id,
                                    };
                                    return option;
                                  }
                                ) ?? []
                              }
                              column={''}
                              columnLabel={''}
                              columnColor={''}
                              onSubmit={(e) => {
                                if (
                                  chartData.options.yAxisColumn === undefined ||
                                  chartData.options.yAxisColumn?.findIndex(
                                    (item) =>
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
                      requiredIndicator={true}
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
                        requiredIndicator={true}
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
  yAxisOptions: Array<SelectOption>;
  column: string;
  columnLabel: string;
  columnColor: string;
  onSubmit: (e: YAxisColumnItem) => void;
  onCancel: () => void;
}) => {
  const [yAxisColumn, setYAxisColumn] = useState(column);
  const [yAxisColumnLabel, setYAxisColumnLabel] = useState(columnLabel);
  const [yAxisColumnColor, setYAxisColumnColor] = useState(columnColor);

  return (
    <div className="flex w-full min-w-full flex-col gap-1 p-8">
      <Form>
        {/* Y axis Column */}
        <Select
          name="selectYAxisColumn"
          label="Column"
          options={yAxisOptions}
          value={yAxisColumn}
          onChange={(e) => {
            setYAxisColumn(e);
          }}
          required
          requiredIndicator={true}
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
      </Form>
    </div>
  );
};
