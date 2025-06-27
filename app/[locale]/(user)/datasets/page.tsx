'use client';

import React from 'react';
import { fetchDatasets } from '@/fetch';
import ListingComponent from '../components/ListingComponent';

const DatasetsListing = () => {
  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '#', label: 'Dataset Listing' },
  ];

  return (
    <ListingComponent
      fetchDatasets={fetchDatasets}
      breadcrumbData={breadcrumbData}
    />
  );
};

export default DatasetsListing;