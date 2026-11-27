import { graphql } from '@/gql';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';

import { GraphQL, nullIfMissing } from '@/lib/api';
import {
  aiModelLookup,
  isIntegerId,
  publicHref,
  publicPageUrl,
} from '@/lib/public-link';
import { generatePageMetadata } from '@/lib/utils';
import AIModelDetailsPage from './AIModelDetailsPage';

const aiModelMetaQuery = graphql(`
  query getAIModelInfo($modelId: Int, $publicId: String) {
    getAiModel(modelId: $modelId, publicId: $publicId) {
      name
      displayName
      description
      urlSlug
    }
  }
`);

// Metadata and the page both need this; `cache` sends one request per render.
const getAIModelMeta = cache((modelId: string) =>
  GraphQL(aiModelMetaQuery, {}, aiModelLookup(modelId))
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  try {
    const res = await getAIModelMeta(modelId);
    const model = res?.getAiModel;
    const title = model?.displayName || model?.name || 'AI Model Details';
    const description =
      model?.description ||
      'Explore AI model details, capabilities, and specifications';
    const segment = model?.urlSlug || modelId;
    return generatePageMetadata({
      title: `${title} | CivicDataSpace`,
      description,
      keywords: ['AI Model', 'Machine Learning', 'API', 'Model Registry'],
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: publicPageUrl('aimodels', segment),
        title,
        description,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch (error) {
    console.error('Metadata fetch error', error);
    return generatePageMetadata({ title: 'AI Model Details' });
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;

  // Unknown models are 404; an API outage still shows the error page.
  const res = await getAIModelMeta(modelId).catch(nullIfMissing);
  const model = res?.getAiModel;
  if (!model) notFound();

  // Old links used the numeric id; send them to the readable address.
  const urlSlug = model.urlSlug;
  if (isIntegerId(modelId) && urlSlug && urlSlug !== modelId) {
    permanentRedirect(publicHref('aimodels', urlSlug, urlSlug));
  }

  return <AIModelDetailsPage modelId={modelId} />;
}
