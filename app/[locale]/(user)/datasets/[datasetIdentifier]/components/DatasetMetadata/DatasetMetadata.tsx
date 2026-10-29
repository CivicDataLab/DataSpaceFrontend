'use client';

import { useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  IconArrowUpRight,
  IconBuildings,
  IconCalendarPlus,
  IconCalendarWeek,
  IconDownload,
  IconExternalLink,
  IconLock,
  IconLockOpen,
  IconMapPin,
  IconNotes,
  IconScale,
  IconStack2,
  IconTag,
  IconUser,
  IconWorld,
  IconWorldMap,
} from '@tabler/icons-react';
import { Tooltip } from 'opub-ui';

import MediaImage from '@/components/MediaImage';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import type { DatasetCoverDataset } from '../../dataset-cover';
import {
  buildMetadataPanel,
  type MetadataFact,
  type MetadataPublisher,
} from '../../dataset-metadata';

const CARD =
  'box-border rounded-[18px] border-[0.8px] border-solid border-[#e5e5e5] bg-white p-6';
const HEADING =
  'font-primary text-300 font-semi-bold leading-[26px] tracking-[0px] text-primaryBlue';
const CARD_RULE =
  '-mx-6 mt-4 border-t-[0.8px] border-solid border-[#e5e5e5] px-6 pt-6';
const LABEL =
  'font-primary text-75 font-medium uppercase leading-1 tracking-[0.6px] text-[#686868]';
const VALUE =
  'font-primary text-100 font-regular leading-2 tracking-[0px] text-[#0a0a0a]';
const FACT_ICON = 'shrink-0 text-[#727272]';

const FACT_ICONS: Record<string, IconComponent> = {
  sector: IconStack2,
  geography: IconMapPin,
  publisher: IconBuildings,
  created: IconCalendarPlus,
  updated: IconCalendarWeek,
  access: IconLock,
  license: IconScale,
  downloads: IconDownload,
  source: IconWorld,
};

type IconComponent = ComponentType<{
  size?: number;
  stroke?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

export function DatasetMetadata({ dataset }: { dataset: DatasetCoverDataset }) {
  const panel = buildMetadataPanel(dataset);
  const hasInformation =
    panel.facts.length > 0 ||
    panel.tags.length > 0 ||
    panel.sources.length > 0 ||
    panel.notes.length > 0;

  if (!panel.description && !hasInformation && !panel.publisher) {
    return (
      <p className="py-10 text-200 text-[#667085]">
        No metadata has been added for this dataset.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {panel.description ? (
        <section className={CARD}>
          <h3 className={`${HEADING} m-0`}>About this dataset</h3>
          <div className={CARD_RULE}>
            <AboutDescription content={panel.description} />
          </div>
        </section>
      ) : null}

      {hasInformation ? (
        <section className={CARD}>
          <h3 className={`${HEADING} m-0`}>Dataset information</h3>
          <div className={CARD_RULE}>
            {panel.facts.length ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {panel.facts.map((fact) => (
                  <InfoFact
                    key={fact.id}
                    fact={fact}
                    licenseTermsHref={
                      fact.id === 'license' ? panel.licenseTermsHref : null
                    }
                  />
                ))}
              </div>
            ) : null}

            {panel.tags.length ? (
              <div
                className={
                  panel.facts.length
                    ? 'mt-6 border-t-[0.8px] border-solid border-[#e5e5e5] pt-5'
                    : ''
                }
              >
                <div className="flex items-start gap-3">
                  <IconTag
                    size={24}
                    stroke={1.5}
                    className={`${FACT_ICON} mt-[13px]`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className={LABEL}>Tags</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {panel.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?types=dataset&tags=${encodeURIComponent(tag)}`}
                          className="rounded-full border-[0.8px] border-solid border-[#e5e5e5] bg-[#f6f6f7] px-3 py-1 font-primary text-75 font-regular leading-1 text-[#0a0a0a] hover:border-[#ecb771] hover:bg-[#ecb771]"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {panel.sources.length || panel.notes.length ? (
              <SourceSection
                sources={panel.sources}
                notes={panel.notes}
                hasDivider={panel.facts.length > 0 || panel.tags.length > 0}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {panel.publisher ? <PublisherCard publisher={panel.publisher} /> : null}
    </div>
  );
}

function AboutDescription({ content }: { content: string }) {
  if (!/<[a-z][\s\S]*>/i.test(content)) {
    return (
      <p className="m-0 font-primary text-100 font-regular leading-[23px] tracking-[0px] text-[#0a0a0a]">
        {content}
      </p>
    );
  }

  return (
    <div className="[&_.ql-editor]:!p-0 [&_.ql-editor]:!font-primary [&_.ql-editor]:!text-[14px] [&_.ql-editor]:!font-regular [&_.ql-editor]:!leading-[23px] [&_.ql-editor]:!tracking-[0px] [&_.ql-editor]:!text-[#0a0a0a] [&_.ql-editor_p]:!m-0 [&_.ql-editor_p]:!font-primary [&_.ql-editor_p]:!text-[14px] [&_.ql-editor_p]:!font-regular [&_.ql-editor_p]:!leading-[23px] [&_.ql-editor_p]:!tracking-[0px] [&_.ql-editor_p]:!text-[#0a0a0a]">
      <RichTextRenderer content={content} />
    </div>
  );
}

function SourceSection({
  sources,
  notes,
  hasDivider,
}: {
  sources: MetadataFact[];
  notes: MetadataFact[];
  hasDivider: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sources : sources.slice(0, 2);
  const hiddenCount = sources.length - visible.length;

  return (
    <div
      className={
        hasDivider
          ? 'mt-6 border-t-[0.8px] border-solid border-[#e5e5e5] pt-5'
          : ''
      }
    >
      <h4 className="m-0 font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue">
        Source & Provenance
      </h4>
      {visible.length ? (
        <div className="mt-5 flex flex-col gap-4">
          {visible.map((source) => (
            <a
              key={source.href || source.id}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-fit items-center gap-3 no-underline"
            >
              <IconWorldMap
                size={24}
                stroke={1.5}
                className={FACT_ICON}
                aria-hidden
              />
              <span className="inline-flex items-center gap-1">
                <span className="font-primary text-200 font-semi-bold leading-3 tracking-[0px] text-primaryBlue group-hover:underline">
                  {source.value}
                </span>
                <IconArrowUpRight
                  size={16}
                  stroke={1.5}
                  className="shrink-0 text-primaryBlue"
                  aria-hidden
                />
              </span>
            </a>
          ))}
        </div>
      ) : null}
      {hiddenCount > 0 ? (
        <div className="-mx-6 mt-5 border-t-[0.8px] border-solid border-[#e5e5e5] px-6 pt-4 text-center">
          <button
            type="button"
            className="appearance-none border-[0px] bg-transparent font-primary text-100 font-medium leading-2 text-primaryBlue"
            onClick={() => setShowAll(true)}
          >
            View all {sources.length} sources
          </button>
        </div>
      ) : null}
      {notes.length ? (
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((fact) => (
            <InfoFact key={fact.id} fact={fact} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PublisherCard({ publisher }: { publisher: MetadataPublisher }) {
  return (
    <section className={CARD}>
      <h3 className={`${HEADING} m-0`}>About the publisher</h3>
      <div className={CARD_RULE}>
        <div className="flex items-start gap-3">
          {publisher.imageSrc ? (
            <MediaImage
              src={publisher.imageSrc}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e7ebf5] text-[#667085]"
              aria-hidden
            >
              <IconUser size={22} stroke={1.75} />
            </span>
          )}
          <div className="min-w-0">
            <p className="m-0 font-primary text-100 font-medium leading-2 tracking-[0px] text-[#0a0a0a]">
              <Link href={publisher.href} className="text-inherit no-underline">
                {publisher.name}
              </Link>
            </p>
            {publisher.bio ? (
              <p className="mt-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#686868]">
                {publisher.bio}
              </p>
            ) : null}
            {publisher.location ? (
              <p className="mt-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#68686b]">
                {publisher.location}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoFact({
  fact,
  licenseTermsHref,
}: {
  fact: MetadataFact;
  licenseTermsHref?: string | null;
}) {
  const Icon =
    fact.id === 'access' && fact.value === 'Open Access'
      ? IconLockOpen
      : (FACT_ICONS[fact.id] ?? IconNotes);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Icon size={24} stroke={1.5} className={FACT_ICON} aria-hidden />
      <div className="min-w-0">
        <p className={LABEL}>{fact.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {fact.href ? (
            <a
              href={fact.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-primaryBlue"
            >
              {fact.value}
              <IconExternalLink size={14} stroke={1.5} aria-hidden />
            </a>
          ) : (
            <div className={VALUE}>{fact.value}</div>
          )}
          {licenseTermsHref ? (
            <Tooltip content={licenseTermsHref}>
              <a
                href={licenseTermsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-primary text-100 font-medium leading-2 text-primaryBlue hover:underline"
              >
                View licence terms
                <IconArrowUpRight size={14} stroke={1.5} aria-hidden />
              </a>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}
