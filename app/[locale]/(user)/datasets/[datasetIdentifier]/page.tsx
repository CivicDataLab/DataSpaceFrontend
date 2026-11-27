import { graphql } from '@/gql';
import { ClientError } from 'graphql-request';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';

import { GraphQL, nullIfMissing } from '@/lib/api';
import { datasetLookup, isUuid, publicHref, publicPageUrl } from '@/lib/public-link';
import { generatePageMetadata } from '@/lib/utils';
import DatasetDetailsPage from './DatasetDetailsPage';

const datasetMetaQuery = graphql(`
  query getDatasetInfo($datasetId: UUID, $publicId: String) {
    getDataset(datasetId: $datasetId, publicId: $publicId) {
      title
      description
      urlSlug
      tags {
        id
        value
      }
    }
  }
`);

// Metadata and the page both need this; `cache` sends one request per render.
const getDatasetMeta = cache((identifier: string) =>
  GraphQL(datasetMetaQuery, {}, datasetLookup(identifier))
);

function isUnpublishedDatasetError(error: unknown): boolean {
  const message =
    error instanceof ClientError
      ? (error.response.errors?.[0]?.message ?? error.message)
      : error instanceof Error
        ? error.message
        : '';

  return message.includes(
    'You need to be authenticated to access non-published datasets'
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ datasetIdentifier: string }>;
}) {
  const { datasetIdentifier } = await params;
  try {
    const res = await getDatasetMeta(datasetIdentifier);
    const dataset = res?.getDataset;
    const segment = dataset?.urlSlug || datasetIdentifier;
    return generatePageMetadata({
      title: `${dataset?.title ?? ''} | Dataset | CivicDataSpace`,
      description: dataset?.description ?? undefined,
      keywords: dataset?.tags?.map((tag) => tag.value) || [],
      openGraph: {
        type: 'dataset',
        locale: 'en_US',
        url: publicPageUrl('datasets', segment),
        title: dataset?.title ?? '',
        description: dataset?.description ?? '',
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (error) {
    if (!isUnpublishedDatasetError(error)) {
      console.error('Metadata fetch error', error);
    }
    return generatePageMetadata({ title: 'Dataset Details' });
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ datasetIdentifier: string }>;
}) {
  const { datasetIdentifier } = await params;

  // Unknown datasets, and unpublished ones the visitor may not see, are 404.
  const res = await getDatasetMeta(datasetIdentifier).catch(nullIfMissing);
  const dataset = res?.getDataset;
  if (!dataset) notFound();

  // Old links used the record's UUID; send them to the readable address.
  const urlSlug = dataset.urlSlug;
  if (isUuid(datasetIdentifier) && urlSlug && urlSlug !== datasetIdentifier) {
    permanentRedirect(publicHref('datasets', urlSlug, urlSlug));
  }

  return <DatasetDetailsPage datasetId={datasetIdentifier} />;
}
