import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  OrgPublishedUseCasesListQuery,
  UserPublishedUseCasesListQuery,
} from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { Card, Icon, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn, extractPublisherId, formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { stripMarkdown } from '../../search/components/UnifiedListingComponent';

const userPublishedUseCasesDoc = graphql(`
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

const orgPublishedUseCasesDoc = graphql(`
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
  const id = extractPublisherId(
    String(type === 'organization' ? params.organizationSlug : params.publisherSlug)
  );

  type PublishedUseCasesData =
    | OrgPublishedUseCasesListQuery
    | UserPublishedUseCasesListQuery;

  type PublishedUseCase =
    | OrgPublishedUseCasesListQuery['organizationPublishedUseCases'][number]
    | UserPublishedUseCasesListQuery['userPublishedUseCases'][number];

  interface UseCaseMetadataItem {
    metadataItem?: { label?: string | null };
    value?: unknown;
  }

  const PublishedUseCasesList = useQuery(
    ['publishedUseCases', type, id],
    (): Promise<PublishedUseCasesData> =>
      type === 'organization'
        ? GraphQL(
            orgPublishedUseCasesDoc,
            {
              // Entity Headers
            },
            { organizationId: id } // ✅ exact match for expected shape
          )
        : GraphQL(
            userPublishedUseCasesDoc,
            {
              // Entity Headers
            },
            { userId: id } // ✅ exact match for expected shape
          )
  );

  const UseCaseData = PublishedUseCasesList.data
    ? 'organizationPublishedUseCases' in PublishedUseCasesList.data
      ? PublishedUseCasesList.data.organizationPublishedUseCases
      : PublishedUseCasesList.data.userPublishedUseCases
    : undefined;

  return (
    <div>
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {PublishedUseCasesList.isLoading ? (
          <div className=" flex w-fit justify-center rounded-2 bg-surfaceDefault p-4">
            <Spinner />
          </div>
        ) : (UseCaseData?.length ?? 0) > 0 ? (
          UseCaseData?.map((item: PublishedUseCase, index: number) => (
            <Card
              // type={[
              //   {
              //     label: 'Use Case',
              //     fillColor: '#FEF7E5',
              //     borderColor: '#F9C74F',
              //   },
              // ]}
              title={item.title ?? ''}
              key={index}
              href={`/usecases/${item.id}`}
              metadataContent={[
                {
                  icon: Icons.calendarEvent,
                  label: 'Date',
                  value: formatDate(item.modified) || '',
                  stroke: 1.2,
                },
                {
                  icon: Icons.worldPin,
                  label: 'Geography',
                  value: String(
                    item.metadata?.find(
                      (meta: UseCaseMetadataItem) =>
                        meta.metadataItem?.label === 'Geography'
                    )?.value ?? ''
                  ),
                  stroke: 1.2,
                },
              ]}
              leftFooterChips={[
                {
                  icon: `/Sectors/${item?.sectors?.[0]?.name}.svg`,
                  label: 'Sectors',
                },
              ]}
              rightFooterChips={[
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
              description={stripMarkdown(item.summary || '')}
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
