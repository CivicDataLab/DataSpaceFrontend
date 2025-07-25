import { generatePageMetadata } from '@/lib/utils';
import PublishersListingClient from './PublishersListingClient';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Explore Data Publishers | CivicDataSpace',
    description:
      'Discover individual and organizational publishers who are driving open data for impact, transparency, and collaboration on CivicDataSpace.',
    keywords: [
      'Data Publishers',
      'Open Data Contributors',
      'Organizations',
      'Individual Publishers',
      'Civic Data',
      'Transparency',
      'CivicDataSpace',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publishers`,
      title: 'Explore Data Publishers | CivicDataSpace',
      description:
        'Meet the individuals and organizations opening up datasets for public good across sectors like governance, climate, and health.',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

export default function Page() {
  return <PublishersListingClient />;
}
