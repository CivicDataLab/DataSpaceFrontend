'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { firstIncompleteAIModelEditStep } from '../aimodel-summary';
import { FetchAIModelForPublish } from './publish/page';

export default function AIModelEditIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const summaryQuery = useQuery(
    [
      `fetch_AIModelForPublish`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
    () =>
      GraphQL(
        FetchAIModelForPublish,
        { [params.entityType]: params.entitySlug },
        { filters: { id: parseInt(params.id, 10) } }
      ),
    { enabled: Boolean(params.id) }
  );

  const model = summaryQuery.data?.aiModels?.[0];

  useEffect(() => {
    if (summaryQuery.isLoading) return;
    const step = model ? firstIncompleteAIModelEditStep(model) : 'versions';
    const tab = searchParams.get('tab');
    const query = tab ? `?tab=${encodeURIComponent(tab)}` : '';
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/${step}${query}`
    );
  }, [
    model,
    summaryQuery.isLoading,
    params.entitySlug,
    params.entityType,
    params.id,
    router,
    searchParams,
  ]);

  return (
    <div className="flex min-h-[240px] w-full items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}
