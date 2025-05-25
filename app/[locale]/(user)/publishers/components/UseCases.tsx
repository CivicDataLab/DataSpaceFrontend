import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner } from 'opub-ui';

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

const UseCases = () => {
  const params = useParams();
  const PublishedUseCasesList: any = useQuery(
    [`userPublishedUseCase_${params.publisherSlug}`],
    () =>
      GraphQL(
        userPublishedUseCasesDoc,
        {
          // Entity Headers if present
        },
        { userId: params.publisherSlug }
      )
  );

  return (
    <div>
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'
        )}
      >
        {PublishedUseCasesList.isLoading ? (
          <div className=" mt-8 flex justify-center">
            <Spinner />
          </div>
        ) : (
          PublishedUseCasesList.data.userPublishedUseCases.length > 0 &&
          PublishedUseCasesList.data.userPublishedUseCases.map(
            (item: any, index: any) => (
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
                  { icon: '/fallback.svg', label: 'Published by' },
                ]}
                description={item.summary}
                iconColor="warning"
                variation={'collapsed'}
              />
            )
          )
        )}
      </div>
    </div>
  );
};

export default UseCases;
