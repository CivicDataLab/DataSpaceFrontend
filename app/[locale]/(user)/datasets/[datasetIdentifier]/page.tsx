import { graphql } from '@/gql';
import { ClientError } from 'graphql-request';
import { permanentRedirect } from 'next/navigation';

import { GraphQL } from '@/lib/api';
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

  if (isUuid(datasetIdentifier)) {
    const res = await GraphQL(datasetMetaQuery, {}, { datasetId: datasetIdentifier }).catch(
      () => null
    );
    const urlSlug = res?.getDataset?.urlSlug;
    if (urlSlug && urlSlug !== datasetIdentifier) {
      permanentRedirect(publicHref('datasets', urlSlug, urlSlug));
    }
  }

  return <DatasetDetailsPage datasetId={datasetIdentifier} />;
}
