'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  firstIncompleteUseCaseEditStep,
  useCaseWizardSummaryQuery,
} from '../usecase-summary';

export default function UseCaseEditIndexPage() {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const summaryQuery = useQuery([`usecase_wizard_${params.id}`], () =>
    GraphQL(
      useCaseWizardSummaryQuery,
      {
        [params.entityType]: params.entitySlug,
      },
      {
        filters: {
          id: params.id,
        },
      }
    )
  );

  const useCase = summaryQuery.data?.useCases[0];

  useEffect(() => {
    if (summaryQuery.isLoading) return;
    const step = useCase
      ? firstIncompleteUseCaseEditStep(useCase)
      : 'builder';
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/${step}`
    );
  }, [
    useCase,
    summaryQuery.isLoading,
    params.entitySlug,
    params.entityType,
    params.id,
    router,
  ]);

  return (
    <div className="flex min-h-[240px] w-full items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}
