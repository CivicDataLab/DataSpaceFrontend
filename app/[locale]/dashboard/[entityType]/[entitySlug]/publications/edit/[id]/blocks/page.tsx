'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Button, DropZone, Spinner, Text, TextField, toast } from 'opub-ui';
import React from 'react';

import { GraphQL } from '@/lib/api';

const blocksQuery = graphql(`
  query publicationBlocks($publicationId: UUID!) {
    getPublication(publicationId: $publicationId) {
      id
      blocks {
        id
        position
        blockType
        fileName
        youtubeUrl
      }
    }
  }
`);

const addYoutube = graphql(`
  mutation addPublicationYoutubeBlock($publicationId: UUID!, $youtubeUrl: String!) {
    addPublicationYoutubeBlock(publicationId: $publicationId, youtubeUrl: $youtubeUrl) {
      success
      errors {
        nonFieldErrors
      }
    }
  }
`);

const addFile = graphql(`
  mutation addPublicationFileBlock($publicationId: UUID!, $file: Upload!) {
    addPublicationFileBlock(publicationId: $publicationId, file: $file) {
      success
      errors {
        nonFieldErrors
      }
    }
  }
`);

const removeBlockMutation = graphql(`
  mutation removePublicationBlock($blockId: UUID!) {
    removePublicationBlock(blockId: $blockId) {
      success
    }
  }
`);

const reorderMutation = graphql(`
  mutation reorderPublicationBlocks($publicationId: UUID!, $blockIds: [UUID!]!) {
    reorderPublicationBlocks(publicationId: $publicationId, blockIds: $blockIds) {
      success
    }
  }
`);

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.odp,.odt,.key';

type Block = {
  id: string;
  position: number;
  blockType: string;
  fileName: string;
  youtubeUrl?: string | null;
};

export default function BlocksPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const headers = { [params.entityType]: params.entitySlug };
  const [youtubeUrl, setYoutubeUrl] = React.useState('');

  const { data, isLoading, refetch } = useQuery(
    ['publication_blocks', params.id],
    () => GraphQL(blocksQuery, headers, { publicationId: params.id })
  );

  const onError = (e: unknown) =>
    toast(e instanceof Error ? e.message : 'Something went wrong');

  const youtubeMutation = useMutation(
    () => GraphQL(addYoutube, headers, { publicationId: params.id, youtubeUrl }),
    {
      onSuccess: (res) => {
        if (!res?.addPublicationYoutubeBlock?.success) {
          toast(
            res?.addPublicationYoutubeBlock?.errors?.nonFieldErrors?.[0] ||
              'Enter a valid YouTube URL'
          );
          return;
        }
        setYoutubeUrl('');
        refetch();
      },
      onError,
    }
  );

  const fileMutation = useMutation(
    (file: File) =>
      GraphQL(addFile, headers, { publicationId: params.id, file }),
    {
      onSuccess: (res) => {
        if (!res?.addPublicationFileBlock?.success) {
          toast(
            res?.addPublicationFileBlock?.errors?.nonFieldErrors?.[0] ||
              'File could not be uploaded'
          );
          return;
        }
        refetch();
      },
      onError,
    }
  );

  const removeMutation = useMutation(
    (blockId: string) => GraphQL(removeBlockMutation, headers, { blockId }),
    { onSuccess: () => refetch(), onError }
  );

  const reorder = useMutation(
    (blockIds: string[]) =>
      GraphQL(reorderMutation, headers, {
        publicationId: params.id,
        blockIds,
      }),
    { onSuccess: () => refetch(), onError }
  );

  const blocks: Block[] = [...(data?.getPublication?.blocks ?? [])].sort(
    (a, b) => a.position - b.position
  );

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= blocks.length) return;
    const ids = blocks.map((b) => b.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    reorder.mutate(ids);
  };

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            name="youtubeUrl"
            label="Add a YouTube video"
            value={youtubeUrl}
            onChange={setYoutubeUrl}
            placeholder="https://youtu.be/..."
          />
        </div>
        <Button
          variant="interactive"
          loading={youtubeMutation.isLoading}
          onClick={() => youtubeUrl && youtubeMutation.mutate()}
        >
          Add video
        </Button>
      </div>

      <DropZone
        accept={ACCEPT}
        name="publication_block_file"
        label="Upload a file (PDF, Word, slides — max 50 MB)"
        allowMultiple={false}
        onDrop={(_all: File[], accepted: File[]) => {
          if (accepted[0]) fileMutation.mutate(accepted[0]);
        }}
      >
        <DropZone.FileUpload
          actionHint={
            <Button kind="secondary" variant="interactive">
              Choose a file to upload
            </Button>
          }
        />
      </DropZone>

      <div className="flex flex-col gap-2">
        <Text variant="headingSm">Content ({blocks.length})</Text>
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="flex items-center justify-between rounded-md border border-solid border-greyExtralight p-3"
          >
            <Text variant="bodyMd">
              {block.blockType === 'YOUTUBE'
                ? block.youtubeUrl
                : block.fileName}
            </Text>
            <div className="flex gap-2">
              <Button variant="basic" onClick={() => move(index, -1)}>
                ↑
              </Button>
              <Button variant="basic" onClick={() => move(index, 1)}>
                ↓
              </Button>
              <Button
                variant="critical"
                onClick={() => removeMutation.mutate(block.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
