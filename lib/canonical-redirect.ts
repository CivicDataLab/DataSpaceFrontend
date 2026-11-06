import { getLocale } from 'next-intl/server';
import { permanentRedirect } from 'next/navigation';

import { publicHref, type PublicSection } from '@/lib/public-link';

/** Next.js implements redirects by throwing. Callers must rethrow this error. */
export function isCanonicalRedirect(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    String((error as { digest?: unknown }).digest).startsWith('NEXT_REDIRECT')
  );
}

/** 308 to the current urlSlug when the address is an old id or a renamed link. */
export async function redirectToCanonical(
  section: PublicSection,
  requested: string,
  urlSlug: string | null | undefined
): Promise<void> {
  const canonical = urlSlug?.trim();
  if (!canonical || canonical === requested) return;

  const locale = await getLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  permanentRedirect(`${prefix}${publicHref(section, canonical, canonical)}`);
}
