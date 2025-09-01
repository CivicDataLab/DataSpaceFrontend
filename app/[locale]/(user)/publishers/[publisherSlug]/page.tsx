import { Metadata } from 'next';
import { graphql } from '@/gql';

import { GraphQL } from '@/lib/api';
import { generatePageMetadata } from '@/lib/utils';
import PublisherPageClient from './PublisherPageClient';

const userInfo = graphql(`
  query Userdetails($userId: ID!) {
    userById(userId: $userId) {
      id
      bio
      fullName
      profilePicture {
        url
      }
    }
  }
`);
export async function generateMetadata(
  props: {
    params: Promise<{ publisherSlug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const data = await GraphQL(userInfo, {}, { userId: params.publisherSlug });

  const user = data.userById;

  return generatePageMetadata({
    title: `${user?.fullName} | Publisher on CivicDataSpace`,
    description:
      user?.bio || 'Explore datasets and use cases by this publisher.',
    keywords: [
      'CivicDataSpace Publisher',
      'Open Data Contributor',
      'Use Case Publisher',
      'Dataset Publisher',
      'CivicTech',
      'Open Government Data',
    ],
    openGraph: {
      title: `${user?.fullName} | Publisher on CivicDataSpace`,
      description:
        user?.bio || 'Explore datasets and use cases by this publisher.',
      type: 'profile',
      siteName: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers/${params.publisherSlug}`,
      image: user?.profilePicture?.url
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.profilePicture.url}`
        : `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      locale: 'en_US',
    },
  });
}

export default async function PublisherPage(
  props: {
    params: Promise<{ publisherSlug: string }>;
  }
) {
  const params = await props.params;
  return <PublisherPageClient publisherSlug={params.publisherSlug} />;
}
