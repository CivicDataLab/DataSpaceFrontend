'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NewPublicationIndexPage() {
  const router = useRouter();
  const params = useParams<{ entityType: string; entitySlug: string }>();

  useEffect(() => {
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/publications/new/files`
    );
  }, [params.entitySlug, params.entityType, router]);

  return null;
}
