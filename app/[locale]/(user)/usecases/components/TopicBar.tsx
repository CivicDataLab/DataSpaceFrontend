import type { ReactNode } from 'react';
import Link from 'next/link';

import type { SdgGoal } from '@/components/sdg-goals/sdg-goal';
import { SdgGoals } from '@/components/sdg-goals/SdgGoals';
import styles from './topic-bar.module.css';
import { searchHref, type TopicLabel } from './usecase-rail';

type TopicBarProps = {
  tags: TopicLabel[];
  sdgs: SdgGoal[];
  sectors: TopicLabel[];
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
          <SdgGoals
            goals={sdgs}
            searchNoun="use cases"
            searchHref={(goal) => searchHref('sdgs', goal.code)}
          />
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
