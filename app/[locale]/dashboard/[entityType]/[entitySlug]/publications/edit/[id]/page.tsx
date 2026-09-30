'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditPublicationIndexPage() {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  useEffect(() => {
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/publications/edit/${params.id}/files`
    );
  }, [params.entitySlug, params.entityType, params.id, router]);

  return null;
}
