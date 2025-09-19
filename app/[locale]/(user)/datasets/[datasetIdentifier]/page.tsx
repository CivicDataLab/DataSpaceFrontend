import { graphql } from '@/gql';

import { GraphQL } from '@/lib/api';
import { generatePageMetadata } from '@/lib/utils';
import DatasetDetailsPage from './DatasetDetailsPage';

const datasetMetaQuery: any = graphql(`
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

export async function generateMetadata({
  params,
}: {
  params: { datasetIdentifier: string };
}) {
  try {
    const res: any = await GraphQL(
      datasetMetaQuery,
      {},
      { datasetId: params.datasetIdentifier }
    );

    const dataset = res?.getDataset;
    return generatePageMetadata({
      title: `${dataset?.title} | Dataset | CivicDataSpace`,
      description: dataset?.description,
      keywords: dataset?.tags?.map((tag: any) => tag.value) || [],
      openGraph: {
        type: 'dataset',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/datasets/${params.datasetIdentifier}`,
        title: dataset?.title,
        description: dataset?.description,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (e) {
    console.error('Metadata fetch error', e);
    return generatePageMetadata({ title: 'Dataset Details' });
  }
}

export default function Page({
  params,
}: {
  params: { datasetIdentifier: string };
}) {
  return <DatasetDetailsPage datasetId={params.datasetIdentifier} />;
}
