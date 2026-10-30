/**
 * Turns one published use case into the public cover: title, subtitle,
 * thumbnail, publisher, place, and published date.
 * Also builds the public page address used by the share actions.
 */

import { parseUseCaseContent } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import type {
  EntityCoverMeta,
  EntityCoverPublisher,
} from '@/components/entity-cover/EntityCover';
import { env } from '@/env';
import {
  backendFileUrl,
  formatShortDate,
  joinNames,
  organizationPublisherHref,
  personPublisherHref,
} from '@/lib/public-entity';

export type UseCaseCoverSource = {
  title?: string | null;
  summary?: string | null;
  created?: string | number | null;
  isIndividualUsecase?: boolean | null;
  logo?: { path?: string | null } | null;
  user?: {
    id: string;
    fullName: string;
    profilePicture?: { url: string } | null;
  } | null;
  organization?: {
    id: string;
    name: string;
    slug?: string | null;
    logo?: { url: string } | null;
  } | null;
  geographies?: Array<{ name?: string | null }> | null;
};

export type UseCaseCover = {
  title: string;
  description: string | null;
  imageSrc: string | null;
  imageAlt: string;
  publisher: EntityCoverPublisher | null;
  meta: EntityCoverMeta[];
};

export function buildUseCasePageUrl(slug: string): string {
  const base = env.NEXT_PUBLIC_PLATFORM_URL.replace(/\/$/, '');
  return `${base}/usecases/${encodeURIComponent(slug)}`;
}

export function buildUseCaseCover(useCase: UseCaseCoverSource): UseCaseCover {
  const title = useCase.title?.trim() || 'Use case';
  const description = parseUseCaseContent(useCase.summary).subtitle.trim();
  const publisher = publisherFrom(useCase);
  const meta: EntityCoverMeta[] = [];
  const location = joinNames(useCase.geographies?.map((place) => place.name));
  const publishedOn = formatShortDate(useCase.created);
  const published = publishedOn ? `Published ${publishedOn}` : null;

  if (location) meta.push({ id: 'location', label: location });
  if (published) meta.push({ id: 'published', label: published });

  return {
    title,
    description: description || null,
    imageSrc: backendFileUrl(useCase.logo?.path, { stripCodeFiles: true }),
    imageAlt: title,
    publisher,
    meta,
  };
}

function publisherFrom(
  useCase: UseCaseCoverSource
): EntityCoverPublisher | null {
  if (
    useCase.isIndividualUsecase &&
    useCase.user?.fullName &&
    useCase.user.id
  ) {
    const name = useCase.user.fullName.trim();
    return {
      name,
      href: personPublisherHref(name, useCase.user.id),
      imageSrc: backendFileUrl(useCase.user.profilePicture?.url),
      imageAlt: name,
      kindLabel: 'Individual',
    };
  }

  const organization = useCase.organization;
  if (!organization?.name || !organization.id) return null;

  const name = organization.name.trim();
  return {
    name,
    href: organizationPublisherHref({
      name,
      slug: organization.slug,
      id: organization.id,
    }),
    imageSrc: backendFileUrl(organization.logo?.url),
    imageAlt: name,
    kindLabel: 'Organisation',
  };
}
