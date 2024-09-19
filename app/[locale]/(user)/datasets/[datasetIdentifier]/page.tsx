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
      categories {
        name
      }
      formats
    }
  }
`);

const DatasetDetailsPage = () => {
  const [open, setOpen] = useState(false);
  const primaryDataRef = useRef<HTMLDivElement>(null); // Explicitly specify the type of ref

  const params = useParams();

  const { data, isLoading } = useQuery([`${params.datasetIdentifier}`], () =>
    GraphQL(datasetQuery, { filters: { id: params.datasetIdentifier } })
  );

  return (
    <main style={{ background: '#F0F9F1' }}>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/datasets', label: 'Dataset Listing' },
          { href: '#', label: 'Dataset Details' },
        ]}
      />
      <div className="flex w-full gap-7 md:px-8 lg:px-8">
        <div className="w-full flex-grow py-8 ">
          <div className=" flex flex-col gap-5  ">
            <div ref={primaryDataRef} className="flex flex-col gap-4">
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
            </div>
          </div>
          <div className=" mt-5 flex w-full">
            <div className="w-full lg:w-9/12">
              <Details />
              <Resources />
            </div>
            <div className=" hidden flex-col gap-8 border-l-2 border-solid border-baseGraySlateSolid3 py-6 pl-7 lg:flex ">
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
        </div>
      </div>
    </main>
  );
};

export default DatasetDetailsPage;
