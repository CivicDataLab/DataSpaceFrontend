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
  Tag,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { useEditStatus } from '../../context';

const FetchAIModelForPublish: any = graphql(`
  query AIModelForPublish($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      name
      displayName
      description
      modelType
      domain
      status
      isPublic
      isActive
      supportedLanguages
      maxTokens
      metadata
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
      versions {
        id
        version
        lifecycleStage
        isLatest
        providers {
          id
          provider
          providerModelId
          isPrimary
        }
      }
    }
  }
`);

const UpdateAIModelStatusMutation: any = graphql(`
  mutation updateAIModelStatus($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        status
        isPublic
        isActive
      }
    }
  }
`);

// Model type display names
const modelTypeLabels: Record<string, string> = {
  LLM: 'Large Language Model',
  VISION: 'Vision Model',
  AUDIO: 'Audio Model',
  MULTIMODAL: 'Multimodal Model',
  EMBEDDING: 'Embedding Model',
  CLASSIFICATION: 'Classification Model',
  GENERATION: 'Generation Model',
  TEXT_GENERATION: 'Text Generation',
  TRANSLATION: 'Translation',
  SUMMARIZATION: 'Summarization',
  QUESTION_ANSWERING: 'Question Answering',
  SENTIMENT_ANALYSIS: 'Sentiment Analysis',
  TEXT_CLASSIFICATION: 'Text Classification',
  NAMED_ENTITY_RECOGNITION: 'Named Entity Recognition',
  TEXT_TO_SPEECH: 'Text to Speech',
  SPEECH_TO_TEXT: 'Speech to Text',
  CUSTOM: 'Custom Model',
  OTHER: 'Other',
};

// Lifecycle stage display names
const lifecycleLabels: Record<string, string> = {
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  BETA: 'Beta Testing',
  STAGING: 'Staging',
  PRODUCTION: 'Production',
  DEPRECATED: 'Deprecated',
  RETIRED: 'Retired',
};

// Domain display names
const domainLabels: Record<string, string> = {
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  LEGAL: 'Legal',
  FINANCE: 'Finance',
  AGRICULTURE: 'Agriculture',
  ENVIRONMENT: 'Environment',
  GOVERNMENT: 'Government',
  TECHNOLOGY: 'Technology',
  SCIENCE: 'Science',
  SOCIAL_SERVICES: 'Social Services',
  TRANSPORTATION: 'Transportation',
  ENERGY: 'Energy',
  GENERAL: 'General',
  OTHER: 'Other',
};

// Provider display names
const providerLabels: Record<string, string> = {
  OPENAI: 'OpenAI',
  LLAMA_TOGETHER: 'Together AI (Llama)',
  LLAMA_REPLICATE: 'Replicate (Llama)',
  LLAMA_OLLAMA: 'Ollama (Llama)',
  LLAMA_CUSTOM: 'Custom API (Llama)',
  HUGGINGFACE: 'HuggingFace',
  CUSTOM: 'Custom API',
};

export default function PublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();
  const { setStatus } = useEditStatus();

  const { data, isLoading, refetch } = useQuery(
    [`fetch_AIModelForPublish_${params.id}`],
    () =>
      GraphQL(
        FetchAIModelForPublish,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: parseInt(params.id),
          },
        }
      ),
    {
      refetchOnMount: true,
    }
  );

  const model = (data as any)?.aiModels?.[0];
  const versions = model?.versions || [];
  const primaryVersion = versions.find((v: any) => v.isLatest) || versions[0];
  const hasProviders = versions.some((v: any) => v.providers?.length > 0);
  const PUBLISH_SUCCESS_TOAST_ID = 'publish-ai-model-success';
  const PUBLISH_ERROR_TOAST_ID = 'publish-ai-model-error';

  const { mutate, isLoading: updateLoading } = useMutation(
    (mutationData: any) =>
      GraphQL(
        UpdateAIModelStatusMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            id: parseInt(params.id),
            ...mutationData,
          },
        }
      ),
    {}
  );

  const handlePublish = () => {
    setStatus('saving');
    mutate(
      {
        status: 'ACTIVE',
        isPublic: true,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast('Model published successfully', {
            id: PUBLISH_SUCCESS_TOAST_ID,
          });
          setStatus('saved');
          refetch();
          router.push(
            `/dashboard/${params.entityType}/${params.entitySlug}/aimodels`
          );
        },
        onError: (error: any) => {
          const errorMessage =
            typeof error?.message === 'string' && error.message.trim()
              ? error.message.trim()
              : 'Unable to publish model right now. Please try again.';
          toast(`Error: ${errorMessage}`, { id: PUBLISH_ERROR_TOAST_ID });
          setStatus('unsaved');
        },
      }
    );
  };

  // Validation checks for each section
  const metadataErrors = [];
  if (!model?.description) metadataErrors.push('Description');
  if (!model?.tags?.length) metadataErrors.push('Tags');
  if (!model?.sectors?.length) metadataErrors.push('Sectors');
  if (!model?.geographies?.length) metadataErrors.push('Geographies');

  // Check required fields from metadata
  const metadata = model?.metadata || {};
  if (!metadata.targetUsers) metadataErrors.push('Target Users');
  if (!metadata.intendedUse) metadataErrors.push('Intended Use');
  if (!metadata.modelWebsite) metadataErrors.push('Model Website');
  if (!model?.maxTokens) metadataErrors.push('Maximum Tokens');
  if (!model?.supportedLanguages?.length)
    metadataErrors.push('Supported Languages');
  if (!model?.modelType) metadataErrors.push('Model Type');

  const versionErrors = [];
  if (versions.length === 0) versionErrors.push('No versions created');
  if (!primaryVersion) versionErrors.push('No primary version selected');
  if (!hasProviders) versionErrors.push('No access methods configured');

  const Summary = [
    {
      name: 'Metadata',
      error:
        metadataErrors.length > 0
          ? `${metadataErrors.join(', ')} missing. Please add to continue.`
          : '',
    },
    {
      name: 'Versions & Access Methods',
      error:
        versionErrors.length > 0
          ? `${versionErrors.join('. ')}. Please configure to continue.`
          : '',
    },
  ];

  const isPublishDisabled =
    metadataErrors.length > 0 || versionErrors.length > 0;

  // Table data for versions
  const versionColumns = [
    { accessorKey: 'version', header: 'Version' },
    { accessorKey: 'lifecycleStage', header: 'Lifecycle Stage' },
    { accessorKey: 'providers', header: 'Access Methods' },
    { accessorKey: 'primary', header: 'Primary' },
  ];

  const versionRows = versions.map((v: any) => ({
    version: v.version,
    lifecycleStage: lifecycleLabels[v.lifecycleStage] || v.lifecycleStage,
    providers: v.providers?.length
      ? v.providers
          .map((p: any) => providerLabels[p.provider] || p.provider)
          .join(', ')
      : 'None',
    primary: v.isLatest ? 'Yes' : 'No',
  }));

  // Primary metadata details
  const PrimaryMetadata = [
    {
      label: 'Model Name',
      value: model?.displayName || model?.name || '',
    },
    {
      label: 'Model Type',
      value: modelTypeLabels[model?.modelType] || model?.modelType || '',
    },
    {
      label: 'Domain',
      value: model?.domain ? domainLabels[model.domain] || model.domain : '',
    },
    {
      label: 'Target Users',
      value: metadata?.targetUsers || '',
    },
    {
      label: 'Intended Use',
      value: metadata?.intendedUse || '',
    },
    {
      label: 'Model Website',
      value: metadata?.modelWebsite || '',
    },
    {
      label: 'Maximum Tokens',
      value: model?.maxTokens ? model.maxTokens.toString() : '',
    },
    {
      label: 'Supported Languages',
      value: model?.supportedLanguages?.length
        ? model.supportedLanguages.join(', ')
        : '',
    },
  ];

  const isPublished = model?.status === 'ACTIVE' && model?.isPublic;

  return (
    <>
      <div className="w-full py-6">
        <div className="flex items-center justify-center gap-2 p-4">
          <Text variant="bodyMd" className="font-semi-bold">
            REVIEW AI MODEL DETAILS
          </Text>
          :
          <Text>
            Please check all the model details below before publishing
          </Text>
        </div>
        <div className="flex flex-col gap-10 pt-6">
          {isLoading || updateLoading ? (
            <div className="mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              {Summary.map((item, index) => (
                <Accordion type="single" collapsible key={index}>
                  <AccordionItem
                    value={`item-${index}`}
                    className="border-none"
                  >
                    <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-baseBlueSolid3 p-4 hover:no-underline">
                      <div className="flex flex-wrap items-center justify-start gap-2">
                        <Text className="w-48 text-justify font-semi-bold">
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
                      className="flex w-full flex-col"
                      style={{
                        backgroundColor: 'var(--base-pure-white)',
                        outline: '1px solid var(--base-pure-white)',
                      }}
                    >
                      <div className="py-4">
                        {item.name === 'Metadata' ? (
                          <div className="flex flex-col gap-4 px-8 py-4">
                            {PrimaryMetadata.map(
                              (meta, idx) =>
                                meta.value && (
                                  <div
                                    className="flex flex-wrap gap-2"
                                    key={idx}
                                  >
                                    <Text
                                      className="lg:basis-1/6"
                                      variant="bodyMd"
                                    >
                                      {meta.label}:
                                    </Text>
                                    <Text
                                      variant="bodyMd"
                                      className="lg:basis-4/5"
                                    >
                                      {meta.value}
                                    </Text>
                                  </div>
                                )
                            )}

                            {model?.description && (
                              <div className="flex flex-wrap gap-2">
                                <Text className="lg:basis-1/6" variant="bodyMd">
                                  Description:
                                </Text>
                                <div className="lg:basis-4/5">
                                  <RichTextRenderer
                                    content={model.description}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Sectors:
                              </Text>
                              <div className="flex gap-2 lg:basis-4/5">
                                {model?.sectors?.length > 0 ? (
                                  model.sectors.map((s: any, idx: number) => (
                                    <Tag key={idx}>{s.name}</Tag>
                                  ))
                                ) : (
                                  <Text variant="bodyMd" color="subdued">
                                    None
                                  </Text>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Tags:
                              </Text>
                              <div className="flex gap-2 lg:basis-4/5">
                                {model?.tags?.length > 0 ? (
                                  model.tags.map((t: any, idx: number) => (
                                    <Tag key={idx}>{t.value}</Tag>
                                  ))
                                ) : (
                                  <Text variant="bodyMd" color="subdued">
                                    None
                                  </Text>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Text className="lg:basis-1/6" variant="bodyMd">
                                Geographies:
                              </Text>
                              <div className="flex gap-2 lg:basis-4/5">
                                {model?.geographies?.length > 0 ? (
                                  model.geographies.map(
                                    (g: any, idx: number) => (
                                      <Tag key={idx}>{g.name}</Tag>
                                    )
                                  )
                                ) : (
                                  <Text variant="bodyMd" color="subdued">
                                    None
                                  </Text>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Versions & Access Methods
                          <div className="px-4">
                            {versions.length > 0 ? (
                              <Table
                                columns={versionColumns}
                                rows={versionRows}
                                hideFooter
                              />
                            ) : (
                              <Text
                                variant="bodyMd"
                                color="subdued"
                                className="px-4 py-2"
                              >
                                No versions found
                              </Text>
                            )}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}

              {/* Publication Status */}
              {isPublished ? (
                <div className="border bg-tertiaryAccent/10 rounded-1 border-tertiaryAccent p-4">
                  <div className="flex items-center gap-2">
                    <Icon source={Icons.check} color="success" size={24} />
                    <Text variant="headingSm" className="text-primaryText">
                      Model is Published and Active
                    </Text>
                  </div>
                  <Text variant="bodySm" className="text-primaryText/80 mt-2">
                    Your AI model is now publicly accessible and can be
                    discovered by other users.
                  </Text>
                </div>
              ) : (
                <div className="border bg-secondaryOrange/10 rounded-1 border-secondaryOrange p-4">
                  <div className="flex items-center gap-2">
                    <Icon source={Icons.alert} color="warning" size={24} />
                    <Text variant="headingSm" className="text-secondaryText">
                      Model is not published
                    </Text>
                  </div>
                  <Text variant="bodySm" className="text-secondaryText/80 mt-2">
                    {!isPublishDisabled
                      ? 'All checklist items are complete. You can now publish your model.'
                      : 'Complete all required fields before publishing your model.'}
                  </Text>
                </div>
              )}

              <Button
                className="m-auto w-fit"
                onClick={handlePublish}
                disabled={isPublishDisabled}
                loading={updateLoading}
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
