'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { firstIncompleteCollaborativeEditStep } from '../collaborative-summary';
import { FetchCollaborativeReview } from '../wizard-documents';

export default function CollaborativeEditIndexPage() {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const summaryQuery = useQuery([`collaborative_wizard_${params.id}`], () =>
    GraphQL(
      FetchCollaborativeReview,
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

  const collaborative = summaryQuery.data?.collaboratives?.[0];

  useEffect(() => {
    if (summaryQuery.isLoading) return;
    const step = collaborative
      ? firstIncompleteCollaborativeEditStep(collaborative)
      : 'about';
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/${step}`
    );
  }, [
    collaborative,
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
