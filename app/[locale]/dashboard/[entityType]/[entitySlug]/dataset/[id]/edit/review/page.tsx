import { InProgress } from '@/components/in-progress';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <>
      <InProgress />
    </>
  );
}
