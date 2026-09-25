'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchData, fetchDatasets } from '@/fetch';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionCard, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { AddDatasetSheet } from '../../../../usecases/edit/components/AddDatasetSheet';
import {
  EntityRowPicker,
  type EntityRow,
  type EntityRowPickerHandle,
} from '../../../../usecases/edit/components/EntityRowPicker';
import { AddUseCase } from '../../../../usecases/page';
import { errorMessage } from '../../collaborative-summary';
import { useCollaborativeEditStatus } from '../../context';
import styles from '../../edit.module.scss';
import {
  AssignCollaborativeDatasets,
  AssignCollaborativeUseCases,
  FetchCollaborativeReview,
  sectorsListQueryDoc,
} from '../../wizard-documents';

interface SearchDataset {
  id: string;
  title: string;
  description?: string;
  status?: string;
  sectors?: Array<string | { name?: string }>;
  geographies?: Array<string | { name?: string }>;
}

interface SearchUseCase {
  id: string | number;
  title: string;
  summary?: string;
  sectors?: Array<string | { name?: string }>;
}

const PAGE_SIZE = 20;

function firstLabel(
  items?: Array<string | { name?: string } | null> | null
) {
  const first = items?.[0];
  if (!first) return undefined;
  if (typeof first === 'string') return first;
  return first.name || undefined;
}

function statusLabel(status?: string | null) {
  if (status === 'DRAFT' || status === 'draft') return 'Draft';
  if (status === 'ARCHIVED' || status === 'archived') return 'Archived';
  return 'Published';
}

export default function ContentPage() {
  const router = useRouter();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const { setStatus } = useCollaborativeEditStatus();
  const ownerArgs = { [params.entityType]: params.entitySlug };
  const datasetsPickerRef = useRef<EntityRowPickerHandle>(null);
  const useCasesPickerRef = useRef<EntityRowPickerHandle>(null);
  const [datasetSearch, setDatasetSearch] = useState('');
  const [debouncedDatasetSearch, setDebouncedDatasetSearch] = useState('');
  const [useCaseSearch, setUseCaseSearch] = useState('');
  const [debouncedUseCaseSearch, setDebouncedUseCaseSearch] = useState('');
  const [datasetSheetOpen, setDatasetSheetOpen] = useState(false);
  const [creatingDataset, setCreatingDataset] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedDatasetSearch(datasetSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [datasetSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedUseCaseSearch(useCaseSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [useCaseSearch]);

  const sectorsQuery = useQuery([`collaborative_wizard_sectors`], () =>
    GraphQL(sectorsListQueryDoc, ownerArgs)
  );

  const collaborativeQuery = useQuery(
    [`collaborative_wizard_${params.id}`],
    () =>
      GraphQL(FetchCollaborativeReview, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: true }
  );

  const datasetsQuery = useInfiniteQuery(
    [`collaborative_wizard_datasets`, debouncedDatasetSearch],
    async ({ pageParam = 1 }) => {
      const search = new URLSearchParams({
        size: String(PAGE_SIZE),
        page: String(pageParam),
        sort: 'recent',
      });
      if (debouncedDatasetSearch) search.set('query', debouncedDatasetSearch);
      const res = (await fetchDatasets(`?${search.toString()}`)) as {
        results?: SearchDataset[];
        total?: number;
      };
      return {
        results: res.results ?? [],
        total: Number(res.total ?? 0),
      };
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.results.length < PAGE_SIZE) return undefined;
        const loaded = allPages.reduce(
          (count, page) => count + page.results.length,
          0
        );
        if (lastPage.total > 0 && loaded >= lastPage.total) return undefined;
        return allPages.length + 1;
      },
    }
  );

  const useCasesQuery = useInfiniteQuery(
    [`collaborative_wizard_usecases`, debouncedUseCaseSearch],
    async ({ pageParam = 1 }) => {
      const search = new URLSearchParams({
        size: String(PAGE_SIZE),
        page: String(pageParam),
        sort: 'recent',
      });
      if (debouncedUseCaseSearch) search.set('query', debouncedUseCaseSearch);
      const res = (await fetchData('usecase', `?${search.toString()}`)) as {
        results?: SearchUseCase[];
        total?: number;
      };
      return {
        results: res.results ?? [],
        total: Number(res.total ?? 0),
      };
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.results.length < PAGE_SIZE) return undefined;
        const loaded = allPages.reduce(
          (count, page) => count + page.results.length,
          0
        );
        if (lastPage.total > 0 && loaded >= lastPage.total) return undefined;
        return allPages.length + 1;
      },
    }
  );

  const collaborative = collaborativeQuery.data?.collaboratives?.[0];
  const datasetIds = collaborative?.datasets?.map((item) => item.id) ?? [];
  const useCaseIds =
    collaborative?.useCases?.map((item) => String(item.id)) ?? [];

  const refresh = () => {
    void collaborativeQuery.refetch();
    void queryClient.invalidateQueries({
      queryKey: [`collaborative_wizard_${params.id}`],
    });
  };

  const { mutate: assignDatasets, isLoading: savingDatasets } = useMutation(
    (nextIds: string[]) =>
      GraphQL(AssignCollaborativeDatasets, ownerArgs, {
        collaborativeId: params.id,
        datasetIds: nextIds,
      }),
    {
      onSuccess: refresh,
      onError: (error: unknown) =>
        toast(errorMessage(error, 'Unable to update datasets right now.')),
    }
  );

  const { mutate: assignUseCases, isLoading: savingUseCases } = useMutation(
    (nextIds: string[]) =>
      GraphQL(AssignCollaborativeUseCases, ownerArgs, {
        collaborativeId: params.id,
        useCaseIds: nextIds,
      }),
    {
      onSuccess: refresh,
      onError: (error: unknown) =>
        toast(errorMessage(error, 'Unable to update use cases right now.')),
    }
  );

  const { mutate: createUseCase, isLoading: creatingUseCase } = useMutation(
    () => GraphQL(AddUseCase, ownerArgs),
    {
      onSuccess: (data) => {
        const created = data.addUseCase;
        const newId = created && 'id' in created ? created.id : undefined;
        if (!newId) {
          toast('Unable to create a use case right now.');
          return;
        }
        assignUseCases([...useCaseIds, String(newId)], {
          onSuccess: () => {
            router.push(
              `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${newId}/builder`
            );
          },
        });
      },
      onError: (error: unknown) =>
        toast(errorMessage(error, 'Unable to create a use case right now.')),
    }
  );

  const contentReady = !collaborativeQuery.isLoading;

  useEffect(() => {
    if (!contentReady) return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentReady]);

  useEffect(() => {
    setStatus(
      savingDatasets || savingUseCases || creatingDataset || creatingUseCase
        ? 'loading'
        : 'success'
    );
  }, [
    savingDatasets,
    savingUseCases,
    creatingDataset,
    creatingUseCase,
    setStatus,
  ]);

  const loadMoreDatasets = useCallback(() => {
    if (!datasetsQuery.hasNextPage || datasetsQuery.isFetchingNextPage) return;
    void datasetsQuery.fetchNextPage();
  }, [
    datasetsQuery.fetchNextPage,
    datasetsQuery.hasNextPage,
    datasetsQuery.isFetchingNextPage,
  ]);

  const loadMoreUseCases = useCallback(() => {
    if (!useCasesQuery.hasNextPage || useCasesQuery.isFetchingNextPage) return;
    void useCasesQuery.fetchNextPage();
  }, [
    useCasesQuery.fetchNextPage,
    useCasesQuery.hasNextPage,
    useCasesQuery.isFetchingNextPage,
  ]);

  if (collaborativeQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const selectedDatasets: EntityRow[] =
    collaborative?.datasets?.map((item) => ({
      id: item.id,
      title: item.title ?? 'Untitled dataset',
      subtitle: firstLabel(item.sectors),
      summary: item.description ?? undefined,
      badge: statusLabel(item.status),
    })) ?? [];

  const datasetOptions: EntityRow[] =
    datasetsQuery.data?.pages.flatMap((page) =>
      page.results.map((item) => ({
        id: String(item.id),
        title: item.title,
        subtitle: [firstLabel(item.sectors), firstLabel(item.geographies)]
          .filter(Boolean)
          .join(' · '),
        summary: item.description,
        badge: statusLabel(item.status),
      }))
    ) ?? [];

  const selectedUseCases: EntityRow[] =
    collaborative?.useCases?.map((item) => ({
      id: String(item.id),
      title: item.title ?? 'Untitled use case',
      subtitle: firstLabel(item.sectors),
      badge: 'Connected',
    })) ?? [];

  const useCaseOptions: EntityRow[] =
    useCasesQuery.data?.pages.flatMap((page) =>
      page.results.map((item) => ({
        id: String(item.id),
        title: item.title,
        subtitle: firstLabel(item.sectors),
        summary: item.summary,
      }))
    ) ?? [];

  return (
    <div className="flex flex-col gap-6 px-6">
      <div id="datasets">
      <SectionCard
        className={styles.overflowVisible}
        title="Datasets"
        description="Connect published datasets that support or relate to this Collaborative."
        actions={[
          {
            kind: 'neutral',
            content: '+ Connect Dataset',
            onAction: () => datasetsPickerRef.current?.focus(),
          },
          {
            kind: 'neutral',
            content: '+ Create New Dataset',
            onAction: () => setDatasetSheetOpen(true),
          },
        ]}
      >
        <EntityRowPicker
          ref={datasetsPickerRef}
          variant="dataset"
          searchPlaceholder="Search published datasets..."
          emptyTitle="No datasets connected yet."
          emptyDescription="Connect an existing published dataset to this Collaborative."
          options={datasetOptions}
          selected={selectedDatasets}
          hasMore={Boolean(datasetsQuery.hasNextPage)}
          isLoading={datasetsQuery.isLoading && !datasetsQuery.data}
          isLoadingMore={datasetsQuery.isFetchingNextPage}
          onSearch={setDatasetSearch}
          onLoadMore={loadMoreDatasets}
          onAdd={(item) => assignDatasets([...datasetIds, item.id])}
          onRemove={(id) =>
            assignDatasets(datasetIds.filter((datasetId) => datasetId !== id))
          }
        />
      </SectionCard>
      </div>

      <div id="use-cases">
      <SectionCard
        className={styles.overflowVisible}
        title="Use Cases"
        description="Connect published Use Cases that are part of or related to this Collaborative."
        actions={[
          {
            kind: 'neutral',
            content: '+ Connect Use Case',
            onAction: () => useCasesPickerRef.current?.focus(),
          },
          {
            kind: 'neutral',
            content: creatingUseCase ? 'Creating…' : '+ Create New Use Case',
            onAction: () => createUseCase(),
          },
        ]}
      >
        <EntityRowPicker
          ref={useCasesPickerRef}
          variant="dataset"
          searchPlaceholder="Search published Use Cases..."
          emptyTitle="No Use Cases connected yet."
          emptyDescription="Connect an existing published Use Case to this Collaborative."
          options={useCaseOptions}
          selected={selectedUseCases}
          hasMore={Boolean(useCasesQuery.hasNextPage)}
          isLoading={useCasesQuery.isLoading && !useCasesQuery.data}
          isLoadingMore={useCasesQuery.isFetchingNextPage}
          onSearch={setUseCaseSearch}
          onLoadMore={loadMoreUseCases}
          onAdd={(item) => assignUseCases([...useCaseIds, item.id])}
          onRemove={(id) =>
            assignUseCases(useCaseIds.filter((useCaseId) => useCaseId !== id))
          }
        />
      </SectionCard>
      </div>
      <AddDatasetSheet
        open={datasetSheetOpen}
        onClose={() => setDatasetSheetOpen(false)}
        ownerArgs={ownerArgs}
        sectors={
          sectorsQuery.data?.sectors?.map((item) => ({
            label: item.name,
            value: String(item.id),
          })) ?? []
        }
        connectedDatasetIds={selectedDatasets.map((row) => row.id)}
        intro="Create the essential dataset information and connect it to this Collaborative."
        descriptionPlaceholder="Briefly describe what this dataset contains and how it relates to this Collaborative."
        successMessage="Dataset created and added to this Collaborative"
        onBusy={setCreatingDataset}
        onConnect={async (datasetId) => {
          const assigned = await GraphQL(
            AssignCollaborativeDatasets,
            ownerArgs,
            {
              collaborativeId: params.id,
              datasetIds: Array.from(new Set([...datasetIds, datasetId])),
            }
          );
          const result = assigned.updateCollaborativeDatasets;
          if (!result || !('id' in result) || !result.id) {
            throw new Error(
              'Unable to connect the dataset to this Collaborative.'
            );
          }
        }}
        onAdded={refresh}
      />
    </div>
  );
}
