/**
 * Turns one published dataset into the rows on the public Metadata tab.
 * The summary card already shows the short version. This is the full record,
 * including tags and any extra notes the provider attached.
 */

import {
  backendFileUrl,
  formatShortDate,
  joinNames,
  organizationPublisherHref,
  personPublisherHref,
  uniqueNames,
  websiteLabel,
} from '@/lib/public-entity';
import { licenseLabel, type DatasetCoverDataset } from './dataset-cover';

export type MetadataFact = {
  id: string;
  label: string;
  value: string;
  href?: string;
};

const ACCESS_LABELS: Record<string, string> = {
  PUBLIC: 'Open Access',
  RESTRICTED: 'Restricted Access',
  PRIVATE: 'Private',
};

export type MetadataPublisher = {
  name: string;
  href: string;
  imageSrc: string | null;
  bio: string | null;
  location: string | null;
};

export type MetadataPanel = {
  description: string;
  facts: MetadataFact[];
  tags: string[];
  licenseTermsHref: string | null;
  sources: MetadataFact[];
  notes: MetadataFact[];
  publisher: MetadataPublisher | null;
};

const LICENSE_TERMS_URLS: Record<string, string> = {
  GOVERNMENT_OPEN_DATA_LICENSE:
    'https://data.gov.in/government-open-data-license-india',
  CC_BY_4_0_ATTRIBUTION: 'https://creativecommons.org/licenses/by/4.0/',
  CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE:
    'https://creativecommons.org/licenses/by-sa/4.0/',
  OPEN_DATA_COMMONS_BY_ATTRIBUTION: 'https://opendatacommons.org/licenses/by/1.0/',
  OPEN_DATABASE_LICENSE: 'https://opendatacommons.org/licenses/odbl/1-0/',
};

export function buildMetadataPanel(
  dataset: DatasetCoverDataset
): MetadataPanel {
  const facts: MetadataFact[] = [];
  pushName(facts, 'sector', 'Sector', dataset.sectors);
  pushName(facts, 'geography', 'Geography', dataset.geographies);

  const publisher = publisherName(dataset);
  if (publisher) {
    facts.push({ id: 'publisher', label: 'Publisher', value: publisher });
  }

  const created = formatShortDate(dataset.created);
  if (created) facts.push({ id: 'created', label: 'Created', value: created });

  const updated = formatShortDate(dataset.modified);
  if (updated) {
    facts.push({ id: 'updated', label: 'Last updated', value: updated });
  }

  const access = dataset.accessType
    ? ACCESS_LABELS[dataset.accessType] || dataset.accessType
    : null;
  if (access) facts.push({ id: 'access', label: 'Access', value: access });

  const license = licenseLabel(dataset.license);
  if (license) facts.push({ id: 'license', label: 'Licence', value: license });

  if (dataset.downloadCount > 0) {
    facts.push({
      id: 'downloads',
      label: 'Downloads',
      value: dataset.downloadCount.toLocaleString('en-US'),
    });
  }

  const provenance = provenanceFacts(dataset);

  return {
    description: dataset.description?.trim() || '',
    facts,
    tags: uniqueNames(dataset.tags?.map((tag) => tag.value)),
    licenseTermsHref: dataset.license
      ? (LICENSE_TERMS_URLS[dataset.license] ?? null)
      : null,
    sources: provenance.sources,
    notes: provenance.notes,
    publisher: metadataPublisher(dataset),
  };
}

function publisherName(dataset: DatasetCoverDataset): string | null {
  if (dataset.isIndividualDataset) return dataset.user?.fullName?.trim() || null;
  return dataset.organization?.name?.trim() || null;
}

function metadataPublisher(
  dataset: DatasetCoverDataset
): MetadataPublisher | null {
  if (dataset.isIndividualDataset && dataset.user?.fullName && dataset.user.id) {
    const name = dataset.user.fullName.trim();
    return {
      name,
      href: personPublisherHref(name, dataset.user.id),
      imageSrc: backendFileUrl(dataset.user.profilePicture?.url),
      bio: dataset.user.bio?.trim() || null,
      location: dataset.user.location?.trim() || null,
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
    bio: organization.description?.trim() || null,
    location: organization.location?.trim() || null,
  };
}

function provenanceFacts(dataset: DatasetCoverDataset): {
  sources: MetadataFact[];
  notes: MetadataFact[];
} {
  const sources: MetadataFact[] = [];
  const seen = new Set<string>();

  const addSource = (id: string, label: string | null | undefined, raw: string) => {
    const href = withProtocol(raw);
    const key = href.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    sources.push({
      id,
      label: label?.trim() || 'Source',
      value: sourceDisplayName(label, href),
      href,
    });
  };

  for (const item of dataset.metadata ?? []) {
    if (item.metadataItem?.dataType !== 'URL' || !item.value?.trim()) continue;
    addSource(
      item.metadataItem?.id || 'source',
      item.metadataItem?.label,
      item.value
    );
  }

  const homepage =
    dataset.source?.sourceUrl?.trim() || dataset.source?.sourceHomepage?.trim();
  if (homepage) addSource('source-homepage', dataset.source?.platform, homepage);

  const notes: MetadataFact[] = [];
  for (const item of dataset.metadata ?? []) {
    if (item.metadataItem?.dataType === 'URL') continue;
    const label = item.metadataItem?.label?.trim();
    const value = metadataValue(item.value, item.metadataItem?.dataType);
    if (!label || !value) continue;
    notes.push({
      id: item.metadataItem?.id || label,
      label,
      value,
    });
  }

  return { sources, notes };
}

function sourceDisplayName(
  label: string | null | undefined,
  href: string
): string {
  const trimmed = label?.trim() || '';
  if (!trimmed || /^(source|source website|website|url|homepage)$/i.test(trimmed)) {
    return websiteLabel(href) || href;
  }
  return trimmed;
}

function pushName(
  facts: MetadataFact[],
  id: string,
  label: string,
  items: Array<{ name?: string | null }> | null | undefined
) {
  const value = joinNames(items?.map((item) => item.name));
  if (value) facts.push({ id, label, value });
}

function metadataValue(
  value: string | null | undefined,
  dataType: string | null | undefined
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (dataType === 'DATE') return formatShortDate(trimmed) || trimmed;
  return trimmed;
}

function withProtocol(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
