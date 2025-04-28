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
  Table,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';

const UseCaseDetails: any = graphql(`
  query UseCasedata($filters: UseCaseFilter) {
    useCases(filters: $filters) {
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
  const params = useParams();

  const UseCaseData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UsecaseDetails`],
    () =>
      GraphQL(
        UseCaseDetails,
        {},
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
    () => GraphQL(publishUseCaseMutation, {}, { useCaseId: params.id }),
    {
      onSuccess: (data: any) => {
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
        UseCaseData.data && UseCaseData.data?.useCases[0]?.length > 0
          ? 'No Details found. Please add to continue.'
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
  ];

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'sector', header: 'Sector' },
    { accessorKey: 'modified', header: 'Last Modified' },
  ];

  const PrimaryDetails = [
    { label: 'Title', value: UseCaseData.data?.useCases[0]?.title },
    { label: 'Summary', value: UseCaseData.data?.useCases[0]?.summary },
    {
      label: 'running Status',
      value: UseCaseData.data?.useCases[0]?.runningStatus,
    },

    {
      label: 'Logo',
      value:
        UseCaseData.data &&
        UseCaseData.data?.useCases[0]?.logo?.name.split('/').pop(),
    },
    {
      label: 'Website',
      value: UseCaseData.data?.useCases[0]?.website,
    },
    {
      label: 'Contact Email',
      value: UseCaseData.data?.useCases[0]?.contactEmail,
    },
    { label: 'Sector', value: UseCaseData.data?.useCases[0]?.sectors[0]?.name },
    { label: 'Tags', value: UseCaseData.data?.useCases[0]?.tags[0]?.value },
    ...(UseCaseData.data?.useCases[0]?.metadata?.map((meta: any) => ({
      label: meta.metadataItem?.label,
      value: meta.value,
    })) || []),
  ];

  const generateTableData = (list: Array<any>) => {
    return list?.map((item) => {
      return {
        title: item.title,
        id: item.id,
        sector: item.sectors[0]?.name,
        modified: formatDate(item.modified),
      };
    });
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
                          <Table
                            columns={columns}
                            rows={generateTableData(item.data)}
                            hideFooter
                          />
                        ) : item.name === 'Details' ? (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            {PrimaryDetails.map(
                              (item, index) =>
                                item.value && (
                                  <div
                                    className="flex flex-wrap gap-2"
                                    key={index}
                                  >
                                    <Text
                                      className="lg:basis-1/6"
                                      variant="bodyMd"
                                    >
                                      {item.label}:
                                    </Text>
                                    <Text
                                      variant="bodyMd"
                                      className="lg:basis-4/5"
                                    >
                                      {item.value}
                                    </Text>
                                  </div>
                                )
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            <></>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              <Button
                className="m-auto w-fit"
                onClick={() => mutate()}
                disabled={UseCaseData?.data?.useCases[0]?.datasets.length <= 0}
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
