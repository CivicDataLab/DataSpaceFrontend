'use client';

import { useQuery } from '@tanstack/react-query';
import { Spinner, Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import { GraphQL } from '@/lib/api';
import { aiModelLookup, publicPageUrl } from '@/lib/public-link';
import { generateJsonLd } from '@/lib/utils';
import Metadata from './components/Metadata';
import PrimaryData from './components/PrimaryData';
import Versions from './components/Versions';
import { aiModelQuery } from './queries';

export default function AIModelDetailsPage({
  modelId,
}: {
  modelId: string;
}) {
  const { data, isLoading, error } = useQuery(
    [`aimodel_details_${modelId}`],
    () => GraphQL(aiModelQuery, {}, aiModelLookup(modelId)),
    { retry: false }
  );

  const modelData = data?.getAiModel;

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: modelData?.displayName || modelData?.name,
    url: publicPageUrl('aimodels', modelData?.urlSlug || modelId),
    description: modelData?.description,
    applicationCategory: 'AI Model',
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <main className="bg-surfaceDefault">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            { href: '/search?types=aimodel', label: 'AI Models' },
            { href: '#', label: 'AI Model Details' },
          ]}
        />
        <div className="flex">
          <div className="w-full gap-10 border-r-2 border-solid border-greyExtralight p-6 lg:w-3/4 lg:p-10">
            {isLoading ? (
              <div className="mt-8 flex justify-center">
                <Spinner />
              </div>
            ) : error ? (
              <div className="mt-8 flex flex-col items-center gap-4">
                <Text variant="heading2xl">Error loading AI Model</Text>
                <Text variant="bodyMd" className="text-textSubdued">
                  {error instanceof Error ? error.message : 'Failed to fetch AI model'}
                </Text>
                <Text variant="bodySm" className="text-textSubdued">
                  Model ID: {modelId}
                </Text>
              </div>
            ) : modelData ? (
              <>
                <PrimaryData data={modelData} isLoading={isLoading} />
                <Versions data={modelData} />
              </>
            ) : (
              <div className="mt-8 flex justify-center">
                <Text variant="heading2xl">AI Model not found</Text>
              </div>
            )}
          </div>
          <div className="hidden w-1/4 gap-10 px-7 py-10 lg:block">
            {isLoading ? (
              <div className="mt-8 flex justify-center">
                <Spinner />
              </div>
            ) : (
              modelData && <Metadata data={modelData} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
