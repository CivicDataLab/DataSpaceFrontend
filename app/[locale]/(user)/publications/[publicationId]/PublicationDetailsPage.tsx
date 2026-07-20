'use client';

import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import JsonLd from '@/components/JsonLd';
import { RESOURCE_LABEL, RESOURCE_PATH } from '@/lib/constants/resourceLabel';
import { GraphQL } from '@/lib/api';
import { generateJsonLd } from '@/lib/utils';
import { Blocks } from './components/Blocks';
import { Metadata } from './components/Metadata';
import { PrimaryData } from './components/PrimaryData';

const publicationQuery = graphql(`
  query getPublication($publicationId: UUID!) {
    getPublication(publicationId: $publicationId) {
      id
      title
      description
      slug
      status
      authors
      publicationDate
      license
      externalSourceLink
      downloadCount
      created
      modified
      resourceType {
        id
        name
      }
      organization {
        id
        name
        logo {
          url
        }
      }
      user {
        id
        fullName
        profilePicture {
          url
        }
      }
      sectors {
        id
        name
      }
      geographies {
        id
        name
      }
      blocks {
        id
        position
        blockType
        fileName
        fileFormat
        fileSize
        youtubeUrl
        youtubeVideoId
      }
    }
  }
`);

export default function PublicationDetailsPage({
  publicationId,
}: {
  publicationId: string;
}) {
  const { data, isLoading, error } = useQuery(
    ['publication_details', publicationId],
    () => GraphQL(publicationQuery, {}, { publicationId }),
    { retry: false }
  );

  const publication = data?.getPublication;

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: publication?.title,
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}${RESOURCE_PATH}/${publicationId}`,
    description: publication?.description,
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
            { href: RESOURCE_PATH, label: RESOURCE_LABEL + 's' },
            { href: '#', label: `${RESOURCE_LABEL} Details` },
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
                <Text variant="heading2xl">Error loading {RESOURCE_LABEL}</Text>
                <Text variant="bodyMd" className="text-textSubdued">
                  {error instanceof Error ? error.message : 'Failed to fetch'}
                </Text>
              </div>
            ) : publication ? (
              <>
                <PrimaryData data={publication} />
                <Blocks blocks={publication.blocks} />
              </>
            ) : (
              <div className="mt-8 flex justify-center">
                <Text variant="heading2xl">{RESOURCE_LABEL} not found</Text>
              </div>
            )}
          </div>
          <div className="hidden w-1/4 gap-10 px-7 py-10 lg:block">
            {!isLoading && publication && <Metadata data={publication} />}
          </div>
        </div>
      </main>
    </>
  );
}
