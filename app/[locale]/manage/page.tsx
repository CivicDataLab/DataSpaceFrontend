'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Loading } from '@/components/loading';

const Manage = () => {
  // const params = useParams();
  // const router = useRouter();

  // useEffect(() => {
  //   // Redirect to the Use Cases page
  //   router.push(`/${params.locale}/manage/usecases`);
  // }, [router]);

  return (
    <div>
      <p>Welcome to Manage</p>
    </div> // Optional: You can show a loading message or spinner here
  );
};

export default Manage;
