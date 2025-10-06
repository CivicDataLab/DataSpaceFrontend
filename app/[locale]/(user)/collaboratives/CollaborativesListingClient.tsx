'use client';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import JsonLd from '@/components/JsonLd';
import { Loading } from '@/components/loading';
import { graphql } from '@/gql';
import { TypeCollaborative } from '@/gql/generated/graphql';
import { GraphQLPublic } from '@/lib/api';
import { formatDate, generateJsonLd } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Button, Card, Icon, SearchInput, Select, Text } from 'opub-ui';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Styles from '../datasets/dataset.module.scss';

// Helper function to strip markdown and HTML tags for card preview
const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    // Remove code blocks first (before other replacements)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace and newlines
    .replace(/\n\s*\n/g, '\n')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const PublishedCollaboratives = graphql(`
  query PublishedCollaboratives {
    publishedCollaboratives {
      id
      title
      summary
      slug
      created
      startedOn
      completedOn
      status
      isIndividualCollaborative
      user {
        fullName
        id
        profilePicture {
          url
        }
      }
      organization {
        name
        slug
        id
        logo {
          url
        }
      }
      logo {
        name
        path
      }
      tags {
        id
        value
      }
      sectors {
        id
        name
      }
      sdgs {
        id
        code
        name
      }
      geographies {
        id
        name
      }
      datasetCount
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
    }
  }
`);

const CollaborativesListingClient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title_asc');

  const {
    data: collaborativesData,
    isLoading,
    error,
  } = useQuery<{ publishedCollaboratives: TypeCollaborative[] }>(
    ['fetch_published_collaboratives'],
    async () => {
      console.log('Fetching collaboratives...');
      try {
        // @ts-expect-error - Query has no variables
        const result = await GraphQLPublic(
          PublishedCollaboratives as any,
          {}
        );
        console.log('Collaboratives result:', result);
        return result as { publishedCollaboratives: TypeCollaborative[] };
      } catch (err) {
        console.error('Error fetching collaboratives:', err);
        throw err;
      }
    },
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: (failureCount) => {
        return failureCount < 3;
      },
    }
  );

  const collaboratives = collaborativesData?.publishedCollaboratives || [];

  // Filter and sort collaboratives
  const filteredAndSortedCollaboratives = collaboratives
    .filter((collaborative) => {
      const matchesSearch = collaborative.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           collaborative.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const [field, direction] = sortBy.split('_');
      
      if (field === 'title') {
        const comparison = (a.title || '').localeCompare(b.title || '');
        return direction === 'asc' ? comparison : -comparison;
      } else if (field === 'startedOn') {
        const dateA = new Date(a.startedOn || 0).getTime();
        const dateB = new Date(b.startedOn || 0).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (field === 'datasetCount') {
        const countA = a.datasetCount || 0;
        const countB = b.datasetCount || 0;
        return direction === 'asc' ? countA - countB : countB - countA;
      }
      return 0;
    });
  const jsonLd = generateJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'CivicDataLab',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives`,
      description:
        'Solving the world\'s major challenges requires greater access to interoperable data that currently resides in silos. Data Collaboratives bring together government, academia, civil society, philanthropy, and companies to responsibly share and use data for public value. Building on trusted, long-term relationships among stakeholders, we can open access to high-impact datasets and responsible AI use-cases to generate insights for climate action, public health, gender equity, and other major shared problems, thereby advancing progress toward the Sustainable Development Goals. Our goal is to accelerate the formation of Data Collaboratives with shared governance, clear safeguards, and collaborative analytics, allowing stakeholders to harness data and AI for the public good.',
    });
  return (
    <main>
      <JsonLd json={jsonLd} />
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/collaboratives', label: 'Collaboratives' },
        ]}
      />
      <>
      <>
      <div className="w-full">
        <div className=" bg-primaryBlue">
          <div className=" container flex flex-col-reverse items-center gap-8 py-10 lg:flex-row ">
            <div className="flex flex-col gap-5 lg:w-1/2">
              <Text
                variant="heading2xl"
                fontWeight="bold"
                color="onBgDefault"
              >
                Our Collaboratives
              </Text>
              <Text
                variant="headingLg"
                color="onBgDefault"
                fontWeight="regular"
                className="leading-3 lg:leading-5"
              >
                Solving the world&apos;s major challenges requires greater access to interoperable data that currently resides in silos. Data Collaboratives bring together government, academia, civil society, philanthropy, and companies to responsibly share and use data for public value. Building on trusted, long-term relationships among stakeholders, we can open access to high-impact datasets and responsible AI use-cases to generate insights for climate action, public health, gender equity, and other major shared problems, thereby advancing progress toward the Sustainable Development Goals. Our goal is to accelerate the formation of Data Collaboratives with shared governance, clear safeguards, and collaborative analytics, allowing stakeholders to harness data and AI for the public good.
              </Text>
            </div>
            <div className="flex w-full items-center justify-center lg:w-1/2">
              <Image
                src={'/collaborative.svg'}
                alt={'collaborative'}
                width={1700}
                height={800}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
          </div>
        </div>
      </>
      </>
      
      <div className="bg-onSurfaceDefault">
        <div className="container py-8 lg:py-14">
          {/* Header Section */}
          <div className="mb-8">
            <Text variant="heading2xl" fontWeight="bold" className="mb-8">
              Explore Collaboratives
            </Text>
            
            {/* Search and Filter Section */}
            <div className="flex flex-wrap gap-6 lg:flex-nowrap">
              <SearchInput
                label={''}
                className={cn('w-full', Styles.Search)}
                onSubmit={(e) => {
                  setSearchTerm(e);
                }}
                onClear={() => {
                  setSearchTerm('');
                }}
                name={'Start typing to search for any collaborative'}
              />
              <div className="flex items-center gap-2">
                <Text
                  variant="bodyLg"
                  fontWeight="semibold"
                  className="whitespace-nowrap text-secondaryOrange"
                >
                  Sort :
                </Text>
                <Select
                  label=""
                  labelInline
                  name="sort-select"
                  options={[
                    {
                      label: 'Title Asc',
                      value: 'title_asc',
                    },
                    {
                      label: 'Title Desc',
                      value: 'title_desc',
                    },
                    {
                      label: 'Started Date Asc',
                      value: 'startedOn_asc',
                    },
                    {
                      label: 'Started Date Desc',
                      value: 'startedOn_desc',
                    },
                    {
                      label: 'Dataset Count Asc',
                      value: 'datasetCount_asc',
                    },
                    {
                      label: 'Dataset Count Desc',
                      value: 'datasetCount_desc',
                    },
                  ]}
                  onChange={(e: any) => {
                    setSortBy(e);
                  }}
                />
              </div>
            </div>
          </div>

          {isLoading? (
            <div className="flex justify-center p-10">
              <Loading />
            </div>
          ):error?(
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <Text variant="headingXl" color="critical">
                Error Loading Collaboratives
              </Text>
              <Text variant="bodyLg">
                Failed to load collaboratives. Please try again later.
              </Text>
            </div>
          ):null}

          {/* Results Section */}
          {!isLoading && !error && (
            <>
              {/* Collaboratives Grid */}
              {filteredAndSortedCollaboratives.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedCollaboratives.map((collaborative: TypeCollaborative) => (
                    <Card
                      key={collaborative.id}
                      title={collaborative.title || ''}
                      variation="collapsed"
                      iconColor="warning"
                      metadataContent={[
                        {
                          icon: Icons.calendar,
                          label: 'Started',
                          value: formatDate(collaborative.startedOn),
                        },
                        {
                          icon: Icons.dataset,
                          label: 'Datasets',
                          value: collaborative.datasetCount?.toString() || '0',
                        },
                        {
                          icon: Icons.globe,
                          label: 'Geography',
                          value:
                            collaborative.geographies && collaborative.geographies.length > 0
                              ? collaborative.geographies.map((geo: any) => geo.name).join(', ')
                              : 'N/A',
                        },
                      ]}
                      href={`/collaboratives/${collaborative.slug}`}
                      footerContent={[
                        {
                          icon: collaborative.sectors?.[0]?.name 
                            ? `/Sectors/${collaborative.sectors[0].name}.svg`
                            : '/Sectors/default.svg',
                          label: 'Sectors',
                        },
                        {
                          icon: collaborative.isIndividualCollaborative
                            ? collaborative?.user?.profilePicture
                              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${collaborative.user.profilePicture.url}`
                              : '/profile.png'
                            : collaborative?.organization?.logo
                              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${collaborative.organization.logo.url}`
                              : '/org.png',
                          label: 'Published by',
                        },
                      ]}
                      description={stripMarkdown(collaborative.summary || '')}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                  <Icon source={Icons.search} size={48} color="subdued" />
                  <Text variant="headingLg" color="subdued">
                    No Collaboratives Found
                  </Text>
                  <Text variant="bodyLg" color="subdued">
                    Try adjusting your search terms or filters.
                  </Text>
                  {searchTerm && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                      }}
                      kind="secondary"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default CollaborativesListingClient;
