'use client';

import React from 'react';

export function MetadataPage({ params }: { params: { id: string } }) {
  return <>Edit Metadata: {params.id}</>;
}
