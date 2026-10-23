'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { imageSource, useChartCatalog } from '../../../../wizard/catalog';
import { useChartEditStatus } from '../../../../wizard/context';
import {
  chartImageDetailsDoc,
  chartImagePublishDoc,
  chartImageUpdateDoc,
} from '../../../../wizard/documents';
import { ReviewStep } from '../../../../wizard/ReviewStep';
import { chartsBasePath, entityHeaders } from '../../../../wizard/model';

export default function ChartImagePublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    imageID: string;
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
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const hydrated = useRef(false);

  const details = useQuery([`chart-image-${params.imageID}`], () =>
    GraphQL(chartImageDetailsDoc, headers, { imageId: params.imageID })
  );
  const image = details.data?.resourceChartImage;
  const catalog = useChartCatalog(
    params.entityType,
    params.entitySlug,
    image?.dataset?.id ?? '',
    ''
  );

  useEffect(() => {
    if (!image || hydrated.current) return;
    hydrated.current = true;
    setName(image.name ?? '');
    setTitleOverride(image.name ?? '');
    setBuildComplete(Boolean(image.dataset?.id && image.image?.url && image.name));
  }, [image, setBuildComplete, setTitleOverride]);

  const datasetTitle =
    catalog.datasets.find((dataset) => dataset.id === image?.dataset?.id)?.title ||
    image?.dataset?.title ||
    '';
  const previewUrl = imageSource(image?.image?.url);

  const save = async (nextName: string) => {
    if (!image?.dataset?.id) return;
    setSaving(true);
    setStatus('loading');
    try {
      await GraphQL(chartImageUpdateDoc, headers, {
        input: {
          id: params.imageID,
          dataset: image.dataset.id,
          name: nextName.trim(),
        },
      });
      setStatus('success');
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

  useEffect(() => {
    registerTitleSave((title) => {
      setName(title);
      setTitleOverride(title);
      void save(title).catch(() => undefined);
    });
    registerBeforeNavigateHandler(async () => {
      if (image?.dataset?.id) await save(name);
    });
    return () => registerBeforeNavigateHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image?.id, name]);

  if (details.isLoading || !image) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const readyName = Boolean(name.trim());
  const readyImage = Boolean(previewUrl);
  const readyDataset = Boolean(image.dataset?.id);

  return (
    <ReviewStep
      datasetTitle={datasetTitle}
      chartTypeLabel="Upload Image"
      configRows={[{ label: 'Image', value: image.image?.name || '—' }]}
      chartName={name}
      onChartName={(value) => {
        setName(value);
        setTitleOverride(value);
      }}
      preview={
        previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={name || 'Chart image'}
            className="max-h-[420px] w-full rounded-3 object-contain"
          />
        ) : (
          <Text color="subdued">No image uploaded yet.</Text>
        )
      }
      checks={[
        { label: 'Dataset selected', ok: readyDataset },
        { label: 'Image uploaded', ok: readyImage },
        { label: 'Chart type selected', ok: true },
        { label: 'Configuration valid', ok: readyDataset && readyImage },
        { label: 'Chart preview generated', ok: readyImage },
        { label: 'Chart name added', ok: readyName },
      ]}
      editBase={`${chartsBasePath(params.entityType, params.entitySlug)}/image/${params.imageID}/edit`}
      saving={saving}
      publishing={publishing}
      onSave={() => {
        void save(name)
          .then(() => toast('Chart image saved'))
          .catch(() => undefined);
      }}
      onPublish={() => {
        if (!readyDataset || !readyImage || !readyName) {
          toast('This chart image is not ready to publish.');
          return;
        }
        setPublishing(true);
        void save(name)
          .then(() =>
            GraphQL(chartImagePublishDoc, headers, {
              resourceChartImageId: params.imageID,
            })
          )
          .then(() => toast('Chart image published'))
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            toast(`Could not publish the chart image. ${message}`);
          })
          .finally(() => setPublishing(false));
      }}
    />
  );
}
