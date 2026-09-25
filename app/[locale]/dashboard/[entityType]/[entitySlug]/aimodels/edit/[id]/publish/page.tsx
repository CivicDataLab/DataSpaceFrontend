'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { AiModelStatus, UpdateAiModelInput } from '@/gql/generated/graphql';
import {
  IconArrowRight,
  IconCheck,
  IconCircleCheckFilled,
  IconPencil,
  IconSquareRoundedCheckFilled,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TriangleAlert } from 'lucide-react';
import { Button, SectionCard, Spinner, Tag, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  languageList,
  metadataString,
  modelInfoIssues,
  plainText,
} from '../../aimodel-summary';
import { useEditStatus } from '../../context';

export const FetchAIModelForPublish = graphql(`
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

const UpdateAIModelStatusMutation = graphql(`
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
  const stepBase = `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}`;

  const { data, isLoading, refetch } = useQuery(
    [
      `fetch_AIModelForPublish`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
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
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
    }
  );

  const model = data?.aiModels?.[0];
  const versions = model?.versions || [];
  const primaryVersion =
    versions.find((version) => version.isLatest) || versions[0];
  const accessReady = (primaryVersion?.providers?.length ?? 0) > 0;
  const isPublished = model?.status === 'ACTIVE' && model?.isPublic;

  const { mutate, isLoading: updateLoading } = useMutation(
    (
      mutationData: Pick<UpdateAiModelInput, 'status' | 'isPublic' | 'isActive'>
    ) =>
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
        status: isPublished ? AiModelStatus.Registered : AiModelStatus.Active,
        isPublic: isPublished ? false : true,
        isActive: isPublished ? false : true,
      },
      {
        onSuccess: () => {
          toast(
            isPublished
              ? 'Model unpublished successfully'
              : 'Model published successfully',
            { id: 'publish-ai-model-success' }
          );
          setStatus('saved');
          refetch();
          router.push(
            `/dashboard/${params.entityType}/${params.entitySlug}/aimodels?tab=${isPublished ? 'draft' : 'published'}`
          );
        },
        onError: (error: unknown) => {
          const errorMessage =
            typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string' &&
            error.message.trim()
              ? error.message.trim()
              : isPublished
                ? 'Unable to unpublish model right now. Please try again.'
                : 'Unable to publish model right now. Please try again.';
          toast(`Error: ${errorMessage}`, { id: 'publish-ai-model-error' });
          setStatus('unsaved');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const infoIssues = model
    ? modelInfoIssues(model).map((issue) => ({
        ...issue,
        group: 'MODEL INFORMATION',
        href: `${stepBase}/${issue.href}`,
      }))
    : [];
  const issues = [...infoIssues];
  if (versions.length === 0) {
    issues.push({
      id: 'versions',
      group: 'VERSIONS',
      message: 'Add a version.',
      href: `${stepBase}/versions`,
    });
  } else if (!accessReady) {
    issues.push({
      id: 'access-methods',
      group: 'ACCESS METHODS',
      message: 'Add at least one access method to the Primary version.',
      href: `${stepBase}/versions#access-methods`,
    });
  }

  const ready = issues.length === 0;
  const metadata = model?.metadata;
  const previewHref = `/aimodels/${params.id}`;
  const languageLabels = languageList(model?.supportedLanguages).join(', ');
  const sectorLabels = model?.sectors?.map((sector) => sector.name).join(', ');
  const tagLabels = model?.tags?.map((tag) => tag.value).join(', ');

  const summaryRows = [
    ['MODEL NAME', model?.displayName || model?.name || ''],
    [
      'MODEL TYPE',
      (model?.modelType && modelTypeLabels[model.modelType]) ||
        model?.modelType ||
        '',
    ],
    ['DESCRIPTION', plainText(model?.description)],
    ['TARGET USERS', metadataString(metadata, 'targetUsers')],
    ['INTENDED USE', metadataString(metadata, 'intendedUse')],
    ['DOMAIN', model?.domain ? domainLabels[model.domain] || model.domain : ''],
    ['SECTORS', sectorLabels || ''],
    ['TAGS', tagLabels || ''],
    ['LANGUAGE SUPPORT', languageLabels],
    ['MODEL WEBSITE', metadataString(metadata, 'modelWebsite')],
    ['USAGE LICENSE', metadataString(metadata, 'usageLicense')],
  ];

  return (
    <div className="flex flex-col gap-6 px-1">
      <div>
        <Text variant="headingLg" fontWeight="semibold" color="highlight">
          Review & Publish
        </Text>
        <div className="mt-1">
          <Text color="subdued">
            Check your information before making this content available
            publicly.
          </Text>
        </div>
      </div>

      <div className="rounded-3 border-1 border-solid border-borderSubdued px-4 py-4">
        <Text
          fontWeight="semibold"
          {...(ready ? { color: 'metadata' } : { color: 'subdued' })}
        >
          {ready ? 'Ready to publish' : 'Needs attention'}
        </Text>
        <div className="mt-1 flex flex-col">
          {issues.length === 0 ? (
            <Text variant="bodySm" color="subdued">
              Required model information and a primary access method are in
              place.
            </Text>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className="last:border-b-0 flex items-center justify-between gap-3 border-b-1 border-solid border-borderSubdued py-3"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <TriangleAlert size={16} className="mt-[6px]" />
                  <div>
                    <Text variant="bodySm" color="subdued">
                      {issue.group}
                    </Text>
                    <br />
                    <Text>{issue.message}</Text>
                  </div>
                </div>

                <Button
                  kind="neutral"
                  size="slim"
                  onClick={() => router.push(issue.href)}
                  icon={<IconArrowRight size={16} />}
                >
                  Fix
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <SectionCard
        title="Model Information"
        expandable
        defaultExpanded
        actions={[
          {
            icon: IconPencil,
            content: 'Edit Model Information',
            onAction: () =>
              router.push(
                infoIssues[0]?.href || `${stepBase}/details#model-name`
              ),
          },
        ]}
      >
        <div className="flex flex-col">
          {summaryRows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-2 border-b-1 border-solid border-borderSubdued py-3 md:grid-cols-[220px_1fr]"
            >
              <Text variant="bodySm" color="subdued">
                {label}
              </Text>
              <Text>{value || '—'}</Text>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Versions"
        expandable
        defaultExpanded
        actions={[
          {
            icon: IconPencil,
            content: 'Edit Versions',
            onAction: () => router.push(`${stepBase}/versions`),
          },
        ]}
      >
        <div className="flex flex-col">
          <div className="grid gap-2 border-b-1 border-solid border-borderSubdued py-3 md:grid-cols-[220px_1fr]">
            <Text variant="bodySm" color="subdued">
              VERSIONS CONFIGURED
            </Text>
            <Text>
              {versions.length} version{versions.length === 1 ? '' : 's'}
            </Text>
          </div>
          <div className="grid gap-2 border-b-1 border-solid border-borderSubdued py-3 md:grid-cols-[220px_1fr]">
            <Text variant="bodySm" color="subdued">
              PRIMARY VERSION
            </Text>
            <div className="flex items-center gap-2">
              <Text>
                {primaryVersion ? `Version ${primaryVersion.version}` : '—'}
              </Text>
              {primaryVersion ? <Tag>Primary</Tag> : null}
            </div>
          </div>
          <div className="grid gap-2 py-3 md:grid-cols-[220px_1fr]">
            <Text variant="bodySm" color="subdued">
              LIFECYCLE STAGE
            </Text>
            <Text>
              {primaryVersion
                ? lifecycleLabels[primaryVersion.lifecycleStage] ||
                  primaryVersion.lifecycleStage
                : '—'}
            </Text>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Access"
        expandable
        defaultExpanded
        actions={[
          {
            icon: IconPencil,
            content: 'Edit Access Methods',
            onAction: () => router.push(`${stepBase}/versions#access-methods`),
          },
        ]}
      >
        {accessReady && primaryVersion ? (
          <div className="flex flex-col gap-2">
            {primaryVersion.providers?.map((provider) => (
              <Text key={provider.id}>
                {providerLabels[provider.provider] || provider.provider}
              </Text>
            ))}
          </div>
        ) : (
          <Text color="subdued">
            No access methods configured on the Primary version yet.
          </Text>
        )}
      </SectionCard>

      <div className="flex flex-col items-center gap-3 rounded-2 border-1 border-solid border-borderSubdued p-6 text-center">
        <Text>
          Open a full preview of this AI Model in a new tab, exactly as it will
          appear once published.
        </Text>
        <Button kind="primary" url={previewHref} external>
          Preview AI Model
        </Button>
        <Text variant="bodySm" color="subdued">
          Publishing happens from inside the preview.
        </Text>
        <Button
          kind="primary"
          disabled={!isPublished && !ready}
          loading={updateLoading}
          onClick={handlePublish}
        >
          {isPublished ? 'Unpublish' : 'Publish AI Model'}
        </Button>
      </div>

      <div>
        <Button
          kind="tertiary"
          onClick={() => router.push(`${stepBase}/details`)}
        >
          Previous
        </Button>
      </div>
    </div>
  );
}
