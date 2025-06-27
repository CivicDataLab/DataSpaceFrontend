'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Loading } from '@/components/loading';

const Manage = () => {
  const router = useRouter();
  useEffect(() => {
    // Redirect to the Use Cases page
    router.push(`/manage/usecases`);
  }, [router]);
  return (
    <div>
      <Loading />
    </div> // Optional: You can show a loading message or spinner here
  );
};
export default Manage;
