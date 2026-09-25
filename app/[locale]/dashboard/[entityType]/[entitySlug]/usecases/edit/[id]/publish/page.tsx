'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { IconInfoCircle, IconSend } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, SectionCard, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  ContentBlockView,
  editAction,
  ReviewField,
  TagList,
} from '../../components/ContentBlocksRenderer';
import { isBlockEmpty, parseUseCaseContent } from '../../content-document';
import {
  isUseCaseBuilderComplete,
  isUseCaseConnectComplete,
  useCaseHasContent,
} from '../../usecase-summary';

const FetchUseCaseReview = graphql(`
  query UseCaseReviewData($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
      summary
      slug
      status
      logo {
        name
        path
        url
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
      sdgs {
        id
        code
        name
        number
      }
      datasets {
        id
        title
      }
      contributors {
        id
        fullName
      }
      partnerOrganizations {
        id
        name
      }
      supportingOrganizations {
        id
        name
      }
    }
  }
`);

const publishUseCaseMutation = graphql(`
  mutation publishUseCaseWizard($useCaseId: String!) {
    publishUseCase(useCaseId: $useCaseId) {
      ... on TypeUseCase {
        id
        status
      }
    }
  }
`);

function mediaUrl(path?: string | null, url?: string | null) {
  const raw = url || path;
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${raw.replace('/code/files/', '')}`;
}

function sdgLabel(item: {
  number?: number | null;
  code?: string | null;
  name?: string | null;
}) {
  const num = item.number
    ? String(item.number).padStart(2, '0')
    : (item.code ?? '').replace('SDG', '').padStart(2, '0');
  return `${num}. ${item.name ?? ''}`;
}

export default function PublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();
  const ownerArgs = { [params.entityType]: params.entitySlug };
  const stepBase = `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}`;

  const reviewQuery = useQuery(
    [`fetch_UsecaseDetails`, params.id, params.entityType, params.entitySlug],
    () =>
      GraphQL(FetchUseCaseReview, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: 'always' }
  );

  const { mutate, isLoading: publishing } = useMutation(
    () => GraphQL(publishUseCaseMutation, ownerArgs, { useCaseId: params.id }),
    {
      onSuccess: () => {
        toast('Use case published successfully');
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/usecases`
        );
      },
      onError: (error: unknown) => {
        toast(
          typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : 'Unable to publish use case right now.'
        );
      },
    }
  );

  const useCase = reviewQuery.data?.useCases?.[0];
  const document = parseUseCaseContent(useCase?.summary);
  const builderComplete = isUseCaseBuilderComplete(useCase ?? {});
  const connectComplete = isUseCaseConnectComplete(useCase ?? {});
  const hasContent = useCaseHasContent(useCase?.summary);
  const ready = builderComplete && connectComplete && hasContent;
  const previewHref = `/usecases/${useCase?.slug || useCase?.id || params.id}`;

  const missing: string[] = [];
  if (!useCase?.logo) missing.push('Upload a thumbnail image.');
  if (!useCase?.title?.trim()) missing.push('Enter a use case title.');
  if (!hasContent) missing.push('Add at least one content block.');
  if (!useCase?.sdgs?.length) missing.push('Select at least one SDG goal.');
  if (!useCase?.sectors?.length) missing.push('Select at least one sector.');

  if (reviewQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6">
      <div>
        <Text variant="headingLg" fontWeight="semibold">
          Review & Publish
        </Text>
        <div className="mt-1">
          <Text color="subdued">
            Check your information before making this content available
            publicly.
          </Text>
        </div>
      </div>

      <div
        className={`rounded-3 p-4 ${
          ready ? 'bg-surfaceSuccess' : 'bg-baseRedSolid3'
        }`}
      >
        <Text fontWeight="semibold">
          {ready ? 'Ready to publish' : 'Not ready to publish'}
        </Text>
        {missing.length ? (
          <ul className="mt-2 list-disc pl-5">
            {missing.map((item) => (
              <li key={item}>
                <Text variant="bodySm">{item}</Text>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {!builderComplete ? (
            <Button
              kind="tertiary"
              onClick={() => router.push(`${stepBase}/builder`)}
            >
              Return to Builder
            </Button>
          ) : null}
          {!connectComplete ? (
            <Button
              kind="tertiary"
              onClick={() => router.push(`${stepBase}/connect`)}
            >
              Return to Connect
            </Button>
          ) : null}
        </div>
      </div>

      <SectionCard
        title="Use Case Overview"
        expandable
        defaultExpanded
        actions={editAction('Edit Use Case Overview', () =>
          router.push(`${stepBase}/builder#basic-information`)
        )}
      >
        <div className="flex flex-col gap-4">
          {useCase?.logo ? (
            <Image
              src={mediaUrl(useCase.logo.path, useCase.logo.url)}
              alt={useCase.title ?? 'Use case thumbnail'}
              width={720}
              height={180}
              className="h-auto max-h-[180px] w-auto max-w-full rounded-3 object-cover"
              loading="lazy"
            />
          ) : (
            <Text>No thumbnail uploaded</Text>
          )}
          <ReviewField label="Use Case Title">
            <Text fontWeight="medium">{useCase?.title || '—'}</Text>
          </ReviewField>
          <ReviewField label="Subtitle">
            <Text>{document.subtitle || '—'}</Text>
          </ReviewField>
        </div>
      </SectionCard>

      <SectionCard
        title="Content"
        expandable
        defaultExpanded
        actions={editAction('Edit Content', () =>
          router.push(`${stepBase}/builder#content`)
        )}
      >
        {document.blocks.length ? (
          <div className="flex flex-col gap-4">
            {document.blocks.map((block) => (
              <div key={block.id}>
                {isBlockEmpty(block) ? (
                  <Text>Empty {block.type} block</Text>
                ) : (
                  <div className="mt-2">
                    <ContentBlockView block={block} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Text>No content added.</Text>
        )}
      </SectionCard>

      <SectionCard
        title="Classification"
        expandable
        defaultExpanded
        actions={editAction('Edit Classification', () =>
          router.push(`${stepBase}/connect#classification`)
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewField label="Tags">
            <TagList
              items={useCase?.tags?.map((item) => ({
                id: item.id,
                label: item.value ?? '',
              }))}
            />
          </ReviewField>
          <ReviewField label="SDG Goals">
            <TagList
              items={useCase?.sdgs?.map((item) => ({
                id: item.id,
                label: sdgLabel(item),
              }))}
            />
          </ReviewField>
          <ReviewField label="Sectors">
            <TagList
              items={useCase?.sectors?.map((item) => ({
                id: item.id,
                label: item.name ?? '',
              }))}
            />
          </ReviewField>
          <ReviewField label="Geography">
            <TagList
              items={useCase?.geographies?.map((item) => ({
                id: item.id,
                label: item.name ?? '',
              }))}
            />
          </ReviewField>
        </div>
      </SectionCard>

      <SectionCard
        title="Connections"
        expandable
        defaultExpanded
        actions={editAction('Edit Connections', () =>
          router.push(`${stepBase}/connect#datasets`)
        )}
      >
        <div className="flex flex-col gap-4">
          <ReviewField label="Datasets">
            <TagList
              items={useCase?.datasets?.map((item) => ({
                id: item.id,
                label: item.title ?? '',
              }))}
            />
          </ReviewField>
          <ReviewField label="Contributors">
            <TagList
              items={useCase?.contributors?.map((item) => ({
                id: item.id,
                label: item.fullName,
              }))}
            />
          </ReviewField>
          <ReviewField label="Organisations">
            <TagList
              items={[
                ...(useCase?.partnerOrganizations ?? []),
                ...(useCase?.supportingOrganizations ?? []),
              ].map((item) => ({
                id: item.id,
                label: item.name,
              }))}
            />
          </ReviewField>
        </div>
      </SectionCard>

      <div className="flex items-start gap-3 rounded-2 bg-surfaceSubdued p-4">
        <IconInfoCircle size={20} className="mt-0.5 shrink-0" />
        <div>
          <Text>
            Open a full preview of this Use Case in a new tab, exactly as it
            will appear once published.
          </Text>
          <div className="mt-3">
            <Button kind="secondary" url={previewHref} external>
              Preview Use Case
            </Button>
          </div>
          <div className="mt-2">
            <Text variant="bodySm" color="subdued">
              Publishing happens from this review step.
            </Text>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2 border-1 border-solid border-borderSubdued p-4">
        <Button
          className="w-1/3 rounded-2 bg-[var(--primary)] py-2 hover:bg-[#0b2540]"
          disabled={!ready}
          loading={publishing}
          onClick={() => mutate()}
        >
          <span className="flex items-center justify-center gap-2 font-bold">
            Publish Use Case
            <IconSend size={20} strokeWidth={1.5} />
          </span>
        </Button>
      </div>

      <div>
        <Button
          kind="tertiary"
          onClick={() => router.push(`${stepBase}/connect`)}
        >
          Previous
        </Button>
      </div>
    </div>
  );
}
