export type ContentBlockType =
  | 'text'
  | 'image'
  | 'chart'
  | 'highlight'
  | 'link';

export type TextBlock = { id: string; type: 'text'; html: string };
export type ImageBlock = {
  id: string;
  type: 'image';
  src: string;
  caption?: string;
};
export type ChartBlock = {
  id: string;
  type: 'chart';
  chartId: string;
  chartName?: string;
  chartKind?: string;
  caption?: string;
};
export const HIGHLIGHT_TONES = ['blue', 'amber', 'green'] as const;
export type HighlightTone = (typeof HIGHLIGHT_TONES)[number];

export type HighlightBlock = {
  id: string;
  type: 'highlight';
  title: string;
  body: string;
  tone: HighlightTone;
};
export type LinkBlock = {
  id: string;
  type: 'link';
  label: string;
  url: string;
  description?: string;
};

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | ChartBlock
  | HighlightBlock
  | LinkBlock;

export type UseCaseContentDocument = {
  version: 1;
  subtitle: string;
  blocks: ContentBlock[];
};

const EMPTY_DOCUMENT: UseCaseContentDocument = {
  version: 1,
  subtitle: '',
  blocks: [],
};

export function createBlockId() {
  return `block_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isLegacyHtmlSummary(summary?: string | null): boolean {
  if (!summary?.trim()) return false;
  try {
    const parsed = JSON.parse(summary) as { version?: number };
    return parsed?.version !== 1;
  } catch {
    return true;
  }
}

export function parseUseCaseContent(
  summary?: string | null
): UseCaseContentDocument {
  if (!summary?.trim()) return { ...EMPTY_DOCUMENT, blocks: [] };

  try {
    const parsed = JSON.parse(summary) as Partial<UseCaseContentDocument>;
    if (parsed?.version === 1 && Array.isArray(parsed.blocks)) {
      return {
        version: 1,
        subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : '',
        blocks: parsed.blocks
          .map(normalizeBlock)
          .filter((block): block is ContentBlock => block !== null),
      };
    }
  } catch {
    // Legacy HTML summary — keep it as a text block so existing drafts are not lost.
  }

  return {
    version: 1,
    subtitle: '',
    blocks: [
      {
        id: createBlockId(),
        type: 'text',
        html: summary,
      },
    ],
  };
}

export function serializeUseCaseContent(doc: UseCaseContentDocument): string {
  return JSON.stringify({
    version: 1,
    subtitle: doc.subtitle ?? '',
    blocks: doc.blocks,
  });
}

export function isRichTextEmpty(html?: string | null): boolean {
  if (!html) return true;
  return html.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
}

export function isBlockEmpty(block: ContentBlock): boolean {
  switch (block.type) {
    case 'text':
      return isRichTextEmpty(block.html);
    case 'image':
      return !block.src?.trim() || block.src.startsWith('blob:');
    case 'chart':
      return !block.chartId?.trim();
    case 'highlight':
      return !block.title.trim() && !block.body.trim();
    case 'link':
      return !block.url.trim();
    default:
      return true;
  }
}

export function hasContentBlocks(doc: UseCaseContentDocument): boolean {
  return doc.blocks.some((block) => !isBlockEmpty(block));
}

export function extractEmbedUrl(value: string): string {
  const trimmed = value.trim();
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch?.[1]) return srcMatch[1];
  return trimmed;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isHighlightTone(value: unknown): value is HighlightTone {
  return (
    value === 'blue' || value === 'amber' || value === 'green'
  );
}

function normalizeBlock(value: unknown): ContentBlock | null {
  if (!value || typeof value !== 'object') return null;
  const block = value as Record<string, unknown>;
  if (typeof block.id !== 'string' || typeof block.type !== 'string') {
    return null;
  }

  switch (block.type) {
    case 'text':
      return { id: block.id, type: 'text', html: readString(block.html) };
    case 'image':
      return {
        id: block.id,
        type: 'image',
        src: readString(block.src),
        caption: readString(block.caption),
      };
    case 'chart':
      return {
        id: block.id,
        type: 'chart',
        chartId: readString(block.chartId),
        chartName: readString(block.chartName),
        chartKind: readString(block.chartKind) || undefined,
        caption: readString(block.caption),
      };
    case 'highlight':
      return {
        id: block.id,
        type: 'highlight',
        title: readString(block.title),
        body: readString(block.body),
        tone: isHighlightTone(block.tone) ? block.tone : 'blue',
      };
    case 'link':
      return {
        id: block.id,
        type: 'link',
        label: readString(block.label),
        url: readString(block.url),
        description: readString(block.description),
      };
    case 'embed':
      return {
        id: block.id,
        type: 'link',
        label: '',
        url: extractEmbedUrl(readString(block.url)),
        description: '',
      };
    default:
      return null;
  }
}
