import { Metadata } from 'next';
import { graphql } from '@/gql';

import { GraphQL } from '@/lib/api';
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
  params: { useCaseSlug: string };
}): Promise<Metadata> {
  const data = await GraphQL(UseCaseInfoQuery, {}, { pk: params.useCaseSlug });

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
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases/${params.useCaseSlug}`,
      title: `${UseCase?.title} | Sector Data | CivicDataSpace`,
      description:
        UseCase?.summary ||
        `Explore open data and curated datasets in the ${UseCase?.title} sector.`,
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });
}

export default function Page() {
  return <UseCaseDetailClient />;
}
