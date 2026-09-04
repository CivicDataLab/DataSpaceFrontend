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

// prettier-ignore
const CollaborativeDetails = graphql(`
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
      coverImage {
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

const publishCollaborativeMutation = graphql(`
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
  const CollaborativeData =
    useQuery(
      [
        `fetch_CollaborativeDetails`,
        params.entityType,
        params.entitySlug,
        params.id,
      ],
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
        // We navigate between tabs via routing; always refetch to avoid showing stale cached data.
        refetchOnMount: 'always',
        refetchOnReconnect: 'always',
      }
    );
  const router = useRouter();
  const PUBLISH_SUCCESS_TOAST_ID = 'collaboratives-publish-toast';
  const PUBLISH_ERROR_TOAST_ID = 'collaboratives-publish-toast';

  const { mutate, isLoading: mutationLoading } = useMutation(
    () =>
      GraphQL(
        publishCollaborativeMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        { collaborativeId: params.id }
      ),
    {
      onSuccess: () => {
        toast('Collaborative Published Successfully', {
          id: PUBLISH_SUCCESS_TOAST_ID,
        });
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives`
        );
      },
      onError: (err: unknown) => {
        const errorMessage =
          typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' && err.message.trim()
            ? err.message.trim()
            : 'Unable to publish collaborative right now. Please try again.';
        toast(`Error: ${errorMessage}`, { id: PUBLISH_ERROR_TOAST_ID });
      },
    }
  );

  const Summary = [
    {
      name: 'Details',
      data: CollaborativeData.data?.collaboratives,
      error:
        CollaborativeData.data?.collaboratives?.[0]?.sectors?.length === 0 ||
        CollaborativeData.data?.collaboratives?.[0]?.summary?.length === 0 ||
        CollaborativeData.data?.collaboratives?.[0]?.sdgs?.length === 0 ||
        CollaborativeData.data?.collaboratives?.[0]?.logo === null ||
        CollaborativeData.data?.collaboratives?.[0]?.coverImage === null
          ? 'Summary, SDG, Sectors, Logo, or Cover Image is missing. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    {
      name: 'Datasets',
      data: CollaborativeData?.data?.collaboratives?.[0]?.datasets,
      error:
        CollaborativeData.data &&
        CollaborativeData.data?.collaboratives?.[0]?.datasets?.length === 0
          ? 'No datasets assigned. Please assign to continue.'
          : '',
    },
    {
      name: 'Use Cases',
      data: CollaborativeData?.data?.collaboratives?.[0]?.useCases,
      error: '',
    },
    // {
    //   name: 'Dashboards',
    //   data: CollaborativeData?.data?.collaboratives[0]?.length > 0,
    //   error: '',
    // },
    {
      name: 'Contributors',
      data: CollaborativeData?.data?.collaboratives?.[0] != null &&
        'length' in CollaborativeData.data.collaboratives[0] &&
        typeof CollaborativeData.data.collaboratives[0].length === 'number' &&
        CollaborativeData.data.collaboratives[0].length > 0,
      error: '',
    },
  ];

  const isPublishDisabled = (collaborative: {
    datasets?: unknown[] | null;
    sectors?: unknown[] | null;
    summary?: string | null;
    sdgs?: unknown[] | null;
    logo?: unknown;
    coverImage?: unknown;
  } | null | undefined) => {
    if (!collaborative) return true;

    const hasDatasets = (collaborative.datasets?.length ?? 0) > 0;
    const hasRequiredMetadata =
      (collaborative.sectors?.length ?? 0) > 0 &&
      (collaborative.summary?.length ?? 0) > 0 &&
      (collaborative.sdgs?.length ?? 0) > 0 &&
      collaborative.logo !== null &&
      collaborative.coverImage !== null;

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
                    <AccordionTrigger className="flex w-full items-center gap-2 rounded-1 bg-baseBlueSolid3  p-4 hover:no-underline ">
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
                            <Text variant="bodyMd" className="text-justify">
                              {item.error}
                            </Text>
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
                disabled={isPublishDisabled(
                  CollaborativeData?.data?.collaboratives[0]
                )}
                loading={mutationLoading}
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
