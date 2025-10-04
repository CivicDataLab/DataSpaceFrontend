import { Metadata } from 'next';

import { generatePageMetadata } from '@/lib/utils';
import CollaborativesListingClient from './CollaborativesListingClient';

export const metadata: Metadata = generatePageMetadata({
  title: 'Collaboratives | CivicDataSpace',
  description:
    'Explore collaborative data initiatives and partnerships. Discover how organizations work together to create impactful data solutions.',
  keywords: ['collaboratives', 'partnerships', 'data collaboration', 'civic data'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives`,
    title: 'Collaboratives | CivicDataSpace',
    description:
      'Explore collaborative data initiatives and partnerships. Discover how organizations work together to create impactful data solutions.',
    siteName: 'CivicDataSpace',
    image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
  },
});

export default function Page() {
  return <CollaborativesListingClient />;
}
