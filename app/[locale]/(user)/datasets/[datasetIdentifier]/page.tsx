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
      sectors {
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
        <div className="w-full gap-10 border-r-2 border-solid border-greyExtralight p-6  lg:w-3/4 lg:p-10">
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
          <div className="mt-10">
            {showCharts ? (
              <Details setShowcharts={setShowcharts} />
            ) : (
              <Resources />
            )}
          </div>
        </div>
        <div className=" hidden  w-1/4 gap-10 px-7 py-10 lg:block">
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
      {showCharts && (
        <div className="w-full p-6 lg:px-28 lg:py-10">
          <Resources />
        </div>
      )}
    </main>
  );
};

export default DatasetDetailsPage;
