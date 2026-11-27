'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconArrowUpRight,
  IconCalendarWeek,
  IconDownload,
  IconFileText,
  IconScale,
  IconShare,
  IconWorldMap,
} from '@tabler/icons-react';
import { Button, Popover } from 'opub-ui';

import { Icons } from '@/components/icons';
import { SharePanel } from '@/components/share-panel/SharePanel';
import type { PublicationMediaItem } from '../publication-detail';

type PublicationCoverProps = {
  backHref: string;
  pageUrl: string;
  title: string;
  description: string | null;
  resourceType: string | null;
  sectors: string[];
  geographies: string[];
  authors: string[];
  publisherName: string | null;
  illustration: string;
  license: string | null;
  publishedOn: string | null;
  sourceHref: string | null;
  files: Extract<PublicationMediaItem, { kind: 'file' }>[];
};

export function PublicationCover({
  backHref,
  pageUrl,
  title,
  description,
  resourceType,
  sectors,
  geographies,
  authors,
  publisherName,
  illustration,
  license,
  publishedOn,
  sourceHref,
  files,
}: PublicationCoverProps) {
  const typeLabel = (resourceType || 'Publication').toLowerCase();
  const onlyFile = files.length === 1 ? files[0] : null;
  const topics = [
    ...sectors.map((name) => ({ name, filter: 'sectors' })),
    ...geographies.map((name) => ({ name, filter: 'geographies' })),
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto box-border flex min-w-0 max-w-[1480px] flex-col gap-4 px-4 pt-8 text-[#0a0a0a] md:px-6 lg:px-8 lg:pt-10 xl:px-10">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Link
            href={backHref}
            className="-ml-3 inline-flex h-9 w-fit items-center gap-2 rounded-[10px] px-3 text-100 font-medium leading-[20px] text-[#6b6b6b] transition-colors hover:bg-[#e4e4e6] hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
          >
            <Icons.back size={16} stroke={2} className="shrink-0" aria-hidden />
            Back
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            {files.length > 0 ? (
              <Button
                kind="primary"
                url={onlyFile?.downloadHref ?? '#files-and-media'}
                external={Boolean(onlyFile?.downloadHref)}
                className="!inline-flex !h-[44px] !items-center !justify-center !gap-2 !rounded-[10px] !bg-primaryBlue !px-6 !py-0 !text-[16px] !font-medium !leading-[24px] !text-white hover:!bg-[#234c74]"
              >
                <span className="inline-flex items-center gap-2 text-[16px] font-medium leading-[24px]">
                  <IconDownload size={16} stroke={2} aria-hidden />
                  {onlyFile
                    ? `Download${onlyFile.extension ? ` ${onlyFile.extension}` : ''}`
                    : 'Download files'}
                </span>
              </Button>
            ) : null}
            <Popover>
              <Popover.Trigger>
                <Button
                  kind="tertiary"
                  accessibilityLabel={`Share ${typeLabel}`}
                  // opub-ui Button forwards extra props to the element, but its type omits `title`.
                  {...{ title: 'Share' }}
                  className="!m-0 !inline-flex !size-[44px] !min-h-[44px] !min-w-[44px] !items-center !justify-center !rounded-full !border-1 !border-solid !border-primaryBlue !bg-transparent !p-0 !leading-0 !text-primaryBlue hover:!bg-[#0b3865]/5"
                >
                  <IconShare
                    size={20}
                    stroke={2}
                    aria-hidden
                    className="block"
                  />
                </Button>
              </Popover.Trigger>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={8}
                className="!m-0 !box-border !w-[256px] !rounded-[10px] !border-[0.8px] !border-solid !border-[#e5e5e5] !bg-white !p-4 !font-primary !text-100 !leading-3 !text-[#0a0a0a] !shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)]"
              >
                <SharePanel
                  label={`Share this ${typeLabel}`}
                  url={pageUrl}
                  title={title}
                />
              </Popover.Content>
            </Popover>
          </div>
        </div>

        <div className="box-border flex min-w-0 flex-col gap-8 rounded-[16px] bg-[#f4f4f5] p-6 sm:p-8 lg:gap-10 lg:p-10">
          <div className="flex items-center justify-between gap-8">
            <div className="flex min-w-0 flex-col gap-5 sm:w-[68%] sm:flex-none">
              {resourceType ? (
                <span className="w-fit rounded-full bg-primaryBlue px-[14px] py-1 text-100 font-medium leading-[17.5px] text-white">
                  {resourceType}
                </span>
              ) : null}
              <h1 className="min-w-0 text-pretty break-words font-primary text-[26px] font-semi-bold leading-[1.1] tracking-[0] text-primaryBlue md:text-[28px]">
                {title}
              </h1>
              {description ? (
                <p className="max-w-3xl whitespace-pre-line text-100 font-regular leading-[21px] text-[#6b6b6b]">
                  {description}
                </p>
              ) : null}
              {topics.length > 0 ? (
                <ul
                  className="m-0 flex list-none flex-wrap gap-2 p-0"
                  aria-label="Topics"
                >
                  {topics.map((topic) => (
                    <li key={`${topic.filter}-${topic.name}`}>
                      <Link
                        href={`/publications?${new URLSearchParams({ [topic.filter]: topic.name })}`}
                        className="inline-flex items-center rounded-full border-1 border-solid border-[#e5e5e5] bg-[#f5f5f5] px-[10px] py-[2px] font-primary text-[12px] font-medium leading-[16px] text-[#6b6b6b] transition-colors hover:bg-secondaryOrange hover:text-primaryBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
                      >
                        {topic.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex items-center gap-3">
                {authors.length > 0 ? (
                  <div className="flex shrink-0 -space-x-2" aria-hidden>
                    {authors.slice(0, 3).map((name) => (
                      <InitialsAvatar
                        key={name}
                        name={name}
                        className="ring-2 ring-[#f4f4f5]"
                      />
                    ))}
                  </div>
                ) : null}
                <p className="min-w-0 text-100 leading-[21px]">
                  {authors.length > 0 ? (
                    <span className="block font-medium text-[#0a0a0a]">
                      {authors.join(', ')}
                    </span>
                  ) : null}
                  {publisherName ? (
                    <span
                      className={
                        authors.length > 0
                          ? 'block text-[#6b6b6b]'
                          : 'block font-medium text-[#0a0a0a]'
                      }
                    >
                      Published by {publisherName}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <Image
              src={illustration}
              alt=""
              width={208}
              height={230}
              aria-hidden
              className="hidden h-auto w-[144px] shrink-0 object-contain sm:block md:w-[176px] lg:mr-6 lg:w-[208px]"
            />
          </div>

          <FactTiles
            label={`${resourceType ?? 'Publication'} details`}
            facts={[
              license
                ? {
                    id: 'license',
                    icon: IconScale,
                    label: 'Licence',
                    value: license,
                  }
                : null,
              files.length > 0
                ? {
                    id: 'files',
                    icon: IconFileText,
                    label: files.length > 1 ? 'Files' : 'File',
                    value:
                      files.length > 1
                        ? `${files.length} files`
                        : [files[0].extension, files[0].sizeLabel]
                            .filter(Boolean)
                            .join(' · '),
                  }
                : null,
              publishedOn
                ? {
                    id: 'published',
                    icon: IconCalendarWeek,
                    label: 'Published',
                    value: publishedOn,
                  }
                : null,
              sourceHref
                ? {
                    id: 'source',
                    icon: IconWorldMap,
                    label: 'Source',
                    value: (
                      <a
                        href={sourceHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-[2px] rounded-1 underline-offset-2 hover:text-primaryBlue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primaryBlue"
                      >
                        <span className="truncate">Original publication</span>
                        <IconArrowUpRight
                          size={14}
                          className="shrink-0"
                          aria-hidden
                        />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ),
                  }
                : null,
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/** On wide screens the tiles share one row: up to licence, files, date, source. */
const FACT_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

type Fact = {
  id: string;
  icon: typeof IconScale;
  label: string;
  value: ReactNode;
};

function FactTiles({
  label,
  facts,
}: {
  label: string;
  facts: Array<Fact | null>;
}) {
  const shown = facts.filter((fact): fact is Fact => fact !== null);
  if (!shown.length) return null;

  return (
    <ul
      aria-label={label}
      className={`m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 ${FACT_COLUMNS[shown.length]}`}
    >
      {shown.map(({ id, icon: FactIcon, label: factLabel, value }) => (
        <li
          key={id}
          className="flex min-w-0 items-center gap-5 rounded-[14px] bg-[rgba(255,255,255,0.8)] px-6 py-5"
        >
          <FactIcon
            size={36}
            stroke={1.5}
            className="shrink-0 text-[#727272]"
            aria-hidden
          />
          <div className="flex min-w-0 flex-col gap-[2px]">
            <span className="text-75 font-medium uppercase leading-1 tracking-[0.05em] text-[#6b6b6b]">
              {factLabel}
            </span>
            <span className="truncate text-100 font-medium leading-[17.5px] text-[#727272]">
              {value}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A contributor with no photo: initials on the amber accent, like the design. */
export function InitialsAvatar({
  name,
  className = '',
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-1 border-solid border-[#e5e5e5] bg-secondaryOrange text-100 font-semi-bold text-primaryBlue ${className}`}
    >
      {initials || '?'}
    </span>
  );
}
