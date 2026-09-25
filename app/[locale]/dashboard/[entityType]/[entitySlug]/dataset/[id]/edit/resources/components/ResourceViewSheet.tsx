'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { IconTable, IconX } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Sheet,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import PdfPreview from '../../../../../../../../(user)/components/PdfPreview';
import PreviewData from './PreviewData';
import { resourceByIdDoc, updateResourceDoc } from './query';

interface ResourceViewSheetProps {
  resourceId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

function formatFileSize(bytes?: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatUploadedAt(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function originalName(path?: string | null): string {
  if (!path) return '—';
  return path.replace(/^resources\//, '');
}

function fileFormat(format?: string | null, fileName?: string | null): string {
  const fromDetails = format?.replace('.', '').toUpperCase();
  if (fromDetails) return fromDetails;
  const ext = fileName?.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

function undeterminedLabel(count: number): { value: string; hint?: string } {
  if (count > 0) return { value: String(count) };
  return {
    value: 'Unable to determine',
    hint: "We couldn't read this information from the file.",
  };
}

function getErrorMessage(err: unknown, fallback: string): string {
  return typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
    ? err.message.trim()
    : fallback;
}

function MetaItem({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text
        variant="bodySm"
        color="subdued"
        className="uppercase tracking-wide"
      >
        {label}
      </Text>
      <Text variant="bodyMd" fontWeight="medium">
        {value}
      </Text>
      {hint ? (
        <Text variant="bodySm" color="subdued">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}

export function ResourceViewSheet({
  resourceId,
  onClose,
  onSaved,
}: ResourceViewSheetProps) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
  }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const resourceQuery = useQuery(
    resourceId
      ? [`fetch_resource_details_${resourceId}`]
      : ['fetch_resource_details_disabled'],
    () => {
      if (!resourceId) {
        return Promise.reject(new Error('No resource ID provided'));
      }
      return GraphQL(
        resourceByIdDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { resourceId }
      );
    },
    {
      enabled: Boolean(resourceId),
      retry: false,
    }
  );

  const resource = resourceQuery.data?.resourceById;
  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (resource?.id && resource.id !== syncedId) {
    setSyncedId(resource.id);
    setTitle(resource.name ?? '');
    setDescription(resource.description ?? '');
    setShowPreview(false);
  }

  useEffect(() => {
    if (!resourceId) {
      setSyncedId(null);
      setTitle('');
      setDescription('');
      setShowPreview(false);
    }
  }, [resourceId]);

  const saveMutation = useMutation(
    (fileResourceInput: { id: string; name?: string; description?: string }) =>
      GraphQL(
        updateResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { fileResourceInput }
      ),
    {
      onSuccess: () => {
        toast('File changes saved');
        void resourceQuery.refetch();
        onSaved();
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to save file changes right now.'));
      },
    }
  );

  const saveField = (field: 'name' | 'description', value: string) => {
    if (!resourceId) return;
    const current =
      field === 'name' ? (resource?.name ?? '') : (resource?.description ?? '');
    if (value === current) return;
    if (field === 'name') {
      saveMutation.mutate({ id: resourceId, name: value });
      return;
    }
    saveMutation.mutate({ id: resourceId, description: value });
  };

  const format = fileFormat(
    resource?.fileDetails?.format,
    resource?.fileDetails?.file?.name
  );
  const columnCount =
    resource?.previewData?.columns?.length || resource?.schema?.length || 0;
  const rowCount = resource?.previewDetails?.isAllEntries
    ? resource.previewData?.rows?.length || 0
    : 0;
  const columnsMeta = undeterminedLabel(columnCount);
  const rowsMeta = undeterminedLabel(rowCount);
  const isPdf = format === 'PDF';
  const canPreview =
    Boolean(resource) &&
    format !== 'ZIP' &&
    (isPdf || (resource?.previewData?.columns?.length ?? 0) > 0);
  const pdfUrl = resourceId
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${resourceId}`
    : '';

  return (
    <>
      <Sheet
        open={Boolean(resourceId)}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Sheet.Content
          side="right"
          size="wide"
          title={title || 'File details'}
          className="flex flex-col p-0"
        >
          <div className="flex items-start justify-between gap-4 border-b-1 border-solid border-baseGraySlateSolid6 px-6 pb-2 pt-6">
            <div className="min-w-0">
              <Text
                variant="headingLg"
                as="h2"
                className="truncate text-[var(--blue-primary-color)]"
              >
                {title || 'File details'}
              </Text>
              <Text variant="bodySm" color="subdued">
                Uploaded to this dataset.
              </Text>
            </div>
            <IconButton
              size="slim"
              icon={IconX}
              onClick={onClose}
              // withTooltip
              tooltipSide="left"
            >
              Close
            </IconButton>
          </div>

          {resourceQuery.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner size={32} />
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
                <TextField
                  name="resource-title"
                  label="Title"
                  value={title}
                  onChange={setTitle}
                  onBlur={() => saveField('name', title)}
                />
                <TextField
                  name="resource-description"
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  onBlur={() => saveField('description', description)}
                  multiline={3}
                  helpText="Starts from a system-generated summary — edit it to add context."
                />

                <Divider />

                <div className="flex items-center gap-2">
                  <Icon source={Icons.info} color="subdued" size={16} />
                  <Text
                    variant="bodySm"
                    fontWeight="medium"
                    className="uppercase tracking-wide"
                  >
                    Read from the file — not editable
                  </Text>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <MetaItem label="File type" value={format} />
                  <MetaItem
                    label="File size"
                    value={formatFileSize(resource?.fileDetails?.size)}
                  />
                  <MetaItem
                    label="Number of rows"
                    value={rowsMeta.value}
                    hint={rowsMeta.hint}
                  />
                  <MetaItem
                    label="Number of columns"
                    value={columnsMeta.value}
                    hint={columnsMeta.hint}
                  />
                  <MetaItem label="Source" value="File upload" />
                  <MetaItem
                    label="Uploaded"
                    value={formatUploadedAt(
                      resource?.fileDetails?.created || resource?.created
                    )}
                  />
                  <MetaItem
                    label="Original filename"
                    value={originalName(resource?.fileDetails?.file?.name)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-4">
                <Button
                  kind="secondary"
                  disabled={!canPreview}
                  icon={<Icon source={Icons.eye} size={18} />}
                  onClick={() => setShowPreview(true)}
                  className="rounded-2 border-1 border-solid border-baseGraySlateSolid8 bg-white text-[var(--base-default)]"
                >
                  Preview
                </Button>
                <Button kind="tertiary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </>
          )}
        </Sheet.Content>
      </Sheet>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <Dialog.Content title="Preview" large limitHeight>
          {isPdf ? (
            <PdfPreview url={pdfUrl} />
          ) : resource?.previewData ? (
            <PreviewData
              previewData={{
                columns: resource.previewData.columns,
                rows: resource.previewData.rows,
              }}
            />
          ) : (
            <Text>No preview is available for this file.</Text>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  );
}
