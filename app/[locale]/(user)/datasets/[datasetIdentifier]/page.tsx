import { graphql } from '@/gql';
import { ClientError } from 'graphql-request';

import { GraphQL } from '@/lib/api';
import { generatePageMetadata } from '@/lib/utils';
import DatasetDetailsPage from './DatasetDetailsPage';

const datasetMetaQuery = graphql(`
  query getDatasetInfo($datasetId: UUID!) {
    getDataset(datasetId: $datasetId) {
      title
      description
      id
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
      { datasetId: datasetIdentifier }
    );

    const dataset = res?.getDataset;
    return generatePageMetadata({
      title: `${dataset?.title ?? ''} | Dataset | CivicDataSpace`,
      description: dataset?.description ?? undefined,
      keywords: dataset?.tags?.map((tag) => tag.value) || [],
      openGraph: {
        type: 'dataset',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/datasets/${datasetIdentifier}`,
        title: dataset?.title ?? '',
        description: dataset?.description ?? '',
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (e) {
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

  return <DatasetDetailsPage datasetId={datasetIdentifier} />;
}
