'use client';

import { Button, Text } from 'opub-ui';

import { RESOURCE_LABEL } from '@/lib/constants/resourceLabel';

type Block = {
  id: string;
  position: number;
  blockType: string;
  fileName: string;
  fileFormat: string;
  fileSize?: number | null;
  youtubeUrl?: string | null;
  youtubeVideoId: string;
};

/** The gated download URL for a block's file (draft files are access-checked). */
function blockDownloadUrl(blockId: string): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/publications/blocks/${blockId}/download/`;
}

/** Human-readable file size. */
function formatSize(bytes?: number | null): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function YoutubeBlock({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-md" style={{ paddingTop: '56.25%' }}>
      <iframe
        className="absolute left-0 top-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function PdfBlock({ blockId, fileName }: { blockId: string; fileName: string }) {
  return (
    <div className="flex flex-col gap-2">
      <iframe
        className="h-[600px] w-full rounded-md border border-solid border-greyExtralight"
        src={blockDownloadUrl(blockId)}
        title={fileName}
      />
      <a href={blockDownloadUrl(blockId)} download>
        <Button variant="basic">Download {fileName}</Button>
      </a>
    </div>
  );
}

function FileCard({ block }: { block: Block }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-solid border-greyExtralight p-4">
      <div className="flex flex-col">
        <Text variant="bodyMd" fontWeight="medium">
          {block.fileName}
        </Text>
        <Text variant="bodySm" className="text-textSubdued">
          {block.fileFormat.toUpperCase()} {formatSize(block.fileSize)}
        </Text>
      </div>
      <a href={blockDownloadUrl(block.id)} download>
        <Button variant="basic">Download</Button>
      </a>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.blockType === 'YOUTUBE') {
    return <YoutubeBlock videoId={block.youtubeVideoId} />;
  }
  if (block.fileFormat.toLowerCase() === 'pdf') {
    return <PdfBlock blockId={block.id} fileName={block.fileName} />;
  }
  return <FileCard block={block} />;
}

/**
 * Renders a resource's ordered content blocks. PDFs and YouTube videos play
 * inline; every other file type shows a download card. A resource with no
 * blocks renders an empty section (zero-block publish is allowed).
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const ordered = [...(blocks ?? [])].sort((a, b) => a.position - b.position);

  if (ordered.length === 0) {
    return (
      <div className="mt-8">
        <Text variant="bodyMd" className="text-textSubdued">
          This {RESOURCE_LABEL} has no content yet.
        </Text>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {ordered.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}
