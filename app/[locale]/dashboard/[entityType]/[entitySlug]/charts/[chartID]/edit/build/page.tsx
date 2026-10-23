'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { BuildStep } from '../../../wizard/BuildStep';
import { useChartCatalog } from '../../../wizard/catalog';
import { useChartEditStatus } from '../../../wizard/context';
import {
  chartImageCreateDoc,
  chartWizardDetailsDoc,
  chartWizardSaveDoc,
} from '../../../wizard/documents';
import {
  builderFromChart,
  chartsBasePath,
  emptyBuilder,
  entityHeaders,
  hasPreviewOptions,
  isBuilderValid,
  vizChartInput,
  type BuilderState,
} from '../../../wizard/model';

export default function ChartBuildPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    chartID: string;
  }>();
  const router = useRouter();
  const headers = entityHeaders(params.entityType, params.entitySlug);
  const {
    setStatus,
    setBuildComplete,
    setTitleOverride,
    registerTitleSave,
    registerBeforeNavigateHandler,
    stepShowErrors,
  } = useChartEditStatus();

  const [state, setState] = useState<BuilderState>(emptyBuilder);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const hydrated = useRef(false);
  const skipAutosave = useRef(true);
  const creatingImage = useRef(false);
  const stateRef = useRef(state);
  const imageFileRef = useRef(imageFile);
  stateRef.current = state;
  imageFileRef.current = imageFile;

  const details = useQuery([`chart-wizard-${params.chartID}`], () =>
    GraphQL(chartWizardDetailsDoc, headers, {
      chartDetailsId: params.chartID,
    })
  );

  const catalog = useChartCatalog(
    params.entityType,
    params.entitySlug,
    state.datasetId,
    state.resourceId
  );

  useEffect(() => {
    const chart = details.data?.resourceChart;
    if (!chart || hydrated.current) return;
    hydrated.current = true;
    const next = builderFromChart(chart);
    setState(next);
    setTitleOverride(next.name);
    setBuildComplete(isBuilderValid(next, false));
    const options = chart.chart?.options;
    if (hasPreviewOptions(options)) {
      setPreview(options as Record<string, unknown>);
    }
  }, [details.data, setBuildComplete, setTitleOverride]);

  const persist = async (next: BuilderState) => {
    if (!next.resourceId || next.selection === 'IMAGE') return;
    setSaving(true);
    setStatus('loading');
    try {
      const result = await GraphQL(chartWizardSaveDoc, headers, {
        chartInput: vizChartInput(next, params.chartID),
      });
      const saved = result.editResourceChart;
      const options =
        saved.__typename === 'TypeResourceChart' ? saved.chart?.options : null;
      if (hasPreviewOptions(options)) {
        setPreview(options as Record<string, unknown>);
      }
      setStatus('success');
    } catch (error) {
      setStatus('success');
      const message = error instanceof Error ? error.message : String(error);
      toast(`Could not save the chart. ${message}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const createImageChart = async (file: File) => {
    const datasetId = stateRef.current.datasetId;
    if (!datasetId) {
      toast('Choose a dataset before uploading an image.');
      throw new Error('Dataset is required');
    }
    if (creatingImage.current) return false;
    creatingImage.current = true;
    setSaving(true);
    setStatus('loading');
    try {
      const result = await GraphQL(chartImageCreateDoc, headers, {
        input: {
          dataset: datasetId,
          image: file,
        },
      });
      const created = result.createResourceChartImage;
      if (!created || created.__typename !== 'TypeResourceChartImage') {
        throw new Error('Could not create the chart image');
      }
      toast('Chart image created');
      router.push(
        `${chartsBasePath(params.entityType, params.entitySlug)}/image/${created.id}/edit/build`
      );
      return false;
    } catch (error) {
      creatingImage.current = false;
      const message = error instanceof Error ? error.message : String(error);
      if (message !== 'Dataset is required') {
        toast(`Could not upload the chart image. ${message}`);
      }
      throw error;
    } finally {
      setSaving(false);
      setStatus('success');
    }
  };

  const handleImageFile = (file: File | null) => {
    setImageFile(file);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const next = file ? URL.createObjectURL(file) : null;
    previewRef.current = next;
    setLocalPreview(next);
  };

  useEffect(() => {
    if (!hydrated.current) return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void persist(stateRef.current).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timer);
    // persist reads the latest state through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setBuildComplete(isBuilderValid(state, Boolean(imageFile)));
  }, [imageFile, setBuildComplete, state]);

  useEffect(() => {
    registerTitleSave((title) => {
      setTitleOverride(title);
      setState((current) => ({ ...current, name: title }));
    });
    registerBeforeNavigateHandler(async () => {
      const current = stateRef.current;
      const file = imageFileRef.current;
      if (!isBuilderValid(current, Boolean(file))) {
        setShowErrors(true);
        throw new Error('Chart configuration is incomplete');
      }
      if (current.selection === 'IMAGE' && file) {
        await createImageChart(file);
        return false;
      }
      await persist(current);
    });
    return () => registerBeforeNavigateHandler(null);
  });

  const fallbackFields =
    state.resourceId &&
    state.resourceId === details.data?.resourceChart?.resource?.id
      ? (details.data?.resourceChart?.resource?.schema?.map((field) => ({
          id: field.id,
          fieldName: field.fieldName,
          format: field.format ?? '',
        })) ?? [])
      : [];
  const fields = catalog.fields.length > 0 ? catalog.fields : fallbackFields;

  if (details.isLoading || !hydrated.current) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (details.isError) {
    return <div className="px-6">Could not load this chart.</div>;
  }

  return (
    <BuildStep
      state={state}
      onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
      datasets={catalog.datasets}
      datasetsLoading={catalog.datasetsLoading}
      fields={fields}
      fieldsLoading={catalog.fieldsLoading}
      hasImage={Boolean(imageFile)}
      imageName={imageFile?.name}
      remoteImageUrl={localPreview}
      previewOptions={preview}
      showErrors={showErrors || stepShowErrors}
      saving={saving}
      selections={['BAR', 'LINE', 'MAP', 'BIG_NUMBER', 'IMAGE', 'TREEMAP']}
      onImageFile={handleImageFile}
      onSave={() => {
        if (state.selection === 'IMAGE') {
          if (!imageFile || !isBuilderValid(state, true)) {
            setShowErrors(true);
            toast('Choose a dataset and an image before saving.');
            return;
          }
          void createImageChart(imageFile).catch(() => undefined);
          return;
        }
        if (!isBuilderValid(state, false)) {
          setShowErrors(true);
          toast('Add the required fields before saving.');
          return;
        }
        void persist(state)
          .then(() => toast('Chart saved'))
          .catch(() => undefined);
      }}
    />
  );
}
