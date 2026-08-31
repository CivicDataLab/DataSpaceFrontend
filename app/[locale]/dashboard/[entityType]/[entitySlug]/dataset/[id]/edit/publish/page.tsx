'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { DatasetsSummaryQuery } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
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

import { GraphQL } from '@/lib/api';
import { formatDate, getWebsiteTitle, toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { RichTextRenderer } from '@/components/RichTextRenderer';

const datasetSummaryQuery = graphql(`
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

const publishDatasetMutation = graphql(`
  mutation publishDataset($datasetId: UUID!) {
    publishDataset(datasetId: $datasetId) {
      ... on TypeDataset {
        id
        status
      }
    }
  }
`);

interface SchemaField {
  fieldName: string;
  description?: string | null;
  format?: string | null;
}

interface AccessModelResource {
  resource: {
    name: string;
    type?: string | null;
  };
}

interface ResourceSummary {
  name: string;
  type: string;
  schema?: SchemaField[] | null;
  modelResources?: AccessModelResource[];
}

interface PromptMetadata {
  task_type?: string;
  domain?: string;
  target_languages?: string[];
  prompt_format?: string;
  target_model_types?: string[];
  has_system_prompt?: boolean;
  has_example_responses?: boolean;
}

type DatasetSummaryResult = DatasetsSummaryQuery['datasets'][number];

type AccessModelSummary = {
  id?: string;
  name: string;
  type: string;
  modelResources?: AccessModelResource[];
};

function hasAccessModels(
  dataset: object
): dataset is { accessModels: AccessModelSummary[] } {
  return 'accessModels' in dataset && Array.isArray(dataset.accessModels);
}

function isPromptMetadata(value: unknown): value is PromptMetadata {
  return typeof value === 'object' && value !== null;
}

interface DialogTableRow {
  dialog: AccessModelResource[] | SchemaField[];
}

const generateColumnData = (name: string) => {
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
      cell: ({ row }: { row: { original: DialogTableRow } }) => {
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
                    rows={row.original.dialog.map((item) => {
                      if ('resource' in item) {
                        return {
                          name: item.resource.name,
                          type: item.resource.type,
                        };
                      }
                      return { name: '', type: '' };
                    })}
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
                    rows={row.original.dialog.map((item) => {
                      if ('fieldName' in item) {
                        return {
                          name: item.fieldName,
                          description: item.description,
                          format: item.format,
                        };
                      }
                      return { name: '', description: '', format: '' };
                    })}
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

const generateTableData = (name: string, data: ResourceSummary[]) => {
  return data.map((item) => {
    const permission = item.type.split('.').pop();
    return {
      name: item.name,
      type:
        name === 'Access Type'
          ? toTitleCase((permission ?? item.type).toLowerCase())
          : item.type,
      dialog: (name === 'Access Type' ? item.modelResources : item.schema) ?? [],
    };
  });
};

const Page = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const getDatasetsSummary = useQuery([`summary_${params.id}`], () =>
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

  const dataset = getDatasetsSummary.data?.datasets[0];
  const isPromptDataset = dataset?.datasetType === 'PROMPT';
  const promptMetadata = isPromptMetadata(dataset?.promptMetadata)
    ? dataset.promptMetadata
    : null;
  const accessModels =
    dataset && hasAccessModels(dataset) ? dataset.accessModels : undefined;

  const Summary = [
    {
      kind: 'resources' as const,
      name: isPromptDataset ? 'Prompt Files' : 'Resource',
      data: dataset?.resources,
      error:
        getDatasetsSummary.data && (dataset?.resources.length ?? 0) === 0
          ? isPromptDataset
            ? 'No Prompt Files found. Please add to continue.'
            : 'No Resources found. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    ...(process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true'
      ? [
          {
            kind: 'access' as const,
            name: 'Access Type',
            data: accessModels,
            error:
              getDatasetsSummary.data && (accessModels?.length ?? 0) === 0
                ? 'No Access Type found. Please add to continue.'
                : '',
            errorType: 'critical',
          },
        ]
      : []),
    {
      kind: 'metadata' as const,
      name: 'Metadata',
      data: dataset?.metadata,
      error:
        (dataset?.sectors.length ?? 0) === 0 ||
        (dataset?.tags.length ?? 0) === 0 ||
        (dataset?.description?.length ?? 0) === 0
          ? 'Tags or Description or Sectors is missing. Please add to continue.'
          : '',
      errorType: 'critical',
    },
    ...(isPromptDataset
      ? [
          {
            kind: 'prompt' as const,
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
      value: dataset?.title,
    },
    {
      label: 'Description',
      value: dataset?.description,
    },
    {
      label: 'Date of Creation',
      value: formatDate(dataset?.created ?? null) || '',
    },
    {
      label: 'Date of Last Update',
      value: formatDate(dataset?.modified ?? null) || '',
    },
  ];
  const router = useRouter();
  const PUBLISH_SUCCESS_TOAST_ID = 'dataset-publish-success';
  const PUBLISH_ERROR_TOAST_ID = 'dataset-publish-error';

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
      onSuccess: () => {
        toast('Dataset Published Successfully', {
          id: PUBLISH_SUCCESS_TOAST_ID,
        });
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/dataset`
        );
      },
      onError: (err: unknown) => {
        const errorMessage =
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string' &&
          err.message.trim()
            ? err.message.trim()
            : 'Unable to publish dataset right now. Please try again.';
        toast(`Error: ${errorMessage}`, { id: PUBLISH_ERROR_TOAST_ID });
      },
    }
  );

  const isPublishDisabled = (current?: DatasetSummaryResult | null) => {
    if (!current) return true;

    const hasResources = current.resources.length > 0;
    const hasAccessModelsFlag =
      hasAccessModels(current) && (current.accessModels?.length ?? 0) > 0;
    const isAccessModelEnabled =
      process.env.NEXT_PUBLIC_ENABLE_ACCESSMODEL === 'true';
    const hasRequiredMetadata =
      current.sectors.length > 0 &&
      (current.description?.length ?? 0) > 0 &&
      current.tags.length > 0;

    // No resources
    if (!hasResources) return true;

    // Access model check if enabled
    if (isAccessModelEnabled && !hasAccessModelsFlag) return true;

    // Required metadata check
    return !hasRequiredMetadata;
  };

  const [sourceTitle, setSourceTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const urlItem = dataset?.metadata.find(
          (item) => item.metadataItem?.dataType === 'URL'
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
  }, [dataset?.metadata, getDatasetsSummary.data?.datasets, getDatasetsSummary.isLoading]);

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
                        {item.kind === 'prompt' ? (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            {item.data?.task_type && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  Task Type:
                                </Text>
                                <Text variant="bodyMd" className="lg:basis-4/5">
                                  {item.data.task_type
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, (c: string) =>
                                      c.toUpperCase()
                                    )}
                                </Text>
                              </div>
                            )}
                            {item.data?.domain && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  Domain:
                                </Text>
                                <Text variant="bodyMd" className="lg:basis-4/5">
                                  {item.data.domain}
                                </Text>
                              </div>
                            )}
                            {(item.data?.target_languages?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  Target Languages:
                                </Text>
                                <div className="flex gap-2 lg:basis-4/5">
                                  {item.data?.target_languages?.map(
                                    (lang: string, idx: number) => (
                                      <Tag key={idx}>{lang}</Tag>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {item.data?.prompt_format && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  Prompt Format:
                                </Text>
                                <Text variant="bodyMd" className="lg:basis-4/5">
                                  {item.data.prompt_format}
                                </Text>
                              </div>
                            )}
                            {(item.data?.target_model_types?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  Target Model Types:
                                </Text>
                                <div className="flex gap-2 lg:basis-4/5">
                                  {item.data?.target_model_types?.map(
                                    (model: string, idx: number) => (
                                      <Tag key={idx}>
                                        {model
                                          .replace(/_/g, ' ')
                                          .replace(/\b\w/g, (c: string) =>
                                            c.toUpperCase()
                                          )}
                                      </Tag>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Has System Prompt:
                              </Text>
                              <Text variant="bodyMd" className="lg:basis-4/5">
                                {item.data?.has_system_prompt ? 'Yes' : 'No'}
                              </Text>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Has Example Responses:
                              </Text>
                              <Text variant="bodyMd" className="lg:basis-4/5">
                                {item.data?.has_example_responses
                                  ? 'Yes'
                                  : 'No'}
                              </Text>
                            </div>
                          </div>
                        ) : item.kind !== 'metadata' ? (
                          item.data &&
                          item.data.length > 0 && (
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

                            {item.data?.map((metadataItem, index) => (
                              <div className="flex flex-wrap gap-2" key={index}>
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  {toTitleCase(metadataItem.metadataItem.label)}:
                                </Text>

                                {metadataItem.metadataItem.dataType !== 'URL' ? (
                                  <Text
                                    variant="bodyMd"
                                    className="lg:basis-4/5"
                                  >
                                    {' '}
                                    {metadataItem.value === ''
                                      ? 'NA'
                                      : metadataItem.value}
                                  </Text>
                                ) : (
                                  <Link
                                    href={metadataItem.value ?? ''}
                                    target="_blank"
                                  >
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
                                {dataset?.sectors?.map((sector, index) => (
                                    <Tag key={index}>{sector.name}</Tag>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Tags:
                              </Text>
                              <div className="flex gap-2 lg:basis-4/5">
                                {dataset?.tags.map((tag, index) => (
                                    <Tag key={index}>{tag.value}</Tag>
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
                disabled={isPublishDisabled(dataset)}
                onClick={() => mutate()}
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

export default Page;
