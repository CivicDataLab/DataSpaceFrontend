import React from 'react';

import { generatePageMetadata } from '@/lib/utils';
import ListingComponent from '../components/ListingComponent';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Browse Open Datasets | CivicDataSpace',
    description:
      'Discover and explore a comprehensive collection of open datasets for research, policy-making, and civic innovation. Filter by sector, format.',
    keywords: [
      'Open Datasets',
      'Data Discovery',
      'Public Data',
      'Research Data',
      'Civic Data',
      'Dataset Search',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/datasets`,
      title: 'Browse Open Datasets | CivicDataSpace',
      description:
        'Explore thousands of open datasets across sectors like health, education, governance, and environment on CivicDataSpace',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`, // from /public/og.png
    },
  });

const DatasetsListing = () => {
  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '#', label: 'Dataset Listing' },
  ];

  return (
    <ListingComponent
      type="dataset"
      breadcrumbData={breadcrumbData}
      redirectionURL={`/datasets`}
      placeholder="Start typing to search for any Dataset"
    />
  );
};

export default DatasetsListing;
