'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconFileSpreadsheet, IconWorld } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import {
  AlertDialog,
  SectionCard,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useDatasetEditStatus } from '../context';
import {
  PublicPlatformImport,
  type PlatformImportDraft,
} from './components/PublicPlatformImport';
import { updateResourceList } from './components/query';
import { ResourceDropzone } from './components/ResourceDropzone';
import { ResourceListView } from './components/ResourceListView';
import { ResourceViewSheet } from './components/ResourceViewSheet';
import { getResourceDoc } from './query';

type UploadTab = 'upload' | 'platform';

const EMPTY_PLATFORM_DRAFT: PlatformImportDraft = {
  platform: '',
  datasetUrl: '',
};

function isUploadTab(value: string): value is UploadTab {
  return value === 'upload' || value === 'platform';
}

function keepDialogOpen(event: unknown) {
  if (
    typeof event === 'object' &&
    event !== null &&
    'preventDefault' in event &&
    typeof event.preventDefault === 'function'
  ) {
    event.preventDefault();
  }
}

function switchDialogCopy(target: UploadTab, draft: PlatformImportDraft) {
  if (target === 'platform') {
    return {
      description:
        'You have already uploaded files manually. Clear these files before importing files from the public platform.',
      confirmLabel: 'Clear Files and Switch',
    };
  }

  if (draft.datasetUrl.trim().length > 0) {
    return {
      description:
        'You have already entered a public platform URL. Clear it before uploading files manually.',
      confirmLabel: 'Clear URL and Switch',
    };
  }

  return {
    description:
      'You have already selected a public platform. Clear this selection before uploading files manually.',
    confirmLabel: 'Clear and Switch',
  };
}

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
  const queryClient = useQueryClient();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sourceTab, setSourceTab] = useState<UploadTab>('upload');
  const [platformDraft, setPlatformDraft] =
    useState<PlatformImportDraft>(EMPTY_PLATFORM_DRAFT);
  const [platformResetKey, setPlatformResetKey] = useState(0);
  const [switchTarget, setSwitchTarget] = useState<UploadTab | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const clearingRef = useRef(false);
  const discardUploadRef = useRef(false);

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

  const handlePlatformDraftChange = useCallback(
    (draft: PlatformImportDraft) => {
      setPlatformDraft(draft);
    },
    []
  );

  const hasFiles = resources.length > 0 || pendingFiles.length > 0;
  const platformOccupied =
    platformDraft.platform.length > 0 ||
    platformDraft.datasetUrl.trim().length > 0;

  const handleTabChange = (next: string) => {
    if (!isUploadTab(next) || next === sourceTab || clearingRef.current) return;

    const leavingFiles = sourceTab === 'upload' && hasFiles;
    const leavingPlatform = sourceTab === 'platform' && platformOccupied;
    if (leavingFiles || leavingPlatform) {
      setSwitchTarget(next);
      return;
    }

    setSourceTab(next);
  };

  const confirmSwitch = async () => {
    if (!switchTarget || clearingRef.current) return;
    clearingRef.current = true;
    setIsClearing(true);

    try {
      if (switchTarget === 'platform') {
        discardUploadRef.current = true;
        const resourceIds = resources
          .map((resource) => resource.id)
          .filter((id): id is string => Boolean(id));
        const results = await Promise.all(
          resourceIds.map(async (resourceId) => {
            try {
              await GraphQL(
                updateResourceList,
                { [params.entityType]: params.entitySlug },
                { resourceId }
              );
              return true;
            } catch {
              return false;
            }
          })
        );
        setPendingFiles([]);
        await refetch();
        void queryClient.invalidateQueries({
          queryKey: [`dataset_title_${params.id}`],
        });
        if (results.some((cleared) => !cleared)) {
          discardUploadRef.current = false;
          toast('Unable to clear files right now.', {
            id: 'dataset-upload-method-clear-error',
          });
          return;
        }
      } else {
        setPlatformResetKey((key) => key + 1);
        setPlatformDraft(EMPTY_PLATFORM_DRAFT);
      }

      setSourceTab(switchTarget);
      setSwitchTarget(null);
    } finally {
      clearingRef.current = false;
      setIsClearing(false);
    }
  };

  const dialogCopy = switchTarget
    ? switchDialogCopy(switchTarget, platformDraft)
    : null;

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
      <Tabs value={sourceTab} onValueChange={handleTabChange}>
        <TabList boxed>
          <Tab value="upload" icon={IconFileSpreadsheet}>
            File Upload
          </Tab>
          <Tab value="platform" icon={IconWorld}>
            Public Platform
          </Tab>
        </TabList>
        <TabPanel
          value="upload"
          forceMount
          style={sourceTab === 'upload' ? undefined : { display: 'none' }}
        >
          <div className="flex flex-col gap-4 pt-4">
            <SectionCard title={`Upload ${fileLabel}`}>
              <ResourceDropzone
                reload={refetch}
                onPendingChange={setPendingFiles}
                error={emptyFileError}
                discardUploadRef={discardUploadRef}
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
            <PublicPlatformImport
              key={platformResetKey}
              onDraftChange={handlePlatformDraftChange}
            />
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
      <AlertDialog
        open={switchTarget !== null}
        onOpenChange={(open) => {
          if (!open && !clearingRef.current) setSwitchTarget(null);
        }}
      >
        <AlertDialog.Content
          title="Change upload method?"
          primaryAction={{
            content: dialogCopy?.confirmLabel ?? 'Clear and Switch',
            destructive: true,
            disabled: isClearing,
            onAction: (event) => {
              keepDialogOpen(event);
              void confirmSwitch();
            },
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              disabled: isClearing,
            },
          ]}
        >
          {dialogCopy?.description ?? ''}
        </AlertDialog.Content>
      </AlertDialog>
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
