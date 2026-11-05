import { Suspense } from 'react';
import { Text } from 'opub-ui';

import { generateJsonLd, generatePageMetadata } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';

import { EventsListing } from './EventsListing';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Events | CivicDataSpace',
    description:
      'Upcoming events from organisations and people on CivicDataSpace.',
    keywords: ['Events', 'CivicDataSpace', 'Community'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/events`,
      title: 'Events | CivicDataSpace',
      description:
        'Upcoming events from organisations and people on CivicDataSpace.',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

export default function EventsPage() {
  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Events | CivicDataSpace',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/events`,
    description:
      'Upcoming events from organisations and people on CivicDataSpace.',
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Events' },
        ]}
      />
      <div className="container flex flex-col gap-8 px-4 py-8 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-2">
          <Text variant="heading2xl" as="h1" fontWeight="semibold">
            Events
          </Text>
          <Text color="subdued">
            Talks, meetups, and workshops from the CivicDataSpace community.
          </Text>
        </div>
        <Suspense fallback={<Text color="subdued">Loading events…</Text>}>
          <EventsListing />
        </Suspense>
      </div>
    </>
  );
}
