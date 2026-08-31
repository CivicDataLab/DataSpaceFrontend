'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { EditResource } from './components/EditResource';
import { ResourceDropzone } from './components/ResourceDropzone';
import { ResourceListView } from './components/ResourceListView';
import { getResourceDoc } from './query';

export interface TListItem {
  label: string;
  value: string;
  description: string;
  dataset?: string | number;
  fileDetails?: {
    id?: string;
    file?: {
      name?: string | null;
      path?: string | null;
      url?: string | null;
    } | null;
    format?: string | null;
    size?: number | null;
    created?: string | null;
    modified?: string | null;
  } | null;
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
        getResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { filters: { id: params.id } }
      ),
  );

  const ResourceList: TListItem[] =
    (data &&
      data?.datasets[0]?.resources.map((item) => ({
        label: item.name,
        value: String(item.id),
        description: item.description ?? '',
        dataset: item.dataset?.pk,
        fileDetails: item.fileDetails,
       
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
                  <EditResource 
                    refetch={refetch} 
                    allResources={ResourceList}
                    isPromptDataset={data.datasets[0].datasetType === 'PROMPT'}
                  />
                ) : (
                  <ResourceListView
                    refetch={refetch}
                    data={data.datasets[0].resources}
                    isPromptDataset={data.datasets[0].datasetType === 'PROMPT'}
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
