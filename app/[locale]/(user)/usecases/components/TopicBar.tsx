import type { ReactNode } from 'react';
import Link from 'next/link';

import styles from './topic-bar.module.css';
import { searchHref, type SdgTopic, type TopicLabel } from './usecase-rail';

type TopicBarProps = {
  tags: TopicLabel[];
  sdgs: SdgTopic[];
  sectors: TopicLabel[];
};

const SDG_COLOR: Record<string, string> = {
  '1': '#E5243B',
  '2': '#DDA63A',
  '3': '#4C9F38',
  '4': '#C5192D',
  '5': '#FF3A21',
  '6': '#26BDE2',
  '7': '#FCC30B',
  '8': '#A21942',
  '9': '#FD6925',
  '10': '#DD1367',
  '11': '#FD9D24',
  '12': '#BF8B2E',
  '13': '#3F7E44',
  '14': '#0A97D9',
  '15': '#56C02B',
  '16': '#00689D',
  '17': '#19486A',
};

export function TopicBar({ tags, sdgs, sectors }: TopicBarProps) {
  if (tags.length === 0 && sdgs.length === 0 && sectors.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 grid gap-8 rounded-[12px] bg-[#f5f5f5] p-6 sm:grid-cols-3 sm:p-8">
      {tags.length > 0 ? (
        <TopicGroup title="Tags">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={searchHref('tags', tag.label)}
              className={styles.tag}
            >
              {tag.label}
            </Link>
          ))}
        </TopicGroup>
      ) : null}
      {sdgs.length > 0 ? (
        <TopicGroup title="SDG Goals">
          {sdgs.map((sdg) => (
            <Link
              key={sdg.id}
              href={searchHref('sdgs', sdg.label)}
              className={styles.sdg}
              style={{ ['--sdg' as string]: sdgColor(sdg.code) }}
            >
              <span className={styles.mark} aria-hidden />
              {sdgText(sdg.code, sdg.label)}
            </Link>
          ))}
        </TopicGroup>
      ) : null}
      {sectors.length > 0 ? (
        <TopicGroup title="Sector">
          {sectors.map((sector) => (
            <Link
              key={sector.id}
              href={searchHref('sectors', sector.label)}
              className={styles.sector}
            >
              {sector.label}
            </Link>
          ))}
        </TopicGroup>
      ) : null}
    </section>
  );
}

function TopicGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-100 font-medium leading-[18px] text-[#0a0a0a]">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function sdgNumber(code: string): string {
  return code.replace(/\D/g, '').replace(/^0+/, '');
}

function sdgText(code: string, label: string): string {
  const number = sdgNumber(code);
  const name = label
    .replace(/^\s*SDG\s*\d+\s*[.:-]?\s*/i, '')
    .replace(/^\d+\s*[.:]\s*/, '');
  return number ? `${number}. ${name}` : label;
}

function sdgColor(code: string): string {
  return SDG_COLOR[sdgNumber(code)] ?? '#687076';
}
