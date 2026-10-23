'use client';

import { useState } from 'react';
import { ChartTypes } from '@/gql/generated/graphql';
import {
  IconCalendar,
  IconHash,
  IconPhoto,
  IconTypography,
  IconX,
} from '@tabler/icons-react';
import ReactECharts from 'echarts-for-react';
import {
  Button,
  DropZone,
  Icon,
  SectionCard,
  Select,
  Spinner,
  Switch,
  Tag,
  Text,
  TextField,
} from 'opub-ui';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import {
  EntityRowPicker,
  type EntityRow,
} from '../../usecases/edit/components/EntityRowPicker';
import { CHART_FIELD_DRAG_TYPE, FieldList } from './FieldList';
import {
  AGGREGATE_OPTIONS,
  aggregateLabel,
  allowsMultipleValues,
  builderErrors,
  columnKind,
  fieldById,
  hasPreviewOptions,
  isAxisSelection,
  MAP_SUBTYPE_OPTIONS,
  recommendedSelection,
  SERIES_COLORS,
  type BuilderState,
  type ChartSelection,
  type SchemaField,
} from './model';

export interface DatasetOption {
  id: string;
  title: string;
  geographies: string[];
  resources: { id: string; name: string }[];
}

const CHART_CARDS: {
  value: ChartSelection;
  label: string;
  description: string;
  icon: keyof typeof Icons;
}[] = [
  {
    value: 'BAR',
    label: 'Bar',
    description: 'Compare values across categories.',
    icon: 'chartBar',
  },
  {
    value: 'LINE',
    label: 'Line',
    description: 'Show change or trends over time.',
    icon: 'chartLine',
  },
  {
    value: 'TREEMAP',
    label: 'Treemap',
    description: 'Show parts of a whole as sized blocks.',
    icon: 'chartTreeMap',
  },
  {
    value: 'MAP',
    label: 'Map',
    description: 'Show values by geography.',
    icon: 'chartMap',
  },
  {
    value: 'BIG_NUMBER',
    label: 'Big Number',
    description: 'Highlight one key value.',
    icon: 'chartBigNumber',
  },
  {
    value: 'IMAGE',
    label: 'Upload Image',
    description: 'Add an externally created visualisation.',
    icon: 'photo',
  },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text variant="bodySm" className="text-textCritical">
      {message}
    </Text>
  );
}

function SelectedField({
  name,
  kind = 'numeric',
  onRemove,
}: {
  name: string;
  kind?: 'numeric' | 'date' | 'text';
  onRemove: () => void;
}) {
  const Icon =
    kind === 'date'
      ? IconCalendar
      : kind === 'text'
        ? IconTypography
        : IconHash;
  return (
    <div className="flex items-center gap-2 rounded-2 bg-surfaceSubdued px-2 py-1">
      <Button kind="tertiary" onClick={onRemove} aria-label={`Remove ${name}`}>
        <IconX size={16} />
      </Button>
      <Icon size={20} className="shrink-0 pb-1 text-textSubdued" aria-hidden />
      <Text variant="bodyMd" color="subdued" className="pb-1">
        {name}
      </Text>
    </div>
  );
}

function DropZoneBox({
  active,
  onDropId,
  children,
}: {
  active: boolean;
  onDropId: (id: string) => void;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        if (!active) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        if (!over) setOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOver(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const id = event.dataTransfer.getData(CHART_FIELD_DRAG_TYPE);
        if (active && id) onDropId(id);
      }}
      className={cn(
        'mt-2 flex flex-col gap-1.5 rounded-3 border-1 border-dashed border-borderSubdued p-1.5',
        active && 'border-borderHighlight bg-surfaceHighlightSubdued',
        active && over && 'bg-surfaceSelected'
      )}
    >
      {children}
    </div>
  );
}

function datasetRow(item: DatasetOption): EntityRow {
  const places = item.geographies.slice(0, 3).join(' · ');
  const files = `${item.resources.length} ${item.resources.length === 1 ? 'file' : 'files'}`;
  return {
    id: item.id,
    title: item.title,
    subtitle: [places, files].filter(Boolean).join(' · '),
  };
}

function SelectedDataset({
  dataset,
  onChange,
}: {
  dataset: DatasetOption;
  onChange: () => void;
}) {
  const row = datasetRow(dataset);
  return (
    <div className="bg-surfaceNeutral flex items-center justify-between gap-3 rounded-3 border-1 border-solid border-borderSubdued px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-2 bg-surfaceDefault text-textSubdued">
          <Icon source={Icons.dataset} size={18} />
        </span>
        <div className="min-w-0">
          <Text
            fontWeight="semibold"
            className="block truncate"
            title={row.title}
          >
            {row.title}
          </Text>
          {row.subtitle ? (
            <Text variant="bodySm" color="subdued" className="block truncate">
              {row.subtitle}
            </Text>
          ) : null}
        </div>
      </div>
      <Button kind="neutral" size="slim" onClick={onChange}>
        Change
      </Button>
    </div>
  );
}

function valueChipLabel(fieldName: string, aggregateType: string) {
  if (!aggregateType || aggregateType === 'NONE') return fieldName;
  return `${aggregateLabel(aggregateType)} of ${fieldName}`;
}

export function BuildStep({
  state,
  onChange,
  datasets,
  datasetsLoading,
  fields,
  fieldsLoading,
  imageName,
  hasImage,
  previewOptions,
  remoteImageUrl,
  showErrors,
  saving,
  onSave,
  onImageFile,
  selections,
}: {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
  datasets: DatasetOption[];
  datasetsLoading: boolean;
  fields: SchemaField[];
  fieldsLoading: boolean;
  imageName?: string | null;
  hasImage: boolean;
  previewOptions?: Record<string, unknown> | null;
  remoteImageUrl?: string | null;
  showErrors: boolean;
  saving: boolean;
  onSave: () => void;
  onImageFile: (file: File | null) => void;
  selections?: ChartSelection[];
}) {
  const [dragging, setDragging] = useState<SchemaField | null>(null);
  const [replacingDataset, setReplacingDataset] = useState(false);
  const errors = showErrors ? builderErrors(state, hasImage) : {};
  const dataset = datasets.find((item) => item.id === state.datasetId);
  const recommended = state.resourceId ? recommendedSelection(fields) : null;
  const numericFields = fields.filter(
    (field) => columnKind(field.format) === 'numeric'
  );
  const singleValue = !allowsMultipleValues(state.selection);
  const valuesFull =
    state.selection === 'BIG_NUMBER' || state.selection === 'TREEMAP'
      ? state.yAxisColumns.length >= 1
      : false;

  const patch = (next: Partial<BuilderState>) => onChange(next);

  const selectChart = (selection: ChartSelection) => {
    const next: Partial<BuilderState> = { selection };
    if (selection !== 'BAR' && selection !== 'LINE') {
      next.yAxisColumns = state.yAxisColumns.slice(0, 1);
    }
    if (selection === 'IMAGE') {
      next.resourceId = '';
    }
    patch(next);
  };

  const addValue = (id: string) => {
    const field = fieldById(fields, id);
    if (!field || columnKind(field.format) !== 'numeric') return;
    if (state.yAxisColumns.some((column) => column.fieldName === id)) return;
    if (valuesFull) return;
    const next = [
      ...(singleValue ? [] : state.yAxisColumns),
      {
        fieldName: id,
        label: field.fieldName,
        color: SERIES_COLORS[state.yAxisColumns.length % SERIES_COLORS.length],
      },
    ];
    patch({
      yAxisColumns: singleValue ? next.slice(-1) : next,
      showLegend: !singleValue && next.length > 1 ? state.showLegend : false,
    });
  };

  const setCategory = (id: string) => {
    if (!fieldById(fields, id)) return;
    patch({ xAxisColumn: id });
  };

  const roleFor = (id: string): string | null => {
    if (state.selection === 'MAP') {
      if (
        id === state.regionColumn ||
        id === state.polygonField ||
        id === state.geospatialField
      ) {
        return 'Geography';
      }
      if (id === state.latField) return 'Latitude';
      if (id === state.lngField) return 'Longitude';
      if (id === state.valueColumn) return 'Value';
      if (id === state.nameField) return 'Name';
      return null;
    }
    if (state.selection !== 'BIG_NUMBER' && id === state.xAxisColumn)
      return 'X-axis';
    if (state.yAxisColumns.some((column) => column.fieldName === id)) {
      return state.selection === 'BIG_NUMBER' ? 'Value' : 'Y-axis';
    }
    return null;
  };

  const categoryLabel =
    state.selection === 'MAP' ? 'Geographic field' : 'X-axis';
  const valueLabel =
    state.selection === 'BAR' || state.selection === 'LINE'
      ? 'Values (Y-axis)'
      : 'Value';

  const showConfigure =
    state.selection && state.selection !== 'IMAGE' && Boolean(state.resourceId);
  const showImage = state.selection === 'IMAGE' && Boolean(state.datasetId);
  const showPreview =
    Boolean(state.selection) &&
    (state.selection === 'IMAGE' || state.resourceId);

  return (
    <div className="flex flex-col gap-6 px-6">
      <SectionCard
        title="Data"
        description="Choose the dataset and the file you want to visualize."
      >
        <div id="data" className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Text fontWeight="semibold">
              Dataset <span className="text-textCritical">*</span>
            </Text>
            {datasetsLoading ? (
              <Spinner />
            ) : dataset && !replacingDataset ? (
              <SelectedDataset
                dataset={dataset}
                onChange={() => setReplacingDataset(true)}
              />
            ) : (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <EntityRowPicker
                    variant="dataset"
                    searchPlaceholder="Search datasets..."
                    emptyTitle="No dataset selected yet."
                    emptyDescription="Search and add the dataset this chart should use."
                    hidePlaceholder={replacingDataset}
                    options={datasets
                      .filter((item) => item.id !== state.datasetId)
                      .map(datasetRow)}
                    selected={[]}
                    onAdd={(item) => {
                      setReplacingDataset(false);
                      if (item.id === state.datasetId) return;
                      patch({
                        datasetId: item.id,
                        resourceId: '',
                        xAxisColumn: '',
                        yAxisColumns: [],
                        regionColumn: '',
                        valueColumn: '',
                        latField: '',
                        lngField: '',
                        polygonField: '',
                        geospatialField: '',
                        nameField: '',
                      });
                    }}
                    onRemove={() => undefined}
                  />
                </div>
                {replacingDataset && dataset ? (
                  <Button
                    kind="tertiary"
                    size="slim"
                    className="p-3.5"
                    onClick={() => setReplacingDataset(false)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            )}
            <FieldError message={errors.dataset} />
          </div>

          {dataset && state.selection !== 'IMAGE' ? (
            dataset.resources.length === 0 ? (
              <Text color="subdued">
                No files are available in this dataset.
              </Text>
            ) : (
              <Select
                name="chartResource"
                label="File / Resource"
                requiredIndicator
                options={dataset.resources.map((resource) => ({
                  label: resource.name,
                  value: resource.id,
                }))}
                value={state.resourceId}
                placeholder="Select a file or resource…"
                onChange={(value) =>
                  patch({
                    resourceId: value,
                    xAxisColumn: '',
                    yAxisColumns: [],
                    regionColumn: '',
                    valueColumn: '',
                    latField: '',
                    lngField: '',
                    polygonField: '',
                    geospatialField: '',
                    nameField: '',
                  })
                }
                error={errors.file}
              />
            )
          ) : null}
        </div>
      </SectionCard>

      {state.datasetId ? (
        <SectionCard title="Chart Type">
          <div id="chart-type" className="flex flex-col gap-3">
            {recommended ? (
              <Text variant="bodySm" color="subdued">
                Recommended for this data:{' '}
                {CHART_CARDS.find((card) => card.value === recommended)?.label}
              </Text>
            ) : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CHART_CARDS.filter(
                (card) => !selections || selections.includes(card.value)
              ).map((card) => {
                const selected = state.selection === card.value;
                const Icon = Icons[card.icon];
                return (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => selectChart(card.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-3 border-1 border-solid bg-white p-4 text-left',
                      selected
                        ? 'border-borderHighlight bg-surfaceHighlightSubdued'
                        : 'border-borderSubdued'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon size={20} strokeWidth={1.5} />
                      {card.value === recommended ? (
                        <span className="text-bodySm rounded-full bg-surfaceHighlightSubdued px-2 py-0.5 text-textHighlight">
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    <Text fontWeight="semibold">{card.label}</Text>
                    <Text variant="bodySm" color="subdued">
                      {card.description}
                    </Text>
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.chartType} />
          </div>
        </SectionCard>
      ) : null}

      {showImage ? (
        <SectionCard
          title="Chart Image"
          description="Upload a chart image. PNG, JPG, SVG, and TIFF are supported."
        >
          <div id="configure">
            <DropZone
              name="chartImage"
              label="Chart Image"
              accept=".png,.jpg,.jpeg,.svg,.tiff"
              allowMultiple={false}
              outline
              onDrop={(files) => onImageFile(files[0] ?? null)}
            >
              {imageName ? (
                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2">
                    <IconPhoto size={18} />
                    <Text>{imageName}</Text>
                  </div>
                  <Button kind="tertiary" onClick={() => onImageFile(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <DropZone.FileUpload
                  actionTitle="Drag and drop a chart image here, or click to browse."
                  actionHint="PNG, JPG, SVG, TIFF"
                />
              )}
            </DropZone>
            {/* <div className="mt-2 flex gap-1">
              {['PNG', 'JPG', 'SVG', 'TIFF'].map((type) => (
                <Tag key={type}>{type}</Tag>
              ))}
            </div> */}
            <FieldError message={errors.image} />
          </div>
        </SectionCard>
      ) : null}

      {showConfigure ? (
        <SectionCard title="Configure">
          <div
            id="configure"
            className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
          >
            {fieldsLoading ? (
              <Spinner />
            ) : (
              <FieldList
                fields={fields}
                roleFor={roleFor}
                onDragField={setDragging}
              />
            )}
            <div className="flex flex-col gap-5">
              {state.selection === 'MAP' ? (
                <MapFields
                  state={state}
                  fields={fields}
                  dragging={dragging}
                  errors={errors}
                  onChange={patch}
                />
              ) : (
                <>
                  {state.selection !== 'BIG_NUMBER' ? (
                    <div className="flex flex-col gap-2">
                      <Text fontWeight="semibold">
                        {categoryLabel}{' '}
                        <span className="text-textCritical">*</span>
                      </Text>
                      <Text variant="bodySm" color="subdued">
                        {state.selection === 'LINE'
                          ? 'What each point represents, e.g. Quarter'
                          : 'What each bar or block represents.'}
                      </Text>
                      <DropZoneBox
                        active={Boolean(dragging)}
                        onDropId={setCategory}
                      >
                        {state.xAxisColumn ? (
                          <SelectedField
                            name={
                              fieldById(fields, state.xAxisColumn)?.fieldName ??
                              state.xAxisColumn
                            }
                            kind={columnKind(
                              fieldById(fields, state.xAxisColumn)?.format ?? ''
                            )}
                            onRemove={() => patch({ xAxisColumn: '' })}
                          />
                        ) : (
                          <Select
                            name="chartCategory"
                            label="Category field"
                            labelHidden
                            options={fields.map((field) => ({
                              label: field.fieldName,
                              value: field.id,
                            }))}
                            placeholder="+ Add a field"
                            onChange={setCategory}
                          />
                        )}
                      </DropZoneBox>
                      <FieldError message={errors.category} />
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    <Text fontWeight="semibold">
                      {valueLabel} <span className="text-textCritical">*</span>
                    </Text>
                    <Text variant="bodySm" color="subdued">
                      {allowsMultipleValues(state.selection)
                        ? 'The numbers to measure. Add more than one to compare them.'
                        : 'The number to show.'}
                    </Text>
                    <DropZoneBox
                      active={Boolean(
                        dragging &&
                        columnKind(dragging.format) === 'numeric' &&
                        !valuesFull
                      )}
                      onDropId={addValue}
                    >
                      {state.yAxisColumns.map((column) => {
                        const field = fieldById(fields, column.fieldName);
                        return (
                          <SelectedField
                            key={column.fieldName}
                            name={valueChipLabel(
                              field?.fieldName ?? column.label,
                              state.aggregateType
                            )}
                            kind="numeric"
                            onRemove={() =>
                              patch({
                                yAxisColumns: state.yAxisColumns.filter(
                                  (item) => item.fieldName !== column.fieldName
                                ),
                              })
                            }
                          />
                        );
                      })}
                      {!valuesFull ? (
                        <Select
                          name="chartValue"
                          label="Value field"
                          labelHidden
                          options={numericFields
                            .filter(
                              (field) =>
                                !state.yAxisColumns.some(
                                  (column) => column.fieldName === field.id
                                )
                            )
                            .map((field) => ({
                              label: field.fieldName,
                              value: field.id,
                            }))}
                          placeholder={
                            state.yAxisColumns.length === 0
                              ? '+ Add a field'
                              : '+ Add another value'
                          }
                          onChange={addValue}
                        />
                      ) : null}
                    </DropZoneBox>
                    <FieldError message={errors.value} />
                  </div>

                  <Select
                    name="chartAggregate"
                    label="Aggregation"
                    helpText="Applied to every value on this chart."
                    options={AGGREGATE_OPTIONS}
                    value={state.aggregateType}
                    onChange={(value) => patch({ aggregateType: value })}
                  />

                  {isAxisSelection(state.selection) &&
                  state.selection !== 'TREEMAP' ? (
                    <>
                      <TextField
                        name="xAxisLabel"
                        label="X-axis Label"
                        value={state.xAxisLabel}
                        placeholder={
                          fieldById(fields, state.xAxisColumn)?.fieldName ??
                          'Display label for the X-axis'
                        }
                        onChange={(value) => patch({ xAxisLabel: value })}
                      />
                      <TextField
                        name="yAxisLabel"
                        label="Y-axis Label"
                        value={state.yAxisLabel}
                        placeholder={
                          state.yAxisColumns.length === 1
                            ? fieldById(fields, state.yAxisColumns[0].fieldName)
                                ?.fieldName
                            : 'Display label for the Y-axis'
                        }
                        onChange={(value) => patch({ yAxisLabel: value })}
                      />
                      {state.yAxisColumns.length > 1 ? (
                        <Switch
                          name="showLegend"
                          label="Show legend"
                          checked={state.showLegend}
                          onCheckedChange={(checked) =>
                            patch({ showLegend: checked })
                          }
                        />
                      ) : null}
                    </>
                  ) : null}

                  {state.selection === 'BAR' ? (
                    <>
                      <Switch
                        name="stacked"
                        label="Stack bars"
                        checked={state.stacked}
                        onCheckedChange={(checked) =>
                          patch({ stacked: checked })
                        }
                      />
                      <Select
                        name="orientation"
                        label="Orientation"
                        options={[
                          { label: 'Vertical', value: 'vertical' },
                          { label: 'Horizontal', value: 'horizontal' },
                        ]}
                        value={state.orientation}
                        onChange={(value) => patch({ orientation: value })}
                      />
                    </>
                  ) : null}

                  {state.selection === 'BIG_NUMBER' ? (
                    <>
                      <TextField
                        name="chartUnit"
                        label="Unit"
                        helpText="Optional. Shown with the number, e.g. %, ₹, Crore."
                        value={state.valuePrefix}
                        placeholder="e.g. %, ₹, Crore"
                        onChange={(value) => patch({ valuePrefix: value })}
                      />
                      <TextField
                        name="chartDisplayLabel"
                        label="Display Label"
                        value={state.displayLabel}
                        placeholder="e.g. Annual Health Budget"
                        onChange={(value) => patch({ displayLabel: value })}
                      />
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {showPreview ? (
        <SectionCard title="Live Preview">
          <div id="preview">
            {state.selection === 'IMAGE' ? (
              remoteImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={remoteImageUrl}
                  alt={state.name || 'Chart image'}
                  className="max-h-[420px] w-full rounded-3 object-contain"
                />
              ) : (
                <Text color="subdued">
                  The image preview appears after the chart is saved.
                </Text>
              )
            ) : hasPreviewOptions(previewOptions) && previewOptions ? (
              <ReactECharts option={previewOptions} style={{ height: 360 }} />
            ) : (
              <Text color="subdued">
                Assign the required fields and save to generate a preview.
              </Text>
            )}
          </div>
        </SectionCard>
      ) : null}

      <div className="flex justify-end">
        <Button kind="secondary" loading={saving} onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function MapFields({
  state,
  fields,
  dragging,
  errors,
  onChange,
}: {
  state: BuilderState;
  fields: SchemaField[];
  dragging: SchemaField | null;
  errors: ReturnType<typeof builderErrors>;
  onChange: (patch: Partial<BuilderState>) => void;
}) {
  const numericFields = fields.filter(
    (field) => columnKind(field.format) === 'numeric'
  );
  const textFields = fields.filter(
    (field) => columnKind(field.format) !== 'numeric'
  );
  const assam =
    state.mapSubtype === ChartTypes.AssamDistrict ||
    state.mapSubtype === ChartTypes.AssamRc;

  const assign = (id: string, key: keyof BuilderState) => {
    if (!fieldById(fields, id)) return;
    onChange({ [key]: id });
  };

  return (
    <div className="flex flex-col gap-5">
      <Select
        name="mapSubtype"
        label="Map type"
        options={MAP_SUBTYPE_OPTIONS}
        value={state.mapSubtype}
        onChange={(value) => onChange({ mapSubtype: value as ChartTypes })}
      />

      {assam ? (
        <FieldSelect
          label="Geographic field"
          required
          helper="Where each value goes on the map."
          name="regionColumn"
          value={state.regionColumn}
          fields={textFields.length > 0 ? textFields : fields}
          dragging={dragging}
          onSelect={(id) => assign(id, 'regionColumn')}
          onClear={() => onChange({ regionColumn: '' })}
          error={errors.category}
        />
      ) : null}

      {state.mapSubtype === ChartTypes.PointMap ? (
        <>
          <FieldSelect
            label="Latitude"
            required
            helper="Numeric latitude column."
            name="latField"
            value={state.latField}
            fields={numericFields}
            dragging={dragging}
            onSelect={(id) => assign(id, 'latField')}
            onClear={() => onChange({ latField: '' })}
            error={errors.category}
          />
          <FieldSelect
            label="Longitude"
            required
            helper="Numeric longitude column."
            name="lngField"
            value={state.lngField}
            fields={numericFields}
            dragging={dragging}
            onSelect={(id) => assign(id, 'lngField')}
            onClear={() => onChange({ lngField: '' })}
          />
        </>
      ) : null}

      {state.mapSubtype === ChartTypes.PolygonMap ? (
        <FieldSelect
          label="Polygon field"
          required
          helper="Column that contains polygon geometry."
          name="polygonField"
          value={state.polygonField}
          fields={fields}
          dragging={dragging}
          onSelect={(id) => assign(id, 'polygonField')}
          onClear={() => onChange({ polygonField: '' })}
          error={errors.category}
        />
      ) : null}

      {state.mapSubtype === ChartTypes.GeospatialMap ? (
        <FieldSelect
          label="Geospatial field"
          required
          helper="Column that contains geospatial data."
          name="geospatialField"
          value={state.geospatialField}
          fields={fields}
          dragging={dragging}
          onSelect={(id) => assign(id, 'geospatialField')}
          onClear={() => onChange({ geospatialField: '' })}
          error={errors.category}
        />
      ) : null}

      <FieldSelect
        label="Value"
        required
        helper="The number that colours each region."
        name="mapValue"
        value={state.valueColumn}
        fields={numericFields}
        dragging={dragging}
        numericOnly
        onSelect={(id) => assign(id, 'valueColumn')}
        onClear={() => onChange({ valueColumn: '' })}
        error={errors.value}
      />

      {!assam ? (
        <FieldSelect
          label="Name field"
          helper="Optional label for each feature."
          name="nameField"
          value={state.nameField}
          fields={textFields.length > 0 ? textFields : fields}
          dragging={dragging}
          onSelect={(id) => assign(id, 'nameField')}
          onClear={() => onChange({ nameField: '' })}
        />
      ) : null}

      <Select
        name="mapAggregate"
        label="Aggregation"
        helpText="Applied to the value for each region."
        options={AGGREGATE_OPTIONS}
        value={state.aggregateType}
        onChange={(value) => onChange({ aggregateType: value })}
      />
    </div>
  );
}

function FieldSelect({
  label,
  required,
  helper,
  name,
  value,
  fields,
  dragging,
  numericOnly,
  onSelect,
  onClear,
  error,
}: {
  label: string;
  required?: boolean;
  helper: string;
  name: string;
  value: string;
  fields: SchemaField[];
  dragging: SchemaField | null;
  numericOnly?: boolean;
  onSelect: (id: string) => void;
  onClear: () => void;
  error?: string;
}) {
  const canDrop =
    Boolean(dragging) &&
    (!numericOnly || columnKind(dragging?.format ?? '') === 'numeric') &&
    fields.some((field) => field.id === dragging?.id);

  return (
    <div>
      <Text fontWeight="semibold">
        {label}{' '}
        {required ? (
          <span className="text-textCritical">*</span>
        ) : (
          <span className="font-normal text-textSubdued">— Optional</span>
        )}
      </Text>
      <Text variant="bodySm" color="subdued">
        {helper}
      </Text>
      <DropZoneBox active={canDrop} onDropId={onSelect}>
        {value ? (
          <SelectedField
            name={fieldById(fields, value)?.fieldName ?? value}
            kind={columnKind(fieldById(fields, value)?.format ?? '')}
            onRemove={onClear}
          />
        ) : (
          <Select
            name={name}
            label={label}
            labelHidden
            options={fields.map((field) => ({
              label: field.fieldName,
              value: field.id,
            }))}
            placeholder="+ Add a field"
            onChange={onSelect}
          />
        )}
      </DropZoneBox>
      <FieldError message={error} />
    </div>
  );
}
