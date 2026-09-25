'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getResourceChartDetails } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/charts/queries';
import { IconExternalLink, IconPencil } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Tag, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import {
  isBlockEmpty,
  isLegacyHtmlSummary,
  parseUseCaseContent,
  type ContentBlock,
  type HighlightTone,
  type UseCaseContentDocument,
} from '../content-document';
import styles from '../edit.module.scss';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export function highlightToneClass(tone: HighlightTone) {
  if (tone === 'amber') return styles.highlightTone1;
  if (tone === 'green') return styles.highlightTone2;
  return styles.highlightTone0;
}

export function ContentBlocksRenderer({
  summary,
  className,
}: {
  summary?: string | null;
  className?: string;
}) {
  if (!summary?.trim()) return null;

  if (isLegacyHtmlSummary(summary)) {
    return <RichTextRenderer content={summary} className={className} />;
  }

  const document = parseUseCaseContent(summary);
  return (
    <div className={`flex flex-col gap-6 ${className ?? ''}`}>
      {document.blocks
        .filter((block) => !isBlockEmpty(block))
        .map((block) => (
          <ContentBlockView key={block.id} block={block} />
        ))}
    </div>
  );
}

export function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return <RichTextRenderer content={block.html} />;
    case 'image':
      return (
        <figure className="flex flex-col gap-2">
          <Image
            src={block.src}
            alt={block.caption || 'Use case image'}
            width={1200}
            height={675}
            loading="lazy"
            className="h-auto w-full rounded-3 object-contain"
          />
          {block.caption?.trim() ? (
            <figcaption className="text-xs mt-1.5 text-textSubdued">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case 'chart':
      return (
        <figure className="flex flex-col gap-2 rounded-3 border-1 border-solid border-baseGraySlateSolid6 p-4">
          <Text variant="bodyMd" fontWeight="medium">
            {block.chartName || 'Chart'}
          </Text>
          {block.chartId ? (
            <SelectedChartPreview
              chartId={block.chartId}
              chartKind={block.chartKind}
              chartName={block.chartName}
            />
          ) : null}
          {block.caption?.trim() ? (
            <figcaption className="font-normal leading-snug mt-1.5 text-[0.75rem] text-textSubdued">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case 'highlight':
      return (
        <div
          className={`${styles.highlightCard} ${highlightToneClass(block.tone)}`}
        >
          {block.title ? (
            <Text
              variant="headingMd"
              fontWeight="semibold"
              color="default"
              className="text-primaryBlue"
            >
              {block.title}
            </Text>
          ) : null}
          <br />
          {block.body ? (
            <Text variant="bodyMd" color="subdued" className="mt-1">
              {block.body}
            </Text>
          ) : null}
        </div>
      );
    case 'link': {
      const url = block.url.trim();
      const safe = url.startsWith('http://') || url.startsWith('https://');
      const label = block.label.trim() || 'Untitled link';
      const title = (
        <span className="leading-snug inline-flex items-center gap-2 text-[0.875rem] font-medium text-primaryBlue">
          <IconExternalLink size={14} />
          {label}
        </span>
      );
      return (
        <div className="flex flex-col gap-1 rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-4">
          {safe ? (
            <Link href={url} target="_blank" rel="noreferrer">
              {title}
            </Link>
          ) : (
            title
          )}
          {block.description?.trim() ? (
            <Text variant="bodySm" color="subdued" className="ml-6">
              {block.description}
            </Text>
          ) : null}
        </div>
      );
    }
    default:
      return null;
  }
}

export function SelectedChartPreview({
  chartId,
  chartKind,
  chartName,
}: {
  chartId: string;
  chartKind?: string;
  chartName?: string;
}) {
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const { entityType, entitySlug } = params;
  const canFetch = Boolean(entityType && entitySlug);
  const isImage = chartKind === 'TypeResourceChartImage';

  const chartQuery = useQuery(
    [`usecase_block_chart_${chartId}`],
    () => {
      if (!entityType || !entitySlug) {
        return Promise.resolve(null);
      }
      return GraphQL(
        getResourceChartDetails,
        { [entityType]: entitySlug },
        { chartDetailsId: chartId }
      );
    },
    { enabled: canFetch && !isImage }
  );

  const options = chartQuery.data?.resourceChart?.chart?.options;

  if (!canFetch) return null;

  if (!isImage && options && typeof options === 'object') {
    return (
      <div className="h-[280px]">
        <ReactECharts
          option={options}
          style={{ height: '100%', width: '100%' }}
          notMerge
        />
      </div>
    );
  }

  return (
    <div className="flex h-32 items-center justify-center rounded-2 bg-baseGraySlateSolid2 px-4">
      <Text variant="bodySm" color="subdued">
        {chartQuery.isLoading
          ? 'Loading chart...'
          : chartName || 'Interactive chart'}
      </Text>
    </div>
  );
}

export function ReviewField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="bodySm" color="subdued">
        {label}
      </Text>
      {children}
    </div>
  );
}

export function TagList({
  items,
  empty = 'None connected.',
}: {
  items?: Array<{ id?: string; label: string }>;
  empty?: string;
}) {
  if (!items?.length) {
    return <Text variant="bodyMd">{empty}</Text>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Tag key={item.id || `${item.label}-${index}`}>{item.label}</Tag>
      ))}
    </div>
  );
}

export function editAction(label: string, onAction: () => void) {
  return [
    {
      icon: IconPencil,
      content: label,
      onAction,
    },
  ];
}

export function contentDocumentFromSummary(
  summary?: string | null
): UseCaseContentDocument {
  return parseUseCaseContent(summary);
}
