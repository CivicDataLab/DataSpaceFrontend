import { graphql } from '@/gql';
import { ChartStatus, ChartTypes } from '@/gql/generated/graphql';
import type { FilterField, SortField } from 'opub-ui';

import {
  EMPTY_CELL,
  formatUpdated,
  labelFromValue,
  optionList,
  toApiFilters,
} from '../provider-flow/table-listing';

export const CHART_TAB_KEYS: readonly string[] = [
  ChartStatus.Draft,
  ChartStatus.Published,
];

export const CHART_TABLE_STATUSES = [
  { key: ChartStatus.Draft, label: 'Draft' },
  { key: ChartStatus.Published, label: 'Published' },
];

export const INITIAL_CHART_SORT: SortField[] = [
  { field: 'modified', direction: 'desc' },
];

const MAP_FILTER = 'MAP';
const IMAGE_FILTER = 'IMAGE';

const MAP_CHART_TYPES = [
  ChartTypes.PolygonMap,
  ChartTypes.PointMap,
  ChartTypes.GeospatialMap,
  ChartTypes.AssamDistrict,
  ChartTypes.AssamRc,
].join(',');

export const CHART_TYPE_FILTER_OPTIONS = [
  { label: 'Bar', value: ChartTypes.Bar },
  { label: 'Line', value: ChartTypes.Line },
  { label: 'Big Number', value: ChartTypes.BigNumber },
  { label: 'Treemap', value: ChartTypes.Treemap },
  { label: 'Map', value: MAP_FILTER },
  { label: 'Image', value: IMAGE_FILTER },
];

export const chartsTableQueryDoc = graphql(`
  query ChartsTableListing(
    $filters: [FilterSpec!]
    $sortOptions: [SortSpec!]
    $limit: Int
    $offset: Int
  ) {
    chartsTable(
      filters: $filters
      sortOptions: $sortOptions
      limit: $limit
      offset: $offset
    ) {
      totalItemsCount
      statusCounts {
        status
        count
      }
      data {
        __typename
        ... on TypeResourceChart {
          id
          name
          chartType
          status
          modified
          dataset {
            id
            title
          }
        }
        ... on TypeResourceChartImage {
          id
          name
          status
          modified
          dataset {
            id
            title
          }
        }
      }
    }
  }
`);

export const chartTableDatasetsQueryDoc = graphql(`
  query ChartTableDatasets {
    datasets {
      id
      title
    }
  }
`);

export type ChartListingRow = {
  id: string;
  name: string;
  dataset: string;
  chartType: string;
  status: string;
  modified: string;
  kind: 'TypeResourceChart' | 'TypeResourceChartImage';
};

type ChartTableRecord = {
  __typename: 'TypeResourceChart' | 'TypeResourceChartImage';
  id: string;
  name?: string | null;
  status: string;
  modified: string;
  chartType?: string | null;
  dataset?: { title?: string | null } | null;
};

export function toChartRows(charts: ChartTableRecord[]): ChartListingRow[] {
  return charts.map((chart) => ({
    id: chart.id,
    name: chart.name?.trim() || 'Untitled Chart',
    dataset: chart.dataset?.title?.trim() || EMPTY_CELL,
    chartType:
      chart.__typename === 'TypeResourceChart' && chart.chartType
        ? labelFromValue(chart.chartType)
        : 'Image',
    status: chart.status,
    modified: formatUpdated(chart.modified),
    kind: chart.__typename,
  }));
}

function toTypeFilter(value: string) {
  if (value === IMAGE_FILTER) {
    return { field: 'kind', condition: 'exact', value: 'IMAGE' };
  }
  if (value === MAP_FILTER) {
    return { field: 'chart_type', condition: 'in', value: MAP_CHART_TYPES };
  }
  return { field: 'chart_type', condition: 'exact', value };
}

export function toChartApiFilters(filters: FilterField[]) {
  const typeFilters = filters.filter((filter) => filter.field === 'chartType');
  const rest = filters.filter((filter) => filter.field !== 'chartType');
  return [
    ...toApiFilters(rest, {}),
    ...typeFilters
      .filter((filter) => filter.value.trim())
      .map((filter) => toTypeFilter(filter.value)),
  ];
}

export function datasetFilterOptions(
  datasets: Array<{ id: string; title?: string | null }> | undefined
) {
  return optionList(
    (datasets ?? [])
      .filter((dataset) => dataset.title?.trim())
      .map((dataset) => ({
        label: dataset.title?.trim() || 'Untitled dataset',
        value: String(dataset.id),
      }))
  );
}
