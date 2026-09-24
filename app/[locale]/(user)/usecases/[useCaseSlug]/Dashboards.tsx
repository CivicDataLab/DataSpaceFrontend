import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';

const getSafeEmbedUrl = (link: string | null | undefined) => {
  if (!link) return null;

  try {
    const url = new URL(link);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    if (url.pathname.includes('/superset/')) {
      url.searchParams.set('standalone', '1');
    }

    return url.toString();
  } catch {
    return null;
  }
};

const DashboardsList = graphql(`
  query usecaseDashboards($usecaseId: Int!) {
    usecaseDashboards(usecaseId: $usecaseId) {
      id
      name
      link
    }
  }
`);

const Dashboards = () => {
  const params = useParams<{ useCaseSlug?: string }>();
  const useCaseSlug = params?.useCaseSlug;

  const usecaseId =
    typeof useCaseSlug === 'string' ? Number.parseInt(useCaseSlug, 10) : NaN;

  const isValidId = !Number.isNaN(usecaseId);

  const { data, isLoading } = useQuery(
    ['fetch_dashboardData', usecaseId],
    () => GraphQL(DashboardsList, {}, { usecaseId }),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
      enabled: isValidId,
    }
  );

  const dashboards = (data?.usecaseDashboards ?? [])
    .map((dashboard) => ({
      ...dashboard,
      embedUrl: getSafeEmbedUrl(dashboard.link),
    }))
    .filter((dashboard) => dashboard.embedUrl);

  if (!isValidId || (!isLoading && dashboards.length === 0)) {
    return null;
  }

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="container py-10">
          <div className=" flex flex-col gap-1 ">
            <Text variant="headingXl">Dashboards Linked to this Use Case</Text>
            <Text variant="bodyLg" fontWeight="regular">
              Analytical dashboards to explore the data further{' '}
            </Text>
          </div>
          <div className="mt-8 flex flex-col gap-10">
            {dashboards.map((dashboard) => (
              <div key={dashboard.id}>
                <Text variant="headingLg" className="text-primaryText">
                  {dashboard.name}
                </Text>
                <div className="mt-4 overflow-hidden rounded-2 border border-baseGraySlateSolid9 bg-surfaceDefault">
                  <iframe
                    title={dashboard.name || 'Dashboard'}
                    src={dashboard.embedUrl || undefined}
                    className="min-h-[640px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <a
                  href={dashboard.embedUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-primaryBlue underline"
                >
                  Open dashboard in a new tab
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboards;
