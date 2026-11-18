/**
 * Turns one published publication into what the public page shows: the
 * cover illustration for its resource type, the publisher link, the files and
 * videos in their saved order, the published date, and the citation text.
 */

import { formatFileSize } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/publications/model';
import {
  PublicationBlockType,
  type PublicationDetailsQuery,
} from '@/gql/generated/graphql';

import {
  backendFileUrl,
  formatShortDate,
  organizationPublisherHref,
  personPublisherHref,
} from '@/lib/public-entity';

export type PublicationRecord = NonNullable<
  PublicationDetailsQuery['getPublication']
>;

export type PublicationPublisher = {
  name: string;
  href: string;
  imageSrc: string | null;
};

export type PublicationMediaItem =
  | {
      kind: 'file';
      id: string;
      title: string;
      description: string | null;
      fileName: string;
      extension: string;
      sizeLabel: string;
      downloadHref: string | null;
    }
  | {
      kind: 'video';
      id: string;
      title: string;
      description: string | null;
      youtubeId: string | null;
      url: string | null;
    };

const ILLUSTRATIONS: Record<string, string> = {
  'policy-brief': '/publications/policy-brief.png',
  report: '/publications/report.png',
  research: '/publications/report.png',
  'white-paper': '/publications/report.png',
  'toolkit-guide': '/publications/toolkit-guide.png',
  toolkit: '/publications/toolkit-guide.png',
  guide: '/publications/toolkit-guide.png',
  'case-study': '/publications/case-study.png',
};

/** Picture for the cover, matched on the resource type's slug or name. */
export function publicationIllustration(
  resourceType: { name: string; slug?: string | null } | null | undefined
): string {
  const key = (resourceType?.slug || resourceType?.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ILLUSTRATIONS[key] ?? '/publications/publication.png';
}

/** The organization, or the person for an individual publication. */
export function publicationPublisher(
  publication: PublicationRecord
): PublicationPublisher | null {
  const { organization, user } = publication;
  if (!publication.isIndividualPublication && organization) {
    return {
      name: organization.name,
      href: organizationPublisherHref(organization),
      imageSrc: backendFileUrl(organization.logo?.url),
    };
  }
  if (user) {
    const name = user.fullName?.trim() || 'Individual publisher';
    return {
      name,
      href: personPublisherHref(name, user.id),
      imageSrc: backendFileUrl(user.profilePicture?.url),
    };
  }
  return null;
}

/** Files and videos in the order the publisher arranged them. */
export function publicationMedia(
  publication: PublicationRecord
): PublicationMediaItem[] {
  return [...publication.blocks]
    .sort((a, b) => a.position - b.position)
    .map((block): PublicationMediaItem => {
      const description = block.description?.trim() || null;
      if (block.blockType === PublicationBlockType.Youtube) {
        return {
          kind: 'video',
          id: block.id,
          title: block.title?.trim() || 'Video',
          description,
          youtubeId: block.youtubeVideoId || null,
          url: block.youtubeUrl ?? null,
        };
      }
      const extension = (
        block.fileFormat ||
        block.fileName.split('.').pop() ||
        ''
      )
        .replace('.', '')
        .toUpperCase();
      return {
        kind: 'file',
        id: block.id,
        title: block.title?.trim() || block.fileName || 'File',
        description,
        fileName: block.fileName,
        extension,
        sizeLabel: formatFileSize(block.fileSize),
        downloadHref: backendFileUrl(
          `api/publications/blocks/${block.id}/download/`
        ),
      };
    });
}

/** Caption under a file or video in the list, e.g. `PDF · 2.4 MB`. */
export function mediaCaption(item: PublicationMediaItem): string {
  if (item.kind === 'video') return 'YouTube video';
  return [item.extension, item.sizeLabel].filter(Boolean).join(' · ');
}

/** `05 Mar 2026`, from the publication date or, failing that, when it was created. */
export function publishedOn(publication: PublicationRecord): string | null {
  return (
    formatShortDate(publication.publicationDate) ??
    formatShortDate(publication.created)
  );
}

/** One-line reference: authors (year). Title [Type]. Publisher. CivicDataSpace. */
export function publicationCitation(
  publication: PublicationRecord,
  publisherName: string | null
): string {
  const authors = publication.authors.filter(Boolean).join(', ');
  const year = String(
    publication.publicationDate || publication.created || ''
  ).slice(0, 4);
  const type = publication.resourceType?.name
    ? ` [${publication.resourceType.name}]`
    : '';
  return [
    `${authors ? `${authors} ` : ''}${year ? `(${year}). ` : ''}${publication.title}${type}.`,
    publisherName ? `${publisherName}.` : null,
    'CivicDataSpace.',
  ]
    .filter(Boolean)
    .join(' ');
}
