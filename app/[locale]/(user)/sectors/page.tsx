import React from 'react';

import { generatePageMetadata } from '@/lib/utils';
import SectorsListing from './SectorsListing';

export const generateMetadata = () =>
  generatePageMetadata({
    title: 'Explore Sector-Wise Open Data | CivicDataSpace',
    description:
      'Browse datasets and real-world use cases across key sectors like Climate Action, Gender Equality, Law and Justice, and Urban Development. Discover insights that drive data-informed governance and civic innovation.',
    keywords: [
      'Sector Data',
      'Open Data by Sector',
      'Climate Action Datasets',
      'Gender Equality Data',
      'Public Finance',
      'Child Rights',
      'Disaster Risk Reduction',
      'Law and Justice',
      'Urban Development',
      'Coastal Data',
      'CivicDataSpace Sectors',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/sectors`,
      title: 'Explore Sector-Wise Open Data | CivicDataSpace',
      description:
        'Explore datasets and civic use cases organized by sectors including climate, gender, governance, and more — curated to support researchers, policymakers, and the public.',
      siteName: 'CivicDataSpace',
      image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
    },
  });

export default function SectorsPage() {
  return <SectorsListing />;
}
