'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFile,
  IconPlayerPlay,
  IconSend,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, SectionCard, Spinner, Tag, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { editAction } from '../../usecases/edit/components/ContentBlocksRenderer';
import { usePublicationDraft } from '../context';
import { errorText, licenseLabel, mutationMessage } from '../model';
import {
  publicationEditorQuery,
  publishPublicationMutation,
  unpublishPublicationMutation,
} from '../queries';

function ReviewRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid items-start gap-2 py-3 md:grid-cols-[200px_1fr] ${
        last ? '' : 'border-b-1 border-solid border-borderSubdued'
      }`}
    >
      <Text variant="bodySm" color="subdued" className="uppercase">
        {label}
      </Text>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ReviewStep({ publicationId }: { publicationId: string }) {
  const router = useRouter();
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const { setStatus } = usePublicationDraft();
  const stepBase = `/dashboard/${params.entityType}/${params.entitySlug}/publications/edit/${publicationId}`;

  const reviewQuery = useQuery(
    ['publication_editor', publicationId],
    () =>
      GraphQL(
        publicationEditorQuery,
        { [params.entityType]: params.entitySlug },
        { publicationId }
      ),
    { refetchOnMount: 'always' }
  );

  const publication = reviewQuery.data?.getPublication;
  const published = publication?.status === 'PUBLISHED';
  const headers = { [params.entityType]: params.entitySlug };
  const listHref = `/dashboard/${params.entityType}/${params.entitySlug}/publications`;

  const publish = useMutation(
    () =>
      GraphQL(publishPublicationMutation, headers, { publicationId }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.publishPublication,
          'Could not publish this publication.'
        );
        if (message) {
          toast(message);
          setStatus('unsaved');
          return;
        }
        toast('Publication published');
        setStatus('success');
        router.push(`${listHref}?tab=published`);
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not publish this publication.'));
        setStatus('unsaved');
      },
    }
  );

  const unpublish = useMutation(
    () =>
      GraphQL(unpublishPublicationMutation, headers, { publicationId }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.unpublishPublication,
          'Could not unpublish this publication.'
        );
        if (message) {
          toast(message);
          setStatus('unsaved');
          return;
        }
        toast('Publication unpublished');
        setStatus('success');
        router.push(`${listHref}?tab=drafts`);
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not unpublish this publication.'));
        setStatus('unsaved');
      },
    }
  );

  const issues: string[] = [];
  if (!publication?.title?.trim()) issues.push('Enter a resource name.');
  if (!publication?.description?.trim()) issues.push('Enter a description.');
  if ((publication?.authors?.length ?? 0) === 0) {
    issues.push('Add at least one contributor.');
  }
  if (!publication?.publicationDate) issues.push('Enter a date.');
  if (!publication?.license) issues.push('Select usage rights.');
  if (!publication?.resourceType?.id) issues.push('Select a resource type.');
  if ((publication?.sectors?.length ?? 0) === 0) {
    issues.push('Select at least one sector.');
  }
  if ((publication?.geographies?.length ?? 0) === 0) {
    issues.push('Select at least one geography.');
  }
  const ready = issues.length === 0;
  const blocks = [...(publication?.blocks ?? [])].sort(
    (a, b) => a.position - b.position
  );

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
        className={`rounded-2 px-4 py-3 ${
          ready ? 'bg-surfaceSuccess' : 'bg-surfaceCritical'
        }`}
      >
        <div className="flex items-center gap-2">
          {ready ? (
            <IconCircleCheck size={18} className="shrink-0 text-textSuccess" />
          ) : (
            <IconAlertTriangle
              size={18}
              className="shrink-0 text-textCritical"
            />
          )}
          <Text
            fontWeight="semibold"
            className={ready ? 'text-textSuccess' : 'text-textCritical'}
          >
            {ready ? 'Ready to publish' : 'Needs attention'}
          </Text>
        </div>
        <div className="mt-1 pl-7">
          <Text
            variant="bodySm"
            className={ready ? 'text-textSuccess' : 'text-textCritical'}
          >
            {ready
              ? 'Everything required to publish is in place.'
              : issues.join(' ')}
          </Text>
        </div>
        {!ready ? (
          <div className="mt-3 pl-7">
            <Button
              kind="tertiary"
              onClick={() => router.push(`${stepBase}/details`)}
            >
              Fix details
            </Button>
          </div>
        ) : null}
      </div>

      <SectionCard
        title="Details"
        expandable
        defaultExpanded
        actions={editAction('Edit details', () =>
          router.push(`${stepBase}/details`)
        )}
      >
        <div className="flex flex-col">
          <ReviewRow label="Resource name">
            <Text fontWeight="medium">{publication?.title || '—'}</Text>
          </ReviewRow>
          <ReviewRow label="Description">
            <Text>{publication?.description || '—'}</Text>
          </ReviewRow>
          <ReviewRow label="Contributors">
            {(publication?.authors?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {publication?.authors?.map((name) => (
                  <Tag
                    key={name}
                    fillColor="#F1F3F5"
                    textColor="#1A1A1A"
                    borderRadius="6px"
                  >
                    {name}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text>—</Text>
            )}
          </ReviewRow>
          <ReviewRow label="Date">
            <Text>{publication?.publicationDate || '—'}</Text>
          </ReviewRow>
          <ReviewRow label="Resource type">
            <Text>{publication?.resourceType?.name || '—'}</Text>
          </ReviewRow>
          <ReviewRow label="Sector / Domain">
            <Text>
              {publication?.sectors?.map((sector) => sector.name).join(', ') ||
                '—'}
            </Text>
          </ReviewRow>
          <ReviewRow label="Geography">
            <Text>
              {publication?.geographies
                ?.map((item) => item.name)
                .join(', ') || '—'}
            </Text>
          </ReviewRow>
          <ReviewRow label="Usage rights">
            <Text>{licenseLabel(publication?.license) || '—'}</Text>
          </ReviewRow>
          <ReviewRow label="External link" last>
            {publication?.externalSourceLink ? (
              <Link
                href={publication.externalSourceLink}
                target="_blank"
                rel="noreferrer"
                className="text-textInteractive underline"
              >
                {publication.externalSourceLink}
              </Link>
            ) : (
              <Text>—</Text>
            )}
          </ReviewRow>
        </div>
      </SectionCard>

      <SectionCard
        title="Files"
        expandable
        defaultExpanded
        actions={editAction('Edit files', () => router.push(`${stepBase}/files`))}
      >
        {blocks.length === 0 ? (
          <Text>No content added yet.</Text>
        ) : (
          <div className="flex flex-col">
            {blocks.map((block) => {
              const isVideo = block.blockType.toUpperCase().includes('YOUTUBE');
              const label =
                block.title?.trim() ||
                (isVideo ? 'YouTube video' : block.fileName || 'Untitled file');
              const format = isVideo
                ? ''
                : block.fileFormat?.replace('.', '').toUpperCase();
              const videoHref =
                block.youtubeUrl ||
                (block.youtubeVideoId
                  ? `https://www.youtube.com/watch?v=${block.youtubeVideoId}`
                  : '');
              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {isVideo ? (
                      <IconPlayerPlay
                        size={18}
                        className="shrink-0 text-iconSubdued"
                      />
                    ) : (
                      <IconFile size={18} className="shrink-0 text-iconSubdued" />
                    )}
                    {isVideo && videoHref ? (
                      <Link
                        href={videoHref}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 truncate text-textInteractive underline"
                      >
                        {label}
                      </Link>
                    ) : (
                      <Text className="truncate">{label}</Text>
                    )}
                  </div>
                  {format ? (
                    <span className="shrink-0 rounded-1 bg-surfaceSubdued px-2 py-0.5">
                      <Text variant="bodySm" color="subdued">
                        {format}
                      </Text>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <div className="flex flex-col items-center gap-3 rounded-3 border-1 border-solid border-borderSubdued px-6 py-8 text-center">
        <Text color="subdued">
          {published
            ? 'This publication is published and available publicly.'
            : 'This publication is not yet published. Publish it to make it available publicly.'}
        </Text>
        <Button
          kind="primary"
          disabled={!published && !ready}
          loading={published ? unpublish.isLoading : publish.isLoading}
          onClick={() => {
            setStatus('loading');
            if (published) unpublish.mutate();
            else publish.mutate();
          }}
        >
          <span className="flex items-center justify-center gap-2 font-semibold">
            {published ? 'Unpublish' : 'Publish Publication'}
            <IconSend size={24} strokeWidth={1.5} className="pb-1" />
          </span>
        </Button>
      </div>

      <div className="flex items-center justify-between border-t-1 border-solid border-borderSubdued pt-4">
        <Button
          kind="tertiary"
          onClick={() => router.push(`${stepBase}/details`)}
        >
          Previous
        </Button>
        <Button
          kind="secondary"
          variant="success"
          onClick={() => {
            setStatus('success');
            toast('All changes saved');
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
