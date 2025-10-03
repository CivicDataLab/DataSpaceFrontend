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
import { Button, Card, Icon, Text } from 'opub-ui';
import { useState } from 'react';

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
  const [selectedSector, setSelectedSector] = useState('');

  const {
    data: collaborativesData,
    isLoading,
    error,
  } = useQuery<{ publishedCollaboratives: TypeCollaborative[] }>(
    ['fetch_published_collaboratives'],
    async () => {
      console.log('Fetching collaboratives...');
      try {
        // @ts-ignore - Query has no variables
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

  // Filter collaboratives based on search term and sector
  const filteredCollaboratives = collaboratives.filter((collaborative) => {
    const matchesSearch = collaborative.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborative.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || 
                         collaborative.sectors?.some(sector => sector.name === selectedSector);
    return matchesSearch && matchesSector;
  });

  // Get unique sectors for filter dropdown
  const allSectors = collaboratives.flatMap((collaborative: TypeCollaborative) => 
    collaborative.sectors?.map((sector: any) => sector.name) || []
  );
  const uniqueSectors = [...new Set(allSectors)];
  const jsonLd = generateJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'CivicDataLab',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives`,
      description:
        'Explore collaborative data initiatives and partnerships that bring organizations together to create impactful solutions.',
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
            <div className="flex flex-col gap-5 ">
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
                By Collaboratives we mean a collective effort by several organisations
                in any specific sectors that can be applied to address some of the
                most pressing concerns from hyper-local to the global level simultaneously.
              </Text>
            </div>
            <div className="flex items-center justify-center gap-2 px-3 ">
              <Image
                src={'/collaborative.png'}
                alt={'collaborative'}
                width={600}
                height={316}
                className="m-auto h-auto w-full"
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
            
            {/* Search and Filter Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search collaboratives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-greyExtralight px-4 py-2 focus:border-primaryBlue focus:outline-none"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full rounded-lg border border-greyExtralight px-4 py-2 focus:border-primaryBlue focus:outline-none"
                >
                  <option value="">All Sectors</option>
                  {uniqueSectors.map((sector: string) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center p-10">
              <Loading />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <Text variant="headingXl" color="critical">
                Error Loading Collaboratives
              </Text>
              <Text variant="bodyLg">
                Failed to load collaboratives. Please try again later.
              </Text>
            </div>
          )}

          {/* Results Section */}
          {!isLoading && !error && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <Text variant="headingLg">
                  {filteredCollaboratives.length} Collaborative{filteredCollaboratives.length !== 1 ? 's' : ''} Found
                </Text>
              </div>

              {/* Collaboratives Grid */}
              {filteredCollaboratives.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCollaboratives.map((collaborative: TypeCollaborative) => (
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
                            collaborative.metadata?.find(
                              (meta: any) =>
                                meta.metadataItem?.label === 'Geography'
                            )?.value || 'N/A',
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
                      description={collaborative.summary || ''}
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
                  {(searchTerm || selectedSector) && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedSector('');
                      }}
                      kind="secondary"
                    >
                      Clear Filters
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
