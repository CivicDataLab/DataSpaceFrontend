'use client';

import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import { GraphQL } from '@/lib/api';
import { generateJsonLd } from '@/lib/utils';
import Details from './components/Details';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Resources from './components/Resources';
import SimilarDatasets from './components/SimilarDatasets';

const datasetQuery: any = graphql(`
  query getDataset($datasetId: UUID!) {
    getDataset(datasetId: $datasetId) {
      tags {
        id
        value
      }
      id
      downloadCount
      title
      description
      created
      modified
      isIndividualDataset
      user {
        fullName
        id
        profilePicture {
          url
        }
      }
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        value
      }
      license
      resources {
        id
        created
        modified
        type
        name
        description
      }
      organization {
        name
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
        id
        name
        code
        type
        parentId {
          id
          name
          type
        }
      }
      formats
    }
  }
`);

export default function DatasetDetailsPage({
  datasetId,
}: {
  datasetId: string;
}) {
  const Datasetdetails: { data: any; isLoading: any } = useQuery(
    [`details_${datasetId}`],
    () => GraphQL(datasetQuery, {}, { datasetId: datasetId })
  );

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: Datasetdetails?.data?.getDataset?.title,
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/datasets/${datasetId}`,
    description: Datasetdetails?.data?.getDataset?.description,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/datasets`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <main className=" bg-surfaceDefault">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            { href: '/datasets', label: 'Dataset Listing' },
            { href: '#', label: 'Dataset Details' },
          ]}
        />
        <div className="flex">
          <div className="w-full gap-10 border-r-2 border-solid border-greyExtralight p-6 lg:w-3/4 lg:p-10">
            {Datasetdetails.isLoading ? (
              <div className=" mt-8 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <PrimaryData
                data={Datasetdetails?.data?.getDataset}
                isLoading={Datasetdetails.isLoading}
              />
            )}
            <Details />
            <Resources />
            <SimilarDatasets />
          </div>
          <div className=" hidden  w-1/4 gap-10 px-7 py-10 lg:block">
            {Datasetdetails.isLoading ? (
              <div className=" mt-8 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <Metadata data={Datasetdetails?.data?.getDataset} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
