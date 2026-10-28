/**
 * Small formatting helpers shared by the public dataset and use-case pages:
 * backend file addresses, publisher page links, name lists, website labels,
 * HTML to plain text, and the short date shown on covers.
 */

const SHORT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * Full address for a file the backend stores. Absolute URLs pass through.
 * Use-case and collaborative images carry a `/code/files/` storage prefix
 * that must be removed first; set `stripCodeFiles` for those.
 */
export function backendFileUrl(
  path: string | null | undefined,
  { stripCodeFiles = false }: { stripCodeFiles?: boolean } = {}
): string | null {
  const trimmed = path?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
  if (!base) return null;

  const relative = (
    stripCodeFiles ? trimmed.replace('/code/files/', '') : trimmed
  ).replace(/^\//, '');
  return `${base}/${relative}`;
}

export function personPublisherHref(name: string, id: string): string {
  return `/publishers/${name}_${id}`;
}

export function organizationPublisherHref(organization: {
  name: string;
  slug?: string | null;
  id: string;
}): string {
  return `/publishers/organization/${organization.slug || organization.name}_${organization.id}`;
}

/** Trimmed, non-empty values in their first-seen order, without repeats. */
export function uniqueNames(
  values: Array<string | null | undefined> | null | undefined
): string[] {
  const names: string[] = [];
  for (const value of values ?? []) {
    const trimmed = value?.trim();
    if (trimmed && !names.includes(trimmed)) names.push(trimmed);
  }
  return names;
}

/** Comma-separated unique names, or null when there are none. */
export function joinNames(
  values: Array<string | null | undefined> | null | undefined
): string | null {
  const names = uniqueNames(values);
  return names.length ? names.join(', ') : null;
}

/** Host name without `www.`, or null when the address does not parse. */
export function websiteLabel(href: string): string | null {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<[\s\S]*?>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** `05 Mar 2026`, or null when the value is not a date. */
export function formatShortDate(
  value: string | number | null | undefined
): string | null {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return SHORT_DATE.format(date).replace(/[\u00A0\u202F]/g, ' ');
}
