import { generatePageMetadata } from '@/lib/utils';
import { use } from 'react';
import AIModelDetailsPage from './AIModelDetailsPage';

// For now, we'll use a simple metadata generation
// You can add GraphQL query later if needed
export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  try {
    const { modelId } = await params;
    // TODO: Fetch AI model data from backend API
    // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/aimodels/${modelId}`);
    // const model = await res.json();
    
    return generatePageMetadata({
      title: `AI Model Details | CivicDataSpace`,
      description: 'Explore AI model details, capabilities, and specifications',
      keywords: ['AI Model', 'Machine Learning', 'API', 'Model Registry'],
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/aimodels/${modelId}`,
        title: 'AI Model Details',
        description: 'Explore AI model details and capabilities',
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (e) {
    console.error('Metadata fetch error', e);
    return generatePageMetadata({ title: 'AI Model Details' });
  }
}

export default function Page({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = use(params);
  return <AIModelDetailsPage modelId={modelId} />;
}
