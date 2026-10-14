'use client';

import { useParams } from 'next/navigation';

import { DetailsStep } from '../../../components/DetailsStep';

export default function EditPublicationDetailsPage() {
  const params = useParams<{ id: string }>();
  return <DetailsStep publicationId={params.id} />;
}
