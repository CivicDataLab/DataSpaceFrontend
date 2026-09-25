'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCloudUpload,
  IconCopy,
  IconExternalLink,
  IconLink,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconQuote,
  IconTextCaption,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Combobox, Icon, Popover, Text, toast } from 'opub-ui';

import {
  ChartBlock,
  ContentBlock,
  ContentBlockType,
  createBlockId,
  HIGHLIGHT_TONES,
  HighlightBlock,
  HighlightTone,
  ImageBlock,
  isBlockEmpty,
  LinkBlock,
  TextBlock,
} from '../content-document';
import styles from '../edit.module.scss';
import {
  ContentBlockView,
  highlightToneClass,
  SelectedChartPreview,
} from './ContentBlocksRenderer';

import 'react-quill-new/dist/quill.snow.css';

import Image from 'next/image';

interface ChartOption {
  id: string;
  name: string;
  kind?: string;
}

interface ContentEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onSave: (blocks: ContentBlock[]) => void;
  chartOptions?: ChartOption[];
  showErrors?: boolean;
}

const BLOCK_TYPES: Array<{
  type: ContentBlockType;
  label: string;
  icon: typeof IconTextCaption;
}> = [
  { type: 'text', label: 'Text', icon: IconTextCaption },
  { type: 'image', label: 'Image', icon: IconPhoto },
  { type: 'chart', label: 'Chart', icon: IconChartBar },
  { type: 'highlight', label: 'Highlight', icon: IconQuote },
  { type: 'link', label: 'Link / Embed', icon: IconLink },
];

function createBlock(type: ContentBlockType): ContentBlock {
  const id = createBlockId();
  switch (type) {
    case 'image':
      return { id, type, src: '', caption: '' };
    case 'chart':
      return { id, type, chartId: '', chartName: '', caption: '' };
    case 'highlight':
      return { id, type, title: '', body: '', tone: 'blue' };
    case 'link':
      return { id, type, label: '', url: '', description: '' };
    default:
      return { id, type: 'text', html: '' };
  }
}

export function ContentEditor({
  blocks,
  onChange,
  onSave,
  chartOptions = [],
  showErrors,
}: ContentEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const updateBlock = (id: string, next: ContentBlock, persist = false) => {
    const nextBlocks = blocks.map((block) => (block.id === id ? next : block));
    onChange(nextBlocks);
    if (persist) onSave(nextBlocks);
  };

  const addBlock = (type: ContentBlockType) => {
    const next = createBlock(type);
    if (next.type === 'highlight') {
      const used = blocks.filter((item) => item.type === 'highlight').length;
      next.tone = HIGHLIGHT_TONES[used % HIGHLIGHT_TONES.length];
    }
    const nextBlocks = [...blocks, next];
    onChange(nextBlocks);
    onSave(nextBlocks);
    setActiveId(next.id);
    setMenuOpen(false);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const nextBlocks = [...blocks];
    const [item] = nextBlocks.splice(index, 1);
    nextBlocks.splice(target, 0, item);
    onChange(nextBlocks);
    onSave(nextBlocks);
  };

  const duplicateBlock = (index: number) => {
    const copy = { ...blocks[index], id: createBlockId() };
    const nextBlocks = [
      ...blocks.slice(0, index + 1),
      copy,
      ...blocks.slice(index + 1),
    ];
    onChange(nextBlocks);
    onSave(nextBlocks);
    setActiveId(copy.id);
  };

  const deleteBlock = (id: string) => {
    const nextBlocks = blocks.filter((block) => block.id !== id);
    onChange(nextBlocks);
    onSave(nextBlocks);
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className={styles.canvas}>
      {blocks.length === 0 ? (
        <div className={styles.canvasEmpty}>
          <Text color="subdued">Your Use Case is ready to be built.</Text>
          <AddContentMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onSelect={addBlock}
          />
        </div>
      ) : (
        <>
          <div className={styles.canvasBody}>
            {blocks.map((block, index) => {
              const active = activeId === block.id;

              return (
                <BlockFrame
                  key={block.id}
                  active={active}
                  isFirst={index === 0}
                  isLast={index === blocks.length - 1}
                  onActivate={() => setActiveId(block.id)}
                  onToggle={() =>
                    setActiveId((current) =>
                      current === block.id ? null : block.id
                    )
                  }
                  onMoveUp={() => moveBlock(index, -1)}
                  onMoveDown={() => moveBlock(index, 1)}
                  onDuplicate={() => duplicateBlock(index)}
                  onDelete={() => deleteBlock(block.id)}
                >
                  {!active ? (
                    isBlockEmpty(block) ? (
                      <Text color="subdued">Empty {block.type} block</Text>
                    ) : (
                      <ContentBlockView block={block} />
                    )
                  ) : null}
                  {active && block.type === 'text' ? (
                    <TextBlockEditor
                      block={block}
                      onChange={(next) => updateBlock(block.id, next)}
                      onBlur={(next) => updateBlock(block.id, next, true)}
                    />
                  ) : null}
                  {active && block.type === 'image' ? (
                    <ImageBlockEditor
                      block={block}
                      showErrors={showErrors}
                      onChange={(next, persist) =>
                        updateBlock(block.id, next, persist)
                      }
                    />
                  ) : null}
                  {active && block.type === 'chart' ? (
                    <ChartBlockEditor
                      block={block}
                      options={chartOptions}
                      onChange={(next) => updateBlock(block.id, next)}
                      onBlur={(next) => updateBlock(block.id, next, true)}
                    />
                  ) : null}
                  {active && block.type === 'highlight' ? (
                    <HighlightBlockEditor
                      block={block}
                      onChange={(next) => updateBlock(block.id, next)}
                      onBlur={(next) => updateBlock(block.id, next, true)}
                    />
                  ) : null}
                  {active && block.type === 'link' ? (
                    <LinkBlockEditor
                      block={block}
                      onChange={(next) => updateBlock(block.id, next)}
                      onBlur={(next) => updateBlock(block.id, next, true)}
                    />
                  ) : null}
                </BlockFrame>
              );
            })}
          </div>
          <div className={styles.addContentFooter}>
            <AddContentMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              onSelect={addBlock}
            />
          </div>
        </>
      )}
    </div>
  );
}

function AddContentMenu({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: ContentBlockType) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <Button kind="neutral" icon={<Icon source={IconPlus} size={16} />}>
          Add Content
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" side="top" sideOffset={8}>
        <div className={styles.menu}>
          {BLOCK_TYPES.map((item) => (
            <button
              key={item.type}
              type="button"
              className={styles.menuItem}
              onClick={() => onSelect(item.type)}
            >
              <item.icon size={16} stroke={1.75} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
}

function BlockFrame({
  children,
  active,
  isFirst,
  isLast,
  onActivate,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  children: React.ReactNode;
  active: boolean;
  isFirst: boolean;
  isLast: boolean;
  onActivate: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`${styles.block} ${active ? styles.blockActive : ''}`}
      onClick={active ? undefined : onActivate}
    >
      <div
        className={`${styles.toolbar} ${active ? styles.toolbarVisible : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          kind="tertiary"
          onClick={onToggle}
          aria-label={active ? 'Done editing' : 'Edit block'}
        >
          {active ? (
            <IconCheck size={14} className="text-primaryBlue" />
          ) : (
            <IconPencil size={14} />
          )}
        </Button>
        <Button
          kind="tertiary"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move up"
        >
          <IconChevronUp size={14} />
        </Button>
        <Button
          kind="tertiary"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move down"
        >
          <IconChevronDown size={14} />
        </Button>
        <Button
          kind="tertiary"
          onClick={onDuplicate}
          aria-label="Duplicate block"
        >
          <IconCopy size={14} />
        </Button>
        <Button kind="tertiary" onClick={onDelete} aria-label="Delete block">
          <IconTrash size={14} className="text-baseRedSolid9" />
        </Button>
      </div>
      {children}
    </div>
  );
}

function TextBlockEditor({
  block,
  onChange,
  onBlur,
}: {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
  onBlur: (block: TextBlock) => void;
}) {
  const ReactQuill = useMemo(
    () =>
      dynamic(() => import('react-quill-new'), {
        ssr: false,
        loading: () => (
          <div className="h-32 animate-pulse rounded-2 bg-baseGraySlateSolid3" />
        ),
      }),
    []
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, false] }],
        ['blockquote'],
        ['bold', 'italic', 'underline'],
        [{ list: 'bullet' }, { list: 'ordered' }],
        ['link'],
      ],
    }),
    []
  );

  return (
    <div className="content-text-editor">
      <ReactQuill
        theme="snow"
        value={block.html}
        placeholder="Write some text..."
        modules={modules}
        onChange={(value) => onChange({ ...block, html: value })}
        onBlur={(_range, _source, editor) =>
          onBlur({ ...block, html: editor.getHTML() })
        }
      />
    </div>
  );
}

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_INLINE_IMAGE_BYTES = 500 * 1024;

function ImageBlockEditor({
  block,
  onChange,
  showErrors,
}: {
  block: ImageBlock;
  onChange: (block: ImageBlock, persist: boolean) => void;
  showErrors?: boolean;
}) {
  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast('Images must be 20MB or smaller.');
      return;
    }
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      toast('Images over 500KB need a hosted URL. Paste the URL below.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ ...block, src: reader.result }, true);
      }
    };
    reader.readAsDataURL(file);
  };

  const hostedSrc =
    block.src.startsWith('data:') || block.src.startsWith('blob:')
      ? ''
      : block.src;

  return (
    <figure>
      {block.src ? (
        <Image
          src={block.src}
          alt={block.caption || 'Use case image'}
          width={1200}
          height={675}
          className="h-auto w-full rounded-2 border-1 border-solid border-baseGraySlateSolid6 object-cover"
        />
      ) : (
        <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2 border-1 border-dashed border-baseGraySlateSolid6 bg-baseGraySlateSolid2 text-center">
          <IconCloudUpload size={20} className="text-baseGraySlateSolid9" />
          <Text variant="bodySm" color="subdued">
            Upload image
          </Text>
          <span className="text-xs text-textSubdued">
            JPG, PNG or WEBP. Max 20MB.
          </span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      )}
      {showErrors && !block.src ? (
        <Text variant="bodySm" color="critical">
          Upload an image or paste a URL
        </Text>
      ) : null}
      <PlainField
        name={`content-image-url-${block.id}`}
        value={hostedSrc}
        placeholder="Or paste an image URL"
        size="caption"
        onChange={(value) => onChange({ ...block, src: value }, false)}
        onBlur={(value) => {
          const keepInline =
            !value.trim() &&
            (block.src.startsWith('data:') || block.src.startsWith('blob:'));
          onChange(keepInline ? block : { ...block, src: value }, true);
        }}
      />
      <PlainField
        name={`content-image-caption-${block.id}`}
        value={block.caption ?? ''}
        placeholder="Add a caption..."
        size="caption"
        onChange={(value) => onChange({ ...block, caption: value }, false)}
        onBlur={(value) => onChange({ ...block, caption: value }, true)}
      />
    </figure>
  );
}

function ChartBlockEditor({
  block,
  options,
  onChange,
  onBlur,
}: {
  block: ChartBlock;
  options: ChartOption[];
  onChange: (block: ChartBlock) => void;
  onBlur: (block: ChartBlock) => void;
}) {
  return (
    <figure className="rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-4">
      <div className="flex items-center gap-2">
        <IconChartBar size={16} className="shrink-0 text-baseGraySlateSolid9" />
        <div className="min-w-0 flex-1">
          <Combobox
            name={`content-chart-${block.id}`}
            label="Select a chart"
            labelHidden
            placeholder="Select a chart..."
            list={options.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            selectedValue={
              block.chartId
                ? [
                    {
                      label: block.chartName || block.chartId,
                      value: block.chartId,
                    },
                  ]
                : []
            }
            displaySelected
            onChange={(value) => {
              const selected = Array.isArray(value) ? value[0] : undefined;
              const match = options.find((item) => item.id === selected?.value);
              onBlur({
                ...block,
                chartId: selected?.value ?? '',
                chartName: selected?.label ?? '',
                chartKind: match?.kind,
              });
            }}
          />
        </div>
      </div>
      {block.chartId ? (
        <SelectedChartPreview
          chartId={block.chartId}
          chartKind={block.chartKind}
          chartName={block.chartName}
        />
      ) : (
        <div className="mt-3 flex h-32 items-center justify-center rounded-2 bg-baseGraySlateSolid2 px-4">
          <Text variant="bodySm" color="subdued">
            No chart selected yet.
          </Text>
        </div>
      )}
      <PlainField
        name={`content-chart-caption-${block.id}`}
        value={block.caption ?? ''}
        placeholder="Add a caption..."
        size="caption"
        onChange={(value) => onChange({ ...block, caption: value })}
        onBlur={(value) => onBlur({ ...block, caption: value })}
      />
    </figure>
  );
}

const HIGHLIGHT_SWATCHES: { tone: HighlightTone; label: string }[] = [
  { tone: 'blue', label: 'Blue' },
  { tone: 'amber', label: 'Amber' },
  { tone: 'green', label: 'Green' },
];

function HighlightBlockEditor({
  block,
  onChange,
  onBlur,
}: {
  block: HighlightBlock;
  onChange: (block: HighlightBlock) => void;
  onBlur: (block: HighlightBlock) => void;
}) {
  return (
    <div className={styles.highlightRow}>
      <div
        className={`${styles.highlightCard} ${highlightToneClass(block.tone)}`}
      >
        <PlainField
          name={`highlight-title-${block.id}`}
          value={block.title}
          placeholder="Key highlight, e.g. 32% reduction in maternal mortality"
          size="heading"
          onChange={(value) => onChange({ ...block, title: value })}
          onBlur={(value) => onBlur({ ...block, title: value })}
        />
        <PlainField
          name={`highlight-body-${block.id}`}
          value={block.body}
          placeholder="Optional supporting text"
          size="support"
          onChange={(value) => onChange({ ...block, body: value })}
          onBlur={(value) => onBlur({ ...block, body: value })}
        />
      </div>
      <div
        className={styles.highlightSwatches}
        role="radiogroup"
        aria-label="Highlight color"
      >
        {HIGHLIGHT_SWATCHES.map((swatch) => (
          <button
            key={swatch.tone}
            type="button"
            role="radio"
            aria-checked={block.tone === swatch.tone}
            aria-label={swatch.label}
            className={`${styles.highlightSwatch} ${highlightToneClass(swatch.tone)} ${
              block.tone === swatch.tone ? styles.highlightSwatchSelected : ''
            }`}
            onClick={() => onBlur({ ...block, tone: swatch.tone })}
          />
        ))}
      </div>
    </div>
  );
}

function LinkBlockEditor({
  block,
  onChange,
  onBlur,
}: {
  block: LinkBlock;
  onChange: (block: LinkBlock) => void;
  onBlur: (block: LinkBlock) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-4">
      <IconExternalLink
        size={16}
        className="mt-1 shrink-0 text-baseGraySlateSolid9"
      />
      <div className="min-w-0 flex-1">
        <PlainField
          name={`link-label-${block.id}`}
          value={block.label}
          placeholder="Link label, e.g. Read the full report"
          size="label"
          onChange={(value) => onChange({ ...block, label: value })}
          onBlur={(value) => onBlur({ ...block, label: value })}
        />
        <PlainField
          name={`link-url-${block.id}`}
          value={block.url}
          placeholder="https://example.org/resource"
          size="mono"
          onChange={(value) => onChange({ ...block, url: value })}
          onBlur={(value) => onBlur({ ...block, url: value })}
        />
        <PlainField
          name={`link-description-${block.id}`}
          value={block.description ?? ''}
          placeholder="Optional description"
          size="caption"
          onChange={(value) => onChange({ ...block, description: value })}
          onBlur={(value) => onBlur({ ...block, description: value })}
        />
      </div>
    </div>
  );
}

function PlainField({
  name,
  value,
  placeholder,
  size,
  onChange,
  onBlur,
}: {
  name: string;
  value: string;
  placeholder: string;
  size?: 'heading' | 'support' | 'caption' | 'label' | 'mono';
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
}) {
  const sizeClass =
    size === 'heading'
      ? styles.plainFieldHeading
      : size === 'support'
        ? styles.plainFieldSupport
        : size === 'caption'
          ? styles.plainFieldCaption
          : size === 'label'
            ? styles.plainFieldLabel
            : size === 'mono'
              ? styles.plainFieldMono
              : '';

  return (
    <input
      name={name}
      value={value}
      placeholder={placeholder}
      className={`${styles.plainField} ${sizeClass}`}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onBlur(event.target.value)}
    />
  );
}
