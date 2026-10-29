'use client';

import React from 'react';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { generateJsonLd } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import ProfileDetails from '../../components/ProfileDetails';
import SidebarCard from '../../components/SidebarCard';

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
      GraphQL(
        orgInfoQuery,
        {},
        {
          id: organizationSlug,
        }
      ),
    { refetchOnMount: true }
  );

  const org = data?.organization;
  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org?.name,
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers/organization/${organizationSlug}`,
    description: org?.description,
    logo: {
      '@type': 'ImageObject',
      url: org?.logo?.url
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${org.logo.url}`
        : `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataLab',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/about`,
    },
  });
  return (
    <main className="bg-primaryBlue">
      <JsonLd json={jsonLd} />
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
