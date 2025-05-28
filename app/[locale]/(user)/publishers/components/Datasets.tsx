import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

const userPublishedDatasetsDoc: any = graphql(`
  query userPublishedDatasetsList($userId: ID!) {
    userPublishedDatasets(userId: $userId) {
      id
      title
      downloadCount
      id
      title
      tags {
        id
        value
      }
      description
      created
      modified
      isIndividualDataset
      user {
        fullName
        id
        profilePicture {
          url
        }
      }
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        value
      }
      organization {
        name
        logo {
          url
        }
        slug
        id
      }
      sectors {
        name
      }
      formats
    }
  }
`);

const organizationPublishedDatasetsDoc: any = graphql(`
  query organizationPublishedDatasetsList($organizationId: ID!) {
    organizationPublishedDatasets(organizationId: $organizationId) {
      id
      title
      downloadCount
      id
      title
      tags {
        id
        value
      }
      description
      created
      modified
      isIndividualDataset
      user {
        fullName
        id
        profilePicture {
          url
        }
      }
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        value
      }
      organization {
        name
        logo {
          url
        }
        slug
        id
      }
      sectors {
        name
      }
      formats
    }
  }
`);

const Datasets = ({ type }: { type: 'organization' | 'Publisher' }) => {
  const params = useParams();

  const PublishedDatasetsList: any = useQuery(
    [`userDataset_${params.publisherSlug}`],
    () =>
      type === 'organization'
        ? GraphQL(
            organizationPublishedDatasetsDoc,
            {
              // Entity Headers
            },
            { organizationId: params.organizationSlug } // ✅ exact match for expected shape
          )
        : GraphQL(
            userPublishedDatasetsDoc,
            {
              // Entity Headers
            },
            { userId: params.publisherSlug } // ✅ exact match for expected shape
          )
  );

  const DatasetData =
    type === 'organization'
      ? PublishedDatasetsList.data?.organizationPublishedDatasets
      : PublishedDatasetsList.data?.userPublishedDatasets;

  return (
    <div>
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'
        )}
      >
        {PublishedDatasetsList.isLoading ? (
          <div className=" flex w-fit justify-center rounded-2 bg-surfaceDefault p-4">
            <Spinner />
          </div>
        ) : (
          DatasetData?.length > 0 &&
          DatasetData?.map((item: any, index: any) => (
            <Card
              type={[
                {
                  label: 'Dataset',
                  fillColor: '#E9EFF4',
                  borderColor: '#F9C74F',
                },
              ]}
              key={index}
              title={item.title}
              description={item.description}
              metadataContent={[
                {
                  icon: Icons.calendar,
                  label: 'Date',
                  value: '19 July 2024',
                },
                {
                  icon: Icons.download,
                  label: 'Download',
                  value: item.downloadCount.toString(),
                },
                {
                  icon: Icons.globe,
                  label: 'Geography',
                  value: 'India',
                },
              ]}
              tag={item.tags}
              formats={item.formats}
              footerContent={[
                {
                  icon: `/Sectors/${item.sectors[0].name}.svg`,
                  label: 'Sectors',
                },
                {
                  icon: item.isIndividualDataset
                    ? item?.user?.profilePicture
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profilePicture.url}`
                      : '/profile.png'
                    : item?.organization?.logo
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo.url}`
                      : '/org.png',
                  label: 'Published by',
                },
              ]}
              variation={'collapsed'}
              iconColor="warning"
              href={`/datasets/${item.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Datasets;
