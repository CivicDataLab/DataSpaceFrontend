import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Icon, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';

const userPublishedUseCasesDoc: any = graphql(`
  query userPublishedUseCasesList($userId: ID!) {
    userPublishedUseCases(userId: $userId) {
      id
      title
      summary
      slug
      isIndividualUsecase
      user {
        fullName
        profilePicture {
          url
        }
      }
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
      publishers {
        logo {
          path
        }
        name
      }
      sectors {
        id
        name
      }
      created
      modified
    }
  }
`);

const orgPublishedUseCasesDoc: any = graphql(`
  query orgPublishedUseCasesList($organizationId: ID!) {
    organizationPublishedUseCases(organizationId: $organizationId) {
      id
      title
      summary
      slug
      user {
        fullName
        profilePicture {
          url
        }
      }
      isIndividualUsecase
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
      publishers {
        logo {
          path
        }
        name
      }
      sectors {
        id
        name
      }
      created
      modified
    }
  }
`);

const UseCases = ({ type }: { type: 'organization' | 'Publisher' }) => {
  const params = useParams();

  const PublishedUseCasesList: any = useQuery({
    queryKey: [`userPublishedDataset_${params.publisherSlug}`],
    queryFn: () =>
      type === 'organization'
        ? GraphQL(
            orgPublishedUseCasesDoc,
            {
              // Entity Headers
            },
            { organizationId: params.organizationSlug } // ✅ exact match for expected shape
          )
        : GraphQL(
            userPublishedUseCasesDoc,
            {
              // Entity Headers
            },
            { userId: params.publisherSlug } // ✅ exact match for expected shape
          )
    });

  const UseCaseData =
    type === 'organization'
      ? PublishedUseCasesList.data?.organizationPublishedUseCases
      : PublishedUseCasesList.data?.userPublishedUseCases;

  return (
    <div>
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'
        )}
      >
        {PublishedUseCasesList.isPending ? (
          <div className=" flex w-fit justify-center rounded-2 bg-surfaceDefault p-4">
            <Spinner />
          </div>
        ) : UseCaseData?.length > 0 ? (
          UseCaseData?.map((item: any, index: any) => (
            <Card
              type={[
                {
                  label: 'Use Case',
                  fillColor: '#FEF7E5',
                  borderColor: '#F9C74F',
                },
              ]}
              title={item.title}
              key={index}
              href={`/usecases/${item.id}`}
              metadataContent={[
                {
                  icon: Icons.calendar,
                  label: 'Date',
                  value: formatDate(item.modified),
                },
                {
                  icon: Icons.globe,
                  label: 'Geography',
                  value: item.metadata?.find(
                    (meta: any) => meta.metadataItem?.label === 'Geography'
                  )?.value,
                },
              ]}
              footerContent={[
                {
                  icon: `/Sectors/${item?.sectors[0]?.name}.svg`,
                  label: 'Sectors',
                },
                {
                  icon: item.isIndividualUsecase
                    ? item?.user?.profilePicture
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profilePicture.url}`
                      : '/profile.png'
                    : item?.organization?.logo
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo.url}`
                      : '/org.png',
                  label: 'Published by',
                },
              ]}
              description={item.summary}
              iconColor="warning"
              variation={'collapsed'}
            />
          ))
        ) : (
          <>
            <div className="flex h-full w-full grow flex-col items-center justify-center rounded-2 bg-white p-10">
              <div className={'h-100 flex flex-col items-center gap-4'}>
                <Icon
                  source={Icons.light}
                  color="interactive"
                  stroke={1}
                  size={80}
                />

                <Text variant="headingSm" color="subdued">
                  No use cases published yet
                </Text>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UseCases;
