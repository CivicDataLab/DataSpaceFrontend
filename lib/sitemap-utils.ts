import { ENTITY_CONFIG, ENTITY_CONFIG_TYPE, getSiteMapConfig } from '@/lib/utils';

export function getSitemapBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_PLATFORM_URL || '').replace(/\/$/, '');
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function getGraphqlEntityCount(
  entity: string,
  config: ENTITY_CONFIG_TYPE[string]
): Promise<{ entityName: string; count: number; list: unknown[] }> {
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
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(
        `GraphQL count failed for ${entity}: ${response.status} ${response.statusText}`
      );
      return { entityName: entity, count: 0, list: [] };
    }

    const data = await response.json();

    if (data?.errors?.length) {
      console.error(`GraphQL errors for ${entity}:`, data.errors);
      return { entityName: entity, count: 0, list: [] };
    }

    let list: unknown[] = Array.isArray(data?.data?.[config.queryResKey as string])
      ? data.data[config.queryResKey as string]
      : [];

    if (config.filterTypename) {
      list = list.filter(
        (item): item is { __typename?: string } =>
          typeof item === 'object' &&
          item !== null &&
          (item as { __typename?: string }).__typename ===
            config.filterTypename
      );
    }

    return {
      entityName: entity,
      count: list.length || 0,
      list,
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
): Promise<{ entityName: string; count: number; list: unknown[] }> {
  try {
    const config = ENTITY_CONFIG[entity];
    const response = await fetch(
      `${process.env.FEATURE_SITEMAP_BACKEND_BASE_URL}${config.endpoint}?sort=recent&size=${size}&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(
        `Search count failed for ${entity}: ${response.status} ${response.statusText}`
      );
      return { entityName: entity, count: 0, list: [] };
    }

    const data = await response.json();
    return {
      entityName: entity,
      count: data.total || 0,
      list: data.results || [],
    };
  } catch (error) {
    console.error(`Error fetching count for ${entity}:`, error);
    return { entityName: entity, count: 0, list: [] };
  }
}

export const getAllEntityCounts = async (): Promise<Record<string, number>> => {
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

export async function getChildSitemapUrls(): Promise<string[]> {
  const baseUrl = getSitemapBaseUrl();
  const itemsPerPage = getSiteMapConfig().itemsPerPage;
  const urls: string[] = [`${baseUrl}/sitemap/static.xml`];

  const entityCounts = await getAllEntityCounts();

  Object.keys(ENTITY_CONFIG).forEach((entity) => {
    const count = entityCounts[entity] || 0;
    if (count <= 0) return;

    const pages = Math.ceil(count / itemsPerPage);
    for (let i = 1; i <= pages; i++) {
      urls.push(`${baseUrl}/sitemap/${entity}-${i}.xml`);
    }
  });

  return urls;
}

export function generateSitemapIndexXml(sitemapUrls: string[]): string {
  const entries = sitemapUrls
    .map(
      (url) => `
  <sitemap>
    <loc>${escapeXml(url)}</loc>
  </sitemap>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</sitemapindex>`;
}

export const STATIC_SITEMAP_PATHS = [
  '',
  '/datasets',
  '/usecases',
  '/collaboratives',
  '/publishers',
  '/sectors',
  '/about-us',
] as const;

export function generateStaticSitemapXml(baseUrl: string): string {
  const urls = STATIC_SITEMAP_PATHS.map(
    (path) => `
  <url>
    <loc>${escapeXml(`${baseUrl}${path}`)}</loc>
  </url>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}
