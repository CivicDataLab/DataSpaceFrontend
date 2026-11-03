import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { getSafeEmbedUrl } from '@/lib/dashboardEmbed';
import { Loading } from '@/components/loading';
import JusticeHubEmbed, { isJusticeHubEmbed } from './JusticeHubEmbed';

const DashboardsList = graphql(`
  query usecaseDashboards($usecaseId: Int!) {
    usecaseDashboards(usecaseId: $usecaseId) {
      id
      name
      link
    }
  }
`);

const Dashboards = ({ usecaseId: usecaseIdValue }: { usecaseId: string }) => {
  const usecaseId = Number.parseInt(usecaseIdValue, 10);
  const isValidId =
    Number.isInteger(usecaseId) && String(usecaseId) === usecaseIdValue;

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
    .filter((dashboard): dashboard is typeof dashboard & { embedUrl: string } =>
      Boolean(dashboard.embedUrl)
    );

  if (!isValidId || (!isLoading && dashboards.length === 0)) {
    return null;
  }

  return (
    <section className="mt-12" aria-label="Explore the data">
      <h2 className="text-[24px] font-semi-bold leading-[30px] text-[#0a0a0a]">
        Explore the data
      </h2>
      <p className="mt-2 text-100 font-regular leading-[21px] text-[#6B6B6B]">
        Explore the data in greater depth through the embedded dashboard.
      </p>
      {isLoading ? (
        <div className="mt-4 flex min-h-[420px] items-center justify-center rounded-4 bg-baseGraySlateSolid3">
          <Loading />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {dashboards.map((dashboard) =>
            isJusticeHubEmbed(dashboard.embedUrl) ? (
              <JusticeHubEmbed
                key={dashboard.id}
                src={dashboard.embedUrl}
                title={dashboard.name || 'Dashboard'}
              />
            ) : (
              <iframe
                key={dashboard.id}
                title={dashboard.name || 'Dashboard'}
                src={dashboard.embedUrl}
                className="border-0 min-h-[420px] w-full rounded-4 bg-baseGraySlateSolid3"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

export default Dashboards;
