import React from 'react';

import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';
import UseCasesListingClient from './UseCasesListingClient';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Explore Real-World Use Cases | CivicDataSpace',
    description:
      'Discover data-driven interventions across sectors like climate, gender, governance, and education. Our use cases highlight how open data solves real-world problems.',
    keywords: [
      'Data Use Cases',
      'CivicTech',
      'Open Data Applications',
      'Policy Use Cases',
      'Climate Data Use Case',
      'Gender Equality Data',
      'Urban Planning',
      'CivicDataSpace Use Cases',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases`,
      title: 'Explore Real-World Use Cases | CivicDataSpace',
      description:
        'Explore impactful data-led interventions solving real-world challenges — from climate change to justice and finance.',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

const UseCasesPage = () => {
  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CivicDataLab',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases`,
    description:
      'Discover data-driven interventions across sectors like climate, gender, governance, and education. Our use cases highlight how open data solves real-world problems.',
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases`,
    },
  });
  return (
    <>
      <JsonLd json={jsonLd} />
      <UseCasesListingClient />
    </>
  );
};

export default UseCasesPage;
