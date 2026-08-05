// app/sitemap.xml/route.ts
import { getAllEntityCounts, getSitemapBaseUrl } from '@/lib/sitemap-utils';
import { ENTITY_CONFIG, getSiteMapConfig, isSitemapEnabled } from '@/lib/utils';

function generateStaticUrls(baseUrl: string): string {
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/datasets', priority: '0.9', changefreq: 'daily' },
    { path: '/usecases', priority: '0.8', changefreq: 'weekly' },
    { path: '/collaboratives', priority: '0.8', changefreq: 'weekly' },
    { path: '/publishers', priority: '0.7', changefreq: 'weekly' },
    { path: '/sectors', priority: '0.7', changefreq: 'weekly' },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly' },
  ];

  return staticPages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}${page.path}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join('');
}

function generateSitemapIndex(
  sitemapUrls: string[],
  staticUrls: string
): string {
  const sitemapEntries = sitemapUrls
    .map(
      (url) =>
        `
    <url>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}\n${sitemapEntries}\n</urlset>`;
}

export async function GET() {
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  try {
    const flags = getSiteMapConfig();
    const ITEMS_PER_SITEMAP = flags.itemsPerPage;
    const baseUrl = getSitemapBaseUrl();

    const sitemapUrls: string[] = [];
    const entityCounts = await getAllEntityCounts();

    Object.keys(ENTITY_CONFIG).forEach((entity) => {
      const count = entityCounts[entity] || 0;
      if (count <= 0) return;

      const pages = Math.ceil(count / ITEMS_PER_SITEMAP);
      for (let i = 1; i <= pages; i++) {
        sitemapUrls.push(`${baseUrl}/sitemap/${entity}-${i}.xml`);
      }
    });

    const sitemapIndex = generateSitemapIndex(
      sitemapUrls,
      generateStaticUrls(baseUrl)
    );

    return new Response(sitemapIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${flags.cacheDuration}`,
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);

    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new Response(errorSitemap, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

export const dynamic = 'force-dynamic';
