'use client';

import { graphql } from '@/gql';
import { TypeCollaborative, TypeDataset, TypeUseCase } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, Text } from 'opub-ui';
import { useEffect } from 'react';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import JsonLd from '@/components/JsonLd';
import { Loading } from '@/components/loading';
import { useAnalytics } from '@/hooks/use-analytics';
import { GraphQLPublic } from '@/lib/api';
import { formatDate, generateJsonLd } from '@/lib/utils';
import PrimaryDetails from '../components/Details';
import Metadata from '../components/Metadata';

const CollaborativeDetails = graphql(`
  query CollaborativeQuery($slug: String!) {
    collaborativeBySlug(slug: $slug) {
      id
      title
      summary
      created
      startedOn
      completedOn
      isIndividualCollaborative
      user {
        fullName
        email
        id
        profilePicture {
          url
        }
      }
      organization {
        name
        slug
        id
        contactEmail
        logo {
          url
        }
      }
      platformUrl
      metadata {
        metadataItem {
          id
          label
          dataType
        }
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
      tags {
        id
        value
      }
      geographies {
        id
        name
        code
        type
      }
      publishers {
        name
        contactEmail
        logo {
          url
        }
      }
      logo {
        name
        path
      }
      coverImage {
        name
        path
      }
      datasets {
        title
        id
        isIndividualDataset
        user {
          fullName
          id
          profilePicture {
            url
          }
        }
        downloadCount
        description
        organization {
          name
          logo {
            url
          }
        }
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          id
          value
        }
        sectors {
          name
        }
        geographies {
          id
          name
          code
          type
        }
        modified
      }
      useCases {
        id
        title
        summary
        slug
        startedOn
        completedOn
        runningStatus
        isIndividualUsecase
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
        sectors {
          name
        }
        geographies {
          id
          name
          code
          type
        }
        tags {
          id
          value
        }
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          id
          value
        }
        modified
      }
      contactEmail
      status
      slug
      modified
      contributors {
        id
        fullName
        profilePicture {
          url
        }
      }
      supportingOrganizations {
        id
        slug
        name
        logo {
          url
        }
      }
      partnerOrganizations {
        id
        slug
        name
        logo {
          url
        }
      }
    }
  }
`);

const CollaborativeDetailClient = () => {
  const params = useParams();
  const { trackCollaborative } = useAnalytics();

  const {
    data: CollaborativeDetailsData,
    isLoading,
    error,
  } = useQuery<{ collaborativeBySlug: TypeCollaborative }>(
    [`fetch_CollaborativeDetails_${params.collaborativeSlug}`],
    async () => {
      console.log('Fetching collaborative details for:', params.collaborativeSlug);
      const result = await GraphQLPublic(
        CollaborativeDetails as any,
        {},
        {
          slug: params.collaborativeSlug,
        }
      ) as { collaborativeBySlug: TypeCollaborative };
      return result;
    },
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: (failureCount) => {
        return failureCount < 3;
      },
    }
  );

  console.log('Collaborative details query state:', { isLoading, error, data: CollaborativeDetailsData });

  // Track collaborative view when data is loaded
  useEffect(() => {
    if (CollaborativeDetailsData?.collaborativeBySlug) {
      trackCollaborative(CollaborativeDetailsData.collaborativeBySlug.id, CollaborativeDetailsData.collaborativeBySlug.title || undefined);
    }
  }, [CollaborativeDetailsData?.collaborativeBySlug, trackCollaborative]);

  const datasets = CollaborativeDetailsData?.collaborativeBySlug?.datasets || []; // Fallback to an empty array
  const useCases = CollaborativeDetailsData?.collaborativeBySlug?.useCases || []; // Fallback to an empty array

  const hasSupportingOrganizations =
    CollaborativeDetailsData?.collaborativeBySlug?.supportingOrganizations &&
    CollaborativeDetailsData?.collaborativeBySlug?.supportingOrganizations?.length > 0;
  const hasPartnerOrganizations =
    CollaborativeDetailsData?.collaborativeBySlug?.partnerOrganizations &&
    CollaborativeDetailsData?.collaborativeBySlug?.partnerOrganizations?.length > 0;
  

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CivicDataLab',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives/${params.collaborativeSlug}`,
    description:
      CollaborativeDetailsData?.collaborativeBySlug?.summary ||
      `Explore open data and curated datasets in the ${CollaborativeDetailsData?.collaborativeBySlug?.title} collaborative.`,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/collaboratives/${params.collaborativeSlug}`,
    },
  });

  return (
    <>
      <JsonLd json={jsonLd} />
      <div>
        {isLoading ? (
          <div className=" flex justify-center p-10">
            <Loading />
          </div>
        ) : error ? (
          <div className="container py-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <Text variant="headingXl" color="critical">
                Error Loading Collaborative
              </Text>
              <Text variant="bodyLg">
                {(error as any)?.message?.includes('401') || (error as any)?.message?.includes('403')
                  ? 'You do not have permission to view this collaborative. Please log in or contact the administrator.'
                  : 'Failed to load collaborative details. Please try again later.'}
              </Text>
            </div>
          </div>
        ) : !CollaborativeDetailsData?.collaborativeBySlug ? (
          <div className="container py-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <Text variant="headingXl">Collaborative Not Found</Text>
              <Text variant="bodyLg">
                The requested collaborative could not be found.
              </Text>
            </div>
          </div>
        ) : (
          <>
            <BreadCrumbs
              data={[
                { href: '/', label: 'Home' },
                { href: '/collaboratives', label: 'Collaboratives' },
                { href: '#', label: CollaborativeDetailsData?.collaborativeBySlug?.title || '' },
              ]}
            />
            <div className=" bg-primaryBlue">
              <div className="container flex flex-row">
                <div className="w-full border-solid border-baseGraySlateSolid9 py-8 pr-8 lg:w-3/4 lg:border-r-2 lg:py-10 lg:pr-8">
                  <PrimaryDetails data={CollaborativeDetailsData} isLoading={isLoading} />
                </div>
                <div className="hidden lg:block lg:w-1/4">
                  <Metadata data={CollaborativeDetailsData} />
                </div>
              </div>
              {(hasSupportingOrganizations || hasPartnerOrganizations) && (
              <div className=" bg-primaryBlue">
                <div className="container flex flex-wrap gap-8 py-10 lg:flex-nowrap ">
                  {hasSupportingOrganizations && (
                    <div className="w-full lg:w-2/4">
                      <Text variant="headingXl" color="onBgDefault">
                        Supporters
                      </Text>
                      <div className="mt-8 flex h-fit w-fit flex-wrap items-center justify-start gap-6 ">
                        {CollaborativeDetailsData?.collaborativeBySlug?.supportingOrganizations?.map(
                          (org: any) => (
                            <Link
                              href={`/publishers/organization/${org.slug + '_' + org.id}`}
                              key={org.id}
                            >
                              <div className=" rounded-4 bg-surfaceDefault  p-4">
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${org.logo?.url}`}
                                  alt={org.name}
                                  width={140}
                                  height={100}
                                  className=" object-contain"
                                />
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {hasPartnerOrganizations && (
                    <div className="w-full lg:w-2/4">
                      <Text variant="headingXl" color="onBgDefault">
                        Partners
                      </Text>
                      <div className="mt-8 flex h-fit w-fit flex-wrap items-center justify-start gap-6 ">
                        {CollaborativeDetailsData?.collaborativeBySlug?.partnerOrganizations?.map(
                          (org: any) => (
                            <Link
                              href={`/publishers/organization/${org.slug + '_' + org.id}`}
                              key={org.id}
                            >
                              <div className=" rounded-4 bg-surfaceDefault  p-4">
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${org.logo?.url}`}
                                  alt={org.name}
                                  width={140}
                                  height={100}
                                  className=" object-contain"
                                />
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}              
            </div>
            <div className="container py-8 lg:py-14" color="onBgDefault">
              {/* Use Cases Section */}
            {useCases.length > 0 && (
              <div className="container py-8 lg:py-14">
                <div className=" flex flex-col gap-1 ">
                  <Text variant="headingXl">Use Cases</Text>
                  <Text variant="bodyLg" fontWeight="regular">
                    Use Cases associated with this Collaborative
                  </Text>
                </div>
                <div className="grid  grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3 ">
                  {useCases.map((useCase: TypeUseCase) => {
                    const image = useCase.isIndividualUsecase
                      ? useCase?.user?.profilePicture
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${useCase.user.profilePicture.url}`
                        : '/profile.png'
                      : useCase?.organization?.logo
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${useCase.organization.logo.url}`
                        : '/org.png';

                    const Geography = useCase.geographies && useCase.geographies.length > 0
                      ? useCase.geographies.map((geo: any) => geo.name).join(', ')
                      : null;

                    const MetadataContent = [
                      {
                        icon: Icons.calendar,
                        label: 'Date',
                        value: formatDate(useCase.modified),
                        tooltip: 'Date',
                      },
                    ];

                    if (Geography) {
                      MetadataContent.push({
                        icon: Icons.globe,
                        label: 'Geography',
                        value: Geography,
                        tooltip: 'Geography',
                      });
                    }

                    const FooterContent = [
                      {
                        icon: useCase.sectors && useCase.sectors[0]?.name
                          ? `/Sectors/${useCase.sectors[0].name}.svg`
                          : '/Sectors/default.svg',
                        label: 'Sectors',
                        tooltip: useCase.sectors?.[0]?.name || 'Sector',
                      },
                      {
                        icon: image,
                        label: 'Published by',
                        tooltip: useCase.isIndividualUsecase
                          ? useCase.user?.fullName
                          : useCase.organization?.name,
                      },
                    ];

                    const commonProps = {
                      title: useCase.title || '',
                      description: useCase.summary || '',
                      metadataContent: MetadataContent,
                      tag: useCase.tags?.map((t: any) => t.value) || [],
                      footerContent: FooterContent,
                      imageUrl: '',
                    };

                    if (useCase.logo) {
                      commonProps.imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${useCase.logo.path.replace('/code/files/', '')}`;
                    }

                    return (
                      <Card
                        {...commonProps}
                        key={useCase.id}
                        variation={'collapsed'}
                        iconColor="success"
                        href={`/usecases/${useCase.id}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
              {/* Datasets Section */}
              <div className="container py-8 lg:py-14">
                <div className=" flex flex-col gap-1 ">
                  <Text variant="headingXl">Datasets in this Collaborative</Text>
                  <Text variant="bodyLg" fontWeight="regular">
                    Explore datasets related to this collaborative{' '}
                  </Text>
                </div>
                <div className="grid  grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3 ">
                  {datasets.length > 0 &&
                    datasets.map((dataset: TypeDataset) => (
                      <Card
                        key={dataset.id}
                        title={dataset.title}
                        variation={'collapsed'}
                        iconColor={'warning'}
                        metadataContent={[
                          {
                            icon: Icons.calendar,
                            label: 'Date',
                            value: formatDate(dataset.modified),
                          },
                          {
                            icon: Icons.download,
                            label: 'Download',
                            value: dataset.downloadCount.toString(),
                          },
                          {
                            icon: Icons.globe,
                            label: 'Geography',
                            value:
                              dataset.geographies && dataset.geographies.length > 0
                                ? dataset.geographies.map((geo: any) => geo.name).join(', ')
                                : '',
                          },
                        ]}
                        href={`/datasets/${dataset.id}`}
                        footerContent={[
                          {
                            icon: `/Sectors/${dataset.sectors[0]?.name}.svg`,
                            label: 'Sectors',
                          },
                          {
                            icon: dataset.isIndividualDataset
                              ? dataset?.user?.profilePicture
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${dataset.user.profilePicture.url}`
                                : '/profile.png'
                              : dataset?.organization?.logo
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${dataset.organization.logo.url}`
                                : '/org.png',
                            label: 'Published by',
                          },
                        ]}
                        description={dataset.description || ''}
                      />
                    ))}
                </div>
              </div>
            </div>
            
          </>
        )}
      </div>
    </>
  );
};

export default CollaborativeDetailClient;
