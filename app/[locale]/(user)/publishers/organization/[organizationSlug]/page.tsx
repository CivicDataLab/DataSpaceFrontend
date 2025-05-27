'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';
import ProfileDetails from '../../components/ProfileDetails';
import { Spinner } from 'opub-ui';
import SidebarCard from '../../components/SidebarCard';
import BreadCrumbs from '@/components/BreadCrumbs';

const orgInfoQuery: any = graphql(`
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

const OrgPage = () => {
  const params = useParams();
  const organizationInfo: any = useQuery([`${params.publisherSlug}`], () =>
    GraphQL(
      orgInfoQuery,
      {
        // Entity Headers if present
      },
      { id: params.organizationSlug }
    )
  );

  return (
    <main className="bg-primaryBlue">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/publishers', label: 'Publishers' },
          {
            href: '#',
            label: `${organizationInfo?.data?.organization?.name || ''} `,
          },
        ]}
      />
      {
        <div className="container py-10 text-surfaceDefault">
          <div className="flex flex-wrap gap-10 lg:flex-nowrap">
            <div className="w-full lg:w-1/4">
              {organizationInfo?.isLoading ? (
                <div className="m-4 flex justify-center rounded-2 bg-surfaceDefault p-4">
                  <Spinner color="highlight" />
                </div>
              ) : (
                <SidebarCard data={organizationInfo?.data?.organization} type={'organization'}/>
              )}
            </div>
            <div className="w-full">
              {organizationInfo?.isLoading ? (
                <div className="m-4 flex justify-center rounded-2 bg-surfaceDefault p-4">
                  <Spinner color="highlight" />
                </div>
              ) : (
                <ProfileDetails data={organizationInfo?.data?.organization} type={'organization'}/>

              )}
            </div>
          </div>
        </div>
      }
    </main>
  );
};

export default OrgPage;
