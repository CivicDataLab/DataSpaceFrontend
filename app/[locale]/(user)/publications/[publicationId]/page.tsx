import { use } from 'react';

import { RESOURCE_LABEL, RESOURCE_PATH } from '@/lib/constants/resourceLabel';
import { generatePageMetadata } from '@/lib/utils';
import PublicationDetailsPage from './PublicationDetailsPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicationId: string }>;
}) {
  try {
    const { publicationId } = await params;
    return generatePageMetadata({
      title: `${RESOURCE_LABEL} Details | CivicDataSpace`,
      description: `Explore a ${RESOURCE_LABEL.toLowerCase()} — reports, research and findings.`,
      keywords: [RESOURCE_LABEL, 'Report', 'Research', 'Publication'],
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}${RESOURCE_PATH}/${publicationId}`,
        title: `${RESOURCE_LABEL} Details`,
        description: `Explore a ${RESOURCE_LABEL.toLowerCase()}.`,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (e) {
    console.error('Metadata fetch error', e);
    return generatePageMetadata({ title: `${RESOURCE_LABEL} Details` });
  }
}

export default function Page({
  params,
}: {
  params: Promise<{ publicationId: string }>;
}) {
  const { publicationId } = use(params);
  return <PublicationDetailsPage publicationId={publicationId} />;
}
