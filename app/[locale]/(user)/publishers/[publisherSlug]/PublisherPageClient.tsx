'use client';

import React from 'react';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { generateJsonLd } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
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

const PublisherPageClient = ({ publisherSlug }: { publisherSlug: string }) => {
  const userInfo: any = useQuery([`${publisherSlug}`], () =>
    GraphQL(
      userInfoQuery,
      {
        // Entity Headers if present
      },
      { userId: publisherSlug }
    )
  );

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: userInfo?.data?.userById?.fullName,
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers/${publisherSlug}`,
    description: userInfo?.data?.userById?.bio,
    logo: {
      '@type': 'ImageObject',
      url: userInfo?.data?.userById?.profilePicture?.url
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${userInfo?.data?.userById?.profilePicture?.url}`
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
                <ProfileDetails
                  data={userInfo?.data?.userById}
                  type="Publisher"
                />
              )}
            </div>
          </div>
        </div>
      }
    </main>
  );
};

export default PublisherPageClient;
