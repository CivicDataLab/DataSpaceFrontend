/**
 * Turns the published files of one dataset into the public file browser:
 * a folder tree when a stored path has folders, and a preview of the selected file.
 * Folders are only the folders in the stored path. A flat upload stays a flat list.
 */

import { backendFileUrl } from '@/lib/public-entity';

export type DatasetFileSource = {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  url?: string | null;
  noOfEntries?: number | null;
  previewEnabled?: boolean | null;
  previewData?: {
    columns?: Array<string | null> | null;
    rows?: Array<Array<unknown> | null> | null;
  } | null;
  schema?: Array<{
    fieldName?: string | null;
    format?: string | null;
    description?: string | null;
  }> | null;
  fileDetails?: {
    format?: string | null;
    size?: number | null;
    file?: { name?: string | null } | null;
  } | null;
};

export type FileTreeNode =
  | { kind: 'folder'; id: string; name: string; children: FileTreeNode[] }
  | { kind: 'file'; id: string; name: string; fileId: string };

export type PreparedDatasetFile = {
  id: string;
  title: string;
  filename: string | null;
  folders: string[];
  format: string | null;
  sizeLabel: string | null;
  rowCount: number | null;
  columnCount: number | null;
  factLine: string;
  description: string | null;
  downloadHref: string | null;
  externalDownload: boolean;
  preview: {
    columns: string[];
    rows: string[][];
  } | null;
  pdfUrl: string | null;
  schema: Array<{ name: string; format: string; description: string | null }>;
};

export function buildFileTree(files: DatasetFileSource[]): FileTreeNode[] {
  const roots: FileTreeNode[] = [];

  for (const file of files) {
    const { folders } = pathParts(file);
    insertFile(roots, folders, file, '');
  }

  sortNodes(roots);
  return roots;
}

export function firstFileId(nodes: FileTreeNode[]): string | null {
  for (const node of nodes) {
    if (node.kind === 'file') return node.fileId;
    const nested = firstFileId(node.children);
    if (nested) return nested;
  }
  return null;
}

export function folderIdsForFile(
  nodes: FileTreeNode[],
  fileId: string
): string[] {
  const path: string[] = [];

  const walk = (level: FileTreeNode[]): boolean => {
    for (const node of level) {
      if (node.kind === 'file') {
        if (node.fileId === fileId) return true;
        continue;
      }
      path.push(node.id);
      if (walk(node.children)) return true;
      path.pop();
    }
    return false;
  };

  walk(nodes);
  return path;
}

export function prepareDatasetFile(
  file: DatasetFileSource
): PreparedDatasetFile {
  const { folders, filename } = pathParts(file);
  const format = fileFormat(file, filename);
  const schema = fileSchema(file);
  const columnCount = schema.length || file.previewData?.columns?.length || 0;
  const rowCount = finiteCount(file.noOfEntries);
  const sizeLabel = formatBytes(file.fileDetails?.size);
  const preview = filePreview(file);
  const download = downloadTarget(file);

  return {
    id: file.id,
    title: file.name.trim() || filename || 'File',
    filename,
    folders,
    format,
    sizeLabel,
    rowCount,
    columnCount: columnCount || null,
    factLine: factLine({
      filename,
      format,
      sizeLabel,
      rowCount,
      columnCount: columnCount || null,
    }),
    description: file.description?.trim() || null,
    downloadHref: download.href,
    externalDownload: download.external,
    preview,
    pdfUrl: format === 'PDF' ? download.href : null,
    schema,
  };
}

function insertFile(
  nodes: FileTreeNode[],
  folders: string[],
  file: DatasetFileSource,
  parentPath: string
) {
  if (!folders.length) {
    nodes.push({
      kind: 'file',
      id: file.id,
      name: file.name.trim() || 'File',
      fileId: file.id,
    });
    return;
  }

  const [head, ...rest] = folders;
  const folderPath = parentPath ? `${parentPath}/${head}` : head;
  let folder = nodes.find(
    (node): node is Extract<FileTreeNode, { kind: 'folder' }> =>
      node.kind === 'folder' && node.name === head
  );

  if (!folder) {
    folder = {
      kind: 'folder',
      id: `folder:${folderPath}`,
      name: head,
      children: [],
    };
    nodes.push(folder);
  }

  insertFile(folder.children, rest, file, folderPath);
}

function sortNodes(nodes: FileTreeNode[]) {
  nodes.sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === 'folder' ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
  for (const node of nodes) {
    if (node.kind === 'folder') sortNodes(node.children);
  }
}

function pathParts(file: DatasetFileSource): {
  folders: string[];
  filename: string | null;
} {
  const stored = file.fileDetails?.file?.name?.trim().replace(/\\/g, '/');
  const withoutRoot = stored?.replace(/^\/+/, '').replace(/^resources\//, '');
  const segments = (withoutRoot ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) return { folders: [], filename: null };

  const filename = segments[segments.length - 1];
  return { folders: segments.slice(0, -1), filename };
}

function fileFormat(file: DatasetFileSource, filename: string | null): string | null {
  const fromDetails = file.fileDetails?.format?.replace(/^\./, '').trim();
  if (fromDetails) return fromDetails.toUpperCase();
  const fromName = filename?.split('.').pop()?.trim();
  if (fromName && fromName !== filename) return fromName.toUpperCase();
  return null;
}

function fileSchema(
  file: DatasetFileSource
): PreparedDatasetFile['schema'] {
  return (file.schema ?? [])
    .map((field) => ({
      name: field.fieldName?.trim() || '',
      format: field.format?.trim() || '',
      description: field.description?.trim() || null,
    }))
    .filter((field) => field.name);
}

function filePreview(
  file: DatasetFileSource
): PreparedDatasetFile['preview'] {
  if (file.previewEnabled === false) return null;

  const columns = (file.previewData?.columns ?? [])
    .map((column) => column?.trim() || '')
    .filter(Boolean);
  const rows = (file.previewData?.rows ?? [])
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) => columns.map((_, index) => cellText(row[index])));

  if (!columns.length || !rows.length) return null;

  return { columns, rows };
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function factLine(parts: {
  filename: string | null;
  format: string | null;
  sizeLabel: string | null;
  rowCount: number | null;
  columnCount: number | null;
}): string {
  const bits = [
    parts.filename,
    parts.format,
    parts.sizeLabel,
    parts.rowCount !== null
      ? `${parts.rowCount.toLocaleString('en-US')} rows`
      : null,
    parts.columnCount
      ? `${parts.columnCount.toLocaleString('en-US')} columns`
      : null,
  ].filter((bit): bit is string => Boolean(bit));

  return bits.join(' · ');
}

function downloadTarget(file: DatasetFileSource): {
  href: string | null;
  external: boolean;
} {
  if (file.type === 'API' || file.type === 'EXTERNAL') {
    const href = file.url?.trim();
    if (href) return { href, external: true };
  }

  const href = file.id
    ? backendFileUrl(`api/download/resource/${file.id}`)
    : null;
  return { href, external: href !== null };
}

function formatBytes(bytes?: number | null): string | null {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function finiteCount(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}
