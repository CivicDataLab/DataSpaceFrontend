export type CollaborativeEditStep = 'about' | 'people' | 'content' | 'publish';

export function plainSummary(value?: string | null) {
  return (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCollaborativeAboutComplete(item: {
  title?: string | null;
  summary?: string | null;
  sectors?: unknown[] | null;
  sdgs?: unknown[] | null;
}) {
  return (
    Boolean(item.title?.trim()) &&
    plainSummary(item.summary).length > 0 &&
    (item.sectors?.length ?? 0) > 0 &&
    (item.sdgs?.length ?? 0) > 0
  );
}

export function aboutEditTarget(item: {
  title?: string | null;
  summary?: string | null;
  sectors?: unknown[] | null;
  sdgs?: unknown[] | null;
}) {
  if (!item.title?.trim()) return 'collaborative-name';
  if (!plainSummary(item.summary)) return 'description';
  if ((item.sectors?.length ?? 0) === 0) return 'sectors';
  if ((item.sdgs?.length ?? 0) === 0) return 'sdgs';
  return 'basic-information';
}

export function contentEditTarget(item: {
  datasets?: unknown[] | null;
  useCases?: unknown[] | null;
}) {
  if ((item.datasets?.length ?? 0) === 0) return 'datasets';
  return 'use-cases';
}

export function isCollaborativeContentComplete(item: {
  datasets?: unknown[] | null;
  useCases?: unknown[] | null;
}) {
  return (item.datasets?.length ?? 0) + (item.useCases?.length ?? 0) > 0;
}

export function firstIncompleteCollaborativeEditStep(item: {
  title?: string | null;
  summary?: string | null;
  datasets?: unknown[] | null;
  useCases?: unknown[] | null;
}): CollaborativeEditStep {
  if (!isCollaborativeAboutComplete(item)) return 'about';
  if (!isCollaborativeContentComplete(item)) return 'content';
  return 'publish';
}

export function errorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message;
  }
  return fallback;
}
