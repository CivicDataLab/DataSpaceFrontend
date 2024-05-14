'use client';

import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Table,
  Tag,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, toTitleCase } from '@/lib/utils';

const datasetSummaryQuery = graphql(`
  query datasetsSummary($filters: DatasetFilter) {
    datasets(filters: $filters) {
      metadata {
        metadataItem {
          id
          label
        }
        id
        value
      }
      resources {
        id
        type
        name
        description
      }
      accessModels {
        id
        name
        description
        type
        created
        modified
      }
      tags
      id
      title
      description
      created
      modified
    }
  }
`);

// const createDatasetMutationDoc: any = graphql(`
//   mutation GenerateDatasetName {
//     addDataset {
//       __typename
//       ... on TypeDataset {
//         id
//         created
//       }
//       ... on OperationInfo {
//         messages {
//           kind
//           message
//         }
//       }
//     }
//   }
// `);

const generateColumnData = (name: any) => {
  return [
    {
      accessorKey: 'name',
      header: `Name of the ${name}`,
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
  ];
};

const generateTableData = (name: any, data: any) => {
  return data.map((item: any) => ({
    name: item.name,
    type: name === 'Access Type' ? item.type.split('.').pop() : item.type,
  }));
};

const Page = () => {
  const params = useParams();

  const { data, isLoading } = useQuery([`summary_${params.id}`], () =>
    GraphQL(datasetSummaryQuery, { filters: { id: params.id } })
  );

  console.log(data);

  // Summary data as per your provided format
  const Summary = [
    {
      name: 'Resource',
      data: data?.datasets[0]?.resources,
    },
    {
      name: 'Access Type',
      data: data?.datasets[0]?.accessModels,
    },
    {
      name: 'Metadata',
      data: data?.datasets[0]?.metadata,
    },
  ];

  const PrimaryMetadata = [
    { label: 'Dataset Name', value: data?.datasets[0].title },
    { label: 'Description', value: data?.datasets[0].description },
    { label: 'Date of Creation', value: formatDate(data?.datasets[0].created) },
    {
      label: 'Date of Last Update',
      value: formatDate(data?.datasets[0].modified),
    },
  ];

  // const { mutate, isLoading } = useMutation(
  //   () => GraphQL(createDatasetMutationDoc, []),
  //   {
  //     onSuccess: (data: any) => {
  //       queryClient.invalidateQueries({
  //         queryKey: [`create_dataset_${'52'}`],
  //       });

  //       router.push(
  //         `/dashboard/organization/${params.organizationId}/dataset/${data?.addDataset?.id}/edit/distribution`
  //       );
  //     },
  //     onError: (err: any) => {
  //       console.log('Error ::: ', err);
  //     },
  //   }
  // );

  return (
    <>
      <div className=" w-full py-6">
        <div className="flex items-center justify-center gap-2 p-4">
          <Text variant="bodyMd" className=" font-semi-bold">
            REVIEW DATASET DETAILS
          </Text>
          :
          <Text>
            Please check all the dataset details below before publishing
          </Text>
        </div>
        <div className=" flex flex-col gap-10 pt-6">
          {isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              {Summary.map((item, index) => (
                <Accordion type="single" collapsible key={index}>
                  <AccordionItem value={`item-${index}`}>
                    <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-baseBlueSolid3  p-4  ">
                      <div>
                        <Text className=" font-semi-bold">See {item.name}</Text>
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
                        {item.name !== 'Metadata' ? (
                          <Table
                            columns={generateColumnData(item.name)}
                            rows={generateTableData(item.name, item.data)}
                            hideFooter
                          />
                        ) : (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            {PrimaryMetadata.map((item, index) => (
                              <div className="flex flex-wrap gap-2" key={index}>
                                <Text className=" basis-1/6" variant="bodyMd">
                                  {item.label}:
                                </Text>
                                <Text variant="bodyMd" className=" basis-4/5">
                                  {item.value}
                                </Text>
                              </div>
                            ))}

                            {item?.data?.map((item: any, index: any) => (
                              <div className="flex flex-wrap gap-2" key={index}>
                                <Text className=" basis-1/6" variant="bodyMd">
                                  {toTitleCase(item.metadataItem.label)}:
                                </Text>
                                <Text variant="bodyMd" className=" basis-4/5">
                                  {' '}
                                  {item.value}
                                </Text>
                              </div>
                            ))}
                            <div className="flex flex-wrap gap-2">
                              <Text className=" basis-1/6" variant="bodyMd">
                                Tags:
                              </Text>
                              <div className=" basis-4/5">
                                {data?.datasets[0].tags.map(
                                  (item: any, index: any) => (
                                    <Tag key={index}>{item}</Tag>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              <Button
                className="m-auto w-fit"
                disabled={
                  !data?.datasets[0]?.resources.length &&
                  !data?.datasets[0]?.accessModels.length
                }
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

export default Page;
