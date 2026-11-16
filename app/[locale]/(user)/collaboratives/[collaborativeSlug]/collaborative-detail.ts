/**
 * Turns one published collaborative into what the public page shows: the
 * hero counts and SDG goals, the facts under "About", and plain rows for the
 * use cases, publications, datasets, organisations, and people it connects.
 * Rows stay plain data so the server can hand them to the client explorer.
 */

import { getUseCaseSummaryExcerpt } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import type { PublicCollaborativeDetailsQuery } from '@/gql/generated/graphql';

import {
  backendFileUrl,
  formatShortDate,
  joinNames,
  organizationPublisherHref,
  personPublisherHref,
  plainTextFromHtml,
  uniqueNames,
} from '@/lib/public-entity';
import { publicHref } from '@/lib/public-link';

export type CollaborativeRecord = NonNullable<
  PublicCollaborativeDetailsQuery['collaborativeBySlug']
>;

export type ResourceKind = 'use-case' | 'publication' | 'dataset';

/** One use case, publication, or dataset card in the explorer. */
export type ResourceRow = {
  id: string;
  kind: ResourceKind;
  title: string;
  description: string;
  href: string;
  imageSrc: string | null;
  /** ISO date used for "newest first". */
  sortDate: string | null;
  dateLabel: string | null;
  geography: string | null;
  sector: string | null;
  /** Publication type, e.g. "Policy brief". */
  typeLabel: string | null;
  downloadCount: number;
  publisherName: string | null;
  publisherImage: string;
  /** Words a search box can match against, in lower case. */
  searchText: string;
};

/** One organisation or person in the explorer. */
export type MemberRow = {
  id: string;
  name: string;
  href: string;
  imageSrc: string | null;
  caption: string | null;
};

export type SdgGoal = {
  id: string;
  number: string;
  name: string;
  description: string | null;
  imageSrc: string | null;
};

/** Organisations, people, and connected resources the page can show. */
export type CollaborativeExploreData = {
  useCases: ResourceRow[];
  publications: ResourceRow[];
  datasets: ResourceRow[];
  organisations: MemberRow[];
  people: MemberRow[];
};

/**
 * `linkBase` is put in front of every link: empty on the main site, the
 * platform address on a collaborative's own subdomain.
 */
export function collaborativeExploreData(
  collaborative: CollaborativeRecord,
  linkBase = ''
): CollaborativeExploreData {
  const withBase = <Row extends { href: string }>(rows: Row[]): Row[] =>
    rows.map((row) => ({ ...row, href: `${linkBase}${row.href}` }));

  return {
    useCases: withBase((collaborative.useCases ?? []).map(useCaseRow)),
    publications: withBase(
      (collaborative.publications ?? []).map(publicationRow)
    ),
    datasets: withBase((collaborative.datasets ?? []).map(datasetRow)),
    organisations: withBase(organisationRows(collaborative)),
    people: withBase(peopleRows(collaborative)),
  };
}

function peopleRows(collaborative: CollaborativeRecord): MemberRow[] {
  return (collaborative.contributors ?? []).flatMap((person) => {
    const name = person.fullName?.trim();
    if (!name) return [];
    return [
      {
        id: `person-${person.id}`,
        name,
        href: personPublisherHref(name, person.id),
        imageSrc: backendFileUrl(person.profilePicture?.url),
        caption: 'Contributor',
      },
    ];
  });
}

/** SDG goals with the badge image that ships in `/public/SDG`. */
export function collaborativeSdgs(
  collaborative: CollaborativeRecord
): SdgGoal[] {
  return (collaborative.sdgs ?? []).map((sdg) => {
    const number =
      sdg.number != null
        ? String(sdg.number)
        : sdg.code.replace(/\D/g, '').replace(/^0+/, '');
    return {
      id: sdg.id,
      number,
      name: sdg.name.trim(),
      description: sdg.description?.trim() || null,
      imageSrc: number ? `/SDG/SDG${number}.png` : null,
    };
  });
}

/** Description as plain text, for metadata and search results. */
export function collaborativeSummaryText(summary?: string | null): string {
  return summary ? plainTextFromHtml(summary) : '';
}

/** Lower-case words of a search query. An empty query matches everything. */
export function searchWords(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesWords(text: string, words: string[]): boolean {
  return words.every((word) => text.includes(word));
}

function useCaseRow(
  useCase: NonNullable<CollaborativeRecord['useCases']>[number]
): ResourceRow {
  const title = useCase.title?.trim() || 'Untitled use case';
  const description = getUseCaseSummaryExcerpt(useCase.summary);
  const geography = joinNames(useCase.geographies?.map((item) => item.name));
  const sector = useCase.sectors?.[0]?.name?.trim() || null;
  const tags = uniqueNames(useCase.tags?.map((tag) => tag.value));
  const individual = useCase.isIndividualUsecase;
  return {
    id: `use-case-${useCase.id}`,
    kind: 'use-case',
    title,
    description,
    href: publicHref('usecases', useCase.urlSlug, useCase.id),
    imageSrc: backendFileUrl(useCase.logo?.url),
    sortDate: useCase.modified ?? null,
    dateLabel: formatShortDate(useCase.modified),
    geography,
    sector,
    typeLabel: null,
    downloadCount: 0,
    ...publisherOf(individual, useCase.user, useCase.organization),
    searchText: searchable(title, description, geography, sector, ...tags),
  };
}

function publicationRow(
  publication: NonNullable<CollaborativeRecord['publications']>[number]
): ResourceRow {
  const title = publication.title.trim() || 'Untitled publication';
  const description = publication.description?.trim() || '';
  const geography = joinNames(publication.geographies.map((item) => item.name));
  const sector = publication.sectors[0]?.name?.trim() || null;
  const typeLabel = publication.resourceType?.name ?? null;
  const date = publication.publicationDate ?? publication.created ?? null;
  return {
    id: `publication-${publication.id}`,
    kind: 'publication',
    title,
    description,
    href: publicHref('publications', publication.urlSlug, publication.id),
    imageSrc: null,
    sortDate: date,
    dateLabel: formatShortDate(date),
    geography,
    sector,
    typeLabel,
    downloadCount: 0,
    ...publisherOf(
      publication.isIndividualPublication,
      publication.user,
      publication.organization
    ),
    searchText: searchable(title, description, geography, sector, typeLabel),
  };
}

function datasetRow(
  dataset: NonNullable<CollaborativeRecord['datasets']>[number]
): ResourceRow {
  const title = dataset.title?.trim() || 'Untitled dataset';
  // Markdown is stripped in the client card; the helper lives in a client file.
  const description = dataset.description?.trim() || '';
  const geography = joinNames(dataset.geographies?.map((item) => item.name));
  const sector = dataset.sectors?.[0]?.name?.trim() || null;
  return {
    id: `dataset-${dataset.id}`,
    kind: 'dataset',
    title,
    description,
    href: publicHref('datasets', dataset.urlSlug, dataset.id),
    imageSrc: null,
    sortDate: dataset.modified ?? null,
    dateLabel: formatShortDate(dataset.modified),
    geography,
    sector,
    typeLabel: null,
    downloadCount: dataset.downloadCount ?? 0,
    ...publisherOf(
      dataset.isIndividualDataset,
      dataset.user,
      dataset.organization
    ),
    searchText: searchable(title, description, geography, sector),
  };
}

type PublisherPerson = {
  fullName?: string | null;
  profilePicture?: { url?: string | null } | null;
} | null;

type PublisherOrganisation = {
  name?: string | null;
  logo?: { url?: string | null } | null;
} | null;

function publisherOf(
  individual: boolean | null | undefined,
  user: PublisherPerson | undefined,
  organization: PublisherOrganisation | undefined
): Pick<ResourceRow, 'publisherName' | 'publisherImage'> {
  if (individual) {
    return {
      publisherName: user?.fullName?.trim() || null,
      publisherImage:
        backendFileUrl(user?.profilePicture?.url) ?? '/profile.png',
    };
  }
  return {
    publisherName: organization?.name?.trim() || null,
    publisherImage: backendFileUrl(organization?.logo?.url) ?? '/org.png',
  };
}

/** Partners first, then supporters; an organisation listed twice shows once. */
function organisationRows(collaborative: CollaborativeRecord): MemberRow[] {
  const groups = [
    { caption: 'Partner', items: collaborative.partnerOrganizations ?? [] },
    {
      caption: 'Supporter',
      items: collaborative.supportingOrganizations ?? [],
    },
  ];
  const rows: MemberRow[] = [];
  for (const { caption, items } of groups) {
    for (const organisation of items) {
      const name = organisation.name?.trim();
      const id = `org-${organisation.id}`;
      if (!name || rows.some((row) => row.id === id)) continue;
      rows.push({
        id,
        name,
        href: organizationPublisherHref({
          name,
          slug: organisation.slug,
          id: organisation.id,
        }),
        imageSrc: backendFileUrl(organisation.logo?.url),
        caption,
      });
    }
  }
  return rows;
}

function searchable(...values: Array<string | null | undefined>): string {
  return values.filter(Boolean).join(' ').toLowerCase();
}
