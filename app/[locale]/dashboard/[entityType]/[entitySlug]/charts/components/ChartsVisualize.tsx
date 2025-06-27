import { UUID } from 'crypto';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { renderGeoJSON } from '@/geo_json/render_geojson';
import { ChartTypes } from '@/gql/generated/graphql';
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
import ChartHeader from './ChartHeader';

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
  aggregateType: string;
  regionColumn?: string;
  showLegend: boolean;
  timeColumn?: string;
  valueColumn?: string;
  xAxisColumn: string;
  xAxisLabel: string;
  yAxisColumn: YAxisColumnItem[];
  yAxisLabel: string;
}

interface ChartData {
  chartId: string;
  description: string;
  filters: any[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
  chart: any;
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
    [`res_charts_${params.id}`],
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
        toast(`Received ${err} while deleting chart `, {
          action: {
            label: 'undo',
            onClick: () => {},
          },
        });
      },
    }
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
    resource: '',
    type: ChartTypes.BarVertical,
    chart: {},
  });

  const [previousChartData, setPreviousChartData] = useState<ChartData | null>(
    null
  );

  const [resourceSchema, setResourceSchema] = useState<any[]>([]);

  useEffect(() => {
    if (chartId && chartDetails?.resourceChart) {
      const resource = resourceData?.datasetResources?.find(
        (r: any) => r.id === chartDetails.resourceChart.resource?.id
      );

      if (resource) {
        setResourceSchema(resource.schema || []);
      }
    }
  }, [chartId, chartDetails, resourceData]);

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

    const updatedData: ChartData = {
      chartId: resourceChart.id,
      description: resourceChart.description || '',
      filters:
        resourceChart.chartFilters?.length > 0
          ? resourceChart.chartFilters.map((filter: any) => ({
              column: filter.column?.id,
              operator: filter.operator,
              value: filter.value,
            }))
          : [{ column: '', operator: '==', value: '' }],
      name: resourceChart.name || '',
      options: {
        aggregateType: resourceChart?.chartOptions?.aggregateType,
        regionColumn: resourceChart?.chartOptions?.regionColumn?.id,
        showLegend: resourceChart?.chartOptions?.showLegend ?? true,
        timeColumn: resourceChart?.chartOptions?.timeColumn,
        valueColumn: resourceChart?.chartOptions?.valueColumn?.id,
        xAxisColumn: resourceChart?.chartOptions?.xAxisColumn?.id,
        xAxisLabel: resourceChart?.chartOptions?.xAxisLabel,
        yAxisColumn: resourceChart?.chartOptions?.yAxisColumn?.map(
          (col: any) => ({
            fieldName: col.field.id,
            label: col.label,
            color: col.color,
          })
        ),
        yAxisLabel: resourceChart?.chartOptions?.yAxisLabel,
      },
      resource: resourceChart.resource?.id,
      type: resourceChart.chartType as ChartTypes,
      chart: resourceChart.chart,
    };
    setChartData(updatedData);
    setPreviousChartData(updatedData);
  };

  const getDefaultOptions = (chartType: ChartTypes) => {
    const baseOptions = {
      aggregateType: 'SUM',
      showLegend: true,
      xAxisColumn: '',
      xAxisLabel: '',
      yAxisLabel: '',
    };

    switch (chartType) {
      case ChartTypes.AssamDistrict:
      case ChartTypes.AssamRc:
        return {
          ...baseOptions,
          regionColumn: '',
          valueColumn: '',
          timeColumn: '',
          yAxisColumn: [],
        };
      case ChartTypes.BarVertical:
      case ChartTypes.BarHorizontal:
        return {
          ...baseOptions,
          yAxisColumn: [{ fieldName: '', label: '', color: '#000000' }],
        };
      default:
        return {
          ...baseOptions,
          yAxisColumn: [{ fieldName: '', label: '', color: '#000000' }],
        };
    }
  };

  const handleChange = useCallback((field: string, value: any) => {
    setChartData((prevData) => {
      if (field === 'type') {
        const newType = value as ChartTypes;
        return {
          ...prevData,
          type: newType,
          options: getDefaultOptions(newType),
        };
      }
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

  const { mutate, isLoading: editMutationLoading } = useMutation(
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
        toast(`Received ${err} during resource chart saving`, {
          action: {
            label: 'undo',
            onClick: () => {},
          },
        });
      },
    }
  );

  const handleSave = useCallback(
    (updatedData: ChartData) => {
      if (JSON.stringify(previousChartData) !== JSON.stringify(updatedData)) {
        // Filter out empty Y-axis columns
        const validYAxisColumns = updatedData.options.yAxisColumn.filter(
          (col) => col.fieldName && col.fieldName.trim() !== ''
        );

        const chartInput: ResourceChartInput = {
          chartId: updatedData.chartId,
          description: updatedData.description,
          filters: updatedData.filters,
          name: updatedData.name,
          options: {
            ...updatedData.options,
            yAxisColumn: validYAxisColumns,
          },
          resource: updatedData.resource,
          type: updatedData.type,
        };

        // Store current type before mutation
        const currentType = updatedData.type;

        mutate(
          { chartInput },
          {
            onSuccess: (data) => {
              setChartData((prev) => ({
                ...prev,
                chart: data.chart,
                type: currentType, // Preserve the type from before mutation
                options: {
                  ...prev.options,
                  yAxisColumn: validYAxisColumns,
                },
              }));
            },
          }
        );

        setPreviousChartData({
          ...updatedData,
          type: currentType, // Ensure previousChartData also has correct type
          filters:
            updatedData.filters?.length > 0
              ? updatedData.filters
              : [{ column: '', operator: '==', value: '' }],
        });
      }
    },
    [previousChartData, mutate]
  );

  const handleResourceChange = useCallback(
    (value: string) => {
      const resource = resourceData?.datasetResources.find(
        (r: any) => r.id === value
      );
      if (resource) {
        handleChange('resource', resource.id);
      }
    },
    [resourceData, handleChange]
  );

  const chartRef = useRef<ReactECharts>(null);

  return (
    <>
      <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
        <ChartHeader
          setType={setType}
          setChartId={setChartId}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          resourceChart={resourceChart}
          resourceData={resourceData}
          chartsList={chartsList}
          chartId={chartId}
        />
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
            {chartData.chart?.options &&
              Object.keys(chartData.chart?.options).length > 0 && (
                <ReactECharts
                  option={chartData.chart?.options}
                  ref={chartRef}
                />
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartsVisualize;
