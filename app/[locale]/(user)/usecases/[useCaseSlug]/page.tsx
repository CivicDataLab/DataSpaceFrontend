import { Metadata } from 'next';
import { graphql } from '@/gql';

import { GraphQLPublic } from '@/lib/api';
import {
  isCanonicalRedirect,
  redirectToCanonical,
} from '@/lib/canonical-redirect';
import { isIntegerId, publicPageUrl } from '@/lib/public-link';
import { generatePageMetadata } from '@/lib/utils';
import { getUseCaseSummaryExcerpt } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import UseCaseDetailClient from './UsecaseDetailsClient';

const UseCaseInfoQuery = graphql(`
  query UseCaseInfo($publicId: String!) {
    useCaseBySlug(publicId: $publicId) {
      id
      title
      summary
      urlSlug
      logo {
        url
      }
      tags {
        id
        value
      }
    }
  }
`);

const UseCaseLegacyInfoQuery = graphql(`
  query UseCaseLegacyInfo($pk: ID!) {
    useCase(pk: $pk) {
      id
      title
      summary
      urlSlug
      logo {
        url
      }
      tags {
        id
        value
      }
    }
  }
`);

async function loadUseCase(segment: string) {
  if (isIntegerId(segment)) {
    const data = await GraphQLPublic(
      UseCaseLegacyInfoQuery,
      {},
      { pk: segment }
    );
    return data.useCase;
  }

  const data = await GraphQLPublic(UseCaseInfoQuery, {}, { publicId: segment });
  return data.useCaseBySlug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ useCaseSlug: string }>;
}): Promise<Metadata> {
  const { useCaseSlug } = await params;
  try {
    const UseCase = await loadUseCase(useCaseSlug);
    await redirectToCanonical('usecases', useCaseSlug, UseCase?.urlSlug);
    const segment = UseCase?.urlSlug || useCaseSlug;

    return generatePageMetadata({
      title: `${UseCase?.title} | Sector Data | CivicDataSpace`,
      description:
        getUseCaseSummaryExcerpt(UseCase?.summary) ||
        `Explore open data and curated datasets in the ${UseCase?.title} sector.`,
      keywords: UseCase?.tags?.map((tag) => tag.value) || [],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: publicPageUrl('usecases', segment),
        title: `${UseCase?.title} | Sector Data | CivicDataSpace`,
        description:
          getUseCaseSummaryExcerpt(UseCase?.summary) ||
          `Explore open data and curated datasets in the ${UseCase?.title} sector.`,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (error) {
    if (isCanonicalRedirect(error)) throw error;
    console.error('Error fetching use case info:', error);
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

export default async function Page({
  params,
}: {
  params: Promise<{ useCaseSlug: string }>;
}) {
  const { useCaseSlug } = await params;

  try {
    const useCase = await loadUseCase(useCaseSlug);
    await redirectToCanonical('usecases', useCaseSlug, useCase?.urlSlug);
  } catch (error) {
    if (isCanonicalRedirect(error)) throw error;
    console.error('Use case lookup error', error);
  }

  return <UseCaseDetailClient />;
}
