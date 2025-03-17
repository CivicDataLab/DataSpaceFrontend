'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { EditResource } from './components/EditResource';
import { ResourceDropzone } from './components/ResourceDropzone';
import { ResourceListView } from './components/ResourceListView';
import { getReourceDoc } from './query';

export interface TListItem {
  label: string;
  value: string;
  description: string;
  dataset: any;
  fileDetails: any;
  previewEnable: boolean
  previewDetails: {
    startEntry: 0,
    endEntry: 0,
    isAllEntries: boolean
  }
}

export function DistibutionPage({
  params,
}: {
  params: { entityType: string; entitySlug: string; id: string };
}) {
  const { data, isLoading, refetch } = useQuery(
    [`fetch_resources_${params.id}`],
    () =>
      GraphQL(
        getReourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { filters: { id: params.id } }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const ResourceList: TListItem[] =
    (data &&
      data?.datasets[0].resources.map((item: any) => ({
        label: item.name,
        value: item.id,
        description: item.description,
        dataset: item.dataset?.pk,
        fileDetails: item.fileDetails,
        previewEnable: item.previewEnable,
        previewDetails: {
          startEntry: item.previewDetails?.startEntry,
          endEntry: item.previewDetails?.endEntry,
          isAllEntries: item.previewDetails?.isAllEntries
        }
      }))) ||
    [];

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
            {data && ResourceList.length > 0 ? (
              <>
                {resourceId ? (
                  <EditResource refetch={refetch} list={ResourceList} />
                ) : (
                  <ResourceListView
                    refetch={refetch}
                    data={data.datasets[0].resources}
                  />
                )}
              </>
            ) : data && ResourceList.length === 0 ? (
              <div className="py-4">
                <ResourceDropzone reload={refetch} />
              </div>
            ) : (
              <div className="flex h-[70vh] w-full items-center justify-center">
                <Text variant="headingLg">Please refresh this page</Text>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
