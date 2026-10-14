'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { FieldType, UpdateFileResourceInput } from '@/gql/generated/graphql';
import {
  IconAlertTriangle,
  IconFile,
  IconRefresh,
  IconTable,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Select,
  Sheet,
  Spinner,
  Tag,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  PDF_PREVIEW_HEIGHT,
  PdfPreview,
  PdfPreviewSkeleton,
  TABLE_PREVIEW_HEIGHT,
  TablePreviewSkeleton,
} from '@/components/file-preview';
import { Icons } from '@/components/icons';
import PreviewData from './PreviewData';
import {
  PROMPT_FILE_NAME_MAX_LENGTH,
  PROMPT_FORMAT_OPTIONS,
} from './prompt-file';
import {
  resourceByIdDoc,
  updatePromptResourceDoc,
  updateResourceDoc,
  updateSchemaDoc,
} from './query';
import {
  enabledFilePreview,
  previewStaysEnabled,
  RESOURCE_FILE_ACCEPT,
} from './ResourceDropzone';

interface ResourceViewSheetProps {
  resourceId: string | null;
  onClose: () => void;
  onSaved: () => void;
  isPromptDataset?: boolean;
  readOnly?: boolean;
}

interface FieldDraft {
  id: string;
  name: string;
  format: string;
  description: string;
}

function schemaFieldType(format: string): FieldType {
  if (
    format === FieldType.Date ||
    format === FieldType.Integer ||
    format === FieldType.Number ||
    format === FieldType.String
  ) {
    return format;
  }
  return FieldType.String;
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

function FileFieldsEditor({
  title,
  help,
  emptyMessage,
  placeholder = 'Describe what this field contains...',
  fields,
  readOnly,
  onDescriptionChange,
  onDescriptionBlur,
}: {
  title: string;
  help: string;
  emptyMessage?: string;
  placeholder?: string;
  fields: FieldDraft[];
  readOnly: boolean;
  onDescriptionChange: (id: string, value: string) => void;
  onDescriptionBlur: (field: FieldDraft) => void;
}) {
  if (fields.length === 0 && !emptyMessage) return null;

  return (
    <div className="flex flex-col gap-1 border-t-1 border-solid border-baseGraySlateSolid6 pt-5">
      <Text variant="bodyMd" fontWeight="semibold">
        {title}
      </Text>
      <Text variant="bodySm" color="subdued" className="mt-1">
        {help}
      </Text>

      {fields.length === 0 ? (
        <div className="mt-3 flex items-start gap-2 rounded-2 border-1 border-solid border-borderCriticalDefault bg-surfaceCritical px-3 py-2">
          <IconAlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-textCritical"
          />
          <Text
            variant="bodyMd"
            fontWeight="medium"
            className="text-textCritical"
          >
            {emptyMessage}
          </Text>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-3"
            >
              <Text variant="bodySm" fontWeight="medium" className="font-mono">
                {field.name}
              </Text>
              <div className="mt-2">
                <TextField
                  name={`field-${field.id}`}
                  label={`Description for ${field.name}`}
                  labelHidden
                  placeholder={placeholder}
                  value={field.description}
                  disabled={readOnly}
                  multiline={2}
                  onChange={(value) => onDescriptionChange(field.id, value)}
                  onBlur={() => onDescriptionBlur(field)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  isPromptDataset = false,
  readOnly = false,
}: ResourceViewSheetProps) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
  }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptFormat, setPromptFormat] = useState('');
  const [hasSystemPrompt, setHasSystemPrompt] = useState(false);
  const [hasExampleResponses, setHasExampleResponses] = useState(false);
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<
    'idle' | 'loading' | 'ready' | 'unavailable'
  >('idle');
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!resourceId) return;

    const isSelectLayer = (node: EventTarget | null) =>
      node instanceof Element &&
      Boolean(
        node.closest(
          "[class*='Select-module_Popover'], [class*='Select-module_PopoverWrapper']"
        )
      );

    const keepSelectOpen = (event: Event) => {
      if (isSelectLayer(event.target)) event.preventDefault();
    };

    const keepSelectFocused = (event: FocusEvent) => {
      if (isSelectLayer(event.target) || isSelectLayer(event.relatedTarget)) {
        event.stopPropagation();
      }
    };

    document.addEventListener(
      'dismissableLayer.pointerDownOutside',
      keepSelectOpen,
      true
    );
    document.addEventListener(
      'dismissableLayer.focusOutside',
      keepSelectOpen,
      true
    );
    document.addEventListener('focusin', keepSelectFocused, true);
    document.addEventListener('focusout', keepSelectFocused, true);

    return () => {
      document.removeEventListener(
        'dismissableLayer.pointerDownOutside',
        keepSelectOpen,
        true
      );
      document.removeEventListener(
        'dismissableLayer.focusOutside',
        keepSelectOpen,
        true
      );
      document.removeEventListener('focusin', keepSelectFocused, true);
      document.removeEventListener('focusout', keepSelectFocused, true);
    };
  }, [resourceId]);

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
  const fileKey = resource
    ? [
        resource.id,
        resource.fileDetails?.file?.name ?? '',
        resource.fileDetails?.modified ?? '',
        (resource.schema ?? []).map((field) => field.id).join(','),
      ].join(':')
    : '';
  const [syncedKey, setSyncedKey] = useState('');
  const [openResourceId, setOpenResourceId] = useState(resourceId);
  if (resourceId !== openResourceId) {
    setOpenResourceId(resourceId);
    if (!resourceId) {
      setSyncedKey('');
      setTitle('');
      setDescription('');
      setPromptFormat('');
      setHasSystemPrompt(false);
      setHasExampleResponses(false);
      setFields([]);
      setShowPreview(false);
    }
  }
  if (resource && fileKey !== syncedKey) {
    setSyncedKey(fileKey);
    setTitle(resource.name ?? '');
    setDescription(resource.description ?? '');
    setPromptFormat(resource.promptDetails?.promptFormat ?? '');
    setHasSystemPrompt(Boolean(resource.promptDetails?.hasSystemPrompt));
    setHasExampleResponses(
      Boolean(resource.promptDetails?.hasExampleResponses)
    );
    setFields(
      (resource.schema ?? []).map((field) => ({
        id: field.id,
        name: field.fieldName,
        format: field.format,
        description: field.description ?? '',
      }))
    );
    setShowPreview(false);
  }

  const saveMutation = useMutation(
    (fileResourceInput: UpdateFileResourceInput) =>
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
    if (!resourceId || readOnly) return;
    const current =
      field === 'name' ? (resource?.name ?? '') : (resource?.description ?? '');
    if (value === current) return;
    if (field === 'name') {
      saveMutation.mutate({
        id: resourceId,
        name: value,
        ...(previewStaysEnabled(
          resource?.fileDetails?.format || resource?.fileDetails?.file?.name
        )
          ? enabledFilePreview
          : { previewEnabled: false }),
      });
      return;
    }
    saveMutation.mutate({
      id: resourceId,
      description: value,
      ...(previewStaysEnabled(
        resource?.fileDetails?.format || resource?.fileDetails?.file?.name
      )
        ? enabledFilePreview
        : { previewEnabled: false }),
    });
  };

  const promptMutation = useMutation(
    (updateInput: {
      resource: string;
      promptFormat?: string;
      hasSystemPrompt?: boolean;
      hasExampleResponses?: boolean;
    }) =>
      GraphQL(
        updatePromptResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { updateInput }
      ),
    {
      onSuccess: (result) => {
        if (!result.updatePromptResource.success) {
          toast('Unable to save prompt file details right now.');
          return;
        }
        toast('File changes saved');
        void resourceQuery.refetch();
        onSaved();
      },
      onError: (err: unknown) => {
        toast(
          getErrorMessage(err, 'Unable to save prompt file details right now.')
        );
      },
    }
  );

  const schemaMutation = useMutation(
    (field: FieldDraft) => {
      if (!resourceId) {
        return Promise.reject(new Error('No resource ID provided'));
      }
      return GraphQL(
        updateSchemaDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          schemaUpdateInput: {
            resource: resourceId,
            updates: [
              {
                id: field.id,
                description: field.description,
                format: schemaFieldType(field.format),
              },
            ],
          },
        }
      );
    },
    {
      onSuccess: () => {
        toast('File changes saved');
        void resourceQuery.refetch();
        onSaved();
      },
      onError: (err: unknown) => {
        toast(
          getErrorMessage(err, 'Unable to save field description right now.')
        );
      },
    }
  );

  const replaceMutation = useMutation(
    (file: File) => {
      if (!resourceId) {
        return Promise.reject(new Error('No resource ID provided'));
      }
      const fileResourceInput: UpdateFileResourceInput = {
        id: resourceId,
        file,
        ...(previewStaysEnabled(file.name)
          ? enabledFilePreview
          : { previewEnabled: false }),
      };
      return GraphQL(
        updateResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { fileResourceInput }
      );
    },
    {
      onSuccess: () => {
        toast('File replaced');
        void resourceQuery.refetch();
        onSaved();
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to replace this file right now.'));
      },
    }
  );

  const savePrompt = (patch: {
    promptFormat?: string;
    hasSystemPrompt?: boolean;
    hasExampleResponses?: boolean;
  }) => {
    if (!resourceId || readOnly) return;
    if (patch.promptFormat !== undefined) setPromptFormat(patch.promptFormat);
    if (patch.hasSystemPrompt !== undefined) {
      setHasSystemPrompt(patch.hasSystemPrompt);
    }
    if (patch.hasExampleResponses !== undefined) {
      setHasExampleResponses(patch.hasExampleResponses);
    }
    promptMutation.mutate({ resource: resourceId, ...patch });
  };

  const commitName = () => {
    const next = title.trim().slice(0, PROMPT_FILE_NAME_MAX_LENGTH);
    setTitle(next);
    saveField('name', next);
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
  const pdfUrl = resourceId
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${resourceId}`
    : '';

  const sheetTitle = isPromptDataset
    ? 'Prompt File Details'
    : title || 'File details';
  const sheetDescription = isPromptDataset
    ? readOnly
      ? 'This dataset is published — prompt file details are read-only.'
      : 'Configure metadata for this prompt file.'
    : 'Uploaded to this dataset.';
  const nameError =
    isPromptDataset && title.trim().length === 0
      ? 'Enter a prompt file name.'
      : undefined;
  const formatError =
    isPromptDataset && resource && !promptFormat
      ? 'Select a prompt format.'
      : undefined;
  const associatedName = originalName(resource?.fileDetails?.file?.name);
  const columnSchemaExpected = ['CSV', 'XLS', 'XLSX', 'JSON'].includes(format);

  const updateFieldDescription = (id: string, value: string) => {
    setFields((current) =>
      current.map((item) =>
        item.id === id ? { ...item, description: value } : item
      )
    );
  };

  const saveFieldDescription = (field: FieldDraft) => {
    const saved =
      resource?.schema?.find((item) => item.id === field.id)?.description ?? '';
    if (field.description === saved) return;
    schemaMutation.mutate(field);
  };

  const openPreview = async () => {
    if (!resourceId) return;
    setShowPreview(true);
    setPreviewStatus('loading');
    try {
      if (isPdf) {
        setPreviewStatus('ready');
        return;
      }
      await GraphQL(
        updateResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { fileResourceInput: { id: resourceId, ...enabledFilePreview } }
      );
      const result = await resourceQuery.refetch();
      const columnCount =
        result.data?.resourceById?.previewData?.columns?.length ?? 0;
      setPreviewStatus(columnCount > 0 ? 'ready' : 'unavailable');
    } catch {
      setPreviewStatus('unavailable');
    }
  };

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
          title={sheetTitle}
          className="flex h-[100svh] max-h-[100svh] flex-col !overflow-hidden p-0"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b-1 border-solid border-baseGraySlateSolid6 px-6 pb-2 pt-6">
            <div className="min-w-0">
              <Text
                variant="headingLg"
                as="h2"
                className="truncate text-[var(--blue-primary-color)]"
              >
                {sheetTitle}
              </Text>
              <Text variant="bodySm" color="subdued">
                {sheetDescription}
              </Text>
            </div>
            <IconButton
              size="slim"
              icon={IconX}
              onClick={onClose}
              tooltipSide="left"
            >
              Close
            </IconButton>
          </div>

          {resourceQuery.isLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Spinner size={32} />
            </div>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
                {isPromptDataset ? (
                  <>
                    <input
                      ref={replaceInputRef}
                      type="file"
                      accept={RESOURCE_FILE_ACCEPT}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (file) replaceMutation.mutate(file);
                      }}
                    />
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <Text variant="bodyMd" fontWeight="medium">
                          Prompt File Name{' '}
                          <span className="text-textCritical">*</span>
                        </Text>
                        <Text variant="bodySm" color="subdued">
                          {title.length}/{PROMPT_FILE_NAME_MAX_LENGTH}
                        </Text>
                      </div>
                      <TextField
                        name="prompt-file-name"
                        label="Prompt File Name"
                        labelHidden
                        value={title}
                        maxLength={PROMPT_FILE_NAME_MAX_LENGTH}
                        disabled={readOnly}
                        error={nameError}
                        onChange={(value) =>
                          setTitle(value.slice(0, PROMPT_FILE_NAME_MAX_LENGTH))
                        }
                        onBlur={commitName}
                      />
                    </div>

                    <div className="rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-2">
                      <Text
                        variant="bodySm"
                        fontWeight="medium"
                        color="subdued"
                        className="uppercase tracking-wide"
                      >
                        File associated with this prompt file
                      </Text>
                      <div className="mt-2 flex items-center gap-2">
                        <IconFile size={16} className="shrink-0" />
                        <Text
                          variant="bodyMd"
                          fontWeight="medium"
                          className="min-w-0 flex-1 truncate"
                        >
                          {associatedName}
                        </Text>
                        <Tag
                          fillColor="var(--base-gray-slate-solid-3)"
                          borderRadius="var(--border-radius-2)"
                        >
                          {format}
                        </Tag>
                      </div>
                      <Text variant="bodySm" className="text-textSuccess">
                        {resource?.fileDetails?.file
                          ? 'File available'
                          : 'File unavailable'}
                      </Text>
                      {readOnly ? null : (
                        <div className="mt-2">
                          <Button
                            kind="neutral"
                            size="medium"
                            loading={replaceMutation.isLoading}
                            icon={<Icon source={IconRefresh} size={16} />}
                            onClick={() => replaceInputRef.current?.click()}
                          >
                            Change file
                          </Button>
                        </div>
                      )}
                    </div>

                    <TextField
                      name="prompt-file-description"
                      label="File Description"
                      value={description}
                      disabled={readOnly}
                      onChange={setDescription}
                      onBlur={() =>
                        saveField('description', description.trim())
                      }
                      multiline={3}
                    />

                    <Select
                      name="prompt-format"
                      label="Prompt Format"
                      requiredIndicator
                      options={[...PROMPT_FORMAT_OPTIONS]}
                      value={promptFormat}
                      placeholder="Select a prompt format..."
                      disabled={readOnly}
                      error={formatError}
                      onChange={(value) => savePrompt({ promptFormat: value })}
                    />

                    <div className="flex flex-col gap-1 rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-3">
                      <Checkbox
                        name="prompt-has-system-prompt"
                        checked={hasSystemPrompt}
                        disabled={readOnly}
                        onChange={(checked) =>
                          savePrompt({ hasSystemPrompt: checked === true })
                        }
                      >
                        Contains System Prompt
                      </Checkbox>
                      <Text variant="bodySm" color="subdued">
                        This prompt file contains a system prompt.
                      </Text>
                    </div>

                    <div className="flex flex-col gap-1 rounded-2 border-1 border-solid border-baseGraySlateSolid6 p-3">
                      <Checkbox
                        name="prompt-has-example-responses"
                        checked={hasExampleResponses}
                        disabled={readOnly}
                        onChange={(checked) =>
                          savePrompt({
                            hasExampleResponses: checked === true,
                          })
                        }
                      >
                        Contains Example Responses
                      </Checkbox>
                      <Text variant="bodySm" color="subdued">
                        This prompt file contains example responses.
                      </Text>
                    </div>

                    <FileFieldsEditor
                      title="File Fields"
                      help="Describe what each field in this prompt file contains."
                      emptyMessage="This file's schema could not be read. Replace the file or try again."
                      fields={fields}
                      readOnly={readOnly}
                      onDescriptionChange={updateFieldDescription}
                      onDescriptionBlur={saveFieldDescription}
                    />
                  </>
                ) : (
                  <>
                    <TextField
                      name="resource-title"
                      label="Title"
                      value={title}
                      disabled={readOnly}
                      onChange={setTitle}
                      onBlur={() => saveField('name', title)}
                    />
                    <TextField
                      name="resource-description"
                      label="Description"
                      value={description}
                      disabled={readOnly}
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

                    <FileFieldsEditor
                      title="Columns"
                      help="Describe what each column contains. Column names stay as they are in the file."
                      placeholder="Describe what this column contains..."
                      emptyMessage={
                        columnSchemaExpected
                          ? "This file's schema could not be read. Replace the file or try again."
                          : undefined
                      }
                      fields={fields}
                      readOnly={readOnly}
                      onDescriptionChange={updateFieldDescription}
                      onDescriptionBlur={saveFieldDescription}
                    />
                  </>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-4">
                <Button
                  kind="neutral"
                  icon={<Icon source={Icons.eye} size={18} />}
                  onClick={() => void openPreview()}
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
      <Dialog
        open={showPreview}
        onOpenChange={(open) => {
          setShowPreview(open);
          if (!open) setPreviewStatus('idle');
        }}
      >
        <Dialog.Content
          large
          headerHidden
          className="rounded-2"
          title={title || 'Preview'}
          style={
            {
              top: '6vh',
              bottom: 'auto',
              height: 'auto',
              // maxHeight: '100vh',
              // transform: 'translateX(-50%)',
              overflow: 'auto',
              // '--show-from': 'translate(-50%, 2vh)',
              // '--show-to': 'translateX(-50%)',
              // '--hide-from': 'translateX(-50%)',
              // '--hide-to': 'translate(-50%, 2vh)',
            } as CSSProperties
          }
          footer={<span className="sr-only">Close the preview</span>}
          primaryAction={
            {
              content: 'Close Preview',
              onAction: () => setShowPreview(false),
              kind: 'neutral',
            } as {
              content: string;
              onAction: () => void;
            }
          }
        >
          <div className="sticky -top-5 z-2 -mx-5 -mt-5 mb-5 flex items-start justify-between gap-4 border-b-1 border-solid border-baseGraySlateSolid6 bg-[var(--surface-default,#fff)] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2 bg-baseGraySlateSolid3 text-[var(--blue-primary-color)]">
                {isPdf ? <IconFile size={20} /> : <IconTable size={20} />}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <Text
                  variant="headingMd"
                  fontWeight="semibold"
                  className="truncate"
                >
                  {title || 'Preview'}
                </Text>
                <Text variant="bodySm" color="subdued" className="truncate">
                  File Type: {format || '—'} • Size:{' '}
                  {formatFileSize(resource?.fileDetails?.size)} • Original:{' '}
                  {originalName(resource?.fileDetails?.file?.name)}
                </Text>
              </div>
            </div>
            <IconButton
              size="slim"
              icon={IconX}
              onClick={() => setShowPreview(false)}
            >
              Close preview
            </IconButton>
          </div>
          {previewStatus === 'loading' ? (
            isPdf ? (
              <PdfPreviewSkeleton height={PDF_PREVIEW_HEIGHT} />
            ) : (
              <TablePreviewSkeleton />
            )
          ) : previewStatus === 'ready' && isPdf ? (
            <div className="flex flex-col gap-2">
              <PdfPreview
                url={pdfUrl}
                height={PDF_PREVIEW_HEIGHT}
                onError={() => setPreviewStatus('unavailable')}
              />
              <Text variant="bodySm" color="subdued">
                Read-only preview.
              </Text>
            </div>
          ) : previewStatus === 'ready' &&
            (resource?.previewData?.columns?.length ?? 0) > 0 ? (
            <PreviewData
              previewData={{
                columns: resource?.previewData?.columns ?? [],
                rows: resource?.previewData?.rows ?? [],
              }}
            />
          ) : (
            <div className="rounded-4 bg-surfaceSubdued">
              <div className="mb-8 h-3.5" aria-hidden />
              <div
                className="flex flex-col items-center justify-center gap-2 text-center"
                style={{ height: TABLE_PREVIEW_HEIGHT }}
              >
                <IconFile size={32} className="text-textSubdued" />
                <Text fontWeight="medium">Preview unavailable</Text>
                <Text variant="bodySm" color="subdued">
                  The file will be available to download after publishing.
                </Text>
                <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left">
                  <Text variant="bodySm" color="subdued" className="font-mono">
                    File type
                  </Text>
                  <Text
                    variant="bodySm"
                    fontWeight="medium"
                    className="font-mono"
                  >
                    {format || '—'}
                  </Text>
                  <Text variant="bodySm" color="subdued" className="font-mono">
                    Size
                  </Text>
                  <Text
                    variant="bodySm"
                    fontWeight="medium"
                    className="font-mono"
                  >
                    {formatFileSize(resource?.fileDetails?.size)}
                  </Text>
                  <Text variant="bodySm" color="subdued" className="font-mono">
                    Original file
                  </Text>
                  <Text
                    variant="bodySm"
                    fontWeight="medium"
                    className="font-mono"
                  >
                    {originalName(resource?.fileDetails?.file?.name)}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  );
}
