'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { stripMarkdown } from '@/app/[locale]/(user)/search/components/UnifiedListingComponent';
import { firstThree } from '@/app/[locale]/(user)/usecases/components/DatasetStories';
import {
  IconArrowDown,
  IconArrowRight,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { Button, Card, SearchInput } from 'opub-ui';

import { Icons } from '@/components/icons';
import {
  matchesWords,
  searchWords,
  type CollaborativeExploreData,
  type MemberRow,
  type ResourceKind,
  type ResourceRow,
} from '../collaborative-detail';
import { MemberTicker, shouldScroll, type MemberKind } from './MemberTicker';

type SectionKey =
  'use-cases' | 'publications' | 'datasets' | 'organisations' | 'people';

type Filter = 'all' | SectionKey;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'use-cases', label: 'Use Cases' },
  { value: 'publications', label: 'Publications' },
  { value: 'datasets', label: 'Datasets' },
  { value: 'organisations', label: 'Organisations and Partners' },
  { value: 'people', label: 'Contributors' },
];

const EMPTY_STATE =
  'm-0 rounded-[18px] border-1 border-dashed border-[#e5e5e5] px-6 py-10 text-center text-100 leading-[20px] text-[#6b6b6b]';

const NOUNS: Record<SectionKey, [string, string]> = {
  'use-cases': ['use case', 'use cases'],
  publications: ['publication', 'publications'],
  datasets: ['dataset', 'datasets'],
  organisations: ['organisation or partner', 'organisations or partners'],
  people: ['contributor', 'contributors'],
};

export function CollaborativeExplore({
  data,
}: {
  data: CollaborativeExploreData;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // One switch pauses both the organisation and the contributor rows.
  const [paused, setPaused] = useState(false);
  const searching = searchWords(query).length > 0;

  const matches = useMemo(() => {
    const words = searchWords(query);
    return {
      'use-cases': data.useCases.filter((row) =>
        matchesWords(row.searchText, words)
      ),
      publications: data.publications.filter((row) =>
        matchesWords(row.searchText, words)
      ),
      datasets: data.datasets.filter((row) =>
        matchesWords(row.searchText, words)
      ),
      organisations: data.organisations.filter((row) =>
        matchesWords(memberText(row), words)
      ),
      people: data.people.filter((row) => matchesWords(memberText(row), words)),
    };
  }, [data, query]);

  const totals: Record<SectionKey, number> = {
    'use-cases': data.useCases.length,
    publications: data.publications.length,
    datasets: data.datasets.length,
    organisations: data.organisations.length,
    people: data.people.length,
  };
  const keys = (Object.keys(totals) as SectionKey[]).filter(
    (key) => totals[key] > 0
  );
  if (keys.length === 0) return null;

  const shown = (key: SectionKey) =>
    totals[key] > 0 && (filter === 'all' || filter === key);
  const countLabel = (key: SectionKey) =>
    searching
      ? `${matches[key].length} of ${totals[key]}`
      : String(totals[key]);
  const noMatch = (key: SectionKey) =>
    `No ${NOUNS[key][1]} match “${query.trim()}”.`;

  return (
    <section
      id="explore"
      aria-labelledby="explore-heading"
      className="scroll-mt-[112px] border-t-[0.8px] border-solid border-[#e5e5e5] py-10 lg:py-[56px]"
    >
      <h2
        id="explore-heading"
        className="font-primary text-[32px] font-semi-bold leading-[36px] tracking-[0] text-primaryBlue md:text-[38px] md:leading-[42px]"
      >
        Explore this collaborative
      </h2>

      <div className="mt-8">
        <SearchInput
          label="Search everything in this collaborative"
          name="collaborative-search"
          placeholder="Search use cases, publications, datasets, organisations, partners, contributors…"
          onChange={setQuery}
          onClear={() => setQuery('')}
        />
        <div
          role="group"
          aria-label="Show"
          className="mt-4 flex flex-wrap gap-2"
        >
          {FILTERS.filter(
            (option) => option.value === 'all' || totals[option.value] > 0
          ).map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={`cursor-pointer rounded-full border-1 border-solid px-4 py-[6px] text-100 font-medium leading-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue ${
                  active
                    ? 'border-primaryBlue bg-primaryBlue text-white'
                    : 'border-[#e5e5e5] bg-white text-[#0a0a0a] hover:border-[#0b3865]/40 hover:text-primaryBlue'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p
          role="status"
          aria-live="polite"
          className={searching ? 'mt-6 text-100 text-[#6b6b6b]' : 'sr-only'}
        >
          {searching ? matchSummary(query, keys, filter, matches) : ''}
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-[56px] lg:mt-12 lg:gap-16">
        {shown('use-cases') ? (
          <Subsection
            id="use-cases"
            title="Use Cases"
            count={countLabel('use-cases')}
            description="Applications of this collaborative's data in practice."
          >
            <ResourceGrid
              kind="use-case"
              rows={matches['use-cases']}
              noun={NOUNS['use-cases']}
              recentLabel="Newest first"
              initial={4}
              step={null}
              moreLabel="View all use cases"
              empty={noMatch('use-cases')}
            />
          </Subsection>
        ) : null}
        {shown('publications') ? (
          <Subsection
            id="publications"
            title="Publications"
            count={countLabel('publications')}
            description="Reports, briefs and other writing from this collaborative."
          >
            <ResourceGrid
              kind="publication"
              rows={matches.publications}
              noun={NOUNS.publications}
              recentLabel="Newest first"
              initial={8}
              step={8}
              moreLabel="Load more publications"
              empty={noMatch('publications')}
            />
          </Subsection>
        ) : null}
        {shown('datasets') ? (
          <Subsection
            id="datasets"
            title="Datasets"
            count={countLabel('datasets')}
            description="Evidence and data behind this collaborative. Open any dataset for a closer look."
          >
            <ResourceGrid
              kind="dataset"
              rows={matches.datasets}
              noun={NOUNS.datasets}
              recentLabel="Recently updated"
              initial={8}
              step={8}
              moreLabel="Load more datasets"
              empty={noMatch('datasets')}
            />
          </Subsection>
        ) : null}
        {shown('organisations') ? (
          <Subsection
            id="organisations"
            title="Organisations and Partners"
            count={countLabel('organisations')}
            description="Organisations and partners working together in this collaborative."
          >
            <MemberSection
              label="Organisations and Partners"
              kind="organisation"
              rows={matches.organisations}
              itemsPerRow={5}
              empty={noMatch('organisations')}
              paused={paused}
              onTogglePaused={() => setPaused((current) => !current)}
            />
          </Subsection>
        ) : null}
        {shown('people') ? (
          <Subsection
            id="people"
            title="Contributors"
            count={countLabel('people')}
            description="People contributing to this collaborative."
          >
            <MemberSection
              label="Contributors"
              kind="person"
              rows={matches.people}
              itemsPerRow={6}
              empty={noMatch('people')}
              paused={paused}
              onTogglePaused={() => setPaused((current) => !current)}
            />
          </Subsection>
        ) : null}
      </div>
    </section>
  );
}

function memberText(row: MemberRow): string {
  return `${row.name} ${row.caption ?? ''}`.toLowerCase();
}

function matchSummary(
  query: string,
  keys: SectionKey[],
  filter: Filter,
  matches: Record<SectionKey, unknown[]>
): string {
  const visible = keys.filter((key) => filter === 'all' || filter === key);
  const total = visible.reduce((sum, key) => sum + matches[key].length, 0);
  const term = query.trim();
  if (total === 0) {
    return `No matches for “${term}”. Try a different word, or clear the search.`;
  }
  const parts = visible
    .filter((key) => matches[key].length > 0)
    .map((key) => {
      const count = matches[key].length;
      return `${count} ${NOUNS[key][count === 1 ? 0 : 1]}`;
    });
  return `${total} ${total === 1 ? 'match' : 'matches'} for “${term}”: ${parts.join(' · ')}.`;
}

function Subsection({
  id,
  title,
  count,
  description,
  children,
}: {
  id: string;
  title: string;
  count: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-[112px]"
    >
      <h3
        id={`${id}-heading`}
        className="font-primary text-300 font-semi-bold leading-[26px] text-primaryBlue"
      >
        {title} <span className="font-regular text-[#6b6b6b]">· {count}</span>
      </h3>
      <p className="mb-6 mt-1 text-100 leading-[21px] text-[#6b6b6b]">
        {description}
      </p>
      {children}
    </section>
  );
}

function ResourceGrid({
  kind,
  rows,
  noun,
  recentLabel,
  initial,
  step,
  moreLabel,
  empty,
}: {
  kind: ResourceKind;
  rows: ResourceRow[];
  noun: [string, string];
  recentLabel: string;
  initial: number;
  /** Cards added per click, or null to reveal everything at once. */
  step: number | null;
  moreLabel: string;
  empty: string;
}) {
  const [sort, setSort] = useState<'relevance' | 'recent'>('relevance');
  const [limit, setLimit] = useState(initial);
  const sorted = useMemo(
    () =>
      sort === 'relevance'
        ? rows
        : [...rows].sort((a, b) =>
            (b.sortDate ?? '').localeCompare(a.sortDate ?? '')
          ),
    [rows, sort]
  );

  if (rows.length === 0) {
    return <p className={EMPTY_STATE}>{empty}</p>;
  }

  const visible = sorted.slice(0, limit);
  const hidden = sorted.length - visible.length;
  const listId = `collaborative-${kind}-list`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-100">
        <p className="text-[#6b6b6b]">
          {rows.length} {rows.length === 1 ? noun[0] : noun[1]}
        </p>
        <label className="flex items-center gap-2 text-[#6b6b6b]">
          Sort by:
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as 'relevance' | 'recent');
              setLimit(initial);
            }}
            className="rounded-1 border-[0px] bg-transparent py-1 pr-1 font-medium text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primaryBlue"
          >
            <option value="relevance">Most relevant</option>
            <option value="recent">{recentLabel}</option>
          </select>
        </label>
      </div>
      <ul
        id={listId}
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {visible.map((row) => (
          <li key={row.id} className="min-w-0">
            <Card {...cardProps(row)} />
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <div>
          <button
            type="button"
            aria-controls={listId}
            onClick={() =>
              setLimit((current) => (step ? current + step : sorted.length))
            }
            className="inline-flex cursor-pointer items-center gap-2 border-[0px] bg-transparent p-0 text-100 font-medium text-primaryBlue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
          >
            {moreLabel}
            {step ? (
              <IconArrowDown size={16} aria-hidden />
            ) : (
              <IconArrowRight size={16} aria-hidden />
            )}
            <span className="font-regular text-[#6b6b6b]">({hidden} more)</span>
          </button>
        </div>
      ) : !step && sorted.length > initial ? (
        <div>
          <button
            type="button"
            aria-controls={listId}
            onClick={() => setLimit(initial)}
            className="cursor-pointer border-[0px] bg-transparent p-0 text-100 font-medium text-primaryBlue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
          >
            Show fewer
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Same card props as the listing pages, so cards look identical there and here. */
function cardProps(row: ResourceRow) {
  // The use case listing shows no description, so neither do these cards.
  let description = row.description;
  if (row.kind === 'use-case') description = '';
  if (row.kind === 'dataset') description = stripMarkdown(row.description);

  const metadata = [];
  if (row.dateLabel) {
    metadata.push({
      icon: Icons.calendarEvent,
      label: 'Date',
      value: row.dateLabel,
      tooltip: 'Date',
      stroke: 1.2,
    });
  }
  if (row.downloadCount > 0) {
    metadata.push({
      icon: Icons.fileDownload,
      label: 'Download',
      value: row.downloadCount,
      tooltip: 'Download',
      stroke: 1.2,
    });
  }
  if (row.geography) {
    metadata.push({
      icon: Icons.worldPin,
      label: 'Geography',
      value: row.geography,
      tooltip: row.geography,
      stroke: 1.2,
    });
  }

  return {
    title: row.title,
    description,
    metadataContent: firstThree(metadata),
    leftFooterChips: row.sector
      ? [
          {
            icon: `/Sectors/${row.sector}.svg`,
            label: 'Sectors',
            tooltip: row.sector,
          },
        ]
      : [],
    rightFooterChips: [
      {
        icon: row.publisherImage,
        label: 'Published by',
        tooltip: row.publisherName || 'Published by',
      },
    ],
    imageUrl: row.imageSrc ?? undefined,
    variation: 'collapsed' as const,
    iconColor: 'warning' as const,
    href: row.href,
    // Listings show "View" on use case and publication cards, not on datasets.
    withViewButton: row.kind !== 'dataset',
  };
}

function MemberSection({
  label,
  kind,
  rows,
  itemsPerRow,
  empty,
  paused,
  onTogglePaused,
}: {
  label: string;
  kind: MemberKind;
  rows: MemberRow[];
  itemsPerRow: number;
  empty: string;
  paused: boolean;
  onTogglePaused: () => void;
}) {
  if (rows.length === 0) {
    return <p className={EMPTY_STATE}>{empty}</p>;
  }

  const ticker = (
    <MemberTicker
      label={label}
      kind={kind}
      rows={rows}
      itemsPerRow={itemsPerRow}
      paused={paused}
    />
  );
  // Static chips have nothing to pause.
  if (!shouldScroll(rows.length, itemsPerRow)) return ticker;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          kind="secondary"
          size="slim"
          onClick={onTogglePaused}
          className="!inline-flex !h-[36px] !min-h-0 !items-center !justify-center !gap-2 !rounded-[10px] !border-[0.8px] !border-solid !border-[#8c8c8c] !bg-white !px-3 !py-0 !text-center !font-primary !text-[14px] !font-medium !leading-[20px] !tracking-[0] !text-[#0a0a0a] ![box-shadow:none] hover:!bg-[#e4e4e6]"
          {...{ 'aria-pressed': paused }}
        >
          <span className="inline-flex items-center gap-2 font-primary text-[14px] font-medium leading-[20px] text-[#0a0a0a]">
            {paused ? (
              <IconPlayerPlay size={16} color="#0a0a0a" aria-hidden />
            ) : (
              <IconPlayerPause size={16} color="#0a0a0a" aria-hidden />
            )}
            {paused ? 'Play animation' : 'Pause animation'}
          </span>
        </Button>
      </div>
      {ticker}
    </>
  );
}
