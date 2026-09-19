'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  IconArrowRight,
  IconInfoCircle,
  IconPencil,
  IconSend,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  FileCard,
  SectionCard,
  Spinner,
  Tag,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate, getWebsiteTitle } from '@/lib/utils';
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
        created
        fileDetails {
          format
          size
          created
          file {
            name
          }
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
      geographies {
        id
        name
      }
      id
      title
      description
      created
      modified
      datasetType
      license
      accessType
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

const LICENSE_LABELS: Record<string, string> = {
  GOVERNMENT_OPEN_DATA_LICENSE: 'Government Open Data License',
  CC_BY_4_0_ATTRIBUTION: 'CC BY 4.0',
  CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE: 'CC BY-SA 4.0',
  OPEN_DATA_COMMONS_BY_ATTRIBUTION: 'Open Data Commons By Attribution',
  OPEN_DATABASE_LICENSE: 'Open Database License',
};

interface PromptMetadata {
  task_type?: string;
  domain?: string;
  target_languages?: string[];
  prompt_format?: string;
  target_model_types?: string[];
  has_system_prompt?: boolean;
  has_example_responses?: boolean;
}

function isPromptMetadata(value: unknown): value is PromptMetadata {
  return typeof value === 'object' && value !== null;
}

function formatFileSize(bytes?: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatUploadedAt(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function resourceFormat(item: {
  name: string;
  type: string;
  fileDetails?: {
    format?: string | null;
    file?: { name?: string | null } | null;
  } | null;
}): string {
  const fromDetails = item.fileDetails?.format?.replace('.', '').toUpperCase();
  if (fromDetails) return fromDetails;
  const fromType = item.type?.split('.').pop()?.toUpperCase();
  if (fromType && fromType !== 'FILE') return fromType;
  const original = item.fileDetails?.file?.name || item.name;
  const ext = original.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

function originalName(item: {
  fileDetails?: { file?: { name?: string | null } | null } | null;
}): string | undefined {
  const name = item.fileDetails?.file?.name;
  if (!name) return undefined;
  return name.replace(/^resources\//, '');
}

function ReviewField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="bodySm" color="subdued">
        {label.toUpperCase()}
      </Text>
      <div>{children}</div>
    </div>
  );
}

function dash(value?: string | null): string {
  return value?.trim() ? value : '—';
}

const Page = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();

  const getDatasetsSummary = useQuery([`summary_${params.id}`], () =>
    GraphQL(
      datasetSummaryQuery,
      {
        [params.entityType]: params.entitySlug,
      },
      { filters: { id: params.id } }
    )
  );

  const dataset = getDatasetsSummary.data?.datasets[0];
  const isPromptDataset = dataset?.datasetType === 'PROMPT';
  const promptMetadata = isPromptMetadata(dataset?.promptMetadata)
    ? dataset.promptMetadata
    : null;

  const editBase = `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${params.id}/edit`;
  const filesStep = `${editBase}/resources`;
  const metadataStep = `${editBase}/metadata`;

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

  const hasResources = (dataset?.resources.length ?? 0) > 0;
  const hasRequiredMetadata =
    (dataset?.sectors.length ?? 0) > 0 &&
    (dataset?.description?.length ?? 0) > 0 &&
    (dataset?.tags.length ?? 0) > 0 &&
    Boolean(dataset?.license);
  const isPublishDisabled = !dataset || !hasResources || !hasRequiredMetadata;

  const [sourceTitle, setSourceTitle] = useState<string | null>(null);
  const sourceUrl = dataset?.metadata.find(
    (item) => item.metadataItem?.dataType === 'URL'
  )?.value;

  useEffect(() => {
    const fetchTitle = async () => {
      if (!sourceUrl) {
        setSourceTitle(null);
        return;
      }
      try {
        const title = await getWebsiteTitle(sourceUrl);
        setSourceTitle(title);
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    void fetchTitle();
  }, [sourceUrl]);

  const extraMetadata =
    dataset?.metadata.filter((item) => item.metadataItem?.dataType !== 'URL') ??
    [];
  const totalBytes = dataset?.resources.reduce(
    (sum, item) => sum + (item.fileDetails?.size ?? 0),
    0
  );
  const filesLabel = isPromptDataset ? 'Prompt Files' : 'Uploaded Files';

  const editAction = (label: string, href: string) => [
    {
      icon: IconPencil,
      content: label,
      onAction: () => router.push(href),
    },
  ];

  return (
    <div className="w-full py-2">
      <div className="flex flex-col gap-6">
        {getDatasetsSummary.isLoading || mutationLoading ? (
          <div className="mt-8 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <SectionCard
              title="Metadata"
              expandable
              defaultExpanded
              actions={editAction(
                'Edit metadata',
                `${metadataStep}#basic-information`
              )}
            >
              <div className="flex flex-col gap-4">
                <ReviewField label="Dataset name">
                  <Text variant="bodyMd" fontWeight="medium">
                    {dash(dataset?.title)}
                  </Text>
                </ReviewField>
                <ReviewField label="Description">
                  {dataset?.description ? (
                    <RichTextRenderer content={dataset.description} />
                  ) : (
                    <Text variant="bodyMd">—</Text>
                  )}
                </ReviewField>
                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewField label="Sector">
                    {dataset?.sectors?.length ? (
                      <Text variant="bodyMd" fontWeight="medium">
                        {dataset.sectors
                          .map((sector) => sector.name)
                          .join(', ')}
                      </Text>
                    ) : (
                      <Text variant="bodyMd">—</Text>
                    )}
                  </ReviewField>
                  <ReviewField label="Geography">
                    {dataset?.geographies?.length ? (
                      <Text variant="bodyMd" fontWeight="medium">
                        {dataset.geographies.map((geo) => geo.name).join(', ')}
                      </Text>
                    ) : (
                      <Text variant="bodyMd">—</Text>
                    )}
                  </ReviewField>
                </div>
                <ReviewField label="Tags">
                  {dataset?.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {dataset.tags.map((tag) => (
                        <Tag key={tag.id}>{tag.value}</Tag>
                      ))}
                    </div>
                  ) : (
                    <Text variant="bodyMd">—</Text>
                  )}
                </ReviewField>
                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewField label="Source website">
                    {sourceUrl ? (
                      <Link href={sourceUrl} target="_blank">
                        <Text className="underline" color="highlight">
                          {sourceTitle?.trim() || sourceUrl}
                        </Text>
                      </Link>
                    ) : (
                      <Text variant="bodyMd">—</Text>
                    )}
                  </ReviewField>
                  <ReviewField label="Create date">
                    <Text variant="bodyMd">
                      {formatDate(dataset?.created ?? null) || '—'}
                    </Text>
                  </ReviewField>
                </div>
                {extraMetadata.map((item) => (
                  <ReviewField key={item.id} label={item.metadataItem.label}>
                    <Text variant="bodyMd">{dash(item.value)}</Text>
                  </ReviewField>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Publishing Settings"
              expandable
              defaultExpanded
              actions={editAction(
                'Edit publishing settings',
                `${metadataStep}#publishing-settings`
              )}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ReviewField label="Access type">
                  <Text variant="bodyMd" fontWeight="medium">
                    {dataset?.accessType && dataset.accessType !== 'PUBLIC'
                      ? 'Restricted Access'
                      : 'Open Access'}
                  </Text>
                </ReviewField>
                <ReviewField label="License">
                  <Text variant="bodyMd" fontWeight="medium">
                    {dataset?.license
                      ? LICENSE_LABELS[dataset.license] || dataset.license
                      : '—'}
                  </Text>
                </ReviewField>
              </div>
            </SectionCard>

            {isPromptDataset ? (
              <SectionCard
                title="Prompt Dataset Metadata"
                expandable
                defaultExpanded
                actions={editAction(
                  'Edit prompt metadata',
                  `${metadataStep}#prompt-metadata`
                )}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewField label="Task type">
                    <Text variant="bodyMd">
                      {dash(
                        promptMetadata?.task_type
                          ?.replace(/_/g, ' ')
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())
                      )}
                    </Text>
                  </ReviewField>
                  <ReviewField label="Domain">
                    <Text variant="bodyMd">{dash(promptMetadata?.domain)}</Text>
                  </ReviewField>
                  <ReviewField label="Target languages">
                    {promptMetadata?.target_languages?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {promptMetadata.target_languages.map((lang) => (
                          <Tag key={lang}>{lang}</Tag>
                        ))}
                      </div>
                    ) : (
                      <Text variant="bodyMd">—</Text>
                    )}
                  </ReviewField>
                  <ReviewField label="Target model types">
                    {promptMetadata?.target_model_types?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {promptMetadata.target_model_types.map((model) => (
                          <Tag key={model}>
                            {model
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <Text variant="bodyMd">—</Text>
                    )}
                  </ReviewField>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard
              title={filesLabel}
              expandable
              defaultExpanded
              actions={editAction(
                `Edit ${filesLabel.toLowerCase()}`,
                filesStep
              )}
            >
              {hasResources ? (
                <div className="flex flex-col gap-3">
                  {dataset?.resources.map((item) => (
                    <FileCard
                      key={item.id}
                      name={item.name}
                      format={resourceFormat(item)}
                      size={formatFileSize(item.fileDetails?.size)}
                      uploadedAt={formatUploadedAt(
                        item.fileDetails?.created || item.created
                      )}
                      originalName={originalName(item)}
                      status="ready"
                      onView={() => router.push(`${filesStep}?id=${item.id}`)}
                    />
                  ))}
                  <Text
                    variant="bodySm"
                    fontWeight="medium"
                    className="self-end"
                  >
                    Total file size: {formatFileSize(totalBytes)}
                  </Text>
                </div>
              ) : (
                <Text variant="bodyMd" color="critical">
                  {isPromptDataset
                    ? 'Add at least one prompt file to continue.'
                    : 'Add at least one dataset file to continue.'}
                </Text>
              )}
            </SectionCard>

            <div className="flex items-start gap-3 rounded-2 bg-surfaceSubdued p-4">
              <IconInfoCircle size={20} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <Text variant="bodyMd" fontWeight="medium">
                  Public dataset
                </Text>
                <Text variant="bodySm" color="subdued">
                  Once published, this dataset will be publicly available on
                  CivicDataSpace. Anyone can discover and access its published
                  resources. Before publishing, make sure you have permission to
                  share all included information and that it does not contain
                  private or restricted content.
                </Text>
              </div>
            </div>

            <div className="border flex flex-col items-center gap-3 rounded-2 border-1 border-solid border-borderSubdued p-4 pt-2">
              <Text variant="bodySm" color="subdued">
                Your dataset will be publicly available immediately after
                publishing.
              </Text>
              <Button
                className="w-1/3 rounded-2 bg-[var(--primary)] py-2 hover:bg-[#0b2540]"
                disabled={isPublishDisabled}
                onClick={() => mutate()}
                loading={mutationLoading}
              >
                <span className="flex items-center justify-center gap-2 font-bold">
                  Publish Dataset
                  <IconSend size={24} strokeWidth={1.5} className="pb-1" />
                </span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-3 pt-1">
              <Button kind="tertiary" onClick={() => router.push(metadataStep)}>
                Previous
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
