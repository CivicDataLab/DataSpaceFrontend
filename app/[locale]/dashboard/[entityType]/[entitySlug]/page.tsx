'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function Page(
  props: {
    params: Promise<{ entityType: string; entitySlug: string }>;
  }
) {
  const params = use(props.params);
  const router = useRouter();

  useEffect(() => {
    router.push(`/dashboard/${params.entityType}/${params.entitySlug}/dataset?tab=drafts`);
  }, [params, router]);

  return null; // prevent rendering anything before redirect
}
