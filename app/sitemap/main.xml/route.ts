// app/sitemap.xml/route.ts
import { type NextRequest } from 'next/server';

import {
  ENTITY_CONFIG,
  ENTITY_CONFIG_TYPE,
  getSiteMapConfig,
  isSitemapEnabled,
} from '@/lib/utils';

const getAllEntityCounts = async (): Promise<Record<string, number>> => {
  const counts: Record<string, number> = {};

  const countPromises: Promise<{ entityName: string; count: number }>[] = [];

  Object.entries(ENTITY_CONFIG).forEach(([entityName, config]) => {
    if (config.source === 'graphql' && config.graphqlQuery) {
      countPromises.push(getGraphqlEntityCount(entityName, config));
    }
    if (config.source === 'search' && config.endpoint) {
      countPromises.push(getSearchEntityCount(entityName, 5, 1));
    }
  });

  const results = await Promise.all(countPromises);

  results.forEach(({ entityName, count }) => {
    counts[entityName] = count;
  });

  return counts;
};

export async function getGraphqlEntityCount(
  entity: string,
  config: ENTITY_CONFIG_TYPE[string]
): Promise<{ entityName: string; count: number; list: any }> {
  try {
    const response = await fetch(
      `${process.env.FEATURE_SITEMAP_BACKEND_BASE_URL}/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: config.graphqlQuery,
          variables: {},
        }),
      }
    );
    const data = await response.json();

    return {
      entityName: entity,
      count: data?.data?.[config.queryResKey as string]?.length || 0,
      list: data?.data?.[config.queryResKey as string] || [],
    };
  } catch (error) {
    console.error(`Error fetching count for ${entity}:`, error);
    return { entityName: entity, count: 0, list: [] };
  }
}

export async function getSearchEntityCount(
  entity: string,
  size: number,
  page: number
): Promise<{ entityName: string; count: number; list: any }> {
  try {
    const config = ENTITY_CONFIG[entity];
    const response = await fetch(
      `${process.env.FEATURE_SITEMAP_BACKEND_BASE_URL}${config.endpoint}?sort=recent&size=${size}&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );
    const data = await response.json();
    return { entityName: entity, count: data.total, list: data.results };
  } catch (error) {
    console.error(`Error fetching count for ${entity}:`, error);
    return { entityName: entity, count: 0, list: [] };
  }
}

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

export async function GET(request: NextRequest) {
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
