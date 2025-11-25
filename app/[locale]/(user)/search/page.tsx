import React from 'react';

import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';
import UnifiedListingComponent from './components/UnifiedListingComponent';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Search Across All Resources | CivicDataSpace',
    description:
      'Search and explore datasets, use cases, and AI models in one place. Discover the most relevant resources for your research and projects.',
    keywords: [
      'Unified Search',
      'Data Discovery',
      'Use Cases',
      'AI Models',
      'Datasets',
      'Search All',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/search`,
      title: 'Search Across All Resources | CivicDataSpace',
      description:
        'Find the most relevant datasets, use cases, and AI models across CivicDataSpace',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

const UnifiedSearchPage = () => {
  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '#', label: 'Search All' },
  ];

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: 'Search Across All Resources | CivicDataSpace',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/search`,
    description:
      'Search and discover datasets, use cases, and AI models in one unified interface.',
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <UnifiedListingComponent
        breadcrumbData={breadcrumbData}
        redirectionURL="/search"
        placeholder="Search across datasets, use cases, and AI models..."
      />
    </>
  );
};

export default UnifiedSearchPage;
