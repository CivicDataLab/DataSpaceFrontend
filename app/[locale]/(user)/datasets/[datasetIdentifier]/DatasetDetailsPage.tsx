'use client';

// Docs: ../architecture.md

import { useEffect } from 'react';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import { useAnalytics } from '@/hooks/use-analytics';
import { useTourTrigger } from '@/hooks/use-tour-trigger';
import { env } from '@/env';
import { GraphQL } from '@/lib/api';
import { generateJsonLd } from '@/lib/utils';
import {
  buildDatasetCover,
  buildDatasetPageUrl,
  matchesFor,
  type DatasetCoverDataset,
  type DatasetCoverLink,
} from './dataset-cover';
import { DatasetCover } from './components/DatasetCover/DatasetCover';
import { DatasetTabs } from './components/DatasetTabs/DatasetTabs';

const datasetQuery = graphql(`
  query getDataset($datasetId: UUID!) {
    getDataset(datasetId: $datasetId) {
      id
      title
      description
      downloadCount
      created
      modified
      isIndividualDataset
      license
      formats
      user {
        fullName
        id
        bio
        location
        profilePicture {
          url
        }
      }
      tags {
        id
        value
      }
      accessType
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        value
      }
      source {
        sourceHomepage
        sourceUrl
        platform
      }
      resources {
        id
        noOfEntries
      }
      organization {
        name
        description
        location
        logo {
          url
        }
        slug
        id
      }
      sectors {
        name
      }
      geographies {
        name
      }
    }
  }
`);

const chartCountQuery = graphql(`
  query datasetVisualisationCount($datasetId: UUID!) {
    getChartData(datasetId: $datasetId) {
      __typename
      ... on TypeResourceChart {
        id
      }
      ... on TypeResourceChartImage {
        id
      }
    }
  }
`);

const useCaseLinksQuery = graphql(`
  query datasetUseCaseLinks {
    publishedUseCases {
      id
      slug
      datasets {
        id
      }
    }
  }
`);

const collaborativeLinksQuery = graphql(`
  query datasetCollaborativeLinks {
    publishedCollaboratives {
      id
      slug
      datasets {
        id
      }
    }
  }
`);

export default function DatasetDetailsPage({
  datasetId,
}: {
  datasetId: string;
}) {
  useTourTrigger(true, 1500);
  const { trackDataset } = useAnalytics();

  // Record one view per dataset, whichever tab the visitor opens.
  useEffect(() => {
    trackDataset(datasetId);
  }, [datasetId, trackDataset]);

  // Load this dataset.
  const datasetQueryResult = useQuery(['dataset-cover', datasetId], () =>
    GraphQL(datasetQuery, {}, { datasetId })
  );
  // Count the charts that belong to this dataset.
  const chartQueryResult = useQuery(['dataset-charts', datasetId], () =>
    GraphQL(chartCountQuery, {}, { datasetId })
  );
  // Collect published use cases so the summary can count the ones that include this dataset.
  const useCaseQueryResult = useQuery(['dataset-use-case-ids'], () =>
    GraphQL(useCaseLinksQuery)
  );
  // Collect published collaboratives the same way.
  const collaborativeQueryResult = useQuery(['dataset-collaborative-ids'], () =>
    GraphQL(collaborativeLinksQuery)
  );

  const dataset = datasetQueryResult.data?.getDataset;
  // Public address the share actions use.
  const pageUrl = buildDatasetPageUrl(datasetId);
  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: dataset?.title,
    url: pageUrl,
    description: dataset?.description,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${env.NEXT_PUBLIC_PLATFORM_URL}/datasets`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <main className="bg-surfaceDefault">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            { href: '/datasets', label: 'Dataset Listing' },
            { href: '#', label: 'Dataset Details' },
          ]}
        />
        {datasetQueryResult.isLoading ? (
          <div className="mt-8 flex justify-center py-16">
            <Spinner />
          </div>
        ) : datasetQueryResult.isError ? (
          <StatusMessage
            title="This dataset could not be loaded"
            body="Refresh the page and try again."
          />
        ) : !dataset ? (
          <StatusMessage
            title="Dataset not found"
            body="This dataset is not available."
          />
        ) : (
          <ReadyDataset
            dataset={dataset}
            pageUrl={pageUrl}
            useCases={
              useCaseQueryResult.isSuccess
                ? useCaseQueryResult.data.publishedUseCases
                : null
            }
            collaboratives={
              collaborativeQueryResult.isSuccess
                ? collaborativeQueryResult.data.publishedCollaboratives
                : null
            }
            visualisationCount={
              chartQueryResult.isSuccess
                ? chartQueryResult.data.getChartData.length
                : null
            }
          />
        )}
      </main>
    </>
  );
}

function ReadyDataset({
  dataset,
  pageUrl,
  useCases,
  collaboratives,
  visualisationCount,
}: {
  dataset: DatasetCoverDataset;
  pageUrl: string;
  useCases: DatasetCoverLink[] | null;
  collaboratives: DatasetCoverLink[] | null;
  visualisationCount: number | null;
}) {
  // Turn the published record into the summary card.
  const cover = buildDatasetCover(dataset, {
    useCases,
    collaboratives,
    visualisationCount,
  });

  return (
    <>
      <DatasetCover cover={cover} pageUrl={pageUrl} />
      <DatasetTabs
        datasetId={dataset.id}
        dataset={dataset}
        useCases={useCases ? matchesFor(dataset.id, useCases) : null}
        collaboratives={
          collaboratives ? matchesFor(dataset.id, collaboratives) : null
        }
      />
    </>
  );
}

function StatusMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
      <Text variant="headingXl">{title}</Text>
      <Text variant="bodyLg">{body}</Text>
    </div>
  );
}
