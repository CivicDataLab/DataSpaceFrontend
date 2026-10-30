'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { graphql } from '@/gql';
import { PdfPreview } from '@/components/file-preview';
import {
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconFile,
  IconFileText,
  IconFolder,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Sheet, Spinner, Tooltip } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  buildFileTree,
  firstFileId,
  folderIdsForFile,
  prepareDatasetFile,
  type FileTreeNode,
  type PreparedDatasetFile,
} from '../../dataset-files';
import PreviewData from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/dataset/[id]/edit/resources/components/PreviewData';

const datasetFilesQuery = graphql(`
  query datasetBrowserFiles($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      type
      name
      description
      url
      noOfEntries
      previewEnabled
      previewData {
        columns
        rows
      }
      schema {
        fieldName
        format
        description
      }
      fileDetails {
        format
        size
        file {
          name
        }
      }
    }
  }
`);

export function DatasetFiles({ datasetId }: { datasetId: string }) {
  const filesQuery = useQuery(['dataset-files', datasetId], () =>
    GraphQL(datasetFilesQuery, {}, { datasetId })
  );

  if (filesQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (filesQuery.isError) {
    return (
      <p className="py-10 text-200 text-[#667085]">
        The files could not be loaded. Refresh the page and try again.
      </p>
    );
  }

  const files = filesQuery.data?.datasetResources ?? [];
  if (!files.length) {
    return (
      <p className="py-10 text-200 text-[#667085]">
        This dataset has no files yet.
      </p>
    );
  }

  return <FileBrowser key={datasetId} files={files} />;
}

function FileBrowser({
  files,
}: {
  files: Parameters<typeof prepareDatasetFile>[0][];
}) {
  const tree = useMemo(() => buildFileTree(files), [files]);
  const prepared = useMemo(() => {
    const byId = new Map<string, PreparedDatasetFile>();
    for (const file of files) byId.set(file.id, prepareDatasetFile(file));
    return byId;
  }, [files]);
  const initialId = firstFileId(tree);
  const [selectedId, setSelectedId] = useState(initialId);
  const [openFolders, setOpenFolders] = useState<string[]>(() =>
    initialId ? folderIdsForFile(tree, initialId) : []
  );

  const selected = (selectedId && prepared.get(selectedId)) || null;

  return (
    <div>
      <h2 className="font-primary text-300 font-semi-bold leading-[26px] tracking-[0px] text-primaryBlue">
        Data files
      </h2>
      <p className="mt-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#68686b]">
        Browse and preview the files included in this dataset.
      </p>
      <div className="mt-5 box-border overflow-hidden rounded-[18px] border-[0.8px] border-solid border-[#e5e5e5] bg-white font-primary leading-3 text-[#0a0a0a] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="max-h-[640px] overflow-auto border-b-[0.8px] border-solid border-[#e5e5e5] p-3 lg:border-b-[0px] lg:border-r-[0.8px]">
          <FileTree
            nodes={tree}
            depth={0}
            filesOnly={!tree.some((node) => node.kind === 'folder')}
            selectedId={selected?.id ?? null}
            openFolders={openFolders}
            onToggle={(folderId) =>
              setOpenFolders((current) =>
                current.includes(folderId)
                  ? current.filter((id) => id !== folderId)
                  : [...current, folderId]
              )
            }
            onSelect={setSelectedId}
          />
        </div>
        <div className="min-w-0 p-4 sm:p-6">
          {selected ? <FilePreview file={selected} /> : null}
        </div>
      </div>
    </div>
  );
}

function TreeLabel({ name }: { name: string }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const node = labelRef.current;
    if (!node) return;

    const update = () => {
      setTruncated(node.scrollWidth > node.clientWidth + 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [name, truncated]);

  const label = (
    <span ref={labelRef} className="min-w-0 truncate">
      {name}
    </span>
  );

  if (!truncated) return label;

  return (
    <Tooltip content={name} side="top">
      {label}
    </Tooltip>
  );
}

function FileTree({
  nodes,
  depth,
  filesOnly,
  selectedId,
  openFolders,
  onToggle,
  onSelect,
}: {
  nodes: FileTreeNode[];
  depth: number;
  filesOnly: boolean;
  selectedId: string | null;
  openFolders: string[];
  onToggle: (folderId: string) => void;
  onSelect: (fileId: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) =>
        node.kind === 'folder' ? (
          <li key={node.id}>
            <button
              type="button"
              className="flex w-full appearance-none items-center gap-1.5 border-[0px] bg-transparent px-2 py-1.5 text-left text-[14px] text-[#243044] hover:bg-[#f3f5f8]"
              style={{ paddingLeft: 8 + depth * 16 }}
              aria-expanded={openFolders.includes(node.id)}
              onClick={() => onToggle(node.id)}
            >
              {openFolders.includes(node.id) ? (
                <IconChevronDown size={14} aria-hidden />
              ) : (
                <IconChevronRight size={14} aria-hidden />
              )}
              <IconFolder size={16} className="shrink-0 text-[#8b95a8]" aria-hidden />
              <TreeLabel name={node.name} />
            </button>
            {openFolders.includes(node.id) ? (
              <FileTree
                nodes={node.children}
                depth={depth + 1}
                filesOnly={filesOnly}
                selectedId={selectedId}
                openFolders={openFolders}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ) : null}
          </li>
        ) : (
          <li key={node.id}>
            <button
              type="button"
              className={`flex w-full min-w-0 appearance-none items-center gap-[6px] rounded-[10px] border-[0px] py-2 pr-2 text-left font-primary text-100 leading-2 ${
                selectedId === node.fileId
                  ? 'bg-[#f3f5f8] font-medium text-[#0a0a0a]'
                  : 'bg-transparent font-regular text-[#243044] hover:bg-[#f3f5f8]'
              }`}
              style={{ paddingLeft: 12 + depth * 16 }}
              aria-current={selectedId === node.fileId ? 'true' : undefined}
              onClick={() => onSelect(node.fileId)}
            >
              {filesOnly ? (
                <IconFileText size={16} className="shrink-0 text-[#8b95a8]" aria-hidden />
              ) : (
                <IconFile size={16} className="shrink-0 text-[#8b95a8]" aria-hidden />
              )}
              <TreeLabel name={node.name} />
            </button>
          </li>
        )
      )}
    </ul>
  );
}

/** Memoised so opening or closing a folder does not redraw the preview table. */
const FilePreview = memo(function FilePreview({
  file,
}: {
  file: PreparedDatasetFile;
}) {
  const previewCount = file.preview?.rows.length ?? 0;

  return (
    <div>
      {file.folders.length ? (
        <p className="text-75 text-[#8b95a8]">{file.folders.join(' / ')}</p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-primary text-100 font-semi-bold leading-2 tracking-[0px] text-[#0a0a0a]">
            {file.title}
          </h3>
          {file.factLine ? (
            <p className="mt-1 break-words font-primary text-75 font-regular leading-1 tracking-[0px] text-[#68686b]">
              {file.factLine}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FileDetailsSheet file={file} />
          {file.downloadHref ? (
            <Button
              kind="primary"
              url={file.downloadHref}
              external={file.externalDownload}
              className="!inline-flex !h-9 !items-center !justify-center !gap-2 !rounded-[10px] !border-[0px] !bg-primaryBlue !px-3 !py-0 !text-center !font-primary !text-[14px] !font-medium !leading-2 !text-white hover:!bg-[#254c75]"
            >
              <span className="inline-flex items-center gap-2 font-primary text-100 font-medium leading-2">
                <IconDownload size={16} aria-hidden />
                Download
              </span>
            </Button>
          ) : null}
        </div>
      </div>

      {file.pdfUrl ? (
        <div className="mt-6">
          <PdfPreview url={file.pdfUrl} />
        </div>
      ) : file.preview ? (
        <div className="-mx-4 mt-5 border-t-[1px] border-solid border-[#efefef] px-4 pt-5 sm:-mx-6 sm:px-6">
          <p className="font-primary text-75 font-medium uppercase leading-1 tracking-[0.6px] text-[#686868]">
            Data preview
          </p>
          <p className="mt-4 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#68686b]">
            {file.rowCount && file.rowCount > previewCount
              ? `Previewing the first ${previewCount.toLocaleString('en-US')} rows of ${file.rowCount.toLocaleString('en-US')}`
              : `Previewing ${previewCount.toLocaleString('en-US')} rows`}
          </p>
          <div className="mt-3">
            <PreviewData
              tableOnly
              previewData={{
                columns: file.preview.columns,
                rows: file.preview.rows,
              }}
              fields={file.schema}
            />
          </div>
        </div>
      ) : (
        <p className="mt-6 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#68686b]">
          This file has no table preview.
        </p>
      )}
    </div>
  );
});

function FileDetailsSheet({ file }: { file: PreparedDatasetFile }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger>
        <Button
          kind="secondary"
          className="!box-border !flex !h-9 !items-center !justify-center !gap-2 !rounded-[10px] !border-[0.8px] !border-solid !border-[#8c8c8c] !bg-white !px-3 !py-0 !text-center !font-primary !text-[14px] !font-medium !leading-2 !text-[#0a0a0a] ![box-shadow:none] hover:!bg-[#e4e4e6]"
        >
          <span className="inline-flex items-center gap-2 font-primary text-[14px] font-medium leading-2 text-[#0a0a0a]">
            <IconInfoCircle size={16} className="shrink-0 translate-y-[0.5px] !text-[#0a0a0a]" aria-hidden />
            File details
          </span>
        </Button>
      </Sheet.Trigger>
      <Sheet.Content
        side="right"
        size="wide"
        title={file.title}
        className="flex h-full flex-col"
      >
        <div className="flex items-start justify-between gap-4 border-b-[0.8px] border-solid border-[#e5e5e5] px-6 pb-4 pt-6">
          <h2 className="min-w-0 font-primary text-200 font-semi-bold leading-3 tracking-[0px] text-primaryBlue">
            {file.title}
          </h2>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 appearance-none items-center justify-center rounded-full border-[0px] bg-transparent text-[#0a0a0a] hover:bg-[#e4e4e6]"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <IconX size={20} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-6">
          {file.description ? (
            <div>
              <DetailLabel>Description</DetailLabel>
              <div className="mt-2 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#0a0a0a]">
                {file.description}
              </div>
            </div>
          ) : null}

          <div className={`${file.description ? 'mt-6' : ''} grid grid-cols-2 gap-x-8 gap-y-5`}>
            <DetailItem label="File type" value={file.format} />
            <DetailItem label="File size" value={file.sizeLabel} />
            <DetailItem
              label="Number of rows"
              value={file.rowCount === null ? null : file.rowCount.toLocaleString('en-US')}
            />
            <DetailItem
              label="Number of columns"
              value={
                file.columnCount === null
                  ? null
                  : file.columnCount.toLocaleString('en-US')
              }
            />
          </div>

          {file.filename ? (
            <div className="mt-5">
              <DetailLabel>Original filename</DetailLabel>
              <div className="mt-1 break-all font-primary text-100 font-regular leading-2 tracking-[0px] text-[#0a0a0a]">
                {file.filename}
              </div>
            </div>
          ) : null}

          <div className="mt-6 border-t-[0.8px] border-solid border-[#e5e5e5] pt-5">
            <DetailLabel colorClass="text-[#68686b]">Download metadata</DetailLabel>
            <p className="mt-2 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#6d6d6b]">
              Downloads this file&apos;s metadata, not the file itself.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="relative">
                <select
                  value={format}
                  aria-label="Metadata format"
                  onChange={(event) =>
                    setFormat(event.target.value === 'csv' ? 'csv' : 'json')
                  }
                  className="h-9 appearance-none rounded-[10px] border-[0.8px] border-solid border-[#8c8c8c] bg-white pl-3 pr-8 font-primary text-[14px] font-medium text-[#0a0a0a] hover:bg-[#e4e4e6]"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <IconChevronDown
                  size={16}
                  aria-hidden
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#0a0a0a]"
                />
              </div>
              <button
                type="button"
                className="inline-flex h-9 appearance-none items-center justify-center gap-2 rounded-[10px] border-[0px] bg-primaryBlue px-3 font-primary text-[14px] font-medium leading-2 text-white hover:bg-[#254c75]"
                onClick={() => downloadFileMetadata(file, format)}
              >
                <IconDownload size={16} aria-hidden />
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t-[0.8px] border-solid border-[#e5e5e5] px-6 py-4">
          <button
            type="button"
            className="appearance-none rounded-[8px] border-[0px] bg-transparent px-3 py-1.5 font-primary text-100 font-medium leading-2 text-[#0a0a0a] hover:bg-[#e4e4e6]"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}

function DetailLabel({
  children,
  colorClass = 'text-[#686868]',
}: {
  children: string;
  colorClass?: string;
}) {
  return (
    <p
      className={`font-primary text-75 font-medium uppercase leading-1 tracking-[0.6px] ${colorClass}`}
    >
      {children}
    </p>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <DetailLabel>{label}</DetailLabel>
      <div className="mt-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#0a0a0a]">
        {value || '—'}
      </div>
    </div>
  );
}

function downloadFileMetadata(file: PreparedDatasetFile, format: 'json' | 'csv') {
  const metadata = {
    name: file.title,
    description: file.description,
    fileType: file.format,
    fileSize: file.sizeLabel,
    rows: file.rowCount,
    columns: file.columnCount,
    filename: file.filename,
    schema: file.schema,
  };
  const body =
    format === 'json'
      ? JSON.stringify(metadata, null, 2)
      : metadataToCsv(metadata);
  const blob = new Blob([body], {
    type: format === 'json' ? 'application/json' : 'text/csv',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const base = (file.filename || file.title).replace(/\.[^.]+$/, '');
  link.href = url;
  link.download = `${base}-metadata.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}

function metadataToCsv(metadata: {
  name: string;
  description: string | null;
  fileType: string | null;
  fileSize: string | null;
  rows: number | null;
  columns: number | null;
  filename: string | null;
  schema: PreparedDatasetFile['schema'];
}) {
  const rows = [
    ['name', metadata.name],
    ['description', metadata.description ?? ''],
    ['fileType', metadata.fileType ?? ''],
    ['fileSize', metadata.fileSize ?? ''],
    ['rows', metadata.rows === null ? '' : String(metadata.rows)],
    ['columns', metadata.columns === null ? '' : String(metadata.columns)],
    ['filename', metadata.filename ?? ''],
  ];
  const schemaRows = metadata.schema.map((field) => [
    'column',
    field.name,
    field.format,
    field.description ?? '',
  ]);
  return [...rows, ...schemaRows]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
