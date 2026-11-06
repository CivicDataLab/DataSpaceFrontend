import { graphql } from '@/gql';
import { ClientError } from 'graphql-request';

import { GraphQL } from '@/lib/api';
import {
  isCanonicalRedirect,
  redirectToCanonical,
} from '@/lib/canonical-redirect';
import { datasetLookup, publicPageUrl } from '@/lib/public-link';
import { generatePageMetadata } from '@/lib/utils';
import DatasetDetailsPage from './DatasetDetailsPage';

const datasetMetaQuery = graphql(`
  query getDatasetInfo($datasetId: UUID, $publicId: String) {
    getDataset(datasetId: $datasetId, publicId: $publicId) {
      title
      description
      id
      urlSlug
      tags {
        id
        value
      }
    }
  }
`);

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
    const res = await GraphQL(
      datasetMetaQuery,
      {},
      datasetLookup(datasetIdentifier)
    );

    const dataset = res?.getDataset;
    await redirectToCanonical(
      'datasets',
      datasetIdentifier,
      dataset?.urlSlug
    );
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
  } catch (e) {
    if (isCanonicalRedirect(e)) throw e;
    if (!isUnpublishedDatasetError(e)) {
      console.error('Metadata fetch error', e);
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

  try {
    const res = await GraphQL(
      datasetMetaQuery,
      {},
      datasetLookup(datasetIdentifier)
    );
    await redirectToCanonical(
      'datasets',
      datasetIdentifier,
      res?.getDataset?.urlSlug
    );
  } catch (error) {
    if (isCanonicalRedirect(error)) throw error;
    if (!isUnpublishedDatasetError(error)) {
      console.error('Dataset lookup error', error);
    }
  }

  return <DatasetDetailsPage datasetId={datasetIdentifier} />;
}
