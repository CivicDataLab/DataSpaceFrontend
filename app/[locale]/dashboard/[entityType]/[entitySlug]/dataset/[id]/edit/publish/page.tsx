'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Dialog,
  Icon,
  Spinner,
  Table,
  Tag,
  Text,
  toast,
} from 'opub-ui';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';
import { formatDate, getWebsiteTitle, toTitleCase } from '@/lib/utils';
import { RichTextRenderer } from '@/components/RichTextRenderer';

const datasetSummaryQuery: any = graphql(`
  query datasetsSummary($filters: DatasetFilter) {
    datasets(filters: $filters) {
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
      resources {
        id
        type
        name
        description
        schema {
          fieldName
          id
          format
          description
        }
      }
      tags {
        id
        value
      }
      sectors {
        id
        name
      }
      id
      title
      description
      created
      modified
      datasetType
      promptMetadata
    }
  }
`);

const publishDatasetMutation: any = graphql(`
  mutation publishDataset($datasetId: UUID!) {
    publishDataset(datasetId: $datasetId) {
      ... on TypeDataset {
        id
        status
      }
    }
  }
`);

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
    {
      accessorKey: 'dialog',
      header: `${name === 'Access Type' ? 'Resources' : 'Fields'}`,
      cell: ({ row }: any) => {
        return (
          <>
            <Dialog>
              <Dialog.Trigger>
                <Button
                  kind="tertiary"
                  disabled={row.original.dialog.length === 0}
                >
                  {name === 'Access Type' ? 'Resources' : 'Fields'}
                </Button>
              </Dialog.Trigger>
              <Dialog.Content
                title={name === 'Access Type' ? 'Resources' : 'Fields'}
                limitHeight
              >
                {name === 'Access Type' ? (
                  <Table
                    columns={[
                      {
                        accessorKey: 'name',
                        header: 'Name of the Resource',
                      },
                      {
                        accessorKey: 'type',
                        header: 'Permissions',
                      },
                    ]}
                    rows={row.original.dialog.map((item: any) => ({
                      name: item.resource.name,
                      type: item.resource.type,
                    }))}
                    hideFooter
                  />
                ) : (
                  <Table
                    columns={[
                      {
                        accessorKey: 'name',
                        header: 'Name of the Field',
                      },
                      {
                        accessorKey: 'description',
                        header: 'Description',
                      },
                      {
                        accessorKey: 'format',
                        header: 'Format',
                      },
                    ]}
                    rows={row.original.dialog.map((item: any) => ({
                      name: item.fieldName,
                      description: item.description,
                      format: item.format,
                    }))}
                    hideFooter
                  />
                )}
              </Dialog.Content>
            </Dialog>
          </>
        );
      },
    },
  ];
};

const generateTableData = (name: any, data: any) => {
  return data.map((item: any) => ({
    name: item.name,
    type:
      name === 'Access Type'
        ? toTitleCase(item.type.split('.').pop().toLowerCase())
        : item.type,
    dialog: name === 'Access Type' ? item.modelResources : item.schema,
  }));
};

const Page = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const getDatasetsSummary: { data: any; isLoading: any; refetch: any } =
    useQuery([`summary_${params.id}`], () =>
      GraphQL(
        datasetSummaryQuery,
        {
          [params.entityType]: params.entitySlug,
        },
        { filters: { id: params.id } }
      )
    );

  useEffect(() => {
    getDatasetsSummary.refetch();
  });

  const isPromptDataset = getDatasetsSummary.data?.datasets[0]?.datasetType === 'PROMPT';
  const promptMetadata = getDatasetsSummary.data?.datasets[0]?.promptMetadata;

  const Summary = [
    {
      name: isPromptDataset ? 'Prompt Files' : 'Resource',
      data: getDatasetsSummary.data?.datasets[0]?.resources,
      error:
        getDatasetsSummary.data &&
        getDatasetsSummary.data?.datasets[0]?.resources.length === 0
          ? isPromptDataset ? 'No Prompt Files found. Please add to continue.' : 'No Resources found. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    ...(process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true'
      ? [
          {
            name: 'Access Type',
            data: getDatasetsSummary.data?.datasets[0]?.accessModels,
            error:
              getDatasetsSummary.data &&
              getDatasetsSummary.data?.datasets[0]?.accessModels.length === 0
                ? 'No Access Type found. Please add to continue.'
                : '',
            errorType: 'critical',
          },
        ]
      : []),
    {
      name: 'Metadata',
      data: getDatasetsSummary.data?.datasets[0]?.metadata,
      error:
        getDatasetsSummary.data?.datasets[0]?.sectors.length === 0 ||
        getDatasetsSummary.data?.datasets[0]?.sectors.length === 0 ||
        getDatasetsSummary.data?.datasets[0]?.description.length === 0
          ? 'Tags or Description or Sectors is missing. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    ...(isPromptDataset
      ? [
          {
            name: 'Prompt Metadata',
            data: promptMetadata,
            error: '',
            errorType: 'info',
          },
        ]
      : []),
  ];

  const PrimaryMetadata = [
    {
      label: 'Dataset Name',
      value: getDatasetsSummary.data?.datasets[0].title,
    },
    {
      label: 'Description',
      value: getDatasetsSummary.data?.datasets[0].description,
    },
    {
      label: 'Date of Creation',
      value: formatDate(getDatasetsSummary.data?.datasets[0].created),
    },
    {
      label: 'Date of Last Update',
      value: formatDate(getDatasetsSummary.data?.datasets[0].modified),
    },
  ];
  const router = useRouter();

  const { mutate, isLoading: mutationLoading } = useMutation(
    () =>
      GraphQL(
        publishDatasetMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        { datasetId: params.id }
      ),
    {
      onSuccess: (data: any) => {
        toast('Dataset Published Successfully');
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/dataset`
        );
      },
      onError: (err: any) => {
        toast(`Received ${err} on dataset publish `);
      },
    }
  );

  const isPublishDisabled = (dataset: any) => {
    if (!dataset) return true;

    const hasResources = dataset.resources.length > 0;
    const hasAccessModels = dataset.accessModels?.length > 0;
    const isAccessModelEnabled =
      process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true';
    const hasRequiredMetadata =
      dataset.sectors.length > 0 &&
      dataset.description.length > 0 &&
      dataset.tags.length > 0;

    // No resources
    if (!hasResources) return true;

    // Access model check if enabled
    if (isAccessModelEnabled && !hasAccessModels) return true;

    // Required metadata check
    return !hasRequiredMetadata;
  };

  const [sourceTitle, setSourceTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const urlItem = getDatasetsSummary.data?.datasets[0]?.metadata.find(
          (item: any) => item.metadataItem?.dataType === 'URL'
        );

        if (urlItem && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setSourceTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    fetchTitle();
  }, [
    getDatasetsSummary.data?.datasets[0]?.metadata,
    getDatasetsSummary.isLoading,
  ]);

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
          {getDatasetsSummary.isLoading || mutationLoading ? (
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
                        {item.name === 'Prompt Metadata' ? (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            {item.data?.task_type && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">Task Type:</Text>
                                <Text variant="bodyMd" className="lg:basis-4/5">
                                  {item.data.task_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                </Text>
                              </div>
                            )}
                            {item.data?.domain && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">Domain:</Text>
                                <Text variant="bodyMd" className="lg:basis-4/5">{item.data.domain}</Text>
                              </div>
                            )}
                            {item.data?.target_languages?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">Target Languages:</Text>
                                <div className="flex gap-2 lg:basis-4/5">
                                  {item.data.target_languages.map((lang: string, idx: number) => (
                                    <Tag key={idx}>{lang}</Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.data?.prompt_format && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">Prompt Format:</Text>
                                <Text variant="bodyMd" className="lg:basis-4/5">{item.data.prompt_format}</Text>
                              </div>
                            )}
                            {item.data?.target_model_types?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">Target Model Types:</Text>
                                <div className="flex gap-2 lg:basis-4/5">
                                  {item.data.target_model_types.map((model: string, idx: number) => (
                                    <Tag key={idx}>{model.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">Has System Prompt:</Text>
                              <Text variant="bodyMd" className="lg:basis-4/5">{item.data?.has_system_prompt ? 'Yes' : 'No'}</Text>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">Has Example Responses:</Text>
                              <Text variant="bodyMd" className="lg:basis-4/5">{item.data?.has_example_responses ? 'Yes' : 'No'}</Text>
                            </div>
                          </div>
                        ) : item.name !== 'Metadata' ? (
                          item.data &&
                          item?.data.length > 0 && (
                            <Table
                              columns={generateColumnData(item.name)}
                              rows={generateTableData(item.name, item.data)}
                              hideFooter
                            />
                          )
                        ) : (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            {PrimaryMetadata.map(
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
                                      <RichTextRenderer content={item.value} />
                                    </Text>
                                  </div>
                                )
                            )}

                            {item?.data?.map((item: any, index: any) => (
                              <div className="flex flex-wrap gap-2" key={index}>
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  {toTitleCase(item.metadataItem.label)}:
                                </Text>

                                {item.metadataItem.dataType !== 'URL' ? (
                                  <Text
                                    variant="bodyMd"
                                    className="lg:basis-4/5"
                                  >
                                    {' '}
                                    {item.value === '' ? 'NA' : item.value}
                                  </Text>
                                ) : (
                                  <Link href={item.value} target="_blank">
                                    <Text
                                      className="underline"
                                      color="highlight"
                                    >
                                      {sourceTitle?.trim()
                                        ? sourceTitle
                                        : 'Visit Website'}
                                    </Text>
                                  </Link>
                                )}
                              </div>
                            ))}
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Sectors:
                              </Text>
                              <div className="flex gap-2 lg:basis-4/5">
                                {getDatasetsSummary.data?.datasets[0]?.sectors?.map(
                                  (item: any, index: any) => (
                                    <Tag key={index}>{item.name}</Tag>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Tags:
                              </Text>
                              <div className="flex gap-2 lg:basis-4/5">
                                {getDatasetsSummary.data?.datasets[0].tags.map(
                                  (item: any, index: any) => (
                                    <Tag key={index}>{item.value}</Tag>
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
                disabled={isPublishDisabled(
                  getDatasetsSummary.data?.datasets[0]
                )}
                onClick={() => mutate()}
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
