// app/sitemap.xml/route.ts
import {
  getSiteMapConfig,
  isSitemapEnabled,
} from '@/lib/utils';
import { getAllEntityCounts } from '@/lib/sitemap-utils';

function generateStaticUrls(): string {
  const baseUrl = process.env.NEXTAUTH_URL;

  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/datasets', priority: '0.9', changefreq: 'daily' },
    { path: '/usecases', priority: '0.8', changefreq: 'weekly' },
    { path: '/publishers', priority: '0.7', changefreq: 'weekly' },
    { path: '/sectors', priority: '0.7', changefreq: 'weekly' },
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
  // Check if sitemaps are enabled via feature flag
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  try {
    const flags = getSiteMapConfig();
    const ITEMS_PER_SITEMAP = flags.itemsPerPage;

    // Fetch counts for all entities
    // const [sectorsCount] = await Promise.all([
    //   getGraphqlEntityCount({ sectors: ENTITY_CONFIG.sectors }),
    // ]);

    const baseUrl = process.env.NEXTAUTH_URL;

    // Generate sitemap URLs for each entity
    const sitemapUrls: string[] = [];

    const entityCounts = await getAllEntityCounts();

    // Datasets sitemaps
    if (entityCounts.datasets > 0) {
      const datasetPages = Math.ceil(entityCounts.datasets / ITEMS_PER_SITEMAP);
      for (let i = 1; i <= datasetPages; i++) {
        sitemapUrls.push(`${baseUrl}/sitemap/datasets-${i}.xml`);
      }
    }

    // Usecases sitemaps
    const usecasePages = Math.ceil(entityCounts.usecases / ITEMS_PER_SITEMAP);
    for (let i = 1; i <= usecasePages; i++) {
      sitemapUrls.push(`${baseUrl}/sitemap/usecases-${i}.xml`);
    }

    // Contributors sitemaps
    const contributorPages = Math.ceil(
      entityCounts.contributors / ITEMS_PER_SITEMAP
    );
    for (let i = 1; i <= contributorPages; i++) {
      sitemapUrls.push(`${baseUrl}/sitemap/contributors-${i}.xml`);
    }

    // Sectors sitemaps
    if (entityCounts.sectors > 0) {
      const sectorPages = Math.ceil(entityCounts.sectors / ITEMS_PER_SITEMAP);
      for (let i = 1; i <= sectorPages; i++) {
        sitemapUrls.push(`${baseUrl}/sitemap/sectors-${i}.xml`);
      }
    }

    const sitemapIndex = generateSitemapIndex(
      sitemapUrls,
      generateStaticUrls()
    );

    return new Response(sitemapIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${flags.cacheDuration}`,
      },
    });

    // return new Response(JSON.stringify(entityCounts), { status: 200 });
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
