/**
 * People and organisations shown in the side list, and the search
 * address a tag, sector, or SDG goal opens.
 */

import {
  backendFileUrl,
  organizationPublisherHref,
  personPublisherHref,
} from '@/lib/public-entity';

export type RailContributor = {
  id: string;
  name: string;
  href: string;
  imageSrc: string | null;
  imageAlt: string;
  caption: string | null;
};

type Person = {
  id: string;
  fullName: string;
  profilePicture?: { url: string } | null;
};

type Organisation = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: { url: string } | null;
};

export type UseCaseRailSource = {
  contributors?: Person[] | null;
  supportingOrganizations?: Organisation[] | null;
  partnerOrganizations?: Organisation[] | null;
};

export function buildRailContributors(
  useCase: UseCaseRailSource
): RailContributor[] {
  const seen = new Set<string>();
  const people = (useCase.contributors ?? [])
    .map(personRow)
    .filter((row): row is RailContributor => row !== null);
  const organisations = [
    ...(useCase.supportingOrganizations ?? []),
    ...(useCase.partnerOrganizations ?? []),
  ]
    .map(organisationRow)
    .filter((row): row is RailContributor => row !== null);

  return [...people, ...organisations].filter((row) => {
    if (seen.has(row.href)) return false;
    seen.add(row.href);
    return true;
  });
}

export type TopicLabel = {
  id: string;
  label: string;
};

export type SdgTopic = TopicLabel & {
  code: string;
};

type TopicSource = {
  tags?: Array<{ id: string; value: string }> | null;
  sdgs?: Array<{ id: string; code: string; name: string }> | null;
  sectors?: Array<{ id: string; name: string }> | null;
};

export function buildUseCaseTopics(useCase: TopicSource): {
  tags: TopicLabel[];
  sdgs: SdgTopic[];
  sectors: TopicLabel[];
} {
  return {
    tags: (useCase.tags ?? [])
      .filter((tag) => tag.value.trim())
      .map((tag) => ({
        id: tag.id,
        label: tag.value.trim(),
      })),
    sdgs: (useCase.sdgs ?? [])
      .filter((sdg) => sdg.name.trim())
      .map((sdg) => ({
        id: sdg.id,
        code: sdg.code,
        label: sdg.name.trim(),
      })),
    sectors: (useCase.sectors ?? [])
      .filter((sector) => sector.name.trim())
      .map((sector) => ({
        id: sector.id,
        label: sector.name.trim(),
      })),
  };
}

export function searchHref(
  filter: 'tags' | 'sectors' | 'sdgs',
  value: string
): string {
  const params = new URLSearchParams();
  params.set(filter, value);
  params.set('types', 'usecase');
  return `/search?${params.toString()}`;
}

function personRow(person: Person): RailContributor | null {
  const name = person.fullName?.trim();
  if (!name || !person.id) return null;

  return {
    id: `person-${person.id}`,
    name,
    href: personPublisherHref(name, person.id),
    imageSrc: backendFileUrl(person.profilePicture?.url),
    imageAlt: name,
    caption: null,
  };
}

function organisationRow(organisation: Organisation): RailContributor | null {
  const name = organisation.name?.trim();
  if (!name || !organisation.id) return null;

  return {
    id: `org-${organisation.id}`,
    name,
    href: organizationPublisherHref({
      name,
      slug: organisation.slug,
      id: organisation.id,
    }),
    imageSrc: backendFileUrl(organisation.logo?.url) ?? '/org.png',
    imageAlt: name,
    caption: 'Organisation',
  };
}
