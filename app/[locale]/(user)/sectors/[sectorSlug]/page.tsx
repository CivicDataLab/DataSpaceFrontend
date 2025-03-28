'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraphQL } from '@/lib/api';
import { graphql } from '@/gql';
import { fetchDatasets } from '@/fetch';
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
    }
  }
`);

const SectorDetailsPage = ({ params }: { params: { categorySlug: string } }) => {
  const { data, isLoading, isError } = useQuery(
    [`get_category_details_${params.categorySlug}`],
    () =>
      GraphQL(
        sectorQueryDoc,
        {},
        { filters: { slug: params.categorySlug } }
      )
  );

  if (isError) return <ErrorPage />;
  if (isLoading) return <Loading />;

  const sector = data?.sectors[0];

  const breadcrumbData = [
    { href: '/', label: 'Home' },
    { href: '/sectors', label: 'Sectors' },
    { href: '#', label: sector?.name || params.categorySlug },
  ];

  return (
    <ListingComponent
      fetchDatasets={fetchDatasets}
      breadcrumbData={breadcrumbData}
      categoryName={sector?.name}
      categoryDescription={sector?.description ?? undefined}
      categoryImage="/obi.jpg"
    />
  );
};

export default SectorDetailsPage;