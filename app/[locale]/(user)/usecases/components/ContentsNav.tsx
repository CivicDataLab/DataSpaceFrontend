'use client';

import type { MouseEvent } from 'react';

import type { StoryHeading } from './story-outline';

type ContentsNavProps = {
  items: StoryHeading[];
};

export function ContentsNav({ items }: ContentsNavProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Contents">
      <p className="text-75 font-medium uppercase leading-1 tracking-[0.3px] text-[#0a0a0a]">
        Contents
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-100 font-regular leading-[21px] text-[#6B6B6B] transition-colors hover:text-primaryBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
              onClick={(event) => jumpTo(event, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({
    behavior: reduce ? 'auto' : 'smooth',
    block: 'start',
  });
  window.history.replaceState(null, '', `#${id}`);
}
