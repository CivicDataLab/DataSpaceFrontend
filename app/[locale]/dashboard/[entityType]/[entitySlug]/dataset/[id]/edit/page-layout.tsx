'use client';

import React from 'react';

export function EditPage({ params }: { params: { id: string } }) {
  return <>Edit Dataset: {params.id}</>;
}
