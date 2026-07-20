import React from 'react';

import JsonLd from '@/components/JsonLd';
import { RESOURCE_LABEL, RESOURCE_LABEL_PLURAL, RESOURCE_PATH } from '@/lib/constants/resourceLabel';
import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import ListingComponent from '../components/ListingComponent';

export const generateMetadata = () =>
  generatePageMetadata({
    title: `Browse ${RESOURCE_LABEL_PLURAL} | CivicDataSpace`,
    description: `Discover reports, research and findings published as ${RESOURCE_LABEL_PLURAL}. Filter by ${RESOURCE_LABEL} Type, sector and geography.`,
    keywords: [RESOURCE_LABEL_PLURAL, 'Reports', 'Research', 'Findings', 'Publications'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}${RESOURCE_PATH}`,
      title: `Browse ${RESOURCE_LABEL_PLURAL} | CivicDataSpace`,
      description: `Explore reports, research and findings on CivicDataSpace.`,
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

const PublicationsListing = () => {
  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '#', label: `${RESOURCE_LABEL} Listing` },
  ];

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Browse ${RESOURCE_LABEL_PLURAL} | CivicDataSpace`,
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}${RESOURCE_PATH}`,
    description: `Explore reports, research and findings published as ${RESOURCE_LABEL_PLURAL}.`,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}${RESOURCE_PATH}`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <ListingComponent
        type="publication"
        breadcrumbData={breadcrumbData}
        redirectionURL={RESOURCE_PATH}
        placeholder={`Start typing to search for any ${RESOURCE_LABEL}`}
      />
    </>
  );
};

export default PublicationsListing;
