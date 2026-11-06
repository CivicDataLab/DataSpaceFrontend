'use client';

// Public use case page. Shows the cover, the story, and the related datasets.
// Docs: ../architecture.md
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUseCaseSummaryExcerpt } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import { type UseCasedetailsQuery } from '@/gql/generated/graphql';
import { useAnalytics } from '@/hooks/use-analytics';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'opub-ui';

import { GraphQLPublic } from '@/lib/api';
import { generateJsonLd } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { EntityCover } from '@/components/entity-cover/EntityCover';
import JsonLd from '@/components/JsonLd';
import { Loading } from '@/components/loading';
import { SharePanel } from '@/components/share-panel/SharePanel';
import { StoryRail } from '@/components/story-rail/StoryRail';
import { ContentsNav } from '../components/ContentsNav';
import { ContributorList } from '../components/ContributorList';
import { DatasetStories } from '../components/DatasetStories';
import { storyHeadings } from '../components/story-outline';
import { TopicBar } from '../components/TopicBar';
import {
  buildUseCaseCover,
  buildUseCasePageUrl,
} from '../components/usecase-cover';
import {
  buildRailContributors,
  buildUseCaseTopics,
} from '../components/usecase-rail';
import { UseCaseStory } from '../components/UseCaseStory';
import Dashboards from './Dashboards';
import { useCaseDetailsQuery } from './queries';

const UseCaseDetailClient = () => {
  const params = useParams();
  const { trackUsecase } = useAnalytics();
  const requested =
    typeof params.useCaseSlug === 'string' ? params.useCaseSlug : '';

  const {
    data: UseCaseDetails,
    isLoading,
    error,
  } = useQuery(
    [`fetch_UsecaseDetails_${params.useCaseSlug}`],
    async () => {
      const result = await GraphQLPublic(
        useCaseDetailsQuery,
        {},
        { publicId: requested }
      );
      return result;
    }
  );

  // Track usecase view when data is loaded
  useEffect(() => {
    if (UseCaseDetails?.useCaseBySlug) {
      trackUsecase(
        UseCaseDetails.useCaseBySlug.id,
        UseCaseDetails.useCaseBySlug.title || undefined
      );
    }
  }, [UseCaseDetails?.useCaseBySlug, trackUsecase]);

  const pageSegment =
    UseCaseDetails?.useCaseBySlug?.urlSlug ||
    (typeof params.useCaseSlug === 'string' ? params.useCaseSlug : '');
  const pageUrl = buildUseCasePageUrl(pageSegment);

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CivicDataLab',
    url: pageUrl,
    description:
      getUseCaseSummaryExcerpt(UseCaseDetails?.useCaseBySlug?.summary) ||
      `Explore open data and curated datasets in the ${UseCaseDetails?.useCaseBySlug?.title} sector.`,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: pageUrl,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <div>
        {isLoading ? (
          <div className=" flex justify-center p-10">
            <Loading />
          </div>
        ) : error ? (
          <div className="container py-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <Text variant="headingXl" color="critical">
                Error Loading Use Case
              </Text>
              <Text variant="bodyLg">
                {error instanceof Error &&
                (error.message.includes('401') || error.message.includes('403'))
                  ? 'You do not have permission to view this use case. Please log in or contact the administrator.'
                  : 'Failed to load use case details. Please try again later.'}
              </Text>
            </div>
          </div>
        ) : !UseCaseDetails?.useCaseBySlug ? (
          <div className="container py-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <Text variant="headingXl">Use Case Not Found</Text>
              <Text variant="bodyLg">
                The requested use case could not be found.
              </Text>
            </div>
          </div>
        ) : (
          <PublishedUseCase
            useCase={UseCaseDetails.useCaseBySlug}
            pageSlug={UseCaseDetails.useCaseBySlug.urlSlug || pageSegment}
          />
        )}
      </div>
    </>
  );
};

function PublishedUseCase({
  useCase,
  pageSlug,
}: {
  useCase: NonNullable<UseCasedetailsQuery['useCaseBySlug']>;
  pageSlug: string;
}) {
  // Shape the cover from the published record.
  const cover = buildUseCaseCover(useCase);
  // Public address the share actions use.
  const pageUrl = buildUseCasePageUrl(pageSlug);
  // Section titles inside the story, for the contents list.
  const headings = storyHeadings(useCase.summary);
  // People and organisations attached to this use case.
  const contributors = buildRailContributors(useCase);
  // Tags, goals, and sectors that open search.
  const topics = buildUseCaseTopics(useCase);

  return (
    <>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/usecases', label: 'Use Cases' },
          { href: '#', label: cover.title },
        ]}
      />
      <EntityCover
        backHref="/usecases"
        title={cover.title}
        description={cover.description}
        imageSrc={cover.imageSrc}
        imageAlt={cover.imageAlt}
        publisher={cover.publisher}
        meta={cover.meta}
      />
      <div className="bg-white">
        <div className="mx-auto w-full max-w-[1760px] px-4 py-8 md:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
            <StoryRail>
              <SharePanel
                label="Share this use case"
                url={pageUrl}
                title={cover.title}
              />
              {headings.length > 0 ? <ContentsNav items={headings} /> : null}
              {contributors.length > 0 ? (
                <ContributorList people={contributors} />
              ) : null}
            </StoryRail>
            <div className="min-w-0">
              <UseCaseStory summary={useCase.summary} headings={headings} />
            </div>
          </div>
          <div className="mx-auto w-full max-w-6xl">
            <Dashboards usecaseId={String(useCase.id)} />
            <DatasetStories datasets={useCase.datasets ?? []} />
            <TopicBar
              tags={topics.tags}
              sdgs={topics.sdgs}
              sectors={topics.sectors}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default UseCaseDetailClient;
