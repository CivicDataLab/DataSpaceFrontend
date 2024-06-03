'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { graphql } from '@/gql';

import { useQuery } from '@tanstack/react-query';
import { Spinner,Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { EditResource } from '../components/EditResource';
import { ResourceDropzone } from '../components/ResourceDropzone';
import { ResourceListView } from '../components/ResourceListView';

export const getReourceDoc = graphql(`
  query getResources($filters: DatasetFilter) {
    datasets(filters: $filters) {
      resources {
        id
        dataset {
          pk
        }
        schema {
          id
          fieldName
          format
          description
        }
        type
        name
        description
        created
        fileDetails {
          id
          resource {
            pk
          }
          file {
            name
            path
            url
          }
          size
          created
          modified
        }
        previewEnabled
        previewDetails {
          pk
        }
      }
    }
  }
`);

export function DistibutionPage({ params }: { params: { id: string } }) {

  const { data, isLoading, refetch } = useQuery(
    [`fetch_resources_${params.id}`],
    () => GraphQL(getReourceDoc, { filters: { id: params.id } }),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const searchParams = useSearchParams();
  const resourceId = searchParams.get('id');

  return (
    <>
      <div>
        {isLoading ? (
          <div className="flex min-h-full w-full items-center justify-center">
            <Spinner size={40} />
          </div>
        ) : (
          <>
            {data && data.datasets[0].resources.length > 0 ? (
              <>
                {resourceId ? (
                  <EditResource
                    reload={refetch}
                    data={data.datasets[0].resources}
                  />
                ) : (
                  <ResourceListView
                    refetch={refetch}
                    data={data.datasets[0].resources}
                  />
                )}
              </>
            ) : data && data.datasets[0].resources.length === 0 ? (
              <div className="py-4">
                <ResourceDropzone reload={refetch} />
              </div>
            ) : (
              <div className="flex h-[70vh] w-full items-center justify-center">
                <Text variant="headingLg">
                   Please refresh this page
                </Text> 
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
