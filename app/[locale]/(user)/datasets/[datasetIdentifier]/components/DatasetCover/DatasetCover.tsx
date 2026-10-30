'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconCalendarWeek,
  IconChartBar,
  IconDownload,
  IconFileStack,
  IconFileTypography,
  IconTable,
  IconMapPin,
  IconScale,
  IconShare,
  IconStack2,
  IconUser,
  IconWorldMap,
} from '@tabler/icons-react';
import * as Sentry from '@sentry/nextjs';
import { Button, Popover, Tooltip } from 'opub-ui';

import { Icons } from '@/components/icons';
import { SharePanel } from '@/components/share-panel/SharePanel';
import type {
  DatasetCover as DatasetCoverModel,
  DatasetCoverUsageItem,
} from '../../dataset-cover';

const LILAC_TILE = 'bg-[color:oklab(0.433132_0.0393874_-0.162422_/_0.1)]';

type DatasetCoverProps = {
  cover: DatasetCoverModel;
  pageUrl: string;
  backHref?: string;
};

export function DatasetCover({
  cover,
  pageUrl,
  backHref = '/datasets',
}: DatasetCoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-white">
      <div className="mx-auto box-border flex min-w-0 max-w-[1400px] flex-col gap-6 px-5 pb-2 pt-8 leading-3 text-[#0a0a0a] sm:px-6 lg:px-8 lg:pt-10 xl:px-0">
          <div className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="inline-flex w-fit items-center gap-1.5 rounded-1 text-100 font-medium leading-[18px] text-[#0a0a0a]/75 transition-colors hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
            >
              <Icons.back size={16} stroke={2} className="shrink-0" aria-hidden />
              Back
            </Link>
            <div className="flex min-w-0 items-center gap-2">
              <div data-tour="download-button">
                <Button
                  kind="primary"
                  url={cover.download.href ?? undefined}
                  external={cover.download.external}
                  disabled={!cover.download.href}
                  accessibilityLabel={
                    cover.download.href
                      ? 'Download dataset'
                      : 'No files to download'
                  }
                  className="!inline-flex !h-11 !items-center !justify-center !gap-2 !rounded-[10px] !bg-primaryBlue !px-6 !py-0 !text-[16px] !font-medium !leading-[24px] !text-white hover:!bg-[#254c75]"
                >
                  <span className="inline-flex items-center gap-2 text-[16px] font-medium leading-[24px]">
                    <IconDownload size={18} stroke={1.75} aria-hidden />
                    Download
                  </span>
                </Button>
              </div>
              <Popover>
                <Popover.Trigger>
                  <Button
                    kind="tertiary"
                    accessibilityLabel="Share dataset"
                    // opub-ui Button forwards extra props to the element, but its type omits `title`.
                    {...{ title: 'Share' }}
                    className="!m-0 !inline-flex !size-11 !min-h-11 !min-w-11 !items-center !justify-center !rounded-full !border-1 !border-solid !border-primaryBlue !bg-transparent !p-0 !leading-0 !text-primaryBlue hover:!bg-[#0b3865]/5"
                  >
                    <IconShare size={20} stroke={2} aria-hidden className="block" />
                  </Button>
                </Popover.Trigger>
                <Popover.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  className="!m-0 !box-border !w-[288px] !rounded-[10px] !border-[0.8px] !border-solid !border-[#e5e5e5] !bg-white !p-2 !font-primary !text-100 !leading-3 !text-[#0a0a0a] !shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)]"
                >
                  <SharePanel
                    label="Share on"
                    url={pageUrl}
                    title={cover.title}
                    showPageActions
                    onDownloadCard={() => {
                      const card = cardRef.current;
                      if (card) {
                        downloadDataCard(cover.title, card).catch((error) =>
                          Sentry.captureException(error)
                        );
                      }
                    }}
                  />
                </Popover.Content>
              </Popover>
            </div>
          </div>

          <div
            ref={cardRef}
            className="box-border flex min-w-0 max-w-full flex-col gap-5 rounded-[24px] bg-[#f3f5f8] p-6 text-primaryBlue leading-3"
            data-tour="dataset-info"
          >
            <h1 className="min-w-0 max-w-full break-words font-primary text-[32px] font-semi-bold leading-[36px] text-[#000] sm:text-[38px] sm:leading-[41.8px] lg:max-w-[70%]">
              {cover.title}
            </h1>

            <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.44625fr)_minmax(0,0.40375fr)]">
              <div className="flex min-w-0 flex-col">
                <DescriptionPanel description={cover.description} />
                <section
                  className={`order-3 box-border mt-3 grid min-w-0 grid-cols-2 items-center gap-4 rounded-4 p-6 font-primary leading-3 text-primaryBlue lg:order-none ${LILAC_TILE}`}
                >
                  <FactChip
                    icon={
                      <IconStack2
                        size={32}
                        stroke={1.25}
                        className="shrink-0 text-[#0b3865]/80"
                        aria-hidden
                      />
                    }
                    label="Sector"
                    value={cover.sector}
                  />
                  <FactChip
                    icon={
                      <IconMapPin
                        size={32}
                        stroke={1.25}
                        className="shrink-0 text-[#0b3865]/80"
                        aria-hidden
                      />
                    }
                    label="Geography"
                    value={cover.geography}
                  />
                </section>
              </div>

              <div className="flex min-w-0 flex-col lg:col-span-2">
                {cover.usage ? (
                  <section className="flex min-h-[110px] shrink-0 items-center gap-3 rounded-4 bg-white p-6 text-[15px] leading-3 text-primaryBlue">
                    <IconChartBar
                      size={61}
                      stroke={1.75}
                      className="shrink-0 text-[#e0e0f0]"
                      aria-hidden
                    />
                    <p>
                      This dataset supports{' '}
                      <UsageLink item={cover.usage.useCases} />, is part of{' '}
                      <UsageLink item={cover.usage.collaboratives} />, and powers{' '}
                      <UsageLink item={cover.usage.visualisations} />.
                    </p>
                  </section>
                ) : (
                  <section
                    className="flex min-h-[110px] shrink-0 items-center gap-3 rounded-4 bg-white p-6"
                    aria-busy="true"
                    aria-label="Loading where this dataset is used"
                  >
                    <IconChartBar
                      size={61}
                      stroke={1.75}
                      className="shrink-0 text-[#e0e0f0]"
                      aria-hidden
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-2" aria-hidden>
                      <span className="h-3 w-4/5 animate-pulse rounded-full bg-[#e6e8ee]" />
                      <span className="h-3 w-2/3 animate-pulse rounded-full bg-[#e6e8ee]" />
                    </span>
                  </section>
                )}
                <div className="mt-4 grid min-h-0 flex-1 content-stretch gap-3 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <section className="box-border flex h-full min-w-0 flex-col justify-between rounded-4 bg-white p-6 leading-3 text-primaryBlue sm:row-span-2">
                    <IconTable
                      size={61}
                      stroke={1.75}
                      className="shrink-0 text-[#e2e2f2]"
                      aria-hidden
                    />
                    <div className="mt-6">
                      <p className="font-primary text-300 font-semi-bold leading-3 tracking-[0px] text-primaryBlue">
                        {cover.recordCount}
                      </p>
                      <p className="mt-1 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#606d6b]">
                        Records
                      </p>
                    </div>
                    <div className="mt-4 border-t-1 border-solid border-[#e6e8ee] pt-4">
                      <p className="font-primary text-300 font-semi-bold leading-3 tracking-[0px] text-primaryBlue">
                        {cover.downloadCount}
                      </p>
                      <p className="mt-1 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#606d6b]">
                        Downloads
                      </p>
                    </div>
                  </section>
                  <div
                    className={`box-border flex min-w-0 items-center gap-4 rounded-4 p-4 font-primary leading-3 text-primaryBlue ${LILAC_TILE}`}
                  >
                    <IconFileStack
                      size={32}
                      className="shrink-0 text-[#fff]"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue">
                        {cover.fileCount}
                      </p>
                      <p className="font-primary text-75 font-regular leading-1 tracking-[0px] text-[#606868]">
                        Data files
                      </p>
                    </div>
                  </div>
                  <div
                    className={`box-border flex min-w-0 items-center gap-4 rounded-4 p-4 font-primary leading-3 text-primaryBlue ${LILAC_TILE}`}
                  >
                    <IconFileTypography
                      size={32}
                      className="shrink-0 text-[#fff]"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="break-words font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue">
                        {cover.fileTypes ?? '—'}
                      </p>
                      <p className="font-primary text-75 font-regular leading-1 tracking-[0px] text-[#606868]">
                        File types
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <section className="box-border grid min-w-0 items-center gap-4 rounded-4 bg-white p-6 font-primary leading-3 text-primaryBlue lg:col-span-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.44625fr)] lg:gap-3 lg:p-0">
                <div className="grid items-center gap-4 sm:grid-cols-2 lg:p-6">
                  <FooterFact
                    icon={<IconScale size={20} stroke={1.75} aria-hidden />}
                    label="License"
                    value={cover.license}
                  />
                  <FooterFact
                    icon={<IconWorldMap size={20} stroke={1.75} aria-hidden />}
                    label="Source"
                    value={cover.source?.label ?? null}
                    href={cover.source?.href}
                  />
                </div>
                <div className="lg:p-6">
                  <FooterFact
                    icon={<IconCalendarWeek size={20} stroke={1.75} aria-hidden />}
                    label="Last Updated"
                    value={cover.updated}
                    alignWithTextAbove
                  />
                </div>
              </section>
              <PublisherFact publisher={cover.publisher} />
            </div>
          </div>
      </div>
    </section>
  );
}

function DescriptionCopy({ description }: { description: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    const update = () => {
      const full = node.cloneNode(true) as HTMLParagraphElement;
      full.classList.remove('line-clamp-4');
      full.style.position = 'absolute';
      full.style.visibility = 'hidden';
      full.style.pointerEvents = 'none';
      full.style.display = 'block';
      full.style.width = `${node.clientWidth}px`;
      full.style.height = 'auto';
      full.style.maxHeight = 'none';
      full.style.overflow = 'visible';
      full.style.webkitLineClamp = 'unset';
      node.parentElement?.appendChild(full);
      const overflows = full.scrollHeight > node.clientHeight + 1;
      full.remove();
      setTruncated(overflows);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [description, truncated]);

  const copy = (
    <p
      ref={textRef}
      tabIndex={truncated ? 0 : undefined}
      className="mt-3 min-w-0 max-w-full break-words font-primary text-400 font-semi-bold leading-[30px] tracking-[0px] text-primaryBlue line-clamp-4 sm:max-w-[28rem]"
    >
      {description}
    </p>
  );

  if (!truncated) return copy;

  return (
    <Tooltip content={description} width="wide" side="top" align="start">
      {copy}
    </Tooltip>
  );
}

function DescriptionPanel({ description }: { description: string | null }) {
  return (
    <div className="relative box-border flex min-h-[280px] min-w-0 max-w-full flex-1 flex-col overflow-hidden rounded-[16px] bg-[#d3e9ff] p-8 text-primaryBlue leading-3">
      <p className="font-primary text-75 font-semi-bold uppercase leading-1 tracking-[0.3px] text-[#0b3865cc]">
        What this data tells us
      </p>
      {description ? <DescriptionCopy description={description} /> : (
        <p className="mt-3 max-w-[28rem] text-[18px] leading-[1.35] text-[#5d6b7c]">
          No description yet.
        </p>
      )}
      {description ? (
        <div className="pointer-events-none absolute inset-x-8 bottom-2 flex items-end justify-between gap-4">
          <p className="pointer-events-auto mb-3 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#0b3865b3]">
            From the dataset description
          </p>
          <DataSketch />
        </div>
      ) : (
        <DataSketch />
      )}
    </div>
  );
}

function UsageLink({ item }: { item: DatasetCoverUsageItem }) {
  return (
    <Link
      href={item.href}
      className="font-medium text-[#0a0a0a] underline decoration-[#0a0a0a]/40 underline-offset-2 hover:decoration-[#0a0a0a]"
    >
      {item.label}
    </Link>
  );
}

function FactChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 text-[#667085]">{icon}</span>
      <span>
        <span className="block font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue">
          {value ?? '—'}
        </span>
        <span className="block font-primary text-75 font-regular leading-1 tracking-[0px] text-[#68666b]">
          {label}
        </span>
      </span>
    </div>
  );
}

function FooterFact({
  icon,
  label,
  value,
  href,
  alignWithTextAbove = false,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
  href?: string;
  alignWithTextAbove?: boolean;
}) {
  const text = value ?? '—';
  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${alignWithTextAbove ? 'lg:-ml-[44px]' : ''}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3e6d4] text-[#b46702] leading-3">
        {icon}
      </span>
      <span className="min-w-0">
        {href && value ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue"
          >
            {text}
          </a>
        ) : (
          <span className="block truncate font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue">
            {text}
          </span>
        )}
        <span className="block font-primary text-75 font-regular leading-1 tracking-[0px] text-[#686b6b]">
          {label}
        </span>
      </span>
    </div>
  );
}

function PublisherFact({
  publisher,
}: {
  publisher: DatasetCoverModel['publisher'];
}) {
  const nameRef = useRef<HTMLSpanElement>(null);
  const [nameTruncated, setNameTruncated] = useState(false);
  const name = publisher?.name ?? '—';

  useEffect(() => {
    const node = nameRef.current;
    if (!node) return;

    const update = () => {
      setNameTruncated(node.scrollWidth > node.clientWidth + 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [name, nameTruncated]);

  const nameNode = (
    <span
      ref={nameRef}
      className="block truncate font-primary text-200 font-semi-bold leading-2 tracking-[0px] text-primaryBlue"
    >
      {name}
    </span>
  );

  const body = (
    <span className="flex min-w-0 items-center gap-3 lg:-ml-2">
      {publisher?.imageSrc ? (
        <Image
          src={publisher.imageSrc}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e7ebf5] text-[#667085]"
          aria-hidden
        >
          <IconUser size={18} stroke={1.75} />
        </span>
      )}
      <span className="min-w-0">
        {nameTruncated ? (
          <Tooltip content={name} side="top">
            {nameNode}
          </Tooltip>
        ) : (
          nameNode
        )}
        <span className="block font-primary text-75 font-regular leading-1 tracking-[0px] text-[#68686b]">
          Publisher
        </span>
      </span>
    </span>
  );

  const cardClass = `box-border flex h-full min-w-0 items-center rounded-4 p-6 font-primary leading-3 text-primaryBlue ${LILAC_TILE}`;

  if (!publisher) {
    return (
      <section className={cardClass}>
        {body}
      </section>
    );
  }

  return (
    <Link
      href={publisher.href}
      className={`${cardClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue`}
    >
      {body}
    </Link>
  );
}

function dataCardFileName(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'dataset'}-data-card.png`;
}

async function downloadDataCard(title: string, card: HTMLElement) {
  const { toPng } = await import('html-to-image');
  const blocked = remoteStylesheets();
  const markers = blocked.map((node) => {
    const marker = document.createComment('remote-stylesheet');
    node.replaceWith(marker);
    return { node, marker };
  });
  try {
    const href = await toPng(card, {
      pixelRatio: 2,
      backgroundColor: '#f3f5f8',
      includeQueryParams: true,
    });
    const link = document.createElement('a');
    link.href = href;
    link.download = dataCardFileName(title);
    link.click();
  } finally {
    for (const { node, marker } of markers) marker.replaceWith(node);
  }
}

function remoteStylesheets() {
  return [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
    (node): node is HTMLLinkElement => {
      if (!(node instanceof HTMLLinkElement) || !node.sheet) return false;
      try {
        void node.sheet.cssRules;
        return false;
      } catch {
        return true;
      }
    }
  );
}

function DataSketch() {
  return (
    <Image
      src="/dataset-dna-card.png"
      alt=""
      width={371}
      height={311}
      aria-hidden
      className="pointer-events-none hidden h-auto w-[148px] shrink-0 sm:block"
    />
  );
}
