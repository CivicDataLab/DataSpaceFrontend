'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from 'opub-ui';

export function RedirectToUseCaseStep({
  step,
}: {
  step: 'builder' | 'connect' | 'publish';
}) {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  useEffect(() => {
    router.replace(
      `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/${step}`
    );
  }, [params.entitySlug, params.entityType, params.id, router, step]);

  return (
    <div className="flex min-h-[160px] w-full items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
