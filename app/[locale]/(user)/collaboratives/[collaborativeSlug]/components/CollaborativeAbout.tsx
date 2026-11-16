import type { ReactNode } from 'react';
import {
  IconBook,
  IconBuilding,
  IconCalendarWeek,
  IconDatabase,
  IconGitBranch,
  IconMapPin,
  IconTarget,
  IconUsers,
  IconWorld,
  IconWorldMap,
} from '@tabler/icons-react';

import { RichTextRenderer } from '@/components/RichTextRenderer';
import { CollaborativeQr } from './CollaborativeQr';

export type EcosystemCounts = {
  useCases: number;
  publications: number;
  datasets: number;
  people: number;
  organisations: number;
  sdgs: number;
};

type CollaborativeAboutProps = {
  title: string;
  summaryHtml: string | null;
  website: string | null;
  geography: string | null;
  updatedOn: string | null;
  pageUrl: string;
  counts: EcosystemCounts;
};

export function CollaborativeAbout({
  title,
  summaryHtml,
  website,
  geography,
  updatedOn,
  pageUrl,
  counts,
}: CollaborativeAboutProps) {
  const nodes: EcosystemNode[] = [
    {
      key: 'use-cases',
      label: 'Use Cases',
      caption: `${counts.useCases} connected`,
      icon: IconGitBranch,
    },
    ...(counts.publications > 0
      ? [
          {
            key: 'publications',
            label: 'Publications',
            caption: `${counts.publications} connected`,
            icon: IconBook,
          },
        ]
      : []),
    {
      key: 'datasets',
      label: 'Datasets',
      caption: `${counts.datasets} connected`,
      icon: IconDatabase,
    },
    {
      key: 'people',
      label: 'People',
      caption: `${counts.people} connected`,
      icon: IconUsers,
    },
    {
      key: 'organisations',
      label: 'Organisations',
      caption: `${counts.organisations} connected`,
      icon: IconBuilding,
    },
    ...(counts.sdgs > 0
      ? [
          {
            key: 'sdg',
            label: 'SDG Goals',
            caption: `${counts.sdgs} ${counts.sdgs === 1 ? 'goal' : 'goals'}`,
            icon: IconTarget,
            iconSide: 'below' as const,
          },
        ]
      : []),
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-[112px] border-t-[0.8px] border-solid border-[#e5e5e5] py-10 lg:py-[56px]"
    >
      <h2
        id="about-heading"
        className="font-primary text-[32px] font-semi-bold leading-[36px] tracking-[0] text-primaryBlue md:text-[38px] md:leading-[42px]"
      >
        About this collaborative.
      </h2>
      {summaryHtml ? (
        <RichTextRenderer
          content={summaryHtml}
          className="mt-4 font-primary font-regular tracking-[0] text-[#6b6b6b] [&_.ql-editor]:!text-[14px] [&_.ql-editor]:!leading-[21px]"
        />
      ) : null}

      {website || geography || updatedOn ? (
        <dl className="sm:divide-x sm:divide-y-0 m-0 mb-10 mt-8 flex flex-col gap-5 sm:grid sm:auto-cols-fr sm:grid-flow-col sm:items-center sm:gap-0 sm:divide-solid sm:divide-[#e5e5e5] lg:mb-16 lg:mt-10">
          {website ? (
            <Fact icon={IconWorldMap} label="Website">
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                title={website}
                className="block truncate rounded-1 text-primaryBlue underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primaryBlue"
              >
                {website}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Fact>
          ) : null}
          {geography ? (
            <Fact icon={IconMapPin} label="Geography">
              {geography}
            </Fact>
          ) : null}
          {updatedOn ? (
            <Fact icon={IconCalendarWeek} label="Last updated">
              {updatedOn}
            </Fact>
          ) : null}
        </dl>
      ) : (
        <div className="mt-8" />
      )}

      <Ecosystem nodes={nodes} title={title} pageUrl={pageUrl} />
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof IconWorld;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 sm:px-8 sm:first:pl-0">
      <Icon
        size={24}
        stroke={1.5}
        className="shrink-0 text-[#727272]"
        aria-hidden
      />
      <div className="min-w-0">
        <dt className="text-75 font-medium uppercase leading-1 tracking-[0.05em] text-[#6b6b6b]">
          {label}
        </dt>
        <dd className="m-0 mt-1 min-w-0 truncate text-100 leading-2 text-[#0a0a0a]">
          {children}
        </dd>
      </div>
    </div>
  );
}

type EcosystemNode = {
  key: string;
  label: string;
  caption: string;
  icon: typeof IconWorld;
  /** Fixes the icon above or below the line; otherwise nodes alternate. */
  iconSide?: 'above' | 'below';
};

/**
 * One column per part plus a wider one for the hub. There are always 4 parts,
 * plus publications and SDG goals when the collaborative has them. Written out
 * in full because Tailwind only builds class names it can read.
 */
const ECOSYSTEM_COLUMNS: Record<number, string> = {
  4: 'md:[grid-template-columns:repeat(4,minmax(0,1fr))_minmax(0,2.2fr)] lg:[grid-template-columns:repeat(4,minmax(0,1fr))_minmax(0,1.75fr)]',
  5: 'md:[grid-template-columns:repeat(5,minmax(0,1fr))_minmax(0,2.2fr)] lg:[grid-template-columns:repeat(5,minmax(0,1fr))_minmax(0,1.75fr)]',
  6: 'md:[grid-template-columns:repeat(6,minmax(0,1fr))_minmax(0,2.2fr)] lg:[grid-template-columns:repeat(6,minmax(0,1fr))_minmax(0,1.75fr)]',
};

const LINE = 'bg-[#727272]/60';
const NODE_DOT = 'size-[12px] rounded-full bg-primaryBlue';

/**
 * Each part of the collaborative strung along one line that ends in the
 * collaborative itself. Wide screens alternate icons above and below the
 * line; phones stack the parts down a vertical line.
 */
function Ecosystem({
  nodes,
  title,
  pageUrl,
}: {
  nodes: EcosystemNode[];
  title: string;
  pageUrl: string;
}) {
  return (
    <>
      <ol
        aria-label="Collaborative ecosystem"
        className={`m-0 hidden list-none p-0 md:grid ${ECOSYSTEM_COLUMNS[nodes.length]}`}
      >
        {nodes.map((node, index) => {
          const iconAbove = node.iconSide
            ? node.iconSide === 'above'
            : index % 2 === 0;
          return (
            <li
              key={node.key}
              className="grid grid-rows-[9.5rem_0.75rem_9.5rem] lg:grid-rows-[10rem_0.75rem_10rem]"
            >
              <div className="flex flex-col items-center justify-end">
                {iconAbove ? (
                  <>
                    <NodeIcon
                      icon={node.icon}
                      className="size-[56px] lg:size-[64px]"
                    />
                    <span aria-hidden className={`w-px flex-1 ${LINE}`} />
                  </>
                ) : (
                  <div className="pb-4">
                    <NodeText node={node} />
                  </div>
                )}
              </div>
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-1/2 h-px ${LINE}`}
                />
                <span aria-hidden className={`relative ${NODE_DOT}`} />
              </div>
              <div className="flex flex-col items-center justify-start">
                {iconAbove ? (
                  <div className="pt-4">
                    <NodeText node={node} />
                  </div>
                ) : (
                  <>
                    <span aria-hidden className={`w-px flex-1 ${LINE}`} />
                    <NodeIcon
                      icon={node.icon}
                      className="size-[56px] lg:size-[64px]"
                    />
                  </>
                )}
              </div>
            </li>
          );
        })}
        <li className="flex items-center">
          <span aria-hidden className={`h-px w-[28px] shrink-0 ${LINE}`} />
          <span
            aria-hidden
            className={`-ml-px size-[12px] shrink-0 rounded-full ${LINE}`}
          />
          <div className="min-w-0 flex-1 px-6 py-[28px] lg:px-[28px]">
            <Hub title={title} pageUrl={pageUrl} />
          </div>
        </li>
      </ol>

      <ol
        aria-label="Collaborative ecosystem"
        className="m-0 flex list-none flex-col p-0 md:hidden"
      >
        {nodes.map((node, index) => (
          <li
            key={node.key}
            className="relative flex items-center gap-4 py-4 pl-[28px]"
          >
            <span
              aria-hidden
              className={`absolute left-[5px] w-px ${LINE} ${index === 0 ? 'bottom-0 top-1/2' : 'inset-y-0'}`}
            />
            <span
              aria-hidden
              className={`absolute left-0 top-1/2 -translate-y-1/2 ${NODE_DOT}`}
            />
            <NodeIcon icon={node.icon} className="size-[48px]" />
            <NodeText node={node} align="start" />
          </li>
        ))}
        <li className="relative flex flex-col items-center pl-[28px] pt-2">
          <span
            aria-hidden
            className={`absolute left-[5px] top-0 h-[48px] w-px ${LINE}`}
          />
          <span
            aria-hidden
            className={`absolute left-0 top-[48px] size-[12px] -translate-y-1/2 rounded-full ${LINE}`}
          />
          <div className="w-full max-w-[240px] px-6 py-10">
            <Hub title={title} pageUrl={pageUrl} />
          </div>
        </li>
      </ol>
    </>
  );
}

function NodeIcon({
  icon: Icon,
  className,
}: {
  icon: typeof IconWorld;
  className: string;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full border-1 border-solid border-[#e5e5e5] bg-white text-primaryBlue ${className}`}
    >
      <Icon className="size-[42%]" stroke={1.75} />
    </span>
  );
}

function NodeText({
  node,
  align = 'center',
}: {
  node: EcosystemNode;
  align?: 'center' | 'start';
}) {
  return (
    <span
      className={`block min-w-0 px-1 md:px-0 lg:px-1 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <span className="block text-[14px] font-semi-bold leading-[1.25] text-primaryBlue md:text-[13px] lg:text-[16px]">
        {node.label}
      </span>
      <span className="mt-1 block text-[12px] leading-[1.375] text-[#6b6b6b] lg:text-[14px]">
        {node.caption}
      </span>
    </span>
  );
}

/**
 * Small dots on a ring around the hub, at 128°, -52° and 205°. Each position
 * is 50% ± 62% of the hub along that angle, worked out ahead of time.
 */
const ORBIT_DOTS = [
  'left-[11.83%] top-[1.14%] size-[10px] bg-[#727272]/60',
  'left-[88.17%] top-[98.86%] size-[14px] bg-primaryBlue',
  'left-[-6.19%] top-[76.20%] size-[6px] bg-[#727272]/60',
];

/** The collaborative at the end of the line: a QR code to its page. */
function Hub({ title, pageUrl }: { title: string; pageUrl: string }) {
  return (
    <div className="relative aspect-square w-full">
      <span
        aria-hidden
        className="absolute inset-[-12px] rounded-full border-1 border-solid border-[#727272]/50"
      />
      <span
        aria-hidden
        className="absolute inset-[-28px] rounded-full border-1 border-solid border-[#e5e5e5]"
      />
      {ORBIT_DOTS.map((dot) => (
        <span
          key={dot}
          aria-hidden
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${dot}`}
        />
      ))}
      {/* The circle is the size container; cqw only works on its children. */}
      <div className="relative size-full rounded-full bg-primaryBlue text-white [container-type:inline-size]">
        <div className="flex size-full flex-col items-center justify-center gap-[5cqw]">
          <CollaborativeQr url={pageUrl} />
          <p className="m-0 text-[3.6cqw] font-medium uppercase leading-[1] tracking-[0.18em]">
            Collaborative link
          </p>
        </div>
        <span className="sr-only">{title}</span>
      </div>
    </div>
  );
}
