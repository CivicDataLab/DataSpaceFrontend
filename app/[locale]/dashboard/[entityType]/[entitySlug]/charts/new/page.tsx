'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { BuildStep } from '../wizard/BuildStep';
import { useChartCatalog } from '../wizard/catalog';
import { ChartWizardShell } from '../wizard/ChartWizardShell';
import { chartImageCreateDoc, chartWizardCreateDoc } from '../wizard/documents';
import {
  chartsBasePath,
  emptyBuilder,
  entityHeaders,
  isBuilderValid,
  vizChartInput,
  type BuilderState,
} from '../wizard/model';

export default function NewChartPage() {
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const router = useRouter();
  const headers = entityHeaders(params.entityType, params.entitySlug);
  const [state, setState] = useState<BuilderState>(emptyBuilder);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success'>('success');
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const creating = useRef(false);

  const catalog = useChartCatalog(
    params.entityType,
    params.entitySlug,
    state.datasetId,
    state.resourceId
  );
  const base = chartsBasePath(params.entityType, params.entitySlug);
  const hasImage = Boolean(imageFile);

  const handleImageFile = (file: File | null) => {
    setImageFile(file);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const next = file ? URL.createObjectURL(file) : null;
    previewRef.current = next;
    setLocalPreview(next);
  };

  const createChart = async (destination: 'build' | 'publish') => {
    if (creating.current) return;
    if (!isBuilderValid(state, hasImage)) {
      setShowErrors(true);
      toast('Fill in the required chart fields before continuing.');
      throw new Error('Chart configuration is incomplete');
    }
    creating.current = true;
    setSaving(true);
    setStatus('loading');
    try {
      if (state.selection === 'IMAGE') {
        if (!imageFile) throw new Error('Choose an image');
        const result = await GraphQL(chartImageCreateDoc, headers, {
          input: {
            dataset: state.datasetId,
            image: imageFile,
            ...(state.name.trim() ? { name: state.name.trim() } : {}),
          },
        });
        const created = result.createResourceChartImage;
        if (!created || created.__typename !== 'TypeResourceChartImage') {
          throw new Error('Could not create the chart image');
        }
        router.replace(`${base}/image/${created.id}/edit/${destination}`);
        return;
      }

      const result = await GraphQL(chartWizardCreateDoc, headers, {
        chartInput: vizChartInput(state),
      });
      const created = result.createResourceChart;
      if (!created || created.__typename !== 'TypeResourceChart') {
        throw new Error('Could not create the chart');
      }
      router.replace(`${base}/${created.id}/edit/${destination}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message !== 'Chart configuration is incomplete') {
        toast(`Could not create the chart. ${message}`);
      }
      throw error;
    } finally {
      creating.current = false;
      setSaving(false);
      setStatus('success');
    }
  };

  return (
    <ChartWizardShell
      title={state.name}
      onTitleSave={(title) => setState((current) => ({ ...current, name: title }))}
      goBackURL={base}
      status={status}
      currentStep={1}
      buildComplete={isBuilderValid(state, hasImage)}
      setStepShowErrors={setShowErrors}
      onStepClick={(step) => {
        if (step !== 2) return;
        void createChart('publish').catch(() => undefined);
      }}
    >
      <BuildStep
        state={state}
        onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
        datasets={catalog.datasets}
        datasetsLoading={catalog.datasetsLoading}
        fields={catalog.fields}
        fieldsLoading={catalog.fieldsLoading}
        hasImage={hasImage}
        imageName={imageFile?.name}
        remoteImageUrl={localPreview}
        previewOptions={null}
        showErrors={showErrors}
        saving={saving}
        onImageFile={handleImageFile}
        onSave={() => {
          void createChart('build').catch(() => undefined);
        }}
      />
    </ChartWizardShell>
  );
}
