import { env } from '@/env';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PublicSection = 'datasets' | 'usecases' | 'aimodels' | 'events';

/** Dataset primary keys are UUIDs. A UUID is an old link, so it is not a publicId. */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Use case and AI model primary keys are integers. */
export function isIntegerId(value: string): boolean {
  return /^\d+$/.test(value);
}

export function publicHref(
  section: PublicSection,
  urlSlug: string | null | undefined,
  fallbackId: string | number
): string {
  const segment = urlSlug?.trim() || String(fallbackId);
  return `/${section}/${segment}`;
}

export function publicPageUrl(section: PublicSection, segment: string): string {
  const base = env.NEXT_PUBLIC_PLATFORM_URL.replace(/\/$/, '');
  return `${base}${publicHref(section, segment, segment)}`;
}

export function datasetLookup(segment: string): {
  datasetId?: string;
  publicId?: string;
} {
  return isUuid(segment) ? { datasetId: segment } : { publicId: segment };
}

export function aiModelLookup(segment: string): {
  modelId?: number;
  publicId?: string;
} {
  return isIntegerId(segment)
    ? { modelId: Number.parseInt(segment, 10) }
    : { publicId: segment };
}

