'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  errorText,
  formatFileSize,
  licenseLabel,
  mutationMessage,
} from '../../model';
import {
  publicationEditorQuery,
  publishPublicationMutation,
  unpublishPublicationMutation,
} from '../../queries';

function downloadUrl(blockId: string) {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/publications/blocks/${blockId}/download/`;
}

export default function PublicationPreviewPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const headers = { [params.entityType]: params.entitySlug };

  const previewQuery = useQuery(
    ['publication_editor', params.id],
    () =>
      GraphQL(publicationEditorQuery, headers, { publicationId: params.id }),
    { refetchOnMount: 'always' }
  );

  const publish = useMutation(
    () =>
      GraphQL(publishPublicationMutation, headers, {
        publicationId: params.id,
      }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.publishPublication,
          'Could not publish this publication.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Publication published');
        void previewQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not publish this publication.'));
      },
    }
  );

  const unpublish = useMutation(
    () =>
      GraphQL(unpublishPublicationMutation, headers, {
        publicationId: params.id,
      }),
    {
      onSuccess: (result) => {
        const message = mutationMessage(
          result.unpublishPublication,
          'Could not unpublish this publication.'
        );
        if (message) {
          toast(message);
          return;
        }
        toast('Publication unpublished');
        void previewQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(errorText(error, 'Could not unpublish this publication.'));
      },
    }
  );

  if (previewQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const publication = previewQuery.data?.getPublication;
  if (!publication) {
    return (
      <div className="p-6">
        <Text>Publication not found.</Text>
      </div>
    );
  }

  const published = publication.status === 'PUBLISHED';
  const blocks = [...(publication.blocks ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3 border-1 border-solid border-borderSubdued p-4">
        <div>
          <Text fontWeight="semibold">
            {published ? 'Published' : 'Preview'}
          </Text>
          <div className="mt-1">
            <Text variant="bodySm" color="subdued">
              {published
                ? 'This publication is public.'
                : 'This is how the publication will look once published.'}
            </Text>
          </div>
        </div>
        {published ? (
          <Button
            kind="tertiary"
            loading={unpublish.isLoading}
            onClick={() => unpublish.mutate()}
          >
            Unpublish
          </Button>
        ) : (
          <Button
            kind="primary"
            loading={publish.isLoading}
            onClick={() => publish.mutate()}
          >
            Publish
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Text variant="heading2xl" fontWeight="semibold">
          {publication.title || 'Untitled Publication'}
        </Text>
        {publication.authors?.length ? (
          <Text color="subdued">{publication.authors.join(', ')}</Text>
        ) : null}
        <Text color="subdued">
          {[
            publication.publicationDate,
            licenseLabel(publication.license),
            publication.resourceType?.name,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        {publication.description ? <Text>{publication.description}</Text> : null}
        {publication.externalSourceLink ? (
          <a
            href={publication.externalSourceLink}
            target="_blank"
            rel="noreferrer"
            className="text-textInteractive"
          >
            {publication.externalSourceLink}
          </a>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        {blocks.map((block) => {
          const isVideo = block.blockType.toUpperCase().includes('YOUTUBE');
          const label =
            block.title?.trim() ||
            (isVideo ? 'YouTube video' : block.fileName || 'File');
          if (isVideo && block.youtubeVideoId) {
            return (
              <div key={block.id} className="flex flex-col gap-2">
                <Text fontWeight="semibold">{label}</Text>
                {block.description ? <Text>{block.description}</Text> : null}
                <iframe
                  title={label}
                  src={`https://www.youtube.com/embed/${block.youtubeVideoId}`}
                  className="aspect-video w-full rounded-3 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          const href = downloadUrl(block.id);
          const format = block.fileFormat?.replace('.', '').toLowerCase();
          return (
            <div key={block.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Text fontWeight="semibold">{label}</Text>
                  {block.description ? (
                    <Text variant="bodySm" color="subdued">
                      {block.description}
                    </Text>
                  ) : null}
                </div>
                <a href={href} className="text-textInteractive" target="_blank" rel="noreferrer">
                  Download
                  {block.fileSize != null ? ` (${formatFileSize(block.fileSize)})` : ''}
                </a>
              </div>
              {format === 'pdf' ? (
                <iframe
                  title={label}
                  src={href}
                  className="h-[640px] w-full rounded-3 border-1 border-solid border-borderSubdued"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
