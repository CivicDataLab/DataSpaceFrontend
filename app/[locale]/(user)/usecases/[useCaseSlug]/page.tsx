import { Metadata } from 'next';
import { graphql } from '@/gql';

import { GraphQLPublic } from '@/lib/api';
import { generatePageMetadata } from '@/lib/utils';
import UseCaseDetailClient from './UsecaseDetailsClient';

const UseCaseInfoQuery = graphql(`
  query UseCaseInfo($pk: ID!) {
    useCase(pk: $pk) {
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
  params: Promise<{ useCaseSlug: string }>;
}): Promise<Metadata> {
  const { useCaseSlug } = await params;
  try {
    const data = await GraphQLPublic(UseCaseInfoQuery, {}, { pk: useCaseSlug });
    const UseCase = data?.useCase;

    return generatePageMetadata({
      title: `${UseCase?.title} | Sector Data | CivicDataSpace`,
      description:
        UseCase?.summary ||
        `Explore open data and curated datasets in the ${UseCase?.title} sector.`,
      keywords: UseCase?.tags?.map((tag: any) => tag.value) || [],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases/${useCaseSlug}`,
        title: `${UseCase?.title} | Sector Data | CivicDataSpace`,
        description:
          UseCase?.summary ||
          `Explore open data and curated datasets in the ${UseCase?.title} sector.`,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (error) {
    // Fallback to generic metadata if the API call fails
    return generatePageMetadata({
      title: `Use Case Details | CivicDataSpace`,
      description: `Explore open data and curated datasets in this use case.`,
      keywords: ['usecase', 'data', 'civic', 'open data'],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases/${useCaseSlug}`,
        title: `Use Case Details | CivicDataSpace`,
        description: `Explore open data and curated datasets in this use case.`,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  }
}

export default function Page() {
  return <UseCaseDetailClient />;
}
