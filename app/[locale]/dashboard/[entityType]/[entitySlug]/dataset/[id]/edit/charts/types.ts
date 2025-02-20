import { ChartTypes } from "@/gql/generated/graphql";



export interface YAxisColumnItem {
  fieldName:  string;
  label: string;
  color: string;
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

export interface ChartData {
  chartId: string;
  description: string;
  filters: any[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
  chart: any;
}

export interface ResourceChartInput {
  chartId: string;
  description: string;
  filters: any[];
  name: string;
  options: ChartOptions;
  resource: string;
  type: ChartTypes;
}

export interface ResourceSchema {
  fieldName: string;
  id: string;
}

export interface Resource {
  id: string;
  name: string;
}

export interface ResourceData {
  datasetResources: Resource[];
}
