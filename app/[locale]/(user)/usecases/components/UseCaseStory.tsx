'use client';

import { useEffect, useRef } from 'react';
import { ContentBlocksRenderer } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/components/ContentBlocksRenderer';

import type { StoryHeading } from './story-outline';

type UseCaseStoryProps = {
  summary?: string | null;
  headings: StoryHeading[];
};

export function UseCaseStory({ summary, headings }: UseCaseStoryProps) {
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = storyRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll('h1, h2, h3'));
    const unused = [...nodes];

    for (const heading of headings) {
      const match = unused.find(
        (node) =>
          node.textContent?.replace(/\s+/g, ' ').trim() === heading.label
      );
      if (!match) continue;
      match.id = heading.id;
      unused.splice(unused.indexOf(match), 1);
    }

    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!hash || !headings.some((heading) => heading.id === hash)) return;
    document.getElementById(hash)?.scrollIntoView({ block: 'start' });
  }, [headings, summary]);

  if (!summary?.trim()) return null;

  return (
    <div
      ref={storyRef}
      className="min-w-0 [&_h1]:scroll-mt-28 [&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28 [&_.ql-editor_p]:text-[14px] [&_.ql-editor_p]:font-[400] [&_.ql-editor_p]:leading-[21px] [&_.ql-editor_p]:text-[#0a0a0a]/75 [&_.ql-editor_li]:text-[14px] [&_.ql-editor_li]:font-[400] [&_.ql-editor_li]:leading-[21px] [&_.ql-editor_li]:text-[#0a0a0a]/75 [&_.ql-editor_p_span]:text-[14px] [&_.ql-editor_p_span]:leading-[21px] [&_.ql-editor_p_span]:!text-[#0a0a0a]/75 [&_.ql-editor_li_span]:text-[14px] [&_.ql-editor_li_span]:leading-[21px] [&_.ql-editor_li_span]:!text-[#0a0a0a]/75"
    >
      <ContentBlocksRenderer summary={summary} />
    </div>
  );
}
