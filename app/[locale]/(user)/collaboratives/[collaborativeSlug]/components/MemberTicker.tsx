'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';

import { publisherImageFallback } from '@/lib/public-entity';
import MediaImage from '@/components/MediaImage';
import type { MemberRow } from '../collaborative-detail';
import styles from './member-ticker.module.css';

/** Pills per row before the row repeats, so short rows still fill the width. */
const MIN_PILLS_PER_ROW = 9;
/** Roughly how wide one pill is, in pixels, for pacing the scroll. */
const PILL_WIDTH = 320;
/** Scroll speed of the first row in pixels per second; later rows run a bit faster. */
const BASE_SPEED = 36;

/** People without a photo get blue initials; organisations get grey. */
export type MemberKind = 'person' | 'organisation';

type MemberTickerProps = {
  label: string;
  kind: MemberKind;
  rows: MemberRow[];
  rowCount: number;
  paused: boolean;
};

export function MemberTicker({
  label,
  kind,
  rows,
  rowCount,
  paused,
}: MemberTickerProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-paused={paused}
      className={styles.ticker}
    >
      {splitRows(rows, rowCount).map((items, rowIndex) => {
        const repeats = Math.max(
          1,
          Math.ceil(MIN_PILLS_PER_ROW / items.length)
        );
        const pills = Array.from({ length: repeats }, (_, copy) =>
          items.map((item) => ({
            item,
            key: `${item.id}-${copy}`,
            extra: copy > 0,
          }))
        ).flat();
        const duration = Math.round(
          (pills.length * PILL_WIDTH) / (BASE_SPEED + rowIndex * 6)
        );
        const style = {
          '--ticker-duration': `${duration}s`,
          '--ticker-delay': `-${Math.round(duration * (0.18 + rowIndex * 0.31))}s`,
        } as CSSProperties;

        return (
          <div
            key={rowIndex}
            className={styles.track}
            data-reverse={rowIndex % 2 === 1}
            style={style}
          >
            <ul
              className="m-0 flex list-none p-0"
              aria-label={`${label}, row ${rowIndex + 1}`}
            >
              {pills.map(({ item, key, extra }) => (
                <Pill key={key} item={item} kind={kind} hidden={extra} />
              ))}
            </ul>
            {/* A second copy makes the loop seamless; screen readers skip it. */}
            <ul
              className={`m-0 flex list-none p-0 ${styles.loopCopy}`}
              aria-hidden
            >
              {pills.map(({ item, key }) => (
                <Pill key={`copy-${key}`} item={item} kind={kind} hidden />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Splits rows into at most `count` even rows. */
function splitRows(rows: MemberRow[], count: number): MemberRow[][] {
  const rowTotal = Math.max(1, Math.min(count, rows.length));
  const perRow = Math.ceil(rows.length / rowTotal);
  return Array.from({ length: rowTotal }, (_, index) =>
    rows.slice(index * perRow, (index + 1) * perRow)
  ).filter((row) => row.length > 0);
}

/** One pill; repeated copies are hidden from screen readers and the tab order. */
function Pill({
  item,
  kind,
  hidden,
}: {
  item: MemberRow;
  kind: MemberKind;
  hidden: boolean;
}) {
  return (
    <li
      aria-hidden={hidden || undefined}
      className={`mr-4 shrink-0 ${hidden ? styles.loopCopy : ''}`}
    >
      <Link
        href={item.href}
        tabIndex={hidden ? -1 : undefined}
        className="flex max-w-[352px] items-center gap-4 rounded-full bg-[#f4f4f5] py-3 pl-3 pr-8 transition-colors hover:bg-[#e7ebf5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
      >
        {item.imageSrc ? (
          <MediaImage
            src={item.imageSrc}
            fallback={publisherImageFallback(item.href)}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full bg-white object-cover"
          />
        ) : (
          <span
            aria-hidden
            className={`flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-200 font-semi-bold leading-3 ${
              kind === 'person' ? 'text-[#2a78d6]' : 'text-[#6b6b6b]'
            }`}
          >
            {initials(item.name)}
          </span>
        )}
        <span className="min-w-0">
          <span
            className="block truncate text-200 font-semi-bold capitalize leading-[20px] text-[#000]"
            title={item.name}
          >
            {item.name}
          </span>
          {item.caption ? (
            <span className="mt-1 block truncate text-75 font-medium capitalize leading-1 text-[#6b6b6b]">
              {item.caption}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

/** Up to two initials, skipping bracketed text and filler words like "of". */
function initials(name: string): string {
  return (
    name
      .replace(/\(.*?\)/g, '')
      .split(/[\s.]+/)
      .filter((word) => /^[A-Za-z]/.test(word) && !FILLER_WORDS.test(word))
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || '·'
  );
}

const FILLER_WORDS = /^(the|of|and|dr)$/i;
