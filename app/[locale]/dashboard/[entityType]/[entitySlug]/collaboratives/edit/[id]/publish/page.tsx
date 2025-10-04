'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Icon,
  Spinner,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import Assign from './Assign';
import Contributors from './Contributors';
import Details from './Details';

const CollaborativeDetails: any = graphql(`
  query CollabDetails($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      summary
      website
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
      startedOn
      completedOn
      logo {
        name
        path
        url
      }
      datasets {
        title
        id
        sectors {
          name
        }
        modified
      }
      useCases {
        title
        id
        slug
        sectors {
          name
        }
        modified
      }
      contactEmail
      status
      slug
      contributors {
        id
        fullName
        username
        profilePicture {
          url
        }
      }
      supportingOrganizations {
        id
        name
        logo {
          url
          name
        }
      }
      partnerOrganizations {
        id
        name
        logo {
          url
          name
        }
      }
    }
  }
`);

const publishCollaborativeMutation: any = graphql(`
  mutation publishCollaborative($collaborativeId: String!) {
    publishCollaborative(collaborativeId: $collaborativeId) {
      ... on TypeCollaborative {
        id
        status
      }
    }
  }
`);

const Publish = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const CollaborativeData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_CollaborativeDetails`],
    () =>
      GraphQL(
        CollaborativeDetails,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: params.id,
          },
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );
  const router = useRouter();

  const { mutate, isLoading: mutationLoading } = useMutation(
    () => GraphQL(publishCollaborativeMutation, {
      [params.entityType]: params.entitySlug,
    }, { collaborativeId: params.id }),
    {
      onSuccess: (data: any) => {
        toast('Collaborative Published Successfully');
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives`
        );
      },
      onError: (err: any) => {
        toast(`Received ${err} on dataset publish `);
      },
    }
  );

  const Summary = [
    {
      name: 'Details',
      data: CollaborativeData.data?.collaboratives,
      error:
        CollaborativeData.data?.collaboratives[0]?.sectors.length === 0 ||
        CollaborativeData.data?.collaboratives[0]?.summary.length === 0 ||
        CollaborativeData.data?.collaboratives[0]?.sdgs.length === 0 ||
        CollaborativeData.data?.collaboratives[0]?.logo === null
          ? 'Summary or SDG or Sectors or Logo is missing. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    {
      name: 'Datasets',
      data: CollaborativeData?.data?.collaboratives[0]?.datasets,
      error:
        CollaborativeData.data && CollaborativeData.data?.collaboratives[0]?.datasets.length === 0
          ? 'No datasets assigned. Please assign to continue.'
          : '',
    },
    {
      name: 'Use Cases',
      data: CollaborativeData?.data?.collaboratives[0]?.useCases,
      error: '',
    },
    {
      name: 'Dashboards',
      data: CollaborativeData?.data?.collaboratives[0]?.length > 0,
      error: '',
    },
    {
      name: 'Contributors',
      data: CollaborativeData?.data?.collaboratives[0]?.length > 0,
      error: '',
    },
  ];

  const isPublishDisabled = (collaborative: any) => {
    if (!collaborative) return true;

    const hasDatasets = collaborative?.datasets.length > 0;
    const hasRequiredMetadata =
      collaborative.sectors.length > 0 &&
      collaborative?.summary.length > 0 &&
      collaborative?.sdgs.length > 0 &&
      collaborative?.logo !== null;

    // No datasets assigned
    if (!hasDatasets) return true;

    // Required metadata check
    if (!hasRequiredMetadata) return true;
  };

  return (
    <>
      <div className=" w-full py-6">
        <div className="flex items-center justify-center gap-2 ">
          <Text variant="bodyMd" className=" font-semi-bold">
            REVIEW COLLABORATIVE DETAILS
          </Text>
          :
          <Text>
            Please check all the Collaborative details below before publishing
          </Text>
        </div>
        <div className=" flex flex-col gap-10 pt-6">
          {CollaborativeData.isLoading || mutationLoading ? (
            <div className=" mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              {Summary.map((item, index) => (
                <Accordion type="single" collapsible key={index}>
                  <AccordionItem
                    value={`item-${index}`}
                    className=" border-none"
                  >
                    <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-baseBlueSolid3  p-4 hover:no-underline ">
                      <div className="flex flex-wrap items-center justify-start gap-2">
                        <Text className=" w-32 text-justify font-semi-bold">
                          {item.name}
                        </Text>
                        {item.error !== '' && (
                          <div className="flex items-center gap-2">
                            <Icon
                              source={Icons.alert}
                              color="critical"
                              size={24}
                            />
                            <Text variant="bodyMd">{item.error}</Text>
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent
                      className="flex w-full flex-col "
                      style={{
                        backgroundColor: 'var( --base-pure-white)',
                        outline: '1px solid var( --base-pure-white)',
                      }}
                    >
                      <div className=" py-4">
                        {item.name === 'Datasets' ? (
                          <Assign data={item.data} />
                        ) : item.name === 'Use Cases' ? (
                          <Assign data={item.data} />
                        ) : item.name === 'Details' ? (
                          <Details data={CollaborativeData.data} />
                        ) : (
                          <Contributors data={CollaborativeData.data} />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              <Button
                className="m-auto w-fit"
                onClick={() => mutate()}
                disabled={isPublishDisabled(CollaborativeData?.data?.collaboratives[0])}
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Publish;
