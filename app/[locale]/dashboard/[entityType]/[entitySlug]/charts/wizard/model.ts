import {
  ChartTypes,
  type ChartOptions,
  type ResourceChartInput,
} from '@/gql/generated/graphql';

export type ChartSelection =
  | 'BAR'
  | 'LINE'
  | 'TREEMAP'
  | 'BIG_NUMBER'
  | 'MAP'
  | 'IMAGE';

export type ColumnKind = 'numeric' | 'date' | 'text';

export interface SchemaField {
  id: string;
  fieldName: string;
  format: string;
}

export interface YAxisItem {
  fieldName: string;
  label: string;
  color: string;
}

export interface BuilderState {
  name: string;
  datasetId: string;
  resourceId: string;
  selection: ChartSelection | null;
  mapSubtype: ChartTypes;
  aggregateType: string;
  xAxisColumn: string;
  yAxisColumns: YAxisItem[];
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  stacked: boolean;
  orientation: string;
  valuePrefix: string;
  displayLabel: string;
  regionColumn: string;
  valueColumn: string;
  latField: string;
  lngField: string;
  polygonField: string;
  geospatialField: string;
  nameField: string;
}

export interface BuilderErrors {
  dataset?: string;
  file?: string;
  chartType?: string;
  category?: string;
  value?: string;
  image?: string;
}

export const SERIES_COLORS = [
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
];

export const MAP_SUBTYPE_OPTIONS: { label: string; value: ChartTypes }[] = [
  { label: 'Assam districts', value: ChartTypes.AssamDistrict },
  { label: 'Assam revenue circles', value: ChartTypes.AssamRc },
  { label: 'Point map', value: ChartTypes.PointMap },
  { label: 'Polygon map', value: ChartTypes.PolygonMap },
  { label: 'Geospatial map', value: ChartTypes.GeospatialMap },
];

const MAP_TYPES = new Set<ChartTypes>(MAP_SUBTYPE_OPTIONS.map((option) => option.value));

export const AGGREGATE_OPTIONS = [
  { label: 'None', value: 'NONE' },
  { label: 'Sum', value: 'SUM' },
  { label: 'Average', value: 'AVG' },
  { label: 'Count', value: 'COUNT' },
];

export function emptyBuilder(): BuilderState {
  return {
    name: '',
    datasetId: '',
    resourceId: '',
    selection: null,
    mapSubtype: ChartTypes.AssamDistrict,
    aggregateType: 'SUM',
    xAxisColumn: '',
    yAxisColumns: [],
    xAxisLabel: '',
    yAxisLabel: '',
    showLegend: false,
    stacked: false,
    orientation: 'vertical',
    valuePrefix: '',
    displayLabel: '',
    regionColumn: '',
    valueColumn: '',
    latField: '',
    lngField: '',
    polygonField: '',
    geospatialField: '',
    nameField: '',
  };
}

export function columnKind(format: string): ColumnKind {
  const value = format.toUpperCase();
  if (['INTEGER', 'NUMBER', 'FLOAT', 'DECIMAL', 'DOUBLE'].includes(value)) {
    return 'numeric';
  }
  if (['DATE', 'DATETIME', 'TIME', 'TIMESTAMP'].includes(value)) {
    return 'date';
  }
  return 'text';
}

export function columnKindLabel(kind: ColumnKind): string {
  if (kind === 'numeric') return 'Number';
  if (kind === 'date') return 'Date';
  return 'Text';
}

export function isMapType(type: ChartTypes | null | undefined): boolean {
  return Boolean(type && MAP_TYPES.has(type));
}

export function selectionFromType(type: ChartTypes | null | undefined): ChartSelection {
  if (!type || isMapType(type)) return type && isMapType(type) ? 'MAP' : 'BAR';
  if (type === ChartTypes.Line) return 'LINE';
  if (type === ChartTypes.Treemap) return 'TREEMAP';
  if (type === ChartTypes.BigNumber) return 'BIG_NUMBER';
  return 'BAR';
}

export function apiChartType(state: BuilderState): ChartTypes | null {
  if (state.selection === 'BAR') return ChartTypes.Bar;
  if (state.selection === 'LINE') return ChartTypes.Line;
  if (state.selection === 'TREEMAP') return ChartTypes.Treemap;
  if (state.selection === 'BIG_NUMBER') return ChartTypes.BigNumber;
  if (state.selection === 'MAP') return state.mapSubtype;
  return null;
}

export function chartTypeLabel(state: Pick<BuilderState, 'selection' | 'mapSubtype'>): string {
  if (state.selection === 'BAR') return 'Bar';
  if (state.selection === 'LINE') return 'Line';
  if (state.selection === 'TREEMAP') return 'Treemap';
  if (state.selection === 'BIG_NUMBER') return 'Big Number';
  if (state.selection === 'IMAGE') return 'Upload Image';
  if (state.selection === 'MAP') {
    return (
      MAP_SUBTYPE_OPTIONS.find((option) => option.value === state.mapSubtype)?.label ??
      'Map'
    );
  }
  return '—';
}

export function isAxisSelection(selection: ChartSelection | null): boolean {
  return selection === 'BAR' || selection === 'LINE' || selection === 'TREEMAP';
}

export function allowsMultipleValues(selection: ChartSelection | null): boolean {
  return selection === 'BAR' || selection === 'LINE';
}

export function recommendedSelection(fields: SchemaField[]): ChartSelection {
  return fields.some((field) => columnKind(field.format) === 'date') ? 'LINE' : 'BAR';
}

export function fieldById(fields: SchemaField[], id: string): SchemaField | undefined {
  return fields.find((field) => field.id === id);
}

export function normalizeAggregate(value: string | null | undefined): string {
  if (!value) return 'SUM';
  if (value.toUpperCase() === 'AVERAGE') return 'AVG';
  const known = AGGREGATE_OPTIONS.some((option) => option.value === value.toUpperCase());
  return known ? value.toUpperCase() : 'SUM';
}

export function normalizeOrientation(value: string | null | undefined): string {
  if (!value) return 'vertical';
  const normalized = value.toLowerCase();
  if (normalized === 'horizontal') return 'horizontal';
  return 'vertical';
}

interface ChartOptionsSource {
  aggregateType?: string | null;
  orientation?: string | null;
  stacked?: boolean | null;
  showLegend?: boolean | null;
  xAxisLabel?: string | null;
  yAxisLabel?: string | null;
  xAxisColumn?: { id?: string | null } | null;
  yAxisColumn?: Array<{
    field?: { id?: string | null } | null;
    label?: string | null;
    color?: string | null;
  }> | null;
  regionColumn?: { id?: string | null } | null;
  valueColumn?: { id?: string | null } | null;
  label?: string | null;
  valuePrefix?: string | null;
  valueSuffix?: string | null;
  latField?: { id?: string | null } | null;
  lngField?: { id?: string | null } | null;
  polygonField?: { id?: string | null } | null;
  geospatialField?: { id?: string | null } | null;
  nameField?: { id?: string | null } | null;
}

export interface ChartRecordSource {
  name?: string | null;
  chartType?: ChartTypes | null;
  dataset?: { id?: string | null } | null;
  resource?: { id?: string | null } | null;
  chartOptions?: ChartOptionsSource | null;
}

export function builderFromChart(chart: ChartRecordSource): BuilderState {
  const selection = selectionFromType(chart.chartType);
  const options = chart.chartOptions;
  return {
    ...emptyBuilder(),
    name: chart.name ?? '',
    datasetId: chart.dataset?.id ?? '',
    resourceId: chart.resource?.id ?? '',
    selection,
    mapSubtype: chart.chartType && isMapType(chart.chartType)
      ? chart.chartType
      : ChartTypes.AssamDistrict,
    aggregateType: normalizeAggregate(options?.aggregateType),
    xAxisColumn: options?.xAxisColumn?.id ?? '',
    yAxisColumns:
      options?.yAxisColumn?.flatMap((column) => {
        const fieldName = column.field?.id;
        if (!fieldName) return [];
        return [
          {
            fieldName,
            label: column.label ?? '',
            color: column.color || SERIES_COLORS[0],
          },
        ];
      }) ?? [],
    xAxisLabel: options?.xAxisLabel ?? '',
    yAxisLabel: options?.yAxisLabel ?? '',
    showLegend: options?.showLegend ?? false,
    stacked: options?.stacked ?? false,
    orientation: normalizeOrientation(options?.orientation),
    valuePrefix: options?.valuePrefix || options?.valueSuffix || '',
    displayLabel: options?.label ?? '',
    regionColumn: options?.regionColumn?.id ?? '',
    valueColumn: options?.valueColumn?.id ?? '',
    latField: options?.latField?.id ?? '',
    lngField: options?.lngField?.id ?? '',
    polygonField: options?.polygonField?.id ?? '',
    geospatialField: options?.geospatialField?.id ?? '',
    nameField: options?.nameField?.id ?? '',
  };
}

export function buildChartOptions(state: BuilderState): ChartOptions {
  const options: ChartOptions = {
    aggregateType: state.aggregateType || 'SUM',
    showLegend: state.showLegend,
    orientation: state.orientation || 'vertical',
    stacked: state.stacked,
    xAxisLabel: state.xAxisLabel || 'X-Axis',
    yAxisLabel: state.yAxisLabel || 'Y-Axis',
  };

  if (state.selection === 'BIG_NUMBER') {
    if (state.yAxisColumns.length > 0) {
      options.yAxisColumn = state.yAxisColumns.slice(0, 1);
    }
    if (state.displayLabel) options.label = state.displayLabel;
    if (state.valuePrefix) options.valuePrefix = state.valuePrefix;
    return options;
  }

  if (state.selection === 'MAP') {
    if (state.valueColumn) options.valueColumn = state.valueColumn;
    if (state.nameField) options.nameField = state.nameField;
    if (
      state.mapSubtype === ChartTypes.AssamDistrict ||
      state.mapSubtype === ChartTypes.AssamRc
    ) {
      if (state.regionColumn) options.regionColumn = state.regionColumn;
    }
    if (state.mapSubtype === ChartTypes.PointMap) {
      if (state.latField) options.latField = state.latField;
      if (state.lngField) options.lngField = state.lngField;
    }
    if (state.mapSubtype === ChartTypes.PolygonMap && state.polygonField) {
      options.polygonField = state.polygonField;
    }
    if (state.mapSubtype === ChartTypes.GeospatialMap && state.geospatialField) {
      options.geospatialField = state.geospatialField;
    }
    return options;
  }

  if (state.xAxisColumn) options.xAxisColumn = state.xAxisColumn;
  if (state.yAxisColumns.length > 0) {
    options.yAxisColumn = allowsMultipleValues(state.selection)
      ? state.yAxisColumns
      : state.yAxisColumns.slice(0, 1);
  }
  return options;
}

export function builderErrors(
  state: BuilderState,
  hasImage: boolean
): BuilderErrors {
  const errors: BuilderErrors = {};
  if (!state.datasetId) errors.dataset = 'Select a dataset.';
  if (!state.selection) errors.chartType = 'Select a chart type.';

  if (state.selection === 'IMAGE') {
    if (!hasImage) errors.image = 'Upload a chart image.';
    return errors;
  }

  if (!state.resourceId) errors.file = 'Select a file or resource.';
  if (!state.selection) return errors;

  if (isAxisSelection(state.selection)) {
    if (!state.xAxisColumn) errors.category = 'Choose a field for the category axis.';
    if (state.yAxisColumns.length === 0) {
      errors.value = 'Choose at least one numeric value.';
    }
  }

  if (state.selection === 'BIG_NUMBER' && state.yAxisColumns.length === 0) {
    errors.value = 'Choose the number to highlight.';
  }

  if (state.selection === 'MAP') {
    if (
      (state.mapSubtype === ChartTypes.AssamDistrict ||
        state.mapSubtype === ChartTypes.AssamRc) &&
      !state.regionColumn
    ) {
      errors.category = 'Choose the geographic field.';
    }
    if (state.mapSubtype === ChartTypes.PointMap && (!state.latField || !state.lngField)) {
      errors.category = 'Choose latitude and longitude fields.';
    }
    if (state.mapSubtype === ChartTypes.PolygonMap && !state.polygonField) {
      errors.category = 'Choose the polygon field.';
    }
    if (state.mapSubtype === ChartTypes.GeospatialMap && !state.geospatialField) {
      errors.category = 'Choose the geospatial field.';
    }
    if (!state.valueColumn) errors.value = 'Choose the value that colours the map.';
  }

  return errors;
}

export function isBuilderValid(state: BuilderState, hasImage: boolean): boolean {
  return Object.keys(builderErrors(state, hasImage)).length === 0;
}

export function hasPreviewOptions(options: unknown): boolean {
  return Boolean(
    options &&
      typeof options === 'object' &&
      !Array.isArray(options) &&
      Object.keys(options as Record<string, unknown>).length > 0
  );
}

export function aggregateLabel(value: string): string {
  return AGGREGATE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function vizChartInput(
  state: BuilderState,
  chartId?: string
): ResourceChartInput {
  const type = apiChartType(state);
  return {
    ...(chartId ? { chartId } : {}),
    resource: state.resourceId,
    ...(state.name.trim() ? { name: state.name.trim() } : {}),
    ...(type ? { type } : {}),
    options: buildChartOptions(state),
  };
}

export function configRows(
  state: BuilderState,
  labelFor: (id: string) => string
): { label: string; value: string }[] {
  const named = (id: string) => (id ? labelFor(id) || id : '—');
  if (state.selection === 'BIG_NUMBER') {
    return [
      {
        label: 'Value',
        value: state.yAxisColumns.map((column) => named(column.fieldName)).join(', ') || '—',
      },
      { label: 'Aggregation', value: aggregateLabel(state.aggregateType) },
      { label: 'Unit', value: state.valuePrefix || '—' },
      { label: 'Display label', value: state.displayLabel || '—' },
    ];
  }
  if (state.selection === 'MAP') {
    const geography =
      state.mapSubtype === ChartTypes.PointMap
        ? `${named(state.latField)}, ${named(state.lngField)}`
        : state.mapSubtype === ChartTypes.PolygonMap
          ? named(state.polygonField)
          : state.mapSubtype === ChartTypes.GeospatialMap
            ? named(state.geospatialField)
            : named(state.regionColumn);
    return [
      { label: 'Geography', value: geography },
      { label: 'Value', value: named(state.valueColumn) },
      { label: 'Aggregation', value: aggregateLabel(state.aggregateType) },
    ];
  }
  if (!state.selection || state.selection === 'IMAGE') return [];
  return [
    { label: 'X-axis', value: named(state.xAxisColumn) },
    {
      label: 'Values (Y-axis)',
      value: state.yAxisColumns.map((column) => named(column.fieldName)).join(', ') || '—',
    },
    { label: 'Aggregation', value: aggregateLabel(state.aggregateType) },
  ];
}

export function chartsBasePath(entityType: string, entitySlug: string): string {
  return `/dashboard/${entityType}/${entitySlug}/charts`;
}

export function entityHeaders(
  entityType: string,
  entitySlug: string
): Record<string, string> {
  if (entityType === 'self') return {};
  return { [entityType]: entitySlug };
}
