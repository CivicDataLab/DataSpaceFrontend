'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  datasetSummaryQueryDoc,
  firstIncompleteDatasetEditStep,
} from './dataset-summary';

export function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const routeParams = useParams<{
    entityType: string;
    entitySlug: string;
  }>();

  const datasetQuery = useQuery([`dataset_title_${params.id}`], () =>
    GraphQL(
      datasetSummaryQueryDoc,
      {
        [routeParams.entityType]: routeParams.entitySlug,
      },
      {
        filters: {
          id: params.id,
        },
      }
    )
  );

  const dataset = datasetQuery.data?.datasets[0];

  useEffect(() => {
    if (datasetQuery.isLoading) return;
    const step = dataset
      ? firstIncompleteDatasetEditStep(dataset)
      : 'resources';
    router.replace(
      `/dashboard/${routeParams.entityType}/${routeParams.entitySlug}/dataset/${params.id}/edit/${step}`
    );
  }, [
    dataset,
    datasetQuery.isLoading,
    params.id,
    routeParams.entitySlug,
    routeParams.entityType,
    router,
  ]);

  return (
    <div className="flex min-h-[240px] w-full items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}
