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
import Dashboards from './Dashboards';
import Details from './Details';

const UseCaseDetails: any = graphql(`
  query UseCasedata($filters: UseCaseFilter) {
    useCases(filters: $filters) {
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
      geographies {
        id
        name
        code
        type
      }
      sdgs {
        id
        code
        name
      }
      runningStatus
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
      usecaseDashboard {
        id
        name
        link
      }
    }
  }
`);

const publishUseCaseMutation: any = graphql(`
  mutation publishUseCase($useCaseId: String!) {
    publishUseCase(useCaseId: $useCaseId) {
      ... on TypeUseCase {
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
  const UseCaseData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UsecaseDetails`],
    () =>
      GraphQL(
        UseCaseDetails,
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
    () => GraphQL(publishUseCaseMutation, {
      [params.entityType]: params.entitySlug,
    }, { useCaseId: params.id }),
    {
      onSuccess: () => {
        toast('UseCase Published Successfully');
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/usecases`
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
      data: UseCaseData.data?.useCases,
      error:
        UseCaseData.data?.useCases[0]?.sectors.length === 0 ||
        UseCaseData.data?.useCases[0]?.summary.length === 0 ||
        UseCaseData.data?.useCases[0]?.sdgs.length === 0 ||
        UseCaseData.data?.useCases[0]?.logo === null
          ? 'Summary or SDG or Sectors or Logo is missing. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    {
      name: 'Assign',
      data: UseCaseData?.data?.useCases[0]?.datasets,
      error:
        UseCaseData.data && UseCaseData.data?.useCases[0]?.datasets.length === 0
          ? 'No datasets assigned. Please assign to continue.'
          : '',
    },
    {
      name: 'Dashboards',
      data: UseCaseData?.data?.useCases[0]?.length > 0,
      error: '',
    },
    {
      name: 'Contributors',
      data: UseCaseData?.data?.useCases[0]?.length > 0,
      error: '',
    },
  ];

  const isPublishDisabled = (useCase: any) => {
    if (!useCase) return true;

    const hasDatasets = useCase?.datasets.length > 0;
    const hasRequiredMetadata =
      useCase.sectors.length > 0 &&
      useCase?.summary.length > 0 &&
      useCase?.sdgs.length > 0 &&
      useCase?.logo !== null;

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
            REVIEW USECASE DETAILS
          </Text>
          :
          <Text>
            Please check all the UseCase details below before publishing
          </Text>
        </div>
        <div className=" flex flex-col gap-10 pt-6">
          {UseCaseData.isLoading || mutationLoading ? (
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
                        {item.name === 'Assign' ? (
                          <Assign data={item.data} />
                        ) : item.name === 'Details' ? (
                          <Details data={UseCaseData.data} />
                        ) : item.name === 'Dashboards' ? (
                          <Dashboards
                            data={
                              UseCaseData.data?.useCases[0]?.usecaseDashboard
                            }
                          />
                        ) : (
                          <Contributors data={UseCaseData.data} />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              <Button
                className="m-auto w-fit"
                onClick={() => mutate()}
                disabled={isPublishDisabled(UseCaseData?.data?.useCases[0])}
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
