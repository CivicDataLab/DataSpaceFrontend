import { NextResponse } from 'next/server';

import { getSitemapBaseUrl } from '@/lib/sitemap-utils';
import { isSitemapEnabled } from '@/lib/utils';

/** Legacy path — redirect to the canonical sitemap index. */
export async function GET() {
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  const baseUrl = getSitemapBaseUrl();
  return NextResponse.redirect(`${baseUrl}/sitemap.xml`, 308);
}

export const dynamic = 'force-dynamic';
