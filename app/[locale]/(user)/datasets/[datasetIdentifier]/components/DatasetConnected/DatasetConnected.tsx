'use client';

import type { ReactNode } from 'react';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner } from 'opub-ui';

import { Icons } from '@/components/icons';
import { GraphQLPublic } from '@/lib/api';
import { backendFileUrl, joinNames } from '@/lib/public-entity';
import { formatDate } from '@/lib/utils';
import { stripMarkdown } from '@/app/[locale]/(user)/search/components/UnifiedListingComponent';
import { getUseCaseSummaryExcerpt } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import type { DatasetCoverLink } from '../../dataset-cover';

const connectedUseCaseQuery = graphql(`
  query connectedUseCaseCard($pk: ID!) {
    useCase(pk: $pk) {
      id
      title
      summary
      slug
      modified
      isIndividualUsecase
      user {
        fullName
        profilePicture {
          url
        }
      }
      organization {
        name
        logo {
          url
        }
      }
      logo {
        path
      }
      geographies {
        name
      }
      sectors {
        name
      }
    }
  }
`);

const connectedCollaborativeQuery = graphql(`
  query connectedCollaborativeCard($pk: ID!) {
    collaborative(pk: $pk) {
      id
      title
      summary
      slug
      startedOn
      datasetCount
      isIndividualCollaborative
      user {
        fullName
        profilePicture {
          url
        }
      }
      organization {
        name
        logo {
          url
        }
      }
      logo {
        path
      }
      coverImage {
        path
      }
      geographies {
        name
      }
      sectors {
        name
      }
    }
  }
`);

export type ConnectedFilter = 'all' | 'usecases' | 'collaboratives';

export type ConnectedUseCase = {
  id: string;
  title?: string | null;
  summary?: string | null;
  slug?: string | null;
  modified?: string | number | null;
  isIndividualUsecase?: boolean | null;
  user?: {
    fullName?: string | null;
    profilePicture?: { url?: string | null } | null;
  } | null;
  organization?: {
    name?: string | null;
    logo?: { url?: string | null } | null;
  } | null;
  logo?: { path?: string | null } | null;
  geographies?: Array<{ name?: string | null }> | null;
  sectors?: Array<{ name?: string | null }> | null;
  datasets?: Array<{ id?: string | null }> | null;
};

export type ConnectedCollaborative = {
  id: string;
  title?: string | null;
  summary?: string | null;
  slug?: string | null;
  startedOn?: string | number | null;
  datasetCount?: number | null;
  isIndividualCollaborative?: boolean | null;
  user?: {
    fullName?: string | null;
    profilePicture?: { url?: string | null } | null;
  } | null;
  organization?: {
    name?: string | null;
    logo?: { url?: string | null } | null;
  } | null;
  logo?: { path?: string | null } | null;
  coverImage?: { path?: string | null } | null;
  geographies?: Array<{ name?: string | null }> | null;
  sectors?: Array<{ name?: string | null }> | null;
  datasets?: Array<{ id?: string | null }> | null;
};

const HEADING =
  'm-0 font-primary text-300 font-semi-bold leading-[26px] tracking-[0px] text-primaryBlue';
const HELPER =
  'mt-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#6b686b]';
const SECTION_HEADING =
  'm-0 font-primary text-200 font-semi-bold leading-3 tracking-[0px] text-primaryBlue';

const FILTERS: Array<{ value: ConnectedFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'usecases', label: 'Use cases' },
  { value: 'collaboratives', label: 'Collaboratives' },
];

export function DatasetConnected({
  useCases,
  collaboratives,
  loadCards,
  filter,
  onFilterChange,
}: {
  useCases: DatasetCoverLink[] | null;
  collaboratives: DatasetCoverLink[] | null;
  loadCards: boolean;
  filter: ConnectedFilter;
  onFilterChange: (filter: ConnectedFilter) => void;
}) {
  const useCaseCards = useCardDetails(
    useCases,
    loadCards,
    'use-case',
    connectedUseCaseQuery,
    (data) => data.useCase
  );
  const collaborativeCards = useCardDetails(
    collaboratives,
    loadCards,
    'collaborative',
    connectedCollaborativeQuery,
    (data) => data.collaborative
  );
  const showUseCases = filter === 'all' || filter === 'usecases';
  const showCollaboratives = filter === 'all' || filter === 'collaboratives';

  return (
    <div>
      <h2 className={HEADING}>Where this dataset is used</h2>
      <p className={HELPER}>
        Explore how this dataset is connected to other resources, projects, and
        initiatives across CivicDataSpace.
      </p>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Connection type">
        {FILTERS.map((item) => {
          const selected = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={selected}
              className={`cursor-pointer appearance-none rounded-full border-[0.8px] border-solid px-4 py-1.5 font-primary text-100 font-medium leading-2 tracking-[0px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue ${
                selected
                  ? 'border-primaryBlue bg-primaryBlue text-white'
                  : 'border-[#e5e5e5] bg-white text-[#0a0a0a] hover:border-primaryBlue'
              }`}
              onClick={() => onFilterChange(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {useCases === null || collaboratives === null ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {showUseCases && (filter === 'usecases' || useCases.length > 0) ? (
            <ConnectionGroup
              title="Use cases"
              count={useCases.length}
              description="Stories and tools built with this dataset."
              emptyTitle="No use cases yet"
              emptyBody="No use cases have been published with this dataset."
            >
              {useCases.length > 0 ? (
                <CardGrid
                  loading={useCaseCards.loading}
                  failed={useCaseCards.failed}
                >
                  {useCaseCards.items.map((item) => (
                    <UseCaseCard key={item.id} item={item} />
                  ))}
                </CardGrid>
              ) : null}
            </ConnectionGroup>
          ) : null}
          {showCollaboratives &&
          (filter === 'collaboratives' || collaboratives.length > 0) ? (
            <ConnectionGroup
              title="Collaboratives"
              count={collaboratives.length}
              description="Initiatives that bring this dataset together with related resources, people and organisations."
              emptyTitle="No collaboratives yet"
              emptyBody="This dataset is not part of a collaborative yet."
            >
              {collaboratives.length > 0 ? (
                <CardGrid
                  loading={collaborativeCards.loading}
                  failed={collaborativeCards.failed}
                >
                  {collaborativeCards.items.map((item) => (
                    <CollaborativeCard key={item.id} item={item} />
                  ))}
                </CardGrid>
              ) : null}
            </ConnectionGroup>
          ) : null}
          {filter === 'all' &&
          useCases.length === 0 &&
          collaboratives.length === 0 ? (
            <div className="rounded-[18px] border-[0.8px] border-dashed border-[#e5e5e5] bg-white px-6 py-10 text-center">
              <p className="m-0 font-primary text-100 font-medium leading-2 tracking-[0px] text-[#0a0a0a]">
                Nothing is connected yet
              </p>
              <p className="m-0 mt-1 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#686868]">
                No use cases or collaboratives use this dataset yet.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function useCardDetails<TData, TCard extends { id: string }>(
  links: DatasetCoverLink[] | null,
  loadCards: boolean,
  kind: string,
  document: Parameters<typeof GraphQLPublic<TData, { pk: string }>>[0],
  pick: (data: TData) => TCard | null | undefined
): { items: TCard[]; loading: boolean; failed: boolean } {
  const ids = (links ?? []).map((link) => link.id);
  const cards = useQuery(
    ['dataset-connected-cards', kind, ...ids],
    () =>
      Promise.all(
        ids.map((id) => GraphQLPublic(document, {}, { pk: id }))
      ),
    { enabled: loadCards && ids.length > 0 }
  );

  return {
    items: (cards.data ?? []).flatMap((data) => {
      const card = pick(data);
      return card ? [card] : [];
    }),
    loading: cards.isLoading,
    failed: cards.isError,
  };
}

function CardGrid({
  loading,
  failed,
  children,
}: {
  loading: boolean;
  failed: boolean;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="mt-6 font-primary text-100 font-regular leading-2 text-[#667085]">
        These connections could not be loaded. Refresh the page and try again.
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

function ConnectionGroup({
  title,
  count,
  description,
  emptyTitle,
  emptyBody,
  children,
}: {
  title: string;
  count: number;
  description: string;
  emptyTitle: string;
  emptyBody: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className={SECTION_HEADING}>
        {title}
        <span className="font-regular text-[#6b6b6b]"> · {count}</span>
      </h3>
      <p className={HELPER}>{description}</p>
      {count > 0 ? (
        children
      ) : (
        <div className="mt-5 rounded-[18px] border-[0.8px] border-dashed border-[#e5e5e5] bg-white px-6 py-10 text-center">
          <p className="m-0 font-primary text-100 font-medium leading-2 tracking-[0px] text-[#0a0a0a]">
            {emptyTitle}
          </p>
          <p className="m-0 mt-1 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#686868]">
            {emptyBody}
          </p>
        </div>
      )}
    </section>
  );
}

function UseCaseCard({ item }: { item: ConnectedUseCase }) {
  const geography = joinNames(item.geographies?.map((place) => place.name));
  const date = {
    icon: Icons.calendarEvent,
    label: 'Date',
    value: formatDate(item.modified ?? null) || '',
    stroke: 1.2,
  };
  const metadataContent = geography
    ? ([
        date,
        {
          icon: Icons.worldPin,
          label: 'Geography',
          value: geography,
          stroke: 1.2,
        },
      ] as const)
    : ([date] as const);
  const sector = item.sectors?.[0]?.name;
  const individual = Boolean(item.isIndividualUsecase);

  return (
    <Card
      title={item.title || ''}
      description={getUseCaseSummaryExcerpt(item.summary)}
      metadataContent={metadataContent}
      variation="collapsed"
      iconColor="success"
      href={`/usecases/${item.id}`}
      imageUrl={imageUrl(item.logo?.path)}
      leftFooterChips={[
        {
          icon: sector ? `/Sectors/${sector}.svg` : '/Sectors/default.svg',
          label: 'Sectors',
        },
      ]}
      rightFooterChips={[
        {
          icon: individual
            ? backendFileUrl(item.user?.profilePicture?.url) || '/profile.png'
            : backendFileUrl(item.organization?.logo?.url) || '/org.png',
          label: 'Published by',
        },
      ]}
    />
  );
}

function CollaborativeCard({ item }: { item: ConnectedCollaborative }) {
  const geography = joinNames(item.geographies?.map((place) => place.name));
  const started = {
    icon: Icons.calendarEvent,
    label: 'Started',
    value: formatDate(item.startedOn ?? null) || '',
    stroke: 1.2,
  };
  const datasets = {
    icon: Icons.dataset,
    label: 'Datasets',
    value: String(item.datasetCount ?? 0),
  };
  const metadataContent = geography
    ? ([
        started,
        datasets,
        {
          icon: Icons.worldPin,
          label: 'Geography',
          value: geography,
          stroke: 1.2,
        },
      ] as const)
    : ([started, datasets] as const);
  const sector = item.sectors?.[0]?.name;
  const individual = Boolean(item.isIndividualCollaborative);
  const image = item.coverImage?.path || item.logo?.path;

  return (
    <Card
      title={item.title || ''}
      description={stripMarkdown(item.summary || '')}
      metadataContent={metadataContent}
      variation="collapsed"
      iconColor="warning"
      href={`/collaboratives/${item.slug || item.id}`}
      imageUrl={imageUrl(image)}
      leftFooterChips={[
        {
          icon: sector ? `/Sectors/${sector}.svg` : '/Sectors/default.svg',
          label: 'Sectors',
        },
      ]}
      rightFooterChips={[
        {
          icon: individual
            ? backendFileUrl(item.user?.profilePicture?.url) || '/profile.png'
            : backendFileUrl(item.organization?.logo?.url) || '/org.png',
          label: 'Published by',
        },
      ]}
    />
  );
}

function imageUrl(path: string | null | undefined): string {
  return backendFileUrl(path, { stripCodeFiles: true }) || '';
}
