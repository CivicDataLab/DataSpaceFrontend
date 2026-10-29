import { Metadata } from 'next';
import { graphql } from '@/gql';

import { GraphQL } from '@/lib/api';
import { extractPublisherId, generatePageMetadata } from '@/lib/utils';
import OrgPageClient from './OrgPageClient';

const orgDataQuery = graphql(`
  query orgData($id: String!) {
    organization(id: $id) {
      id
      name
      description
      logo {
        url
      }
    }
  }
`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}): Promise<Metadata> {
  const { organizationSlug } = await params;
  const data = await GraphQL(
    orgDataQuery,
    {},
    { id: extractPublisherId(organizationSlug) }
  );

  const org = data.organization;

  return generatePageMetadata({
    title: `${org?.name} | Publisher on CivicDataSpace`,
    description:
      org?.description || 'Explore datasets and use cases by this publisher.',
    keywords: [
      'CivicDataSpace Publisher',
      'Open Data Contributor',
      'Use Case Publisher',
      'Dataset Publisher',
      'CivicTech',
      'Open Government Data',
    ],
    openGraph: {
      title: `${org?.name} | Publisher on CivicDataSpace`,
      description:
        org?.description || 'Explore datasets and use cases by this publisher.',
      type: 'profile',
      siteName: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers/${organizationSlug}`,
      image: org?.logo?.url
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${org.logo.url}`
        : `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      locale: 'en_US',
    },
  });
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  return (
    <OrgPageClient
      organizationSlug={extractPublisherId(organizationSlug)}
    />
  );
}
