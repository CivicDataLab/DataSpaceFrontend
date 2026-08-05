import {
  generateStaticSitemapXml,
  getSitemapBaseUrl,
} from '@/lib/sitemap-utils';
import { getSiteMapConfig, isSitemapEnabled } from '@/lib/utils';

export async function GET() {
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  const flags = getSiteMapConfig();
  const sitemap = generateStaticSitemapXml(getSitemapBaseUrl());

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${flags.cacheDuration}`,
    },
  });
}

export const dynamic = 'force-dynamic';
