'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import Details from './components/Details';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Resources from './components/Resources';

const datasetQuery = graphql(`
  query datasets($filters: DatasetFilter) {
    datasets(filters: $filters) {
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
      metadata {
        metadataItem {
          id
          label
        }
        value
      }
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
      categories {
        name
      }
      formats
    }
  }
`);

const DatasetDetailsPage = () => {
  const [showCharts, setShowcharts] = useState(true);

  const params = useParams();

  const { data, isLoading } = useQuery([`${params.datasetIdentifier}`], () =>
    GraphQL(
      datasetQuery,
      {
        // Entity Headers if present
      },
      { filters: { id: params.datasetIdentifier } }
    )
  );

  return (
    <main className=" bg-surfaceDefault">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/datasets', label: 'Dataset Listing' },
          { href: '#', label: 'Dataset Details' },
        ]}
      />
      <div className="flex">
        <div className="w-full gap-10 border-r-2 border-solid border-greyExtralight p-6  lg:p-10 lg:w-3/4">
          {isLoading ? (
            <div className=" mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <PrimaryData
              data={data && data?.datasets[0]}
              isLoading={isLoading}
            />
          )}
          <Details setShowcharts={setShowcharts} />
        </div>
        <div className=" hidden  w-1/4 gap-10 py-10 px-7 lg:block">
          {isLoading ? (
            <div className=" mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              <Metadata data={data && data?.datasets[0]} />
            </div>
          )}
        </div>
      </div>
      <Resources />
    </main>
  );
};

export default DatasetDetailsPage;
