'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Bare edit route → land on the Metadata tab. */
export default function EditIndex() {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  useEffect(() => {
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/publications/edit/${params.id}/metadata`
    );
  }, [router, params]);

  return null;
}
