'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import {
  IconFileSpreadsheet,
  IconWorld,
} from '@tabler/icons-react';
import {
  SectionCard,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useDatasetEditStatus } from '../context';
import { PublicPlatformImport } from './components/PublicPlatformImport';
import { ResourceDropzone } from './components/ResourceDropzone';
import { ResourceListView } from './components/ResourceListView';
import { ResourceViewSheet } from './components/ResourceViewSheet';
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
  const { setFilesCompleted, stepShowErrors } = useDatasetEditStatus();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sourceTab, setSourceTab] = useState('upload');

  const { data, isLoading, refetch } = useQuery(
    [`fetch_resources_${params.id}`],
    () =>
      GraphQL(
        getResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { filters: { id: params.id } }
      )
  );

  const resources = data?.datasets[0]?.resources ?? [];
  const isPromptDataset = data?.datasets[0]?.datasetType === 'PROMPT';
  const fileLabel = isPromptDataset ? 'Prompt Files' : 'Dataset File';

  const [resourceId, setResourceId] = useQueryState('id', parseAsString);

  useEffect(() => {
    setFilesCompleted(resources.length > 0);
  }, [resources.length, setFilesCompleted]);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] w-full items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[40vh] w-full items-center justify-center">
        <Text variant="headingLg">Please refresh this page</Text>
      </div>
    );
  }

  const readyCount = resources.length;
  const emptyFileError =
    stepShowErrors && readyCount === 0
      ? isPromptDataset
        ? 'Add at least one prompt file to continue.'
        : 'Add at least one dataset file to continue.'
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={sourceTab} onValueChange={setSourceTab}>
        <TabList boxed>
          <Tab value="upload" icon={IconFileSpreadsheet}>
            File Upload
          </Tab>
          <Tab value="platform" icon={IconWorld}>
            Public Platform
          </Tab>
        </TabList>
        <TabPanel value="upload">
          <div className="flex flex-col gap-4 pt-4">
            <SectionCard title={`Upload ${fileLabel}`}>
              <ResourceDropzone
                reload={refetch}
                onPendingChange={setPendingFiles}
                error={emptyFileError}
              />
            </SectionCard>
            {readyCount > 0 || pendingFiles.length > 0 ? (
              <SectionCard
                title={`Uploaded Files (${readyCount})`}
                successText={
                  readyCount > 0
                    ? `${readyCount} File${readyCount === 1 ? '' : 's'} Ready`
                    : undefined
                }
              >
                <ResourceListView
                  refetch={refetch}
                  data={resources}
                  pendingFiles={pendingFiles}
                />
              </SectionCard>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel value="platform">
          <div className="flex flex-col gap-4 pt-4">
            <PublicPlatformImport />
            {readyCount > 0 || pendingFiles.length > 0 ? (
              <SectionCard
                title={`Uploaded Files (${readyCount})`}
                successText={
                  readyCount > 0
                    ? `${readyCount} File${readyCount === 1 ? '' : 's'} Ready`
                    : undefined
                }
              >
                <ResourceListView
                  refetch={refetch}
                  data={resources}
                  pendingFiles={pendingFiles}
                />
              </SectionCard>
            ) : null}
          </div>
        </TabPanel>
      </Tabs>
      <ResourceViewSheet
        resourceId={resourceId}
        onClose={() => {
          void setResourceId(null);
        }}
        onSaved={() => {
          void refetch();
        }}
      />
    </div>
  );
}
