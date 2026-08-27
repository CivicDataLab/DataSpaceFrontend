import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';

import locales from './config/locales';

const publicPages = [
  '/',
  '/datasets',
  '/datasets/(.*)',
  '/login',
  '/chart',
  '/sectors',
  '/sectors/(.*)',
  '/usecases',
  '/usecases/(.*)',
  '/collaboratives',
  '/collaboratives/(.*)',
  '/about-us',
  '/publishers',
  '/publishers/(.*)',
  '/search',
  '/search/(.*)',
  '/aimodels',
  '/aimodels/(.*)',
];

const baseDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN;

const intlMiddleware = createIntlMiddleware({
  locales: locales.all,
  localePrefix: 'as-needed',
  defaultLocale: locales.default,
});

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

const getHostname = (hostHeader: string | null) =>
  (hostHeader || '').split(':')[0].toLowerCase();

const getPlatformUrl = () => {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL;
  if (!platformUrl) return null;
  try {
    return new URL(platformUrl);
  } catch {
    return null;
  }
};

const getBaseHostname = () => {
  if (baseDomain) {
    return baseDomain
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split(':')[0]
      .toLowerCase();
  }

  const platformUrl = getPlatformUrl();
  return platformUrl?.hostname?.toLowerCase() || null;
};

const getCollaborativeSlugFromHostname = (hostname: string) => {
  const normalizedHost = hostname.toLowerCase();
  const baseHostname = getBaseHostname();

  if (!baseHostname || normalizedHost === baseHostname) return null;

  const reservedSubdomains = new Set([
    'www',
    'dev',
    'staging',
    'stage',
    'test',
    'qa',
    'prod',
    'production',
    'app',
    'api',
    'admin',
    'assets',
    'static',
    'cdn',
  ]);

  // Local: <slug>.collab.localhost OR <slug>.collab.127.0.0.1
  if (
    baseHostname === 'collab.localhost' ||
    baseHostname === 'collab.127.0.0.1'
  ) {
    const localSuffix =
      baseHostname === 'collab.localhost'
        ? '.collab.localhost'
        : '.collab.127.0.0.1';
    if (!normalizedHost.endsWith(localSuffix)) return null;
    const slug = normalizedHost.slice(0, -localSuffix.length);
    if (!slug || slug.includes('.')) return null;
    if (reservedSubdomains.has(slug)) return null;
    return slug;
  }

  const baseSuffix = `.${baseHostname}`;
  if (!normalizedHost.endsWith(baseSuffix)) return null;
  const slug = normalizedHost.slice(0, -baseSuffix.length);
  if (!slug || slug.includes('.')) return null;
  if (reservedSubdomains.has(slug)) return null;
  return slug;
};

export default function proxy(req: NextRequest) {
  const hostname = getHostname(req.headers.get('host'));
  const localeRootRegex = RegExp(`^/(${locales.all.join('|')})/?$`, 'i');
  const localeRootMatch = req.nextUrl.pathname.match(localeRootRegex);
  const localePathRegex = RegExp(`^/(${locales.all.join('|')})(/.*)$`, 'i');
  const localePathMatch = req.nextUrl.pathname.match(localePathRegex);

  const baseHostname = getBaseHostname();
  const isPlatformHost = Boolean(baseHostname) && hostname === baseHostname;

  // Ensure collab.<domain>/ shows collaboratives listing (not main homepage)
  if (
    isPlatformHost &&
    (req.nextUrl.pathname === '/' || Boolean(localeRootMatch))
  ) {
    const rewriteUrl = req.nextUrl.clone();
    const defaultLocalePrefix = `/${locales.default}`;
    const localePrefix = localeRootMatch
      ? `/${localeRootMatch[1]}`
      : defaultLocalePrefix;
    rewriteUrl.pathname = `${localePrefix}/collaboratives`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const collaborativeSlug = getCollaborativeSlugFromHostname(hostname);
  if (collaborativeSlug) {
    const rewriteUrl = req.nextUrl.clone();
    const defaultLocalePrefix = `/${locales.default}`;

    // slug.domain/ -> /<locale>/collaboratives/<slug>
    if (req.nextUrl.pathname === '/' || Boolean(localeRootMatch)) {
      const localePrefix = localeRootMatch
        ? `/${localeRootMatch[1]}`
        : defaultLocalePrefix;
      rewriteUrl.pathname = `${localePrefix}/collaboratives/${collaborativeSlug}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    // slug.domain/<locale>/... -> /<locale>/collaboratives/<slug>/...
    if (localePathMatch) {
      rewriteUrl.pathname = `/${localePathMatch[1]}/collaboratives/${collaborativeSlug}${localePathMatch[2]}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    // slug.domain/<path> -> /<default-locale>/collaboratives/<slug>/<path>
    rewriteUrl.pathname = `${defaultLocalePrefix}/collaboratives/${collaborativeSlug}${req.nextUrl.pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const publicPathnameRegex = RegExp(
    `^(/(${locales.all.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
