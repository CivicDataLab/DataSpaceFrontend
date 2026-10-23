'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { BuildStep } from '../../../../wizard/BuildStep';
import { imageSource, useChartCatalog } from '../../../../wizard/catalog';
import { useChartEditStatus } from '../../../../wizard/context';
import {
  chartImageDetailsDoc,
  chartImageUpdateDoc,
  chartWizardCreateDoc,
} from '../../../../wizard/documents';
import {
  chartsBasePath,
  emptyBuilder,
  entityHeaders,
  isBuilderValid,
  vizChartInput,
  type BuilderState,
} from '../../../../wizard/model';

export default function ChartImageBuildPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    imageID: string;
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

  const [state, setState] = useState<BuilderState>({
    ...emptyBuilder(),
    selection: 'IMAGE',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const hydrated = useRef(false);
  const creatingViz = useRef(false);
  const stateRef = useRef(state);
  const fileRef = useRef(imageFile);
  stateRef.current = state;
  fileRef.current = imageFile;

  const details = useQuery([`chart-image-${params.imageID}`], () =>
    GraphQL(chartImageDetailsDoc, headers, { imageId: params.imageID })
  );

  const catalog = useChartCatalog(
    params.entityType,
    params.entitySlug,
    state.datasetId,
    state.resourceId
  );

  useEffect(() => {
    const image = details.data?.resourceChartImage;
    if (!image) return;
    setRemoteUrl(imageSource(image.image?.url));
    if (hydrated.current) return;
    hydrated.current = true;
    const next: BuilderState = {
      ...emptyBuilder(),
      selection: 'IMAGE',
      name: image.name ?? '',
      datasetId: image.dataset?.id ?? '',
    };
    setState(next);
    setTitleOverride(next.name);
    setBuildComplete(isBuilderValid(next, Boolean(image.image?.url)));
  }, [details.data, setBuildComplete, setTitleOverride]);

  const hasImage = Boolean(imageFile || remoteUrl);

  const persist = async (next: BuilderState, file: File | null) => {
    if (!next.datasetId) return;
    setSaving(true);
    setStatus('loading');
    try {
      await GraphQL(chartImageUpdateDoc, headers, {
        input: {
          id: params.imageID,
          dataset: next.datasetId,
          ...(next.name.trim() ? { name: next.name.trim() } : {}),
          ...(file ? { image: file } : {}),
        },
      });
      setStatus('success');
      if (file) setImageFile(null);
      await details.refetch();
    } catch (error) {
      setStatus('success');
      const message = error instanceof Error ? error.message : String(error);
      toast(`Could not save the chart image. ${message}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const createVizChart = async (next: BuilderState) => {
    if (creatingViz.current) return false;
    creatingViz.current = true;
    setSaving(true);
    setStatus('loading');
    try {
      const result = await GraphQL(chartWizardCreateDoc, headers, {
        chartInput: vizChartInput(next),
      });
      const created = result.createResourceChart;
      if (!created || created.__typename !== 'TypeResourceChart') {
        throw new Error('Could not create the chart');
      }
      router.push(
        `${chartsBasePath(params.entityType, params.entitySlug)}/${created.id}/edit/build`
      );
      return false;
    } catch (error) {
      creatingViz.current = false;
      const message = error instanceof Error ? error.message : String(error);
      toast(`Could not create the chart. ${message}`);
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
    setBuildComplete(isBuilderValid(state, hasImage));
  }, [hasImage, setBuildComplete, state]);

  useEffect(() => {
    registerTitleSave((title) => {
      setTitleOverride(title);
      setState((current) => ({ ...current, name: title }));
    });
    registerBeforeNavigateHandler(async () => {
      const current = stateRef.current;
      const file = fileRef.current;
      if (!isBuilderValid(current, Boolean(file || remoteUrl))) {
        setShowErrors(true);
        throw new Error('Chart configuration is incomplete');
      }
      if (current.selection !== 'IMAGE') {
        await createVizChart(current);
        return false;
      }
      await persist(current, file);
    });
    return () => registerBeforeNavigateHandler(null);
  });

  if (details.isLoading || !hydrated.current) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <BuildStep
      state={state}
      onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
      datasets={catalog.datasets}
      datasetsLoading={catalog.datasetsLoading}
      fields={catalog.fields}
      fieldsLoading={catalog.fieldsLoading}
      hasImage={hasImage}
      imageName={imageFile?.name || details.data?.resourceChartImage?.image?.name}
      remoteImageUrl={localPreview || remoteUrl}
      showErrors={showErrors || stepShowErrors}
      saving={saving}
      onImageFile={handleImageFile}
      onSave={() => {
        if (!isBuilderValid(state, hasImage)) {
          setShowErrors(true);
          toast(
            state.selection === 'IMAGE'
              ? 'Choose a dataset and an image before saving.'
              : 'Add the required fields before saving.'
          );
          return;
        }
        if (state.selection !== 'IMAGE') {
          void createVizChart(state).catch(() => undefined);
          return;
        }
        void persist(state, imageFile)
          .then(() => toast('Chart image saved'))
          .catch(() => undefined);
      }}
    />
  );
}
