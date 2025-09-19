import { ENTITY_CONFIG, ENTITY_CONFIG_TYPE } from '@/lib/utils';

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
