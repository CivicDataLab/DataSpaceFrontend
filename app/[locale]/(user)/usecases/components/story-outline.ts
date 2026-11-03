/**
 * Reads the story headings (The Challenge, and the sections after it)
 * so the side list can jump to each one. Only headings inside the text
 * blocks are included. Highlight titles and link labels are not sections.
 */

import {
  isBlockEmpty,
  parseUseCaseContent,
} from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/content-document';
import { plainTextFromHtml } from '@/lib/public-entity';

export type StoryHeading = {
  id: string;
  label: string;
};

export function storyHeadings(summary?: string | null): StoryHeading[] {
  if (!summary?.trim()) return [];

  const headingPattern = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const used = new Set<string>();
  const headings: StoryHeading[] = [];

  for (const block of parseUseCaseContent(summary).blocks) {
    if (block.type !== 'text' || isBlockEmpty(block)) continue;

    headingPattern.lastIndex = 0;
    for (const match of block.html.matchAll(headingPattern)) {
      const label = plainTextFromHtml(match[2] ?? '');
      if (!label) continue;
      headings.push({ id: uniqueId(label, used), label });
    }
  }

  return headings;
}

function uniqueId(label: string, used: Set<string>): string {
  const base =
    label
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'section';

  let id = base;
  let count = 2;
  while (used.has(id)) {
    id = `${base}-${count}`;
    count += 1;
  }
  used.add(id);
  return id;
}
