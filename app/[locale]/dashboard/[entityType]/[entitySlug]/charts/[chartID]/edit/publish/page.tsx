'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useChartCatalog } from '../../../wizard/catalog';
import { useChartEditStatus } from '../../../wizard/context';
import {
  chartWizardDetailsDoc,
  chartWizardPublishDoc,
  chartWizardSaveDoc,
} from '../../../wizard/documents';
import { ReviewStep } from '../../../wizard/ReviewStep';
import {
  builderFromChart,
  chartsBasePath,
  configRows,
  entityHeaders,
  fieldById,
  hasPreviewOptions,
  isBuilderValid,
  vizChartInput,
  chartTypeLabel,
} from '../../../wizard/model';

export default function ChartPublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    chartID: string;
  }>();
  const headers = entityHeaders(params.entityType, params.entitySlug);
  const {
    setStatus,
    setTitleOverride,
    registerTitleSave,
    registerBeforeNavigateHandler,
    setBuildComplete,
  } = useChartEditStatus();
  const [name, setName] = useState('');
  const nameReady = useRef(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const details = useQuery([`chart-wizard-${params.chartID}`], () =>
    GraphQL(chartWizardDetailsDoc, headers, {
      chartDetailsId: params.chartID,
    })
  );

  const chart = details.data?.resourceChart;
  const state = chart ? { ...builderFromChart(chart), name } : null;

  useEffect(() => {
    if (!chart || nameReady.current) return;
    nameReady.current = true;
    setName(chart.name ?? '');
    setTitleOverride(chart.name ?? '');
    setBuildComplete(isBuilderValid(builderFromChart(chart), false));
  }, [chart, setBuildComplete, setTitleOverride]);

  const catalog = useChartCatalog(
    params.entityType,
    params.entitySlug,
    state?.datasetId ?? '',
    state?.resourceId ?? ''
  );

  const datasetTitle =
    catalog.datasets.find((dataset) => dataset.id === state?.datasetId)?.title ||
    chart?.dataset?.title ||
    '';
  const resourceName =
    catalog.datasets
      .find((dataset) => dataset.id === state?.datasetId)
      ?.resources.find((resource) => resource.id === state?.resourceId)?.name ||
    chart?.resource?.name ||
    '';

  const save = async (nextName: string) => {
    if (!state) return;
    const next = { ...state, name: nextName };
    setSaving(true);
    setStatus('loading');
    try {
      await GraphQL(chartWizardSaveDoc, headers, {
        chartInput: vizChartInput(next, params.chartID),
      });
      setStatus('success');
      await details.refetch();
    } catch (error) {
      setStatus('success');
      const message = error instanceof Error ? error.message : String(error);
      toast(`Could not save the chart. ${message}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    registerTitleSave((title) => {
      setName(title);
      setTitleOverride(title);
      void save(title).catch(() => undefined);
    });
    registerBeforeNavigateHandler(async () => {
      await save(name);
    });
    return () => registerBeforeNavigateHandler(null);
    // save closes over the latest chart once it has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart?.id, name]);

  if (details.isLoading || !state || !chart) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const previewReady = hasPreviewOptions(chart.chart?.options);
  const namedState = { ...state, name };
  const valid = isBuilderValid(namedState, false);
  const labelFor = (id: string) =>
    fieldById(catalog.fields, id)?.fieldName ||
    chart.resource?.schema?.find((field) => field.id === id)?.fieldName ||
    id;

  return (
    <ReviewStep
      datasetTitle={datasetTitle}
      resourceName={resourceName}
      chartTypeLabel={chartTypeLabel(namedState)}
      configRows={configRows(namedState, labelFor)}
      chartName={name}
      onChartName={(value) => {
        setName(value);
        setTitleOverride(value);
      }}
      preview={
        previewReady ? (
          <ReactECharts
            option={chart.chart?.options as Record<string, unknown>}
            style={{ height: 360 }}
          />
        ) : (
          <Text color="subdued">No preview yet. Finish the chart configuration first.</Text>
        )
      }
      checks={[
        { label: 'Dataset selected', ok: Boolean(namedState.datasetId) },
        { label: 'File selected', ok: Boolean(namedState.resourceId) },
        { label: 'Chart type selected', ok: Boolean(namedState.selection) },
        { label: 'Configuration valid', ok: valid },
        { label: 'Chart preview generated', ok: previewReady },
        { label: 'Chart name added', ok: Boolean(name.trim()) },
      ]}
      editBase={`${chartsBasePath(params.entityType, params.entitySlug)}/${params.chartID}/edit`}
      saving={saving}
      publishing={publishing}
      onSave={() => {
        void save(name)
          .then(() => toast('Chart saved'))
          .catch(() => undefined);
      }}
      onPublish={() => {
        if (!valid || !name.trim() || !previewReady) {
          toast('This chart is not ready to publish.');
          return;
        }
        setPublishing(true);
        void save(name)
          .then(() =>
            GraphQL(chartWizardPublishDoc, headers, {
              chartId: params.chartID,
            })
          )
          .then(() => toast('Chart published'))
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            toast(`Could not publish the chart. ${message}`);
          })
          .finally(() => setPublishing(false));
      }}
    />
  );
}
