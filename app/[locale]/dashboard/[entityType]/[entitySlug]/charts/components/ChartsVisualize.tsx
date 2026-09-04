import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { renderGeoJSON } from '@/geo_json/render_geojson';
import { ChartTypes } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { Divider, Icon, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import {
  chartDetailsQuery,
  createChart,
  CreateResourceChart,
  datasetResource,
  getResourceChartDetails,
} from '../queries';
import {
  ChartFilters,
  ChartOptions,
  ChartPreview,
  ResourceData,
  ResourceSchema,
} from '../types';
import ChartForm from './ChartForm';
import ChartHeader from './ChartHeader';

interface ChartData {
  chartId: string;
  description: string;
  filters: ChartFilters[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
  chart: ChartPreview;
}

type ChartChangeValue =
  | string
  | boolean
  | ChartTypes
  | ChartOptions
  | ChartFilters[]
  | ChartData;

interface ResourceChartDetails {
  id: string;
  description?: string | null;
  name?: string | null;
  chartType: string;
  chartFilters?: Array<{
    column?: { id: string } | null;
    operator: string;
    value: string;
  }>;
  chartOptions?: {
    aggregateType?: string | null;
    regionColumn?: { id: string } | null;
    showLegend?: boolean | null;
    timeColumn?: string | { id?: string } | null;
    valueColumn?: { id: string } | null;
    xAxisColumn?: { id: string } | null;
    xAxisLabel?: string | null;
    yAxisColumn?: Array<{
      field?: { id: string } | null;
      label?: string | null;
      color?: string | null;
    }> | null;
    yAxisLabel?: string | null;
  } | null;
  resource?: { id: string } | null;
  chart?: ChartPreview | null;
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
  setType: (type: string) => void;
  setChartId: (id: string) => void;
  chartId: string | null;
}

function registerChartGeoJson(chartType: string): void {
  if (chartType === 'ASSAM_DISTRICT' || chartType === 'ASSAM_RC') {
    const geoJson = renderGeoJSON(chartType.toLowerCase());
    if (geoJson) {
      echarts.registerMap(
        chartType.toLowerCase(),
        geoJson as Parameters<typeof echarts.registerMap>[1]
      );
    }
  }
}

function mapResourceChartToChartData(
  resourceChartDetails: ResourceChartDetails
): ChartData {
  const chartFilters = resourceChartDetails.chartFilters ?? [];
  return {
    chartId: resourceChartDetails.id,
    description: resourceChartDetails.description || '',
    filters:
      chartFilters.length > 0
        ? chartFilters.map((filter) => ({
            column: filter.column?.id ?? '',
            operator: filter.operator,
            value: filter.value,
          }))
        : [{ column: '', operator: '==', value: '' }],
    name: resourceChartDetails.name || '',
    options: {
      aggregateType: resourceChartDetails.chartOptions?.aggregateType ?? '',
      regionColumn: resourceChartDetails.chartOptions?.regionColumn?.id,
      showLegend: resourceChartDetails.chartOptions?.showLegend ?? true,
      timeColumn:
        typeof resourceChartDetails.chartOptions?.timeColumn === 'string'
          ? resourceChartDetails.chartOptions.timeColumn
          : resourceChartDetails.chartOptions?.timeColumn?.id,
      valueColumn: resourceChartDetails.chartOptions?.valueColumn?.id,
      xAxisColumn: resourceChartDetails.chartOptions?.xAxisColumn?.id ?? '',
      xAxisLabel: resourceChartDetails.chartOptions?.xAxisLabel ?? '',
      yAxisColumn:
        resourceChartDetails.chartOptions?.yAxisColumn?.map((col) => ({
          fieldName: col.field?.id ?? '',
          label: col.label ?? '',
          color: col.color ?? '',
        })) ?? [],
      yAxisLabel: resourceChartDetails.chartOptions?.yAxisLabel ?? '',
    },
    resource: resourceChartDetails.resource?.id ?? '',
    type: resourceChartDetails.chartType as ChartTypes,
    chart: resourceChartDetails.chart ?? {},
  };
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

  const { data: resourceData } = useQuery([`res_charts_${params.id}`], () =>
    GraphQL(
      datasetResource,
      {
        [params.entityType]: params.entitySlug,
      },
      { datasetId: params.id }
    )
  );

  const { data: chartDetails, refetch } = useQuery(
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

  const { data: chartsList, refetch: chartsListRefetch } = useQuery(
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

  const resourceChart = useMutation(
    (data: { resource: string }) =>
      GraphQL(
        CreateResourceChart,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res) => {
        toast('Resource Chart Created Successfully');
        refetch();
        setIsSheetOpen(false);
        setType('visualize');
        const created = res.addResourceChart;
        if (created && 'id' in created) {
          setChartId(created.id);
        }
        chartsListRefetch();
      },
      onError: (err: unknown) => {
        toast(`Received ${String(err)} while deleting chart `, {
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
    type: ChartTypes.Bar,
    chart: {},
  });

  const [previousChartData, setPreviousChartData] = useState<ChartData | null>(
    null
  );

  const [resourceSchema, setResourceSchema] = useState<ResourceSchema[]>([]);
  const [prevChartDetails, setPrevChartDetails] = useState(chartDetails);
  const [prevResourceData, setPrevResourceData] = useState(resourceData);
  if (chartDetails !== prevChartDetails || resourceData !== prevResourceData) {
    setPrevChartDetails(chartDetails);
    setPrevResourceData(resourceData);
    if (chartId && chartDetails?.resourceChart) {
      const updatedData = mapResourceChartToChartData(
        chartDetails.resourceChart
      );
      setChartData(updatedData);
      setPreviousChartData(updatedData);
      const resource = resourceData?.datasetResources?.find(
        (r) => r.id === chartDetails.resourceChart.resource?.id
      );
      if (resource) {
        setResourceSchema(resource.schema || []);
      }
    }
  }

  useEffect(() => {
    if (chartId && chartDetails?.resourceChart) {
      refetch();
      registerChartGeoJson(chartDetails.resourceChart.chartType);
    }
  }, [chartId, chartDetails, refetch]);

  const updateChartData = (resourceChartDetails: ResourceChartDetails) => {
    registerChartGeoJson(resourceChartDetails.chartType);
    const updatedData = mapResourceChartToChartData(resourceChartDetails);
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
      case ChartTypes.Bar:
      case ChartTypes.Line:
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

  const handleChange = useCallback((field: string, value: ChartChangeValue) => {
    setChartData((prevData) => {
      if (field === 'type' && typeof value === 'string') {
        const newType = value as ChartTypes;
        return {
          ...prevData,
          type: newType,
          options: getDefaultOptions(newType),
        };
      }
      if (
        field === 'options' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        'showLegend' in value
      ) {
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
      onSuccess: (res) => {
        toast('Resource chart saved');
        if (
          res?.editResourceChart &&
          'id' in res.editResourceChart
        ) {
          const savedChart = res.editResourceChart;
          const newChartId = savedChart.id;
          updateChartData(savedChart);
          setChartId(newChartId);
        }
        chartsListRefetch();
        refetch();
      },
      onError: (err: unknown) => {
        toast(`Received ${String(err)} during resource chart saving`, {
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
                chart:
                  'chart' in data
                    ? ((data as { chart?: ChartPreview }).chart ?? {})
                    : {},
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
        (r) => r.id === value
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
          resourceData={resourceData as ResourceData}
          chartsList={chartsList ?? null}
          chartId={chartId ?? ''}
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
