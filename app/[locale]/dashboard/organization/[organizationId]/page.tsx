import { InProgress } from '@/components/in-progress';

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <InProgress />
    </>
  );
}