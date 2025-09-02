'use client';

import React from 'react';
import { TypeSector } from '@/gql/generated/graphql';

import { generateJsonLd } from '@/lib/utils';
import { ErrorPage } from '@/components/error';
import JsonLd from '@/components/JsonLd';
import ListingComponent from '../../components/ListingComponent';

const SectorDetailsClient = ({ sector }: { sector: TypeSector }) => {
  if (!sector) return <ErrorPage />;

  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '/sectors', label: 'Sectors' },
    { href: '#', label: sector.name },
  ];

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CivicDataLab',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/sectors/${sector.slug}`,
    description:
      sector.description ||
      `Explore open data and curated datasets in the ${sector.name} sector.`,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/sectors/${sector.slug}`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <ListingComponent
        type="dataset"
        breadcrumbData={breadcrumbData}
        categoryName={sector.name}
        categoryDescription={sector.description ?? undefined}
        categoryImage={`/Sectors/${sector.name}.svg`}
        redirectionURL={`/datasets`}
        placeholder="Start typing to search for any Dataset"
      />
    </>
  );
};

export default SectorDetailsClient;
