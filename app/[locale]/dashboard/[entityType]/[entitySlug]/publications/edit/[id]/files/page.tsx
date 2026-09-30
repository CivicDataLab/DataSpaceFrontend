'use client';

import { useParams } from 'next/navigation';

import { FilesStep } from '../../../components/FilesStep';

export default function EditPublicationFilesPage() {
  const params = useParams<{ id: string }>();
  return <FilesStep publicationId={params.id} />;
}
