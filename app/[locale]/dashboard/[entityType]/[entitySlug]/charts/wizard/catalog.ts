'use client';

import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { mediaUrl } from '@/lib/utils';
import { chartWizardDatasetsDoc, chartWizardSchemaDoc } from './documents';
import { entityHeaders, type SchemaField } from './model';
import type { DatasetOption } from './BuildStep';

export function useChartCatalog(
  entityType: string,
  entitySlug: string,
  datasetId: string,
  resourceId: string
) {
  const headers = entityHeaders(entityType, entitySlug);

  const datasetsQuery = useQuery([`chart-wizard-datasets-${entitySlug}`], () =>
    GraphQL(chartWizardDatasetsDoc, headers)
  );

  const schemaQuery = useQuery(
    [`chart-wizard-schema-${datasetId}`],
    () =>
      GraphQL(chartWizardSchemaDoc, headers, {
        datasetId,
      }),
    { enabled: Boolean(datasetId) }
  );

  const datasets: DatasetOption[] =
    datasetsQuery.data?.datasets?.map((dataset) => ({
      id: dataset.id,
      title: dataset.title,
      geographies: dataset.geographies?.map((geography) => geography.name) ?? [],
      resources:
        dataset.resources?.map((resource) => ({
          id: resource.id,
          name: resource.name,
        })) ?? [],
    })) ?? [];

  const schema = schemaQuery.data?.datasetResources?.find(
    (resource) => resource.id === resourceId
  )?.schema;

  const fields: SchemaField[] =
    schema?.map((field) => ({
      id: field.id,
      fieldName: field.fieldName,
      format: field.format ?? '',
    })) ?? [];

  return {
    datasets,
    datasetsLoading: datasetsQuery.isLoading,
    fields,
    fieldsLoading: Boolean(datasetId) && schemaQuery.isLoading,
  };
}

export function imageSource(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return mediaUrl(url);
}
