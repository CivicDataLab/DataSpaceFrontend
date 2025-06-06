'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page({
  params,
}: {
  params: { entityType: string; entitySlug: string };
}) {
  const router = useRouter();

  useEffect(() => {
    router.push(`/dashboard/${params.entityType}/${params.entitySlug}/dataset?tab=drafts`);
  }, [params, router]);

  return null; // prevent rendering anything before redirect
}
