'use client';

import { useParams } from 'next/navigation';

import { ReviewStep } from '../../../components/ReviewStep';

export default function EditPublicationReviewPage() {
  const params = useParams<{ id: string }>();
  return <ReviewStep publicationId={params.id} />;
}
