'use client';

import React from 'react';
import { TypeSector } from '@/gql/generated/graphql';

import { ErrorPage } from '@/components/error';
import ListingComponent from '../../components/ListingComponent';

const SectorDetailsClient = ({ sector }: { sector: TypeSector }) => {
  if (!sector) return <ErrorPage />;

  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '/sectors', label: 'Sectors' },
    { href: '#', label: sector.name },
  ];

  return (
    <ListingComponent
      type="dataset"
      breadcrumbData={breadcrumbData}
      categoryName={sector.name}
      categoryDescription={sector.description ?? undefined}
      categoryImage={`/Sectors/${sector.name}.svg`}
      redirectionURL={`/datasets`}
      placeholder="Start typing to search for any Dataset"
    />
  );
};

export default SectorDetailsClient;
