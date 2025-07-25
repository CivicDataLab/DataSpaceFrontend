import React from 'react';
import { graphql } from '@/gql';

import { GraphQL } from '@/lib/api';
import { generatePageMetadata } from '@/lib/utils';
import SectorDetailsClient from './SectorDetailsClient';

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

export async function generateMetadata({
  params,
}: {
  params: { sectorSlug: string };
}) {
  const data = await GraphQL(
    sectorQueryDoc,
    {},
    { filters: { slug: params.sectorSlug } }
  );
  const sector = data?.sectors?.[0];

  return generatePageMetadata({
    title: `${sector?.name} | Sector Data | CivicDataSpace`,
    description:
      sector?.description ||
      `Explore open data and curated datasets in the ${sector?.name} sector.`,
    keywords: [sector?.name, 'CivicDataSpace', 'Open Data', 'Sector Data'],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/sectors/${params.sectorSlug}`,
      title: `${sector?.name} | Sector Data | CivicDataSpace`,
      description:
        sector?.description ||
        `Explore open data and curated datasets in the ${sector?.name} sector.`,
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });
}

const SectorDetailsPage = async ({
  params,
}: {
  params: { sectorSlug: string };
}) => {
  const data = await GraphQL(
    sectorQueryDoc,
    {},
    { filters: { slug: params.sectorSlug } }
  );
  const sector = data?.sectors?.[0];

  return <SectorDetailsClient sector={sector} />;
};

export default SectorDetailsPage;
