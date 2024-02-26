import { InProgress } from '@/components/in-progress';

export default function DatasetDetailsPage({
  params,
}: {
  params: { datasetIdentifier: string };
}) {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-2">
      <text>{params.datasetIdentifier}</text>
      <InProgress />
    </main>
  );
}
