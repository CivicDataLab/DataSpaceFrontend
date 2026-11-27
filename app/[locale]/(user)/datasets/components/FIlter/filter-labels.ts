/**
 * Readable text for search filter groups and values. Filters stay keyed by
 * the raw value the API expects (e.g. `sdgs=SDG3`); only what people read
 * changes.
 */
import { toTitleCase } from '@/lib/utils';
import { sdgCodeLabel } from '@/components/sdg-goals/sdg-goal';

const GROUP_TITLES: Record<string, string> = {
  sdgs: 'SDG Goals',
};

export function filterGroupTitle(category: string): string {
  return GROUP_TITLES[category] ?? toTitleCase(category);
}

export function filterValueLabel(category: string, value: string): string {
  return category === 'sdgs' ? sdgCodeLabel(value) : value;
}
