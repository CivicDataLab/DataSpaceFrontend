'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/loading';


const Manage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Use Cases page
    router.push('/manage/usecases');
  }, [router]);

  return (
    <div>
      <Loading />
    </div> // Optional: You can show a loading message or spinner here
  );
};

export default Manage;
