'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import {
  IconArrowRight,
  IconBook,
  IconDatabase,
  IconPhotoOff,
  IconShare,
  IconUsers,
} from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'opub-ui';

import { Icons } from '@/components/icons';
import MediaImage from '@/components/MediaImage';
import { downloadCardImage } from '@/components/share-panel/download-card';
import { SharePanel } from '@/components/share-panel/SharePanel';
import type { SdgGoal } from '../collaborative-detail';

type CollaborativeHeroProps = {
  backHref: string | null;
  /** Prefix for links to other pages; the platform address on a subdomain. */
  linkBase: string;
  pageUrl: string;
  title: string;
  tags: string[];
  sdgs: SdgGoal[];
  imageSrc: string | null;
  collaborateHref: string | null;
  counts: {
    peopleAndOrganisations: number;
    datasetsAndUseCases: number;
    publications: number;
  };
};

/** Up to this many goals show as badges; past it the last slot reads "+N". */
const SDG_SHOWN = 5;
const SDG_SIZE = 58;
/**
 * Gap between badges once they slide apart, by how many badges there are:
 * spread to fill the tile, never tucked more than 18px, never more than 2px apart.
 * Written out in full because Tailwind only builds class names it can read.
 */
const SDG_SPREAD: Record<number, string> = {
  1: '[--spread:clamp(-18px,calc((100cqw_-_58px)_/_1),2px)]',
  2: '[--spread:clamp(-18px,calc((100cqw_-_116px)_/_1),2px)]',
  3: '[--spread:clamp(-18px,calc((100cqw_-_174px)_/_2),2px)]',
  4: '[--spread:clamp(-18px,calc((100cqw_-_232px)_/_3),2px)]',
  5: '[--spread:clamp(-18px,calc((100cqw_-_290px)_/_4),2px)]',
};

/** Earlier badges sit on top of later ones. */
const SDG_LAYER = ['z-[0]', 'z-[1]', 'z-[2]', 'z-[3]', 'z-[4]', 'z-[5]'];

export function CollaborativeHero({
  backHref,
  linkBase,
  pageUrl,
  title,
  tags,
  sdgs,
  imageSrc,
  collaborateHref,
  counts,
}: CollaborativeHeroProps) {
  const visualRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="introduction"
      aria-labelledby="introduction-heading"
      className="scroll-mt-[112px] bg-white"
    >
      <div className="mx-auto box-border flex min-w-0 max-w-[1480px] flex-col gap-6 px-4 pb-10 pt-8 text-[#0a0a0a] md:px-6 lg:px-8 lg:pb-[56px] lg:pt-10 xl:px-10">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="-ml-3 inline-flex h-9 w-fit items-center gap-2 rounded-[10px] px-3 text-100 font-medium leading-[20px] text-[#6b6b6b] transition-colors hover:bg-[#e4e4e6] hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
            >
              <Icons.back
                size={16}
                stroke={2}
                className="shrink-0"
                aria-hidden
              />
              Back
            </Link>
          ) : (
            <span />
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {collaborateHref ? (
              <Button
                kind="primary"
                url={collaborateHref}
                external
                className="!inline-flex !h-[44px] !items-center !justify-center !gap-2 !rounded-[10px] !bg-primaryBlue !px-6 !py-0 !text-[16px] !font-medium !leading-[24px] !text-white hover:!bg-[#234c74]"
              >
                <span className="inline-flex items-center gap-2 text-[16px] font-medium leading-[24px]">
                  Collaborate
                  <IconArrowRight size={16} stroke={2} aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </Button>
            ) : null}
            <Popover>
              <Popover.Trigger>
                <Button
                  kind="tertiary"
                  accessibilityLabel="Share collaborative"
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
                className="!m-0 !box-border !w-[288px] !rounded-[10px] !border-[0.8px] !border-solid !border-[#e5e5e5] !bg-white !p-2 !font-primary !text-100 !leading-3 !text-[#0a0a0a] !shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)]"
              >
                <SharePanel
                  label="Share on"
                  url={pageUrl}
                  title={title}
                  showPageActions
                  downloadLabel="Download visual"
                  onDownloadCard={() => {
                    const visual = visualRef.current;
                    if (visual) {
                      downloadCardImage(title, visual, {
                        fileSuffix: 'collaborative',
                        backgroundColor: '#ffffff',
                      }).catch((error) => Sentry.captureException(error));
                    }
                  }}
                />
              </Popover.Content>
            </Popover>
          </div>
        </div>

        <div
          ref={visualRef}
          className="grid gap-4 bg-white xl:grid-cols-[39.5fr_60.5fr]"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex min-w-0 flex-1 flex-col rounded-[16px] bg-[#f4f4f5] p-6 sm:p-8 xl:p-6">
              <h1
                id="introduction-heading"
                className="min-w-0 text-pretty break-words font-primary text-[32px] font-semi-bold leading-[36px] tracking-[0] text-[#000] sm:text-[44px] sm:leading-[48px] lg:text-[60px] lg:leading-[66px]"
              >
                {title}
              </h1>
              {tags.length > 0 ? (
                <ul
                  className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0"
                  aria-label="Topics"
                >
                  {tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`${linkBase}/search?${new URLSearchParams({ tags: tag, types: 'collaborative' })}`}
                        className="inline-flex items-center rounded-full border-1 border-solid border-[#e5e5e5] bg-[#f5f5f5] px-[14.4px] py-[2.88px] font-primary text-[17.28px] font-medium leading-[23.04px] tracking-[0] text-[#6b6b6b] transition-colors hover:bg-secondaryOrange hover:text-primaryBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {sdgs.length > 0 ? (
              <SdgTile goals={sdgs} linkBase={linkBase} />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="grid gap-4 min-[520px]:grid-cols-3">
              <StatTile
                icon={IconUsers}
                tone="bg-[#e0e8f2] text-[#2a78d6]"
                total={counts.peopleAndOrganisations}
                label={['Contributors', '& organisations']}
              />
              <StatTile
                icon={IconDatabase}
                tone="bg-[#d4eae2] text-[#1baf7a]"
                total={counts.datasetsAndUseCases}
                label={['Datasets', '& use cases']}
              />
              <StatTile
                icon={IconBook}
                tone="bg-[#f3e8d0] text-[#eda100]"
                total={counts.publications}
                label={['Publications']}
              />
            </div>
            <div className="relative min-h-[18rem] flex-1 overflow-hidden rounded-[16px] border-[0.8px] border-solid border-[#e5e5e5] bg-[#f5f5f5] max-sm:aspect-[4/3.9] sm:max-xl:aspect-[16/9.1] xl:min-h-[30rem]">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={title}
                  fill
                  sizes="(min-width: 1280px) 840px, 100vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div
                  role="img"
                  aria-label="No collaborative image available"
                  className="flex size-full min-h-[18rem] items-center justify-center text-[#6b6b6b]"
                >
                  <IconPhotoOff size={40} stroke={1.5} aria-hidden />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatTile({
  icon: Icon,
  tone,
  total,
  label,
}: {
  icon: typeof IconDatabase;
  tone: string;
  total: number;
  label: string[];
}) {
  return (
    <div className="flex min-h-[9.7rem] min-w-0 flex-col justify-center gap-3 rounded-[16px] bg-[#f4f4f5] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex size-[45px] shrink-0 items-center justify-center rounded-full ${tone}`}
        >
          <Icon size={17} stroke={1.75} />
        </span>
        <p className="font-primary text-[24px] font-semi-bold tabular-nums leading-[30px] tracking-[0] text-primaryBlue">
          {total.toLocaleString('en-US')}
        </p>
      </div>
      <p className="font-primary text-[14px] font-regular leading-[21px] tracking-[0] text-[#0a0a0a]">
        {label.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * Goal badges sit stacked; on hover or keyboard focus they slide apart to
 * fill the tile, each with a tooltip naming the goal.
 */
function SdgTile({ goals, linkBase }: { goals: SdgGoal[]; linkBase: string }) {
  const overflow = goals.length > SDG_SHOWN;
  const shown = overflow ? goals.slice(0, SDG_SHOWN - 1) : goals;
  const rest = overflow ? goals.slice(SDG_SHOWN - 1) : [];
  const tiles = shown.length + (overflow ? 1 : 0);
  const slide = `shrink-0 transition-[margin] duration-200 ease-out motion-reduce:transition-none`;
  const stacked = `-ml-[18px] group-focus-within:[margin-left:var(--spread)] group-hover:[margin-left:var(--spread)]`;
  const goalLabel = (goal: SdgGoal) => `Goal ${goal.number}: ${goal.name}`;

  return (
    <div className="flex min-h-[9.7rem] min-w-0 flex-col justify-between gap-3 rounded-[16px] bg-[#f4f4f5] p-5 sm:p-6">
      <div className="w-full [container-type:inline-size]">
        <ul
          className={`group m-0 flex list-none items-center p-0 ${SDG_SPREAD[tiles]}`}
          aria-label="Goals"
        >
          {shown.map((goal, index) => (
            <li
              key={goal.id}
              className={`${slide} ${SDG_LAYER[tiles - index]} ${index > 0 ? stacked : ''}`}
            >
              <Tooltip
                side="top"
                width="wide"
                disableHoverableContent
                content={
                  <>
                    <span className="block font-semi-bold text-primaryBlue">
                      {goalLabel(goal)}
                    </span>
                    {goal.description ? (
                      <span className="mt-[2px] block font-regular text-[#6b6b6b]">
                        {goal.description}
                      </span>
                    ) : null}
                  </>
                }
              >
                <Link
                  href={`${linkBase}/search?${new URLSearchParams({ sdgs: goal.name, types: 'collaborative' })}`}
                  aria-label={`${goalLabel(goal)}. Show collaboratives for this goal`}
                  className="block rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
                >
                  {goal.imageSrc ? (
                    <MediaImage
                      src={goal.imageSrc}
                      fallback="/SDG/SDG1.png"
                      alt=""
                      width={SDG_SIZE}
                      height={SDG_SIZE}
                      className="size-[58px] rounded-[6px] object-cover ring-2 ring-[#f4f4f5]"
                    />
                  ) : (
                    <span className="flex size-[58px] items-center justify-center rounded-[6px] bg-white text-100 font-semi-bold text-primaryBlue ring-2 ring-[#f4f4f5]">
                      {goal.number || 'SDG'}
                    </span>
                  )}
                </Link>
              </Tooltip>
            </li>
          ))}
          {overflow ? (
            <li className={`${slide} ${SDG_LAYER[0]} ${stacked}`}>
              {/* Hoverable, so a long list can be scrolled inside the tooltip. */}
              <Tooltip
                side="top"
                width="wide"
                content={
                  <>
                    <span className="block font-semi-bold text-primaryBlue">
                      {rest.length} more goals
                    </span>
                    <ul className="m-0 mt-[2px] list-none p-0 font-regular text-[#6b6b6b]">
                      {rest.map((goal) => (
                        <li key={goal.id}>{goalLabel(goal)}</li>
                      ))}
                    </ul>
                  </>
                }
              >
                <span
                  tabIndex={0}
                  role="img"
                  aria-label={`and ${rest.length} more goals: ${rest.map(goalLabel).join(', ')}`}
                  className="flex size-[58px] items-center justify-center rounded-[6px] bg-white text-100 font-semi-bold text-primaryBlue ring-2 ring-[#f4f4f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
                >
                  +{rest.length}
                </span>
              </Tooltip>
            </li>
          ) : null}
        </ul>
      </div>
      <p className="self-end text-right font-primary text-[16px] font-regular leading-[20px] tracking-[0] text-[#0a0a0a]">
        The <strong className="font-semi-bold">SDG goals</strong>
        <br />
        this collaborative works towards
      </p>
    </div>
  );
}
