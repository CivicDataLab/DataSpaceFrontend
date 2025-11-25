import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';

const DashboardsList: any = graphql(`
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

  const { data, isLoading } = useQuery<{ usecaseDashboards: any }>(
    ['fetch_dashboardData', usecaseId],
    () => GraphQL(DashboardsList, {}, { usecaseId }),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
      enabled: isValidId,
    }
  );

  if (!isValidId) {
    return null;
  }

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        data?.usecaseDashboards?.length > 0 && (
          <div className="container py-10">
            <div className=" flex flex-col gap-1 ">
              <Text variant="headingXl">
                Dashboards Linked to this Use Case
              </Text>
              <Text variant="bodyLg" fontWeight="regular">
                Analytical dashboards to explore the data further{' '}
              </Text>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data?.usecaseDashboards?.map((dashboard: any) => (
                <Link
                  key={dashboard.id}
                  href={dashboard.link}
                  className="flex h-[100px] w-full items-center rounded-4 bg-surfaceDefault p-5 shadow-card"
                  target="_blank"
                >
                  <Text
                    variant="bodyLg"
                    className="line-clamp-2 text-primaryText"
                    title={dashboard.name}
                  >
                    {dashboard.name}
                  </Text>
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboards;
