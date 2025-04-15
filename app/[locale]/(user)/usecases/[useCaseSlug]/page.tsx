'use client';

import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { TypeDataset, TypeUseCase } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import PrimaryDetails from '../components/Details';
import Metadata from '../components/Metadata';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/utils';
import { Loading } from '@/components/loading';

const UseCasedetails: any = graphql(`
  query UseCasedetails($pk: ID!) {
    useCase(pk: $pk) {
      id
      title
      summary
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
        logo {
          path
        }
      }
      logo {
        name
        path
        url
      }
      datasets {
        title
        id
        downloadCount
        description
        organization {
          name
          logo {
            path
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
    }
  }
`);

const UseCaseDetailPage = () => {
  const params = useParams();
  const {
    data: UseCaseDetails,
    isLoading,
    refetch,
  } = useQuery<{ useCase: TypeUseCase }>(
    [`fetch_UsecaseDetails_${params.useCaseSlug}`],
    () =>
      GraphQL(
        UseCasedetails,
        {},
        {
          pk: params.useCaseSlug,
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );
  const datasets = UseCaseDetails?.useCase?.datasets || []; // Fallback to an empty array

  return (
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
            <div className="flex flex-row">
              <div className="w-full border-r-2 border-solid border-greyExtralight p-8 lg:w-3/4 lg:p-10">
                <PrimaryDetails data={UseCaseDetails} isLoading={isLoading} />
              </div>
              <div className="hidden lg:block lg:w-1/4">
                <Metadata data={UseCaseDetails} />
              </div>
            </div>
            <div className="p-8 lg:p-14">
              <div className=" flex flex-col gap-1">
                <Text variant="heading3xl">Datasets in this Use Case</Text>
                <Text variant="headingLg" fontWeight="regular">
                  All Datasets related to this Use Case
                </Text>
              </div>
              <div className="grid w-full grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3">
                {datasets.length > 0 &&
                  datasets.map(
                    (dataset: TypeDataset) => (
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
                            value: dataset.metadata?.find(
                              (meta: any) => meta.metadataItem?.label === 'Geography'
                            )?.value || '',
                          },
                        ]}
                        href={`/datasets/${dataset.id}`}
                        footerContent={[
                          {
                            icon: `/Sectors/${dataset.sectors[0].name}.svg`,
                            label: 'Sectors',
                          },
                          { icon: '/fallback.svg', label: 'Published by' },
                        ]}
                        description={dataset.description || ''}
                      />
                    )
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UseCaseDetailPage;
