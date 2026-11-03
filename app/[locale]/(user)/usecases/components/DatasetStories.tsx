'use client';

import { Card } from 'opub-ui';

import { backendFileUrl } from '@/lib/public-entity';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { stripMarkdown } from '../../search/components/UnifiedListingComponent';

type StoryDataset = {
  id: string;
  title?: string | null;
  description?: string | null;
  modified?: string | null;
  downloadCount?: number | null;
  isIndividualDataset?: boolean | null;
  user?: {
    fullName?: string | null;
    profilePicture?: { url?: string | null } | null;
  } | null;
  organization?: {
    name?: string | null;
    logo?: { url?: string | null } | null;
  } | null;
  sectors?: Array<{ name?: string | null }> | null;
  geographies?: Array<{ name?: string | null }> | null;
};

type DatasetStoriesProps = {
  datasets: StoryDataset[];
};

export function DatasetStories({ datasets }: DatasetStoriesProps) {
  const rows = datasets.filter(
    (dataset) => dataset.title?.trim() && dataset.id
  );
  if (rows.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-[24px] font-semi-bold leading-[30px] text-[#0a0a0a]">
        Datasets behind this story
      </h2>
      <ul className="mt-4 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((dataset) => (
          <li key={dataset.id}>
            <Card {...listingCardProps(dataset)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

type CardMeta = {
  icon: (typeof Icons)[keyof typeof Icons];
  label: string;
  value: string | number;
  tooltip: string;
  stroke: number;
};

/** Card metadata accepts at most three rows, typed as a tuple. */
function firstThree<T>(
  items: T[]
): readonly [] | readonly [T] | readonly [T, T] | readonly [T, T, T] {
  const [first, second, third] = items;
  if (first === undefined) return [];
  if (second === undefined) return [first];
  if (third === undefined) return [first, second];
  return [first, second, third];
}

function listingCardProps(dataset: StoryDataset) {
  const geographies = (dataset.geographies ?? [])
    .map((geography) => geography.name?.trim())
    .filter((name): name is string => Boolean(name));
  const metadata: CardMeta[] = [
    {
      icon: Icons.calendarEvent,
      label: 'Date',
      value: formatDate(dataset.modified ?? null) || '',
      tooltip: 'Date',
      stroke: 1.2,
    },
  ];

  if ((dataset.downloadCount ?? 0) > 0) {
    metadata.push({
      icon: Icons.fileDownload,
      label: 'Download',
      value: dataset.downloadCount || 0,
      tooltip: 'Download',
      stroke: 1.2,
    });
  }

  if (geographies.length > 0) {
    const places = geographies.join(', ');
    metadata.push({
      icon: Icons.worldPin,
      label: 'Geography',
      value: places,
      tooltip: places,
      stroke: 1.2,
    });
  }

  const sector = dataset.sectors?.[0]?.name?.trim();
  const publisher = dataset.isIndividualDataset
    ? dataset.user?.fullName
    : dataset.organization?.name;
  const picture = dataset.isIndividualDataset
    ? dataset.user?.profilePicture?.url
    : dataset.organization?.logo?.url;

  return {
    title: dataset.title ?? '',
    description: stripMarkdown(dataset.description || ''),
    metadataContent: firstThree(metadata),
    leftFooterChips: sector
      ? [{ icon: `/Sectors/${sector}.svg`, label: 'Sectors', tooltip: sector }]
      : [],
    rightFooterChips: [
      {
        icon:
          backendFileUrl(picture) ??
          (dataset.isIndividualDataset ? '/profile.png' : '/org.png'),
        label: 'Published by',
        tooltip: publisher || 'Published by',
      },
    ],
    variation: 'collapsed' as const,
    iconColor: 'warning' as const,
    href: `/datasets/${dataset.id}`,
    withViewButton: false,
  };
}
