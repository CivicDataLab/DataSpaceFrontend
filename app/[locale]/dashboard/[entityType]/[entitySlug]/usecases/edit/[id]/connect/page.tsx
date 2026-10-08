'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
import { graphql } from '@/gql';
import { UpdateUseCaseMetadataInput } from '@/gql/generated/graphql';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Combobox, SectionCard, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { AddDatasetSheet } from '../../components/AddDatasetSheet';
import { AddOrganisationSheet } from '../../components/AddOrganisationSheet';
import {
  EntityRowPicker,
  type EntityRow,
  type EntityRowPickerHandle,
} from '../../components/EntityRowPicker';
import {
  PeopleOrganisationsSection,
  peopleOrgRoleMessage,
  personSubtitle,
  rawEntityId,
} from '../../components/PeopleOrganisationsSection';
import { useUseCaseEditStatus } from '../../context';
import styles from '../../edit.module.scss';
import { isUseCaseConnectComplete } from '../../usecase-summary';
import {
  AddContributors,
  AddPartners,
  AddSupporters,
  FetchUsers,
  OrgList,
  RemoveContributor,
  RemovePartners,
  RemoveSupporters,
} from '../contributors/query';

interface SelectOption {
  label: string;
  value: string;
}

interface ConnectFormData {
  tags: SelectOption[];
  sdgs: SelectOption[];
  sectors: SelectOption[];
  geographies: SelectOption[];
}

interface SearchDataset {
  id: string;
  title: string;
  description?: string;
  status?: string;
  sectors?: Array<string | { name?: string }>;
  geographies?: Array<string | { name?: string }>;
}

function firstLabel(
  items?: Array<string | { name?: string } | null> | null
): string | undefined {
  const first = items?.[0];
  if (!first) return undefined;
  if (typeof first === 'string') return first;
  return first.name || undefined;
}

function datasetStatusLabel(status?: string | null) {
  if (status === 'DRAFT' || status === 'draft') return 'Draft';
  if (status === 'ARCHIVED' || status === 'archived') return 'Archived';
  return 'Published';
}

function datasetMeta(item: {
  sectors?: Array<string | { name?: string } | null> | null;
  geographies?: Array<string | { name?: string } | null> | null;
}) {
  return [firstLabel(item.sectors), firstLabel(item.geographies)]
    .filter(Boolean)
    .join(' · ');
}

const DATASET_PAGE_SIZE = 20;

const FetchUseCaseConnect = graphql(`
  query UseCaseConnectData($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      tags {
        id
        value
      }
      sectors {
        id
        name
      }
      geographies {
        id
        name
      }
      sdgs {
        id
        code
        name
        number
      }
      datasets {
        id
        title
        description
        status
        sectors {
          name
        }
        geographies {
          name
        }
      }
      contributors {
        id
        fullName
        profilePicture {
          url
        }
        organizationMemberships {
          role {
            name
          }
          organization {
            name
          }
        }
      }
      partnerOrganizations {
        id
        name
        logo {
          url
        }
      }
      supportingOrganizations {
        id
        name
        logo {
          url
        }
      }
    }
  }
`);

const UpdateConnectMetadata = graphql(`
  mutation updateUseCaseConnectMetadata(
    $updateMetadataInput: UpdateUseCaseMetadataInput!
  ) {
    addUpdateUsecaseMetadata(updateMetadataInput: $updateMetadataInput) {
      ... on TypeUseCase {
        id
        tags {
          id
          value
        }
        sectors {
          id
          name
        }
        geographies {
          id
          name
        }
        sdgs {
          id
          code
          name
          number
        }
      }
    }
  }
`);

const AssignDatasets = graphql(`
  mutation assignUseCaseWizardDatasets(
    $useCaseId: String!
    $datasetIds: [UUID!]!
  ) {
    updateUsecaseDatasets(useCaseId: $useCaseId, datasetIds: $datasetIds) {
      ... on TypeUseCase {
        id
        datasets {
          id
          title
        }
      }
    }
  }
`);

const sectorsListQuery = graphql(`
  query UseCaseWizardSectors {
    sectors {
      id
      name
    }
  }
`);

const geographiesListQuery = graphql(`
  query UseCaseWizardGeographies {
    geographies {
      id
      name
      parentId {
        name
      }
    }
  }
`);

const tagsListQuery = graphql(`
  query UseCaseWizardTags {
    tags {
      id
      value
    }
  }
`);

const sdgsListQuery = graphql(`
  query UseCaseWizardSdgs {
    sdgs {
      id
      code
      name
      number
    }
  }
`);

function comboValues(value: SelectOption[], key: 'value' | 'label'): string[] {
  return value.map((item) => String(item[key] ?? ''));
}

function fileUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${url.replace('/code/files/', '')}`;
}

function sdgLabel(item: {
  number?: number | null;
  code?: string | null;
  name?: string | null;
}) {
  const num = item.number
    ? String(item.number).padStart(2, '0')
    : (item.code ?? '').replace('SDG', '').padStart(2, '0');
  return `${num}. ${item.name ?? ''}`;
}

export default function ConnectPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const {
    setStatus,
    setConnectCompleted,
    registerBeforeNavigateHandler,
    stepShowErrors,
  } = useUseCaseEditStatus();
  const ownerArgs = { [params.entityType]: params.entitySlug };

  const [formData, setFormData] = useState<ConnectFormData>({
    tags: [],
    sdgs: [],
    sectors: [],
    geographies: [],
  });
  const formRef = useRef(formData);
  useEffect(() => {
    formRef.current = formData;
  });
  const [userSearch, setUserSearch] = useState('');
  const [datasetSearch, setDatasetSearch] = useState('');
  const [debouncedDatasetSearch, setDebouncedDatasetSearch] = useState('');
  const [datasetSheetOpen, setDatasetSheetOpen] = useState(false);
  const [creatingDataset, setCreatingDataset] = useState(false);
  const [orgSheetOpen, setOrgSheetOpen] = useState(false);
  const [creatingOrganisation, setCreatingOrganisation] = useState(false);
  const datasetsPickerRef = useRef<EntityRowPickerHandle>(null);

  const useCaseQuery = useQuery(
    [`fetch_UseCaseConnect`, params.id, params.entityType, params.entitySlug],
    () =>
      GraphQL(FetchUseCaseConnect, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: true }
  );

  const sectorsQuery = useQuery([`use_case_wizard_sectors`], () =>
    GraphQL(sectorsListQuery, ownerArgs)
  );
  const tagsQuery = useQuery([`use_case_wizard_tags`], () =>
    GraphQL(tagsListQuery, ownerArgs)
  );
  const sdgsQuery = useQuery([`use_case_wizard_sdgs`], () =>
    GraphQL(sdgsListQuery, ownerArgs)
  );
  const geosQuery = useQuery([`use_case_wizard_geos`], () =>
    GraphQL(geographiesListQuery, ownerArgs)
  );
  const usersQuery = useQuery(
    [`use_case_wizard_users`, userSearch],
    () =>
      GraphQL(FetchUsers, ownerArgs, {
        limit: 10,
        searchTerm: userSearch,
      }),
    { enabled: userSearch.length > 0, keepPreviousData: true }
  );
  const orgsQuery = useQuery([`use_case_wizard_orgs`], () =>
    GraphQL(OrgList, ownerArgs)
  );

  const datasetsQuery = useInfiniteQuery(
    [`use_case_wizard_datasets`, debouncedDatasetSearch],
    async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        size: String(DATASET_PAGE_SIZE),
        page: String(pageParam),
        sort: 'recent',
      });
      if (debouncedDatasetSearch) {
        params.set('query', debouncedDatasetSearch);
      }
      const res = (await fetchDatasets(`?${params.toString()}`)) as {
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
      staleTime: 0,
      cacheTime: 0,
      refetchOnMount: 'always',
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.results.length < DATASET_PAGE_SIZE) return undefined;
        const loaded = allPages.reduce(
          (count, page) => count + page.results.length,
          0
        );
        if (lastPage.total > 0 && loaded >= lastPage.total) return undefined;
        return allPages.length + 1;
      },
    }
  );

  const loadMoreDatasets = useCallback(() => {
    if (!datasetsQuery.hasNextPage || datasetsQuery.isFetchingNextPage) return;
    void datasetsQuery.fetchNextPage();
  }, [
    datasetsQuery.fetchNextPage,
    datasetsQuery.hasNextPage,
    datasetsQuery.isFetchingNextPage,
  ]);

  const useCase = useCaseQuery.data?.useCases?.[0];
  const [syncedUseCase, setSyncedUseCase] = useState(useCase);
  if (useCase && useCase !== syncedUseCase) {
    setSyncedUseCase(useCase);
    setFormData({
      tags:
        useCase.tags?.map((item) => ({
          label: item.value ?? '',
          value: item.id,
        })) ?? [],
      sdgs:
        useCase.sdgs?.map((item) => ({
          label: sdgLabel(item),
          value: item.id,
        })) ?? [],
      sectors:
        useCase.sectors?.map((item) => ({
          label: item.name ?? '',
          value: item.id,
        })) ?? [],
      geographies:
        useCase.geographies?.map((item) => ({
          label: item.name ?? '',
          value: item.id,
        })) ?? [],
    });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedDatasetSearch(datasetSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [datasetSearch]);

  const { mutateAsync: saveMetadata, isLoading: savingMetadata } = useMutation(
    (input: UpdateUseCaseMetadataInput) =>
      GraphQL(UpdateConnectMetadata, ownerArgs, {
        updateMetadataInput: input,
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [`usecase_wizard_${params.id}`],
        });
        void queryClient.invalidateQueries({
          queryKey: [`fetch_UsecaseDetails`, params.id],
        });
        void useCaseQuery.refetch();
        void tagsQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(
          typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : 'Unable to save classification right now.'
        );
      },
    }
  );

  const persistMetadata = useCallback(
    (next = formRef.current) => {
      return saveMetadata({
        id: params.id,
        metadata: [],
        sectors: comboValues(next.sectors, 'value'),
        tags: comboValues(next.tags, 'label'),
        sdgs: comboValues(next.sdgs, 'value'),
        geographies: comboValues(next.geographies, 'value').map((value) =>
          parseInt(value, 10)
        ),
      }).catch(() => undefined);
    },
    [params.id, saveMetadata]
  );

  const handleClassChange = (
    field: keyof ConnectFormData,
    value: SelectOption[] | string
  ) => {
    const nextValue = Array.isArray(value) ? value : [];
    const next = { ...formRef.current, [field]: nextValue };
    setFormData(next);
    void persistMetadata(next);
  };

  const { mutate: assignDatasets, isLoading: savingDatasets } = useMutation(
    (datasetIds: string[]) =>
      GraphQL(AssignDatasets, ownerArgs, {
        useCaseId: params.id,
        datasetIds,
      }),
    {
      onSuccess: () => {
        void useCaseQuery.refetch();
      },
    }
  );

  const { mutate: addContributor, isLoading: addingContributor } = useMutation(
    (userId: string) =>
      GraphQL(AddContributors, ownerArgs, {
        useCaseId: params.id,
        userId,
      }),
    { onSuccess: () => void useCaseQuery.refetch() }
  );

  const { mutate: removeContributor, isLoading: removingContributor } =
    useMutation(
      (userId: string) =>
        GraphQL(RemoveContributor, ownerArgs, {
          useCaseId: params.id,
          userId,
        }),
      { onSuccess: () => void useCaseQuery.refetch() }
    );

  const { mutate: addPartner, isLoading: addingPartner } = useMutation(
    (organizationId: string) =>
      GraphQL(AddPartners, ownerArgs, {
        useCaseId: params.id,
        organizationId,
      }),
    { onSuccess: () => void useCaseQuery.refetch() }
  );

  const { mutate: removePartner, isLoading: removingPartner } = useMutation(
    (organizationId: string) =>
      GraphQL(RemovePartners, ownerArgs, {
        useCaseId: params.id,
        organizationId,
      }),
    { onSuccess: () => void useCaseQuery.refetch() }
  );

  const { mutate: addSupporter, isLoading: addingSupporter } = useMutation(
    (organizationId: string) =>
      GraphQL(AddSupporters, ownerArgs, {
        useCaseId: params.id,
        organizationId,
      }),
    { onSuccess: () => void useCaseQuery.refetch() }
  );

  const { mutate: removeSupporter, isLoading: removingSupporter } =
    useMutation(
      (organizationId: string) =>
        GraphQL(RemoveSupporters, ownerArgs, {
          useCaseId: params.id,
          organizationId,
        }),
      { onSuccess: () => void useCaseQuery.refetch() }
    );

  useEffect(() => {
    registerBeforeNavigateHandler(async () => {
      await persistMetadata();
    });
    return () => registerBeforeNavigateHandler(null);
  }, [persistMetadata, registerBeforeNavigateHandler]);

  useEffect(() => {
    setStatus(
      savingMetadata ||
        savingDatasets ||
        addingContributor ||
        removingContributor ||
        addingPartner ||
        removingPartner ||
        addingSupporter ||
        removingSupporter ||
        creatingDataset ||
        creatingOrganisation
        ? 'loading'
        : 'success'
    );
  }, [
    savingMetadata,
    savingDatasets,
    addingContributor,
    removingContributor,
    addingPartner,
    removingPartner,
    addingSupporter,
    removingSupporter,
    creatingDataset,
    creatingOrganisation,
    setStatus,
  ]);

  useEffect(() => {
    setConnectCompleted(
      isUseCaseConnectComplete({
        sectors: formData.sectors,
        sdgs: formData.sdgs,
        datasets: useCase?.datasets,
      })
    );
  }, [formData.sectors, formData.sdgs, useCase?.datasets, setConnectCompleted]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    window.document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (
    useCaseQuery.isLoading ||
    sectorsQuery.isLoading ||
    tagsQuery.isLoading ||
    sdgsQuery.isLoading ||
    geosQuery.isLoading
  ) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const selectedDatasets: EntityRow[] =
    useCase?.datasets?.map((item) => ({
      id: item.id,
      title: item.title ?? 'Untitled dataset',
      subtitle: datasetMeta(item),
      summary: item.description ?? undefined,
      badge: datasetStatusLabel(item.status),
    })) ?? [];

  const datasetOptions: EntityRow[] =
    datasetsQuery.data?.pages.flatMap((page) =>
      page.results.map((item) => ({
        id: String(item.id),
        title: item.title,
        subtitle: datasetMeta(item),
        summary: item.description,
        badge: datasetStatusLabel(item.status),
      }))
    ) ?? [];

  const partnerIds = new Set(
    useCase?.partnerOrganizations?.map((item) => item.id) ?? []
  );
  const selectedPeople: EntityRow[] = [
    ...(useCase?.contributors?.map((item) => ({
      id: `user:${item.id}`,
      kind: 'person' as const,
      role: 'contributor',
      title: item.fullName,
      subtitle: personSubtitle(item.organizationMemberships),
      imageUrl: fileUrl(item.profilePicture?.url),
    })) ?? []),
    ...(useCase?.partnerOrganizations?.map((item) => ({
      id: `org:${item.id}`,
      kind: 'org' as const,
      role: 'partner',
      title: item.name,
      subtitle: 'Registered organisation',
      imageUrl: fileUrl(item.logo?.url) || undefined,
    })) ?? []),
    ...(useCase?.supportingOrganizations
      ?.filter((item) => !partnerIds.has(item.id))
      .map((item) => ({
        id: `org:${item.id}`,
        kind: 'org' as const,
        role: 'supporter',
        title: item.name,
        subtitle: 'Registered organisation',
        imageUrl: fileUrl(item.logo?.url) || undefined,
      })) ?? []),
  ];
  const selectedPeopleIds = new Set(selectedPeople.map((item) => item.id));
  const peopleOptions: EntityRow[] = [
    ...(usersQuery.data?.searchUsers?.map((item) => ({
      id: `user:${item.id}`,
      kind: 'person' as const,
      role: 'contributor',
      title: item.fullName,
      subtitle: personSubtitle(item.organizationMemberships),
      imageUrl: fileUrl(item.profilePicture?.url) || undefined,
    })) ?? []),
    ...(orgsQuery.data?.allOrganizations?.map((item) => ({
      id: `org:${item.id}`,
      kind: 'org' as const,
      role: 'partner',
      title: item.name,
      subtitle: 'Registered organisation',
      imageUrl: fileUrl(item.logo?.url) || undefined,
    })) ?? []),
  ].filter((item) => !selectedPeopleIds.has(item.id));

  const removePerson = (item: EntityRow) => {
    const id = rawEntityId(item.id);
    if (item.role === 'partner') removePartner(id);
    else if (item.role === 'supporter') removeSupporter(id);
    else removeContributor(id);
  };

  const changePersonRole = (item: EntityRow, role: string) => {
    if (role === item.role) return;
    const blocked = peopleOrgRoleMessage(item, role);
    if (blocked) {
      toast(blocked);
      return;
    }
    const id = rawEntityId(item.id);
    const add = role === 'supporter' ? addSupporter : addPartner;
    if (item.role === 'partner') {
      removePartner(id, { onSuccess: () => add(id) });
      return;
    }
    if (item.role === 'supporter') {
      removeSupporter(id, { onSuccess: () => add(id) });
    }
  };

  const sdgError =
    stepShowErrors && formData.sdgs.length === 0
      ? 'Select at least one SDG goal'
      : undefined;
  const sectorError =
    stepShowErrors && formData.sectors.length === 0
      ? 'Select at least one sector'
      : undefined;
  const datasetError =
    stepShowErrors && (useCase?.datasets?.length ?? 0) === 0
      ? 'Connect at least one dataset'
      : undefined;

  return (
    <div className="flex flex-col gap-6 px-6">
      <SectionCard
        title="Classification"
        description="Add sectors and topics to help people discover this content."
      >
        <div id="classification" className="grid gap-5 md:grid-cols-1">
          <Combobox
            variant="bright"
            displaySelected
            creatable
            name="tags"
            label="Tags"
            list={
              tagsQuery.data?.tags?.map((item) => ({
                label: item.value ?? '',
                value: item.id,
              })) || []
            }
            selectedValue={formData.tags}
            onChange={(value) => handleClassChange('tags', value)}
          />
          <Combobox
            variant="bright"
            displaySelected
            required
            requiredIndicator
            name="sdgs"
            label="SDG Goals"
            error={sdgError}
            list={
              sdgsQuery.data?.sdgs?.map((item) => ({
                label: sdgLabel(item),
                value: item.id,
              })) || []
            }
            selectedValue={formData.sdgs}
            onChange={(value) => handleClassChange('sdgs', value)}
          />
          <Combobox
            variant="bright"
            displaySelected
            required
            requiredIndicator
            name="sectors"
            label="Sectors"
            error={sectorError}
            list={
              sectorsQuery.data?.sectors?.map((item) => ({
                label: item.name,
                value: item.id,
              })) || []
            }
            selectedValue={formData.sectors}
            onChange={(value) => handleClassChange('sectors', value)}
          />
          <Combobox
            variant="bright"
            displaySelected
            name="geographies"
            label="Geography"
            list={
              geosQuery.data?.geographies?.map((item) => ({
                label: `${item.name}${item.parentId ? ` (${item.parentId.name})` : ''}`,
                value: item.id,
              })) || []
            }
            selectedValue={formData.geographies}
            onChange={(value) => handleClassChange('geographies', value)}
          />
        </div>
      </SectionCard>

      <SectionCard
        className={styles.overflowVisible}
        title={
          <>
            Datasets{' '}
            <Text as="span" color="critical">
              *
            </Text>
          </>
        }
        description="Connect datasets related to this Use Case."
        actions={[
          {
            kind: 'neutral',
            content: '+ Create New Dataset',
            onAction: () => setDatasetSheetOpen(true),
          },
        ]}
      >
        <div id="datasets">
          <EntityRowPicker
            ref={datasetsPickerRef}
            variant="dataset"
            searchPlaceholder="Search published datasets..."
            emptyTitle="No datasets connected yet."
            emptyDescription="Connect an existing published dataset to this Use Case."
            options={datasetOptions}
            selected={selectedDatasets}
            hasMore={Boolean(datasetsQuery.hasNextPage)}
            isLoading={datasetsQuery.isLoading && !datasetsQuery.data}
            isLoadingMore={datasetsQuery.isFetchingNextPage}
            onSearch={setDatasetSearch}
            onLoadMore={loadMoreDatasets}
            onAdd={(item) => {
              assignDatasets([
                ...selectedDatasets.map((row) => row.id),
                item.id,
              ]);
            }}
            onRemove={(id) => {
              assignDatasets(
                selectedDatasets
                  .filter((row) => row.id !== id)
                  .map((row) => row.id)
              );
            }}
          />
          {datasetError ? (
            <div className="mt-2">
              <Text variant="bodySm" color="critical">
                {datasetError}
              </Text>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <PeopleOrganisationsSection
        subject="Use Case"
        className={styles.overflowVisible}
        options={peopleOptions}
        selected={selectedPeople}
        isLoading={userSearch.trim().length > 0 && usersQuery.isFetching}
        onSearch={setUserSearch}
        onAdd={(item) => {
          const id = rawEntityId(item.id);
          if (item.kind === 'org') addPartner(id);
          else addContributor(id);
        }}
        onRemove={(id) => {
          const item = selectedPeople.find((row) => row.id === id);
          if (item) removePerson(item);
        }}
        onRoleChange={changePersonRole}
        onAddOrganisation={() => setOrgSheetOpen(true)}
      />

      <AddOrganisationSheet
        open={orgSheetOpen}
        onClose={() => setOrgSheetOpen(false)}
        onConnect={(organizationId) =>
          GraphQL(AddPartners, ownerArgs, {
            useCaseId: params.id,
            organizationId,
          })
        }
        onBusy={setCreatingOrganisation}
        onAdded={() => {
          void orgsQuery.refetch();
          void useCaseQuery.refetch();
        }}
      />
      <AddDatasetSheet
        open={datasetSheetOpen}
        onClose={() => setDatasetSheetOpen(false)}
        useCaseId={params.id}
        ownerArgs={ownerArgs}
        sectors={
          sectorsQuery.data?.sectors?.map((item) => ({
            label: item.name,
            value: String(item.id),
          })) ?? []
        }
        connectedDatasetIds={selectedDatasets.map((row) => row.id)}
        onBusy={setCreatingDataset}
        onAdded={() => {
          void useCaseQuery.refetch();
        }}
      />
    </div>
  );
}
