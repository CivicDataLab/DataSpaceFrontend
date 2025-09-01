'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { TypeDataset, TypeUseCase } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { Card, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, generateJsonLd } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import JsonLd from '@/components/JsonLd';
import { Loading } from '@/components/loading';
import PrimaryDetails from '../components/Details';
import Metadata from '../components/Metadata';
import Dashboards from './Dashboards';

const UseCasedetails: any = graphql(`
  query UseCasedetails($pk: ID!) {
    useCase(pk: $pk) {
      id
      title
      summary
      created
      startedOn
      isIndividualUsecase
      user {
        fullName
        email
        profilePicture {
          url
        }
      }
      organization {
        name
        contactEmail
        logo {
          url
        }
      }
      website
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
      runningStatus
      tags {
        id
        value
      }
      publishers {
        name
        contactEmail
        logo {
          url
        }
      }
      platformUrl
      logo {
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
        name
        logo {
          url
        }
      }
      partnerOrganizations {
        id
        name
        logo {
          url
        }
      }
    }
  }
`);

const UseCaseDetailClient = () => {
  const params = useParams();
  const {
    data: UseCaseDetails,
    isLoading,
    refetch,
  } = useQuery<{ useCase: TypeUseCase }>( {
    queryKey: [`fetch_UsecaseDetails_${params.useCaseSlug}`],
    queryFn: () =>
      GraphQL(
        UseCasedetails,
        {},
        {
          pk: params.useCaseSlug,
        }
      ),
    refetchOnMount: true,
    refetchOnReconnect: true,
    }
  );
  const datasets = UseCaseDetails?.useCase?.datasets || []; // Fallback to an empty array

  const hasSupportingOrganizations =
    UseCaseDetails?.useCase?.supportingOrganizations &&
    UseCaseDetails?.useCase?.supportingOrganizations?.length > 0;
  const hasPartnerOrganizations =
    UseCaseDetails?.useCase?.partnerOrganizations &&
    UseCaseDetails?.useCase?.partnerOrganizations?.length > 0;
  const hasContributors =
    UseCaseDetails?.useCase?.contributors &&
    UseCaseDetails?.useCase?.contributors?.length > 0;

  const jsonLd = generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CivicDataLab',
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases/${params.useCaseSlug}`,
    description:
      UseCaseDetails?.useCase?.summary ||
      `Explore open data and curated datasets in the ${UseCaseDetails?.useCase?.title} sector.`,
    publisher: {
      '@type': 'Organization',
      name: 'CivicDataSpace',
      url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/usecases/${params.useCaseSlug}`,
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
        ) : (
          <>
            <BreadCrumbs
              data={[
                { href: '/', label: 'Home' },
                { href: '/usecases', label: 'Use Cases' },
                { href: '#', label: UseCaseDetails?.useCase?.title || '' },
              ]}
            />
            <div className=" bg-onSurfaceDefault">
              <div className="container flex flex-row">
                <div className="w-full border-solid border-greyExtralight py-8 pr-8 lg:w-3/4 lg:border-r-2 lg:py-10 lg:pr-8">
                  <PrimaryDetails data={UseCaseDetails} isLoading={isLoading} />
                </div>
                <div className="hidden lg:block lg:w-1/4">
                  <Metadata data={UseCaseDetails} />
                </div>
              </div>
              <div className="container py-8 lg:py-14">
                <div className=" flex flex-col gap-1 ">
                  <Text variant="headingXl">Datasets in this Use Case</Text>
                  <Text variant="bodyLg" fontWeight="regular">
                    Explore datasets related to this use case{' '}
                  </Text>
                </div>
                <div className="grid  grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3 ">
                  {/* <div className="grid grid-cols-1 p-4 gap-6 overflow-y-auto  md:grid-cols-2 lg:grid-cols-3 max-h-[calc(100vh-250px)]"> */}
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
                              dataset.metadata?.find(
                                (meta: any) =>
                                  meta.metadataItem?.label === 'Geography'
                              )?.value || '',
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
            <Dashboards />
            {(hasSupportingOrganizations ||
              hasPartnerOrganizations ||
              hasContributors) && (
              <div className=" bg-primaryBlue">
                <div className="container flex flex-wrap gap-8 py-10 lg:flex-nowrap ">
                  {hasSupportingOrganizations && (
                    <div className="w-full lg:w-2/4">
                      <Text variant="headingXl" color="onBgDefault">
                        Supported by
                      </Text>
                      <div className="mt-8 flex h-fit w-fit flex-wrap items-center justify-start gap-6 ">
                        {UseCaseDetails?.useCase?.supportingOrganizations?.map(
                          (org: any) => (
                            <div
                              key={org.id}
                              className=" rounded-4 bg-surfaceDefault  p-4"
                            >
                              <Image
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${org.logo?.url}`}
                                alt={org.name}
                                width={140}
                                height={100}
                                className=" object-contain"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {hasPartnerOrganizations && (
                    <div className="w-full lg:w-2/4">
                      <Text variant="headingXl" color="onBgDefault">
                        Partnered by
                      </Text>
                      <div className="mt-8 flex h-fit w-fit flex-wrap items-center justify-start gap-6 ">
                        {UseCaseDetails?.useCase?.partnerOrganizations?.map(
                          (org: any) => (
                            <div
                              key={org.id}
                              className=" rounded-4 bg-surfaceDefault  p-4"
                            >
                              <Image
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${org.logo?.url}`}
                                alt={org.name}
                                width={140}
                                height={100}
                                className=" object-contain"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {hasContributors && (
                  <div className="container py-10">
                    <div className="flex flex-col gap-1">
                      <Text variant="headingXl" color="onBgDefault">
                        Contributors{' '}
                      </Text>
                      <Text color="onBgDefault" variant="bodyLg">
                        Publisher and Contributors who have added to the Use
                        Case
                      </Text>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-start gap-8">
                      {UseCaseDetails?.useCase?.contributors?.map(
                        (contributor: any) => (
                          <Image
                            alt={contributor.fullName}
                            width={120}
                            height={120}
                            className="rounded-full object-cover"
                            key={contributor.id}
                            src={
                              contributor.profilePicture?.url
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${contributor.profilePicture?.url}`
                                : '/profile.png'
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UseCaseDetailClient;
