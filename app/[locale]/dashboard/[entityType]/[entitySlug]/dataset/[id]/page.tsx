'use client';

import React from 'react';
import { notFound } from 'next/navigation';

import { testDataset } from '@/config/dashboard';

export default function Page({ params }: { params: { id: string } }) {
  const data = testDataset[params.id];
  if (!data) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
    </div>
  );
}
