import { Metadata } from 'next';
import { graphql } from '@/gql';

import { GraphQLPublic } from '@/lib/api';
import { generatePageMetadata } from '@/lib/utils';
import CollaborativeDetailClient from './CollaborativeDetailsClient';

const CollaborativeInfoQuery = graphql(`
  query CollaborativeInfo($pk: ID!) {
    collaborative(pk: $pk) {
      id
      title
      summary
      slug
      logo {
        path
      }
      tags {
        id
        value
      }
    }
  }
`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collaborativeSlug: string }>;
}): Promise<Metadata> {
  const { collaborativeSlug } = await params;
  try {
    const data = await GraphQLPublic(
      CollaborativeInfoQuery,
      {},
      { pk: collaborativeSlug }
    );
    const Collaborative = data?.collaborative;

    return generatePageMetadata({
      title: `${Collaborative?.title} | Collaborative Data | CivicDataSpace`,
      description:
        Collaborative?.summary ||
        `Explore open data and curated datasets in the ${Collaborative?.title} collaborative.`,
      keywords: Collaborative?.tags?.map((tag: any) => tag.value) || [],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives/${collaborativeSlug}`,
        title: `${Collaborative?.title} | Collaborative Data | CivicDataSpace`,
        description:
          Collaborative?.summary ||
          `Explore open data and curated datasets in the ${Collaborative?.title} collaborative.`,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (error) {
    // Fallback to generic metadata if the API call fails
    return generatePageMetadata({
      title: `Collaborative Details | CivicDataSpace`,
      description: `Explore open data and curated datasets in this collaborative.`,
      keywords: ['collaborative', 'data', 'civic', 'open data'],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives/${collaborativeSlug}`,
        title: `Collaborative Details | CivicDataSpace`,
        description: `Explore open data and curated datasets in this collaborative.`,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  }
}

export default function Page() {
  return <CollaborativeDetailClient />;
}
