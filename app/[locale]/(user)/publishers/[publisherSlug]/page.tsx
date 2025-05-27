'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import ProfileDetails from '../components/ProfileDetails';
import SidebarCard from '../components/SidebarCard';

const userInfoQuery: any = graphql(`
  query UserData($userId: ID!) {
    userById(userId: $userId) {
      id
      bio
      dateJoined
      contributedSectorsCount
      location
      twitterProfile
      githubProfile
      fullName
      profilePicture {
        url
      }
      publishedUseCasesCount
      publishedDatasetsCount
      linkedinProfile
    }
  }
`);

const PublisherPage = () => {
  const params = useParams();
  const userInfo: any = useQuery([`${params.publisherSlug}`], () =>
    GraphQL(
      userInfoQuery,
      {
        // Entity Headers if present
      },
      { userId: params.publisherSlug }
    )
  );

  return (
    <main className="bg-primaryBlue">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/publishers', label: 'Publishers' },
          { href: '#', label: `${userInfo?.data?.userById?.fullName || ''} ` },
        ]}
      />
      {
        <div className="container py-10 text-surfaceDefault">
          <div className="flex flex-wrap gap-10 lg:flex-nowrap">
            <div className="w-full lg:w-1/4">
              {userInfo?.isLoading ? (
                <div className="m-4 flex justify-center rounded-2 bg-surfaceDefault p-4">
                  <Spinner color="highlight" />
                </div>
              ) : (
                <SidebarCard data={userInfo?.data?.userById} type="Publisher" />
              )}
            </div>
            <div className="w-full">
              {userInfo?.isLoading ? (
                <div className="m-4 flex justify-center rounded-2 bg-surfaceDefault p-4">
                  <Spinner color="highlight" />
                </div>
              ) : (
                <ProfileDetails data={userInfo?.data?.userById} type="Publisher" />
              )}
            </div>
          </div>
        </div>
      }
    </main>
  );
};

export default PublisherPage;
