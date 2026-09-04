import { ChartTypes } from "@/gql/generated/graphql";



export interface YAxisColumnItem {
  fieldName:  string;
  label: string;
  color: string;
}

export interface ChartFilters{
  column: string;
  operator: string;
  value: string;
}
export interface ChartOptions {
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

export interface ChartPreview {
  options?: Record<string, unknown>;
}

export interface ChartData {
  chartId: string;
  description: string;
  filters: ChartFilters[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
  chart: ChartPreview;
}

export interface ResourceChartInput {
  chartId: string;
  description: string;
  filters: ChartFilters[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
}

export interface ResourceSchema {
  fieldName: string;
  id: string;
  format: string
}

export interface Resource {
  id: string;
  name: string;
}

export interface ResourceData {
  datasetResources: Resource[];
}
