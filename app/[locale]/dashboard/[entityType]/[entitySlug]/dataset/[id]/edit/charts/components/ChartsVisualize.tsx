import { UUID } from 'crypto';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { renderGeoJSON } from '@/geo_json/render_geojson';
import { ResourceChartInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { Button, Divider, Icon, Sheet, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import {
  chartDetailsQuery,
  createChart,
  CreateResourceChart,
  datasetResource,
  getResourceChartDetails,
} from '../queries';
import ChartForm from './ChartForm';

interface VisualizationProps {
  setType: any;
  setChartId: any;
  chartId: any;
}

const ChartsVisualize: React.FC<VisualizationProps> = ({
  setType,
  chartId,
  setChartId,
}) => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { data: resourceData }: { data: any } = useQuery(
    [`charts_${params.id}`],
    () =>
      GraphQL(
        datasetResource,
        {
          [params.entityType]: params.entitySlug,
        },
        { datasetId: params.id }
      )
  );

  const { data: chartDetails, refetch }: { data: any; refetch: any } = useQuery(
    [`chartdata_${params.id}`],
    () =>
      GraphQL(
        getResourceChartDetails,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          chartDetailsId: chartId,
        }
      ),
    {}
  );

  const {
    data: chartsList,
    isLoading,
    refetch: chartsListRefetch,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`chartsList_${params.id}`],
    () =>
      GraphQL(
        chartDetailsQuery,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          datasetId: params.id,
        }
      )
  );

  const resourceChart: {
    mutate: any;
    isLoading: any;
  } = useMutation(
    (data: { resource: UUID }) =>
      GraphQL(
        CreateResourceChart,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res: any) => {
        toast('Resource Chart Created Successfully');
        refetch();
        setIsSheetOpen(false);
        setType('visualize');
        setChartId(res.addResourceChart.id);
        chartsListRefetch();
      },
      onError: (err: any) => {
        toast(`Received ${err} while deleting chart `);
      },
    }
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const initialChartData = {
    chartId: '',
    description: '',
    filters: [],
    name: '',
    options: {
      aggregateType: '',
      regionColumn: '',
      showLegend: false,
      timeColumn: '',
      valueColumn: '',
      xAxisColumn: '',
      xAxisLabel: '',
      yAxisColumn: [],
      yAxisLabel: '',
    },
    resource: resourceData?.datasetResources[0]?.id,
    type: 'BAR_VERTICAL',
    chart: '',
  };

  const [chartData, setChartData] = useState(initialChartData);
  const [previousChartData, setPreviousChartData] = useState(initialChartData);
  const [resourceSchema, setResourceSchema] = useState<any[]>([]);

  useEffect(() => {
    if (resourceData) {
      if (chartData.resource) {
        const resource = resourceData?.datasetResources.find(
          (resource: any) => resource.id === chartData.resource
        );

        setResourceSchema(resource?.schema || []);
        handleChange('resource', chartData.resource);
      }
    }
  }, [resourceData, chartId, chartData.resource]);

  console.log(chartData, chartDetails?.resourceChart);

  useEffect(() => {
    if (chartId && chartDetails?.resourceChart) {
      refetch();
      updateChartData(chartDetails.resourceChart);
    }
  }, [chartId, chartDetails]);

  const updateChartData = (resourceChart: any) => {
    if (
      resourceChart.chartType === 'ASSAM_DISTRICT' ||
      resourceChart.chartType === 'ASSAM_RC'
    ) {
      echarts.registerMap(
        resourceChart.chartType.toLowerCase(),
        renderGeoJSON(resourceChart.chartType.toLowerCase())
      );
    }

    const updatedData = {
      chartId: resourceChart.id,
      description: resourceChart.description,
      filters: resourceChart.filters || [],
      name: resourceChart.name || '',
      options: {
        aggregateType: resourceChart?.options?.aggregateType,
        regionColumn: resourceChart?.options?.regionColumn,
        showLegend: resourceChart?.options?.showLegend,
        timeColumn: resourceChart?.options?.timeColumn,
        valueColumn: resourceChart?.options?.valueColumn,
        xAxisColumn: resourceChart?.options?.xAxisColumn?.id,
        xAxisLabel: resourceChart?.options?.xAxisLabel,
        yAxisColumn: resourceChart?.options?.yAxisColumn?.map((col: any) => ({
          fieldName: col.field,
        })),
        yAxisLabel: resourceChart?.options?.yAxisLabel,
      },
      resource: resourceChart.resource?.id,
      type: resourceChart.chartType,
      chart: resourceChart.chart,
    };
    setChartData(updatedData);
    setPreviousChartData(updatedData);
  };

  const {
    mutate,
    isLoading: editMutationLoading,
  } = useMutation(
    (chartInput: { chartInput: ResourceChartInput }) =>
      GraphQL(
        createChart,
        {
          [params.entityType]: params.entitySlug,
        },
        chartInput
      ),
    {
      onSuccess: (res: any) => {
        toast('Resource chart saved');
        const newChartId = res?.editResourceChart?.id;
        updateChartData(res.editResourceChart);
        setChartId(newChartId);
        chartsListRefetch();
        refetch();
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

      console.log(
        {
          chartInput: {
            chartId: inputChartId,
            description: updatedData.description,
            filters: updatedData.filters || [],
            name: updatedData.name,
            options: {
              aggregateType: updatedData.aggregateType,
              regionColumn: updatedData.regionColumn,
              showLegend: updatedData.showLegend,
              timeColumn: updatedData.timeColumn,
              valueColumn: updatedData.valueColumn,
              xAxisColumn: updatedData.xAxisColumn,
              xAxisLabel: updatedData.xAxisLabel,
              yAxisColumn: updatedData.options.yAxisColumn?.map((col: any) => ({
                fieldName: col.field,
              })),
              yAxisLabel: updatedData.yAxisLabel,
            },
            resource:
              updatedData.resource || resourceData?.datasetResources[0]?.id,
            type: updatedData.chartType,
          },
        },
        'log'
      );
    }
  };

  const handleChange = useCallback((field: string, value: any) => {
    setChartData((prevData) => {
      if (field === 'options') {
        return {
          ...prevData,
          options: {
            ...prevData.options,
            ...value,
          },
        };
      }
      return {
        ...prevData,
        [field]: value,
      };
    });
  }, []);

  const handleResourceChange = useCallback(
    (resourceId: string) => {
      const selectedResource = resourceData?.datasetResources.find(
        (resource: any) => resource.id === resourceId
      );
      setResourceSchema(selectedResource?.schema || []);
      handleChange('resource', resourceId);
    },
    [resourceData]
  );

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
                    <Button
                      onClick={(e) =>
                        resourceChart.mutate({
                          resource: resourceData?.datasetResources[0].id,
                        })
                      }
                    >
                      Visualize Data
                    </Button>
                    <Button
                      kind="tertiary"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Icon source={Icons.cross} size={24} />
                    </Button>
                  </div>
                </div>
                {chartsList?.chartsDetails.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={`rounded-1 border-1 border-solid border-baseGraySlateSolid6 px-6 py-3 ${chartId === item.id ? ' bg-baseGraySlateSolid5' : ''}`}
                  >
                    <Button
                      kind={'tertiary'}
                      className="flex w-full justify-start"
                      disabled={chartId === item.id}
                      onClick={() => {
                        setChartId(item.id);
                        setIsSheetOpen(false);
                      }}
                    >
                      {item.name}
                    </Button>
                  </div>
                ))}
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
          <ChartForm
            chartData={chartData}
            resourceData={resourceData}
            resourceSchema={resourceSchema}
            handleChange={handleChange}
            handleResourceChange={handleResourceChange}
            handleSave={handleSave}
          />
          <div className="mb-6 flex flex-col gap-6 p-8 text-center">
            <Text>Preview</Text>
              <ReactECharts option={{
        "animation": true,
        "animationThreshold": 2000,
        "animationDuration": 1000,
        "animationEasing": "cubicOut",
        "animationDelay": 0,
        "animationDurationUpdate": 300,
        "animationEasingUpdate": "cubicOut",
        "animationDelayUpdate": 0,
        "aria": {
          "enabled": false
        },
        "color": [
          "#5470c6",
          "#91cc75",
          "#fac858",
          "#ee6666",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc"
        ],
        "series": [
          {
            "type": "bar",
            "legendHoverLink": true,
            "data": [
              2,
              1,
              6
            ],
            "realtimeSort": false,
            "showBackground": false,
            "stackStrategy": "samesign",
            "cursor": "pointer",
            "barMinHeight": 0,
            "barCategoryGap": "20%",
            "barGap": "30%",
            "large": false,
            "largeThreshold": 400,
            "seriesLayoutBy": "column",
            "datasetIndex": 0,
            "clip": true,
            "zlevel": 0,
            "z": 2,
            "label": {
              "show": true,
              "position": "inside",
              "color": "#000",
              "distance": 0,
              "rotate": 90,
              "margin": 8,
              "fontSize": 12,
              "align": "center",
              "verticalAlign": "middle"
            },
            "itemStyle": {}
          },
          {
            "type": "bar",
            "legendHoverLink": true,
            "data": [
              3,
              2,
              5
            ],
            "realtimeSort": false,
            "showBackground": false,
            "stackStrategy": "samesign",
            "cursor": "pointer",
            "barMinHeight": 0,
            "barCategoryGap": "20%",
            "barGap": "30%",
            "large": false,
            "largeThreshold": 400,
            "seriesLayoutBy": "column",
            "datasetIndex": 0,
            "clip": true,
            "zlevel": 0,
            "z": 2,
            "label": {
              "show": true,
              "position": "inside",
              "color": "#000",
              "distance": 0,
              "rotate": 90,
              "margin": 8,
              "fontSize": 12,
              "align": "center",
              "verticalAlign": "middle"
            },
            "itemStyle": {}
          },
          {
            "type": "bar",
            "legendHoverLink": true,
            "data": [
              4,
              5,
              9
            ],
            "realtimeSort": false,
            "showBackground": false,
            "stackStrategy": "samesign",
            "cursor": "pointer",
            "barMinHeight": 0,
            "barCategoryGap": "20%",
            "barGap": "30%",
            "large": false,
            "largeThreshold": 400,
            "seriesLayoutBy": "column",
            "datasetIndex": 0,
            "clip": true,
            "zlevel": 0,
            "z": 2,
            "label": {
              "show": true,
              "position": "inside",
              "color": "#000",
              "distance": 0,
              "rotate": 90,
              "margin": 8,
              "fontSize": 12,
              "align": "center",
              "verticalAlign": "middle"
            },
            "itemStyle": {}
          }
        ],
        "legend": [
          {
            "data": [],
            "selected": {},
            "show": true,
            "padding": 5,
            "itemGap": 10,
            "itemWidth": 25,
            "itemHeight": 14,
            "backgroundColor": "transparent",
            "borderColor": "#ccc",
            "borderWidth": 1,
            "borderRadius": 0,
            "pageButtonItemGap": 5,
            "pageButtonPosition": "end",
            "pageFormatter": "{current}/{total}",
            "pageIconColor": "#2f4554",
            "pageIconInactiveColor": "#aaa",
            "pageIconSize": 15,
            "animationDurationUpdate": 800,
            "selector": false,
            "selectorPosition": "auto",
            "selectorItemGap": 7,
            "selectorButtonGap": 10
          }
        ],
        "tooltip": {
          "show": true,
          "trigger": "item",
          "triggerOn": "mousemove|click",
          "axisPointer": {
            "type": "line"
          },
          "showContent": true,
          "alwaysShowContent": false,
          "showDelay": 0,
          "hideDelay": 100,
          "enterable": false,
          "confine": false,
          "appendToBody": false,
          "transitionDuration": 0.4,
          "textStyle": {
            "fontSize": 14
          },
          "borderWidth": 0,
          "padding": 5,
          "order": "seriesAsc"
        },
        "xAxis": [
          {
            "type": "category",
            "name": "Xaxis",
            "show": true,
            "scale": false,
            "nameLocation": "end",
            "nameGap": 15,
            "gridIndex": 0,
            "inverse": false,
            "offset": 0,
            "splitNumber": 5,
            "minInterval": 0,
            "splitLine": {
              "show": true,
              "lineStyle": {
                "show": true,
                "width": 1,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
              }
            },
            "data": [
              2020,
              2021,
              2022
            ]
          }
        ],
        "yAxis": [
          {
            "type": "value",
            "name": "Yaxis",
            "show": true,
            "scale": false,
            "nameLocation": "end",
            "nameGap": 15,
            "gridIndex": 0,
            "inverse": false,
            "offset": 0,
            "splitNumber": 5,
            "minInterval": 0,
            "splitLine": {
              "show": true,
              "lineStyle": {
                "show": true,
                "width": 1,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
              }
            }
          }
        ],
        "title": [
          {
            "show": true,
            "target": "blank",
            "subtarget": "blank",
            "padding": 5,
            "itemGap": 10,
            "textAlign": "auto",
            "textVerticalAlign": "auto",
            "triggerEvent": false
          }
        ]
      }} ref={chartRef} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartsVisualize;
