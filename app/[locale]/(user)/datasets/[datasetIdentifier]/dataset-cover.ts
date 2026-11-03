/**
 * Turns one published dataset into the public summary card: the description,
 * where the dataset is used, the file facts, and the footer facts.
 * Also builds the public page address used by the share actions.
 */

import { env } from '@/env';
import {
  backendFileUrl,
  formatShortDate,
  joinNames,
  organizationPublisherHref,
  personPublisherHref,
  plainTextFromHtml,
  websiteLabel,
} from '@/lib/public-entity';

export type DatasetCoverDataset = {
  id: string;
  title: string;
  description?: string | null;
  downloadCount: number;
  created?: string | number | null;
  modified?: string | number | null;
  license?: string | null;
  formats?: Array<string | null> | null;
  isIndividualDataset: boolean;
  resources?: Array<{ id: string; noOfEntries?: number | null }> | null;
  tags?: Array<{ id?: string | null; value?: string | null }> | null;
  accessType?: string | null;
  metadata?: Array<{
    value?: string | null;
    metadataItem?: {
      id?: string | null;
      label?: string | null;
      dataType?: string | null;
    } | null;
  }> | null;
  source?: {
    sourceHomepage?: string | null;
    sourceUrl?: string | null;
    platform?: string | null;
  } | null;
  sectors?: Array<{ name?: string | null }> | null;
  geographies?: Array<{ name?: string | null }> | null;
  user?: {
    fullName?: string | null;
    id?: string | null;
    bio?: string | null;
    location?: string | null;
    profilePicture?: { url?: string | null } | null;
  } | null;
  organization?: {
    name?: string | null;
    slug?: string | null;
    id?: string | null;
    description?: string | null;
    location?: string | null;
    logo?: { url?: string | null } | null;
  } | null;
};

export type DatasetCoverLink = {
  id: string;
  slug?: string | null;
  datasets?: Array<{ id?: string | null }> | null;
};

export type DatasetCoverLinks = {
  useCases: DatasetCoverLink[] | null;
  collaboratives: DatasetCoverLink[] | null;
  visualisationCount: number | null;
};

export type DatasetCoverUsageItem = {
  label: string;
  href: string;
};

export type DatasetCoverPublisher = {
  name: string;
  href: string;
  imageSrc: string | null;
  imageAlt: string;
};

export type DatasetCoverSourceLink = {
  label: string;
  href: string;
};

export type DatasetCoverDownload = {
  href: string | null;
  external: boolean;
};

export type DatasetCover = {
  title: string;
  description: string | null;
  usage: {
    useCases: DatasetCoverUsageItem;
    collaboratives: DatasetCoverUsageItem;
    visualisations: DatasetCoverUsageItem;
  } | null;
  recordCount: string;
  downloadCount: string;
  fileCount: string;
  fileTypes: string | null;
  sector: string | null;
  geography: string | null;
  license: string | null;
  source: DatasetCoverSourceLink | null;
  updated: string | null;
  publisher: DatasetCoverPublisher | null;
  download: DatasetCoverDownload;
};

const LICENSE_LABELS: Record<string, string> = {
  GOVERNMENT_OPEN_DATA_LICENSE: 'Government Open Data License',
  CC_BY_4_0_ATTRIBUTION: 'CC BY 4.0',
  CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE: 'CC BY-SA 4.0',
  OPEN_DATA_COMMONS_BY_ATTRIBUTION: 'Open Data Commons By Attribution',
  OPEN_DATABASE_LICENSE: 'Open Database License',
};

const FILES_ANCHOR = '#dataset-files';
const CHARTS_ANCHOR = '#dataset-visualisations';
const CONNECTED_USE_CASES = '#dataset-connected-usecases';
const CONNECTED_COLLABORATIVES = '#dataset-connected-collaboratives';

export function buildDatasetPageUrl(datasetId: string): string {
  const base = env.NEXT_PUBLIC_PLATFORM_URL.replace(/\/$/, '');
  return `${base}/datasets/${encodeURIComponent(datasetId)}`;
}

export function buildDatasetCover(
  dataset: DatasetCoverDataset,
  links: DatasetCoverLinks
): DatasetCover {
  const resources = dataset.resources ?? [];
  const download = downloadTarget(resources);

  return {
    title: dataset.title.trim() || 'Dataset',
    description: plainText(dataset.description),
    usage: usageSentence(dataset.id, links),
    recordCount: formatCount(recordTotal(resources)),
    downloadCount: formatCount(dataset.downloadCount),
    fileCount: formatCount(resources.length),
    fileTypes: fileTypeLabel(dataset.formats ?? []),
    sector: joinNames(dataset.sectors?.map((item) => item.name)),
    geography: joinNames(dataset.geographies?.map((item) => item.name)),
    license: licenseLabel(dataset.license),
    source: sourceLink(dataset),
    updated: formatShortDate(dataset.modified),
    publisher: publisherFrom(dataset),
    download,
  };
}

function usageSentence(
  datasetId: string,
  links: DatasetCoverLinks
): DatasetCover['usage'] {
  if (
    links.useCases === null ||
    links.collaboratives === null ||
    links.visualisationCount === null
  ) {
    return null;
  }

  const useCases = matchesFor(datasetId, links.useCases);
  const collaboratives = matchesFor(datasetId, links.collaboratives);

  return {
    useCases: {
      label: countedLabel(useCases.length, 'use case', 'use cases'),
      href: CONNECTED_USE_CASES,
    },
    collaboratives: {
      label: countedLabel(
        collaboratives.length,
        'collaborative',
        'collaboratives'
      ),
      href: CONNECTED_COLLABORATIVES,
    },
    visualisations: {
      label: countedLabel(
        links.visualisationCount,
        'visualisation',
        'visualisations'
      ),
      href: CHARTS_ANCHOR,
    },
  };
}

/** The use cases or collaboratives that list this dataset. */
export function matchesFor(
  datasetId: string,
  items: DatasetCoverLink[]
): DatasetCoverLink[] {
  return items.filter((item) =>
    (item.datasets ?? []).some((dataset) => dataset.id === datasetId)
  );
}

function countedLabel(count: number, singular: string, plural: string): string {
  const noun = count === 1 ? singular : plural;
  return `${formatCount(count)} ${noun}`;
}

function recordTotal(
  resources: Array<{ noOfEntries?: number | null }>
): number {
  return resources.reduce((sum, resource) => {
    const rows = resource.noOfEntries;
    if (typeof rows !== 'number' || !Number.isFinite(rows) || rows < 0) {
      return sum;
    }
    return sum + rows;
  }, 0);
}

function downloadTarget(
  resources: Array<{ id: string }>
): DatasetCoverDownload {
  if (resources.length === 1) {
    const href = resourceDownloadUrl(resources[0].id);
    if (href) return { href, external: true };
  }
  if (resources.length > 0) return { href: FILES_ANCHOR, external: false };
  return { href: null, external: false };
}

function resourceDownloadUrl(resourceId: string): string | null {
  return backendFileUrl(`api/download/resource/${resourceId}`);
}

function fileTypeLabel(formats: Array<string | null>): string | null {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const format of formats) {
    const label = format?.replace(/^\./, '').trim().toUpperCase();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }

  return labels.length ? labels.join(' · ') : null;
}

export function licenseLabel(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return LICENSE_LABELS[trimmed] ?? trimmed.replace(/_/g, ' ');
}

function sourceLink(dataset: DatasetCoverDataset): DatasetCoverSourceLink | null {
  const metadataUrl = (dataset.metadata ?? []).find(
    (item) => item.metadataItem?.dataType === 'URL' && item.value?.trim()
  )?.value;
  const raw = metadataUrl?.trim() || dataset.source?.sourceHomepage?.trim();
  if (!raw) return null;

  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const label = websiteLabel(href);
  if (!label) return null;
  return { label, href };
}

function publisherFrom(
  dataset: DatasetCoverDataset
): DatasetCoverPublisher | null {
  if (dataset.isIndividualDataset && dataset.user?.fullName && dataset.user.id) {
    const name = dataset.user.fullName.trim();
    return {
      name,
      href: personPublisherHref(name, dataset.user.id),
      imageSrc: backendFileUrl(dataset.user.profilePicture?.url),
      imageAlt: name,
    };
  }

  const organization = dataset.organization;
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
  };
}

function plainText(value: string | null | undefined): string | null {
  if (!value) return null;
  return plainTextFromHtml(value) || null;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}
