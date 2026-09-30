'use client';

import { useParams, useRouter } from 'next/navigation';
import { IconAlertTriangle, IconCircleCheck, IconExternalLink } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, SectionCard, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  editAction,
  ReviewField,
  TagList,
} from '../../usecases/edit/components/ContentBlocksRenderer';
import { formatFileSize, licenseLabel } from '../model';
import { publicationEditorQuery } from '../queries';

export function ReviewStep({ publicationId }: { publicationId: string }) {
  const router = useRouter();
  const params = useParams<{ entityType: string; entitySlug: string }>();
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

      <div className="rounded-3 border-1 border-solid border-borderSubdued px-4">
        <div className="flex items-center gap-2 pt-4">
          {ready ? (
            <IconCircleCheck size={20} className="text-textSuccess" />
          ) : (
            <IconAlertTriangle size={20} className="text-textCritical" />
          )}
          <Text fontWeight="semibold">
            {ready ? 'Ready to publish' : 'Needs attention'}
          </Text>
        </div>
        <div className="py-3">
          <Text variant="bodySm" color="subdued">
            {ready
              ? 'Everything required to publish is in place.'
              : issues.join(' ')}
          </Text>
        </div>
        {!ready ? (
          <div className="pb-4">
            <Button kind="tertiary" onClick={() => router.push(`${stepBase}/details`)}>
              Fix details
            </Button>
          </div>
        ) : null}
      </div>

      <SectionCard
        title="Details"
        expandable
        defaultExpanded
        actions={editAction('Edit details', () => router.push(`${stepBase}/details`))}
      >
        <div className="flex flex-col gap-4">
          <ReviewField label="Resource name">
            <Text fontWeight="medium">{publication?.title || '—'}</Text>
          </ReviewField>
          <ReviewField label="Description">
            <Text>{publication?.description || '—'}</Text>
          </ReviewField>
          <ReviewField label="Contributors">
            <TagList
              items={publication?.authors?.map((name) => ({ label: name }))}
              empty="—"
            />
          </ReviewField>
          <ReviewField label="Date">
            <Text>{publication?.publicationDate || '—'}</Text>
          </ReviewField>
          <ReviewField label="Resource type">
            <Text>{publication?.resourceType?.name || '—'}</Text>
          </ReviewField>
          <ReviewField label="Sector / Domain">
            <Text>
              {publication?.sectors?.map((sector) => sector.name).join(', ') || '—'}
            </Text>
          </ReviewField>
          <ReviewField label="Geography">
            <Text>
              {publication?.geographies?.map((item) => item.name).join(', ') || '—'}
            </Text>
          </ReviewField>
          <ReviewField label="Usage rights">
            <Text>{licenseLabel(publication?.license) || '—'}</Text>
          </ReviewField>
          <ReviewField label="External link">
            {publication?.externalSourceLink ? (
              <a
                href={publication.externalSourceLink}
                target="_blank"
                rel="noreferrer"
                className="text-textInteractive"
              >
                {publication.externalSourceLink}
              </a>
            ) : (
              <Text>—</Text>
            )}
          </ReviewField>
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
          <div className="flex flex-col gap-2">
            {blocks.map((block) => {
              const isVideo = block.blockType.toUpperCase().includes('YOUTUBE');
              const label =
                block.title?.trim() ||
                (isVideo ? 'YouTube video' : block.fileName || 'Untitled file');
              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Text>{label}</Text>
                    {block.description ? (
                      <Text variant="bodySm" color="subdued">
                        {block.description}
                      </Text>
                    ) : null}
                  </div>
                  <Text variant="bodySm" color="subdued">
                    {isVideo
                      ? 'VIDEO'
                      : [
                          block.fileFormat?.replace('.', '').toUpperCase(),
                          formatFileSize(block.fileSize),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                  </Text>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <div className="flex flex-col items-center gap-3 rounded-3 border-1 border-dashed border-borderSubdued px-6 py-8 text-center">
        <Text color="subdued">
          Open a full preview of this Publication in a new tab, exactly as it
          will appear once published.
        </Text>
        <Button
          kind="primary"
          icon={<IconExternalLink size={16} />}
          onClick={() =>
            window.open(
              `/dashboard/${params.entityType}/${params.entitySlug}/publications/preview/${publicationId}`,
              '_blank',
              'noopener'
            )
          }
        >
          Preview Publication
        </Button>
        <Text variant="bodySm" color="subdued">
          Publishing happens from inside the preview.
        </Text>
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
