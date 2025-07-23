'use client';

import React from 'react';
import { fetchDatasets } from '@/fetch';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { ErrorPage } from '@/components/error';
import { Loading } from '@/components/loading';
import ListingComponent from '../../components/ListingComponent';

const sectorQueryDoc = graphql(`
  query CategoryDetails($filters: SectorFilter) {
    sectors(filters: $filters) {
      id
      name
      description
      datasetCount
      slug
    }
  }
`);

const SectorDetailsPage = ({ params }: { params: { sectorSlug: string } }) => {
  const { data, isLoading, isError } = useQuery(
    [`get_category_details_${params.sectorSlug}`],
    () => GraphQL(sectorQueryDoc, {}, { filters: { slug: params.sectorSlug } })
  );

  if (isError) return <ErrorPage />;
  if (isLoading) return <Loading />;

  const sector = data?.sectors.filter(
    (item) => item.slug === params.sectorSlug
  )[0];

  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '/sectors', label: 'Sectors' },
    { href: '#', label: sector?.name || params.sectorSlug },
  ];

  return (
    <ListingComponent
      fetchDatasets={fetchDatasets}
      breadcrumbData={breadcrumbData}
      categoryName={sector?.name}
      categoryDescription={sector?.description ?? undefined}
      categoryImage={`/Sectors/${sector.name}.svg`}
      redirectionURL={`/datasets`}
      placeholder="Start typing to search for any Dataset"
    />
  );
};

export default SectorDetailsPage;
