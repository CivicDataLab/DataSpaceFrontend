'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

/** Records one analytics view per collaborative page. */
export function CollaborativeViewTracker({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const { trackCollaborative } = useAnalytics();

  useEffect(() => {
    trackCollaborative(id, title);
  }, [id, title, trackCollaborative]);

  return null;
}
