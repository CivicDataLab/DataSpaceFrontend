'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from 'opub-ui';

import { chartsBasePath } from '../wizard/model';

export default function ChartDetailsRedirect() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    chartID: string;
  }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const base = chartsBasePath(params.entityType, params.entitySlug);
    const destination =
      searchParams.get('type') === 'TypeResourceChartImage'
        ? `${base}/image/${params.chartID}/edit/build`
        : `${base}/${params.chartID}/edit/build`;
    router.replace(destination);
  }, [params.chartID, params.entitySlug, params.entityType, router, searchParams]);

  return (
    <div className="flex justify-center py-16">
      <Spinner />
    </div>
  );
}
