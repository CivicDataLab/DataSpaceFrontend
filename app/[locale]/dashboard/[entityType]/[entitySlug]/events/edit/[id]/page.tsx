'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditEventIndexPage() {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  useEffect(() => {
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/events/edit/${params.id}/details`
    );
  }, [params.entitySlug, params.entityType, params.id, router]);

  return null;
}
