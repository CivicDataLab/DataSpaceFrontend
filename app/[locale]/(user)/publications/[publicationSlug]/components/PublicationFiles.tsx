'use client';

import { useState, type ReactNode } from 'react';
import {
  IconCirclePlay,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconFileX,
  IconPresentation,
  IconVideoOff,
} from '@tabler/icons-react';

import { PdfPreview } from '@/components/file-preview';
import { mediaCaption, type PublicationMediaItem } from '../publication-detail';

const PREVIEW_HEIGHT = '70vh';

/** Small outlined action button, the design's `outline` + `sm` button. */
const OUTLINE_BUTTON =
  'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] border-1 border-solid border-[#8c8c8c] bg-white px-3 text-100 font-medium leading-[20px] text-[#0a0a0a] transition-colors hover:bg-[#e4e4e6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue';

export function PublicationFiles({ items }: { items: PublicationMediaItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const fileCount = items.filter((item) => item.kind === 'file').length;
  const videoCount = items.length - fileCount;
  const summary = [
    fileCount ? `${fileCount} file${fileCount === 1 ? '' : 's'}` : null,
    videoCount ? `${videoCount} video${videoCount === 1 ? '' : 's'}` : null,
  ]
    .filter(Boolean)
    .join(' and ');

  return (
    <section
      id="files-and-media"
      aria-labelledby="files-and-media-heading"
      className="flex scroll-mt-[160px] flex-col gap-4"
    >
      <div>
        <h2
          id="files-and-media-heading"
          className="font-primary text-300 font-semi-bold leading-[26px] text-primaryBlue"
        >
          Files and media
        </h2>
        {selected ? (
          <p className="mt-1 text-100 font-regular leading-[20px] text-[#6b6b6b]">
            {items.length > 1
              ? `${summary}. Choose one to view it here.`
              : `${summary}.`}
          </p>
        ) : null}
      </div>
      {!selected ? (
        <EmptyState
          icon={IconFileText}
          title="No files yet"
          body="Files and videos added to this publication appear here."
        />
      ) : (
        <div className="box-border overflow-hidden rounded-[18px] border-1 border-solid border-[#e5e5e5] bg-white text-[#0a0a0a] lg:grid lg:grid-cols-[minmax(220px,28%)_minmax(0,1fr)]">
          <nav
            aria-label="Files and media"
            className="max-h-[640px] min-w-0 overflow-auto border-b-1 border-solid border-[#e5e5e5] p-3 lg:border-b-[0px] lg:border-r-1"
          >
            <ul className="m-0 flex list-none flex-col gap-[2px] p-0">
              {items.map((item) => (
                <li key={item.id}>
                  <MediaButton
                    item={item}
                    selected={item.id === selected.id}
                    onSelect={() => setSelectedId(item.id)}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex min-w-0 flex-col gap-4 p-4">
            <MediaHeader item={selected} />
            <MediaViewer key={selected.id} item={selected} />
          </div>
        </div>
      )}
    </section>
  );
}

function MediaIcon({ item }: { item: PublicationMediaItem }) {
  const Icon =
    item.kind === 'video'
      ? IconCirclePlay
      : item.extension === 'PPT' || item.extension === 'PPTX'
        ? IconPresentation
        : IconFileText;
  return (
    <Icon size={16} className="mt-[2px] shrink-0 text-[#6b6b6b]" aria-hidden />
  );
}

function MediaButton({
  item,
  selected,
  onSelect,
}: {
  item: PublicationMediaItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`flex w-full min-w-0 cursor-pointer appearance-none items-start gap-2 rounded-[10px] border-[0px] px-3 py-2 text-left font-primary text-100 leading-[20px] text-[#0a0a0a] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue ${
        selected
          ? 'bg-[#f5f5f5] font-medium'
          : 'bg-transparent font-regular hover:bg-[#f5f5f5]/60'
      }`}
    >
      <MediaIcon item={item} />
      <span className="min-w-0">
        <span className="block truncate">{item.title}</span>
        <span className="block text-75 font-regular leading-1 text-[#6b6b6b]">
          {mediaCaption(item)}
        </span>
      </span>
    </button>
  );
}

function MediaHeader({ item }: { item: PublicationMediaItem }) {
  const opensInBrowser =
    item.kind === 'file' && item.extension === 'PDF' && item.downloadHref;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-1 border-solid border-[#e5e5e5] pb-4">
      <div className="min-w-0">
        <h3 className="break-words font-primary text-100 font-medium leading-[17.5px] text-[#0a0a0a]">
          {item.title}
        </h3>
        <p className="break-words text-75 leading-1 text-[#6b6b6b]">
          {item.kind === 'file'
            ? [item.fileName, mediaCaption(item)].filter(Boolean).join(' · ')
            : mediaCaption(item)}
        </p>
        {item.kind === 'file' && item.description ? (
          <p className="mt-1 whitespace-pre-line text-100 leading-[21px] text-[#18181b]">
            {item.description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {opensInBrowser ? (
          <a
            href={item.downloadHref ?? undefined}
            target="_blank"
            rel="noreferrer"
            className={OUTLINE_BUTTON}
          >
            <IconExternalLink size={16} aria-hidden />
            Open in new tab
          </a>
        ) : null}
        {item.kind === 'file' && item.downloadHref ? (
          <a
            href={item.downloadHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-primaryBlue px-3 text-100 font-medium leading-[20px] text-white transition-colors hover:bg-[#234c74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
          >
            <IconDownload size={16} aria-hidden />
            Download
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
        {item.kind === 'video' && item.youtubeId ? (
          <a
            href={`https://www.youtube.com/watch?v=${encodeURIComponent(item.youtubeId)}`}
            target="_blank"
            rel="noreferrer"
            className={OUTLINE_BUTTON}
          >
            <IconExternalLink size={16} aria-hidden />
            Watch on YouTube
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

function MediaViewer({ item }: { item: PublicationMediaItem }) {
  const [pdfFailed, setPdfFailed] = useState(false);

  if (item.kind === 'video') {
    if (item.youtubeId) {
      return <YouTubePlayer id={item.youtubeId} title={item.title} />;
    }
    return (
      <EmptyState
        icon={IconVideoOff}
        title="This video can’t be played here"
        body="The link isn’t a YouTube video, so it opens on the site it came from."
        action={
          item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className={OUTLINE_BUTTON}
            >
              Open link
              <IconExternalLink size={16} aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null
        }
        className="min-h-[24rem]"
      />
    );
  }

  if (item.extension === 'PDF' && item.downloadHref && !pdfFailed) {
    return (
      <PdfPreview
        url={item.downloadHref}
        height={PREVIEW_HEIGHT}
        onError={() => setPdfFailed(true)}
      />
    );
  }

  return (
    <EmptyState
      icon={IconFileX}
      title={
        item.extension === 'PDF' || !item.extension
          ? 'This file can’t be previewed here'
          : `${item.extension} files can’t be previewed in the browser`
      }
      body="Download it to read it on your device."
      className="min-h-[24rem]"
    />
  );
}

/** Shows the thumbnail first; nothing loads from YouTube until play is pressed. */
function YouTubePlayer({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const videoId = encodeURIComponent(id);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-[#0b2540]">
        {playing ? (
          <iframe
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            className="absolute inset-0 size-full border-[0px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 cursor-pointer border-[0px] bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primaryBlue"
          >
            {/* YouTube thumbnails are not in next/image's allowed hosts. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className="size-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.25)] transition-colors group-hover:bg-[rgba(0,0,0,0.35)]">
              <IconCirclePlay
                size={64}
                stroke={1.25}
                className="text-white drop-shadow"
                aria-hidden
              />
            </span>
          </button>
        )}
      </div>
      <p className="text-75 leading-1 text-[#6b6b6b]">
        Plays from YouTube. Nothing loads from YouTube until you press play.
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className = '',
}: {
  icon: typeof IconFileX;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[14px] border-1 border-dashed border-[#e5e5e5] bg-[#f5f5f5]/30 px-6 py-10 text-center ${className}`}
    >
      <Icon size={20} className="text-[#6b6b6b]" aria-hidden />
      <p className="text-100 font-medium leading-[20px] text-[#0a0a0a]">
        {title}
      </p>
      <p className="max-w-sm text-75 leading-1 text-[#6b6b6b]">{body}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
