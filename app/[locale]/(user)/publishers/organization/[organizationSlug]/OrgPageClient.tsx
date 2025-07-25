'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphql } from '@/gql';
import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import SidebarCard from '../../components/SidebarCard';
import ProfileDetails from '../../components/ProfileDetails';
import { Spinner } from 'opub-ui';

const orgInfoQuery = graphql(`
  query organizationData($id: String!) {
    organization(id: $id) {
      id
      created
      description
      contributedSectorsCount
      location
      twitterProfile
      githubProfile
      name
      logo {
        url
      }
      publishedUseCasesCount
      publishedDatasetsCount
      linkedinProfile
    }
  }
`);

const OrgPageClient = ({ organizationSlug }: { organizationSlug: string }) => {
  const { data, isLoading } = useQuery(
    [`org_details_${organizationSlug}`],
    () =>
      GraphQL(orgInfoQuery, {}, {
        id: organizationSlug,
      }),
    { refetchOnMount: true }
  );

  const org = data?.organization;

  return (
    <main className="bg-primaryBlue">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/publishers', label: 'Publishers' },
          {
            href: '#',
            label: org?.name || organizationSlug,
          },
        ]}
      />
      <div className="container py-10 text-surfaceDefault">
        <div className="flex flex-wrap gap-10 lg:flex-nowrap">
          <div className="w-full lg:w-1/4">
            {isLoading ? (
              <div className="m-4 flex justify-center rounded-2 bg-surfaceDefault p-4">
                <Spinner color="highlight" />
              </div>
            ) : (
              <SidebarCard data={org} type="organization" />
            )}
          </div>
          <div className="w-full">
            {isLoading ? (
              <div className="m-4 flex justify-center rounded-2 bg-surfaceDefault p-4">
                <Spinner color="highlight" />
              </div>
            ) : (
              <ProfileDetails data={org} type="organization" />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrgPageClient;
