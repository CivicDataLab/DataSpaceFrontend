import { Metadata } from 'next';
import { graphql } from '@/gql';
import { permanentRedirect } from 'next/navigation';

import { GraphQLPublic } from '@/lib/api';
import { isIntegerId, publicHref, publicPageUrl } from '@/lib/public-link';
import { generatePageMetadata } from '@/lib/utils';
import { getUseCaseSummaryExcerpt } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import UseCaseDetailClient from './UsecaseDetailsClient';

const useCaseMetaQuery = graphql(`
  query UseCaseInfo($publicId: String!) {
    useCaseBySlug(publicId: $publicId) {
      title
      summary
      urlSlug
      tags {
        id
        value
      }
    }
  }
`);

const useCaseLegacyMetaQuery = graphql(`
  query UseCaseLegacyInfo($pk: ID!) {
    useCase(pk: $pk) {
      title
      summary
      urlSlug
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
  const useCase = isIntegerId(useCaseSlug)
    ? (
        await GraphQLPublic(useCaseLegacyMetaQuery, {}, { pk: useCaseSlug }).catch(
          () => null
        )
      )?.useCase
    : (
        await GraphQLPublic(useCaseMetaQuery, {}, { publicId: useCaseSlug }).catch(
          () => null
        )
      )?.useCaseBySlug;
  const segment = useCase?.urlSlug || useCaseSlug;
  const description =
    getUseCaseSummaryExcerpt(useCase?.summary) ||
    `Explore open data and curated datasets in the ${useCase?.title ?? 'this'} sector.`;

  return generatePageMetadata({
    title: `${useCase?.title ?? 'Use Case Details'} | Sector Data | CivicDataSpace`,
    description,
    keywords: useCase?.tags?.map((tag) => tag.value) || [
      'usecase',
      'data',
      'civic',
      'open data',
    ],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: publicPageUrl('usecases', segment),
      title: `${useCase?.title ?? 'Use Case Details'} | Sector Data | CivicDataSpace`,
      description,
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ useCaseSlug: string }>;
}) {
  const { useCaseSlug } = await params;

  if (isIntegerId(useCaseSlug)) {
    const data = await GraphQLPublic(
      useCaseLegacyMetaQuery,
      {},
      { pk: useCaseSlug }
    ).catch(() => null);
    const urlSlug = data?.useCase?.urlSlug;
    if (urlSlug && urlSlug !== useCaseSlug) {
      permanentRedirect(publicHref('usecases', urlSlug, urlSlug));
    }
  }

  return <UseCaseDetailClient />;
}
