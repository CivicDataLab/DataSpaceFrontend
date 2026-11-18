import { Text } from 'opub-ui';

import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';
import ListingComponent from '../components/ListingComponent';

const DESCRIPTION =
  'Reports, policy briefs, case studies, and toolkits from organisations and people on CivicDataSpace.';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Publications | CivicDataSpace',
    description: DESCRIPTION,
    keywords: [
      'Publications',
      'Reports',
      'Policy Briefs',
      'Case Studies',
      'Toolkits',
      'CivicDataSpace Publications',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publications`,
      title: 'Publications | CivicDataSpace',
      description: DESCRIPTION,
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

const breadcrumbData = [
  { href: '/', label: 'Home' },
  { href: '#', label: 'Publications' },
];

export default function PublicationsPage() {
  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Publications | CivicDataSpace',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/publications`,
    description: DESCRIPTION,
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <Text as="h1" visuallyHidden>
        Publications
      </Text>
      <ListingComponent
        type="publication"
        breadcrumbData={breadcrumbData}
        redirectionURL="/publications"
        placeholder="Start typing to search for any Publication"
      />
    </>
  );
}
