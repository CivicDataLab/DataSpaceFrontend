'use client';

import { useEffect, useRef, useState } from 'react';
import { DatasetEditStatusProvider } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/dataset/[id]/edit/context';
import { PublicPlatformImport } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/dataset/[id]/edit/resources/components/PublicPlatformImport';
import { createResourceFilesDoc } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/dataset/[id]/edit/resources/components/query';
import {
  RESOURCE_FILE_ACCEPT,
  RESOURCE_FILE_TYPES,
} from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/dataset/[id]/edit/resources/components/ResourceDropzone';
import { graphql } from '@/gql';
import {
  DatasetAccessType,
  DatasetLicense,
  DatasetType,
} from '@/gql/generated/graphql';
import { IconFileSpreadsheet, IconWorld, IconX } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  DropZone,
  FileCard,
  Icon,
  IconButton,
  RadioGroup,
  RadioItem,
  SectionCard,
  Select,
  Sheet,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const MAX_RESOURCE_BYTES = 50 * 1024 * 1024;

const LICENSE_OPTIONS: Array<{ label: string; value: DatasetLicense }> = [
  {
    label: 'Government Open Data License',
    value: DatasetLicense.GovernmentOpenDataLicense,
  },
  {
    label: 'CC BY 4.0 (Attribution)',
    value: DatasetLicense.CcBy_4_0Attribution,
  },
  {
    label: 'CC BY-SA 4.0 (Attribution-ShareAlike)',
    value: DatasetLicense.CcBySa_4_0AttributionShareAlike,
  },
  {
    label: 'Open Data Commons By Attribution',
    value: DatasetLicense.OpenDataCommonsByAttribution,
  },
  {
    label: 'Open Database License',
    value: DatasetLicense.OpenDatabaseLicense,
  },
];

const updateDatasetTitleMutationDoc = graphql(`
  mutation SaveTitle($updateDatasetInput: UpdateDatasetInput!) {
    updateDataset(updateDatasetInput: $updateDatasetInput) {
      __typename
      ... on TypeDataset {
        id
        title
        created
      }
      ... on OperationInfo {
        messages {
          kind
          message
        }
      }
    }
  }
`);

const updateMetadataMutationDoc = graphql(`
  mutation SaveMetadata($UpdateMetadataInput: UpdateMetadataInput!) {
    addUpdateDatasetMetadata(updateMetadataInput: $UpdateMetadataInput) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
        nonFieldErrors
      }
      data {
        id
        description
        title
        tags {
          id
          value
        }
        sectors {
          id
          name
        }
        geographies {
          id
          name
          code
          type
        }
        license
        accessType
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          id
          value
        }
      }
    }
  }
`);

const createDatasetMutation = graphql(`
  mutation UseCaseWizardCreateDataset($createInput: CreateDatasetInput) {
    addDataset(createInput: $createInput) {
      success
      errors {
        fieldErrors {
          messages
        }
      }
      data {
        id
      }
    }
  }
`);

const assignUseCaseDatasetsDoc = graphql(`
  mutation assignUseCaseWizardDatasets(
    $useCaseId: String!
    $datasetIds: [UUID!]!
  ) {
    updateUsecaseDatasets(useCaseId: $useCaseId, datasetIds: $datasetIds) {
      ... on TypeUseCase {
        id
        datasets {
          id
          title
        }
      }
    }
  }
`);

const deleteDatasetMutationDoc = graphql(`
  mutation deleteDatasetMutation($datasetId: UUID!) {
    deleteDataset(datasetId: $datasetId)
  }
`);

interface DatasetSectorOption {
  label: string;
  value: string;
}

interface DatasetDraft {
  name: string;
  description: string;
  sectors: DatasetSectorOption[];
  accessType: DatasetAccessType | '';
  license: DatasetLicense | '';
}

interface FieldErrors {
  name?: string;
  description?: string;
  sector?: string;
  accessType?: string;
  license?: string;
}

type UploadTab = 'upload' | 'platform';

const emptyDraft: DatasetDraft = {
  name: '',
  description: '',
  sectors: [],
  accessType: '',
  license: '',
};

export interface AddDatasetSheetProps {
  open: boolean;
  onClose: () => void;
  useCaseId?: string;
  ownerArgs: Record<string, string>;
  sectors: DatasetSectorOption[];
  connectedDatasetIds: string[];
  onAdded: () => void;
  onBusy?: (busy: boolean) => void;
  onConnect?: (datasetId: string) => Promise<void>;
  intro?: string;
  successMessage?: string;
  descriptionPlaceholder?: string;
}

function isLicense(value: string): value is DatasetLicense {
  return LICENSE_OPTIONS.some((option) => option.value === value);
}

function isAccess(value: string): value is DatasetAccessType {
  return (
    value === DatasetAccessType.Public || value === DatasetAccessType.Restricted
  );
}

function isUploadTab(value: string): value is UploadTab {
  return value === 'upload' || value === 'platform';
}

function selectMenuIsOpen(): boolean {
  return Array.from(
    document.querySelectorAll(
      '[class*="Select-module_Popover__"], [class*="Combobox-module_Popover__"]'
    )
  ).some((node) => node instanceof HTMLElement && !node.hidden);
}

function selectedSectors(
  value: DatasetSectorOption[] | string
): DatasetSectorOption[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is DatasetSectorOption =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.label === 'string' &&
      typeof item.value === 'string'
  );
}

function fieldErrors(form: DatasetDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Dataset name is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (form.sectors.length === 0) {
    errors.sector = 'Sector is required';
  }
  if (!isAccess(form.accessType)) {
    errors.accessType = 'Access type is required';
  }
  if (!isLicense(form.license)) errors.license = 'License is required';
  return errors;
}

function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function fileKey(files: File[]): string {
  return files
    .map((file) => `${file.name}:${file.size}:${file.lastModified}`)
    .join('|');
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message.trim();
  }
  return fallback;
}

function metadataErrorMessage(
  errors:
    | {
        fieldErrors?: Array<{ messages: Array<string> }> | null;
        nonFieldErrors?: Array<string> | null;
      }
    | null
    | undefined
): string {
  return (
    errors?.fieldErrors?.[0]?.messages[0] ??
    errors?.nonFieldErrors?.[0] ??
    'Unable to save dataset details.'
  );
}

export function AddDatasetSheet({
  open,
  onClose,
  useCaseId,
  ownerArgs,
  sectors,
  connectedDatasetIds,
  onAdded,
  onBusy,
  onConnect,
  intro = 'Create the essential dataset information and connect it to this Use Case.',
  successMessage = 'Dataset created and added to this Use Case',
  descriptionPlaceholder = 'Briefly describe what this dataset contains and how it relates to this Use Case.',
}: AddDatasetSheetProps): React.ReactElement {
  const [form, setForm] = useState<DatasetDraft>(emptyDraft);
  const [files, setFiles] = useState<File[]>([]);
  const [tab, setTab] = useState<UploadTab>('upload');
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const createdIdRef = useRef<string | null>(null);
  const connectedRef = useRef(false);
  const uploadedKeyRef = useRef('');

  useEffect(() => {
    if (open) return;
    setForm(emptyDraft);
    setFiles([]);
    setTab('upload');
    setShowErrors(false);
    uploadedKeyRef.current = '';
    connectedRef.current = false;
  }, [open]);

  useEffect(() => {
    onBusy?.(saving);
    return () => onBusy?.(false);
  }, [onBusy, saving]);

  const errors = showErrors ? fieldErrors(form) : {};

  const discardUnassignedDraft = async (): Promise<void> => {
    const datasetId = createdIdRef.current;
    createdIdRef.current = null;
    uploadedKeyRef.current = '';
    if (!datasetId || connectedRef.current) return;
    try {
      await GraphQL(deleteDatasetMutationDoc, ownerArgs, { datasetId });
    } catch (error: unknown) {
      toast(
        getErrorMessage(
          error,
          'The dataset was created but could not be removed.'
        )
      );
    }
  };

  const handleClose = (): void => {
    if (saving) return;
    if (!connectedRef.current) {
      void discardUnassignedDraft();
    }
    onClose();
  };

  const handleDrop = (_dropped: File[], accepted: File[]): void => {
    const incoming = accepted.length > 0 ? accepted : _dropped;
    if (incoming.length === 0) return;

    const allowed = new Set<string>(RESOURCE_FILE_TYPES);
    const oversized = incoming.filter((file) => file.size > MAX_RESOURCE_BYTES);
    const unsupported = incoming.filter((file) => {
      const extension = file.name.split('.').pop()?.toUpperCase() ?? '';
      return !allowed.has(extension);
    });
    if (oversized.length > 0) {
      toast('Maximum file size limit: 50MB');
    }
    if (unsupported.length > 0) {
      toast('That file type is not supported.');
    }

    const next = incoming.filter((file) => {
      const extension = file.name.split('.').pop()?.toUpperCase() ?? '';
      return file.size <= MAX_RESOURCE_BYTES && allowed.has(extension);
    });
    if (next.length === 0) return;

    setFiles((current) => {
      const seen = new Set(current.map((file) => fileKey([file])));
      const added = next.filter((file) => !seen.has(fileKey([file])));
      return [...current, ...added];
    });
  };

  const handleSave = async (): Promise<void> => {
    const nextErrors = fieldErrors(form);
    if (hasFieldErrors(nextErrors)) {
      setShowErrors(true);
      return;
    }
    if (!isLicense(form.license) || !isAccess(form.accessType)) return;

    setSaving(true);
    try {
      let datasetId = createdIdRef.current;
      if (!datasetId) {
        const created = await GraphQL(createDatasetMutation, ownerArgs, {
          createInput: { datasetType: DatasetType.Data },
        });
        const newId = created.addDataset.data?.id;
        if (!created.addDataset.success || !newId) {
          toast(
            created.addDataset.errors?.fieldErrors?.[0]?.messages[0] ??
              'Unable to create dataset'
          );
          return;
        }
        datasetId = String(newId);
        createdIdRef.current = datasetId;
      }

      const titled = await GraphQL(updateDatasetTitleMutationDoc, ownerArgs, {
        updateDatasetInput: {
          dataset: datasetId,
          title: form.name.trim(),
        },
      });
      if (titled.updateDataset.__typename !== 'TypeDataset') {
        toast(
          titled.updateDataset.messages[0]?.message ??
            'Unable to save the dataset name.'
        );
        return;
      }

      const metadata = await GraphQL(updateMetadataMutationDoc, ownerArgs, {
        UpdateMetadataInput: {
          dataset: datasetId,
          description: form.description.trim(),
          sectors: form.sectors.map((sector) => sector.value),
          license: form.license,
          accessType: form.accessType,
          metadata: [],
        },
      });
      if (!metadata.addUpdateDatasetMetadata.success) {
        toast(metadataErrorMessage(metadata.addUpdateDatasetMetadata.errors));
        return;
      }

      const currentFileKey = fileKey(files);
      if (currentFileKey && uploadedKeyRef.current !== currentFileKey) {
        await GraphQL(createResourceFilesDoc, ownerArgs, {
          fileResourceInput: {
            dataset: datasetId,
            files,
          },
        });
        uploadedKeyRef.current = currentFileKey;
      }

      if (onConnect) {
        await onConnect(datasetId);
      } else if (useCaseId) {
        const assigned = await GraphQL(assignUseCaseDatasetsDoc, ownerArgs, {
          useCaseId,
          datasetIds: Array.from(new Set([...connectedDatasetIds, datasetId])),
        });
        if (
          !('id' in assigned.updateUsecaseDatasets) ||
          !assigned.updateUsecaseDatasets.id
        ) {
          toast('Unable to connect the dataset to this Use Case.');
          return;
        }
      } else {
        toast('Unable to connect the dataset.');
        return;
      }

      connectedRef.current = true;
      createdIdRef.current = null;
      toast(successMessage);
      onAdded();
      onClose();
    } catch (error: unknown) {
      toast(getErrorMessage(error, 'Unable to create the dataset right now.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (selectMenuIsOpen()) return;
          handleClose();
        }
      }}
    >
      <Sheet.Content
        side="right"
        size="wide"
        title="Add Dataset"
        className="flex !h-[100svh] !max-h-[100svh] flex-col !overflow-hidden p-0"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b-1 border-solid border-baseGraySlateSolid6 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <Text
              variant="headingLg"
              as="h2"
              className="text-[var(--blue-primary-color)] "
            >
              Add Dataset
            </Text>
            <Text variant="bodySm" color="subdued">
              {intro}
            </Text>
          </div>
          <IconButton
            size="slim"
            icon={IconX}
            onClick={handleClose}
            disabled={saving}
          >
            Close
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <div className="flex flex-col gap-4">
            <Tabs
              value={tab}
              onValueChange={(next) => {
                if (isUploadTab(next)) setTab(next);
              }}
            >
              <TabList boxed>
                <Tab value="upload" icon={IconFileSpreadsheet}>
                  File Upload
                </Tab>
                <Tab value="platform" icon={IconWorld}>
                  Public Platform
                </Tab>
              </TabList>
              <TabPanel
                value="upload"
                forceMount
                style={tab === 'upload' ? undefined : { display: 'none' }}
              >
                <div className="flex flex-col gap-4 pt-4">
                  <SectionCard title="Upload Dataset File">
                    <DropZone
                      accept={RESOURCE_FILE_ACCEPT}
                      name="dataset_files"
                      label="Upload dataset file"
                      labelHidden
                      allowMultiple
                      disabled={saving}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center gap-3 bg-baseGraySlateSolid2 py-8">
                        <Icon
                          source={Icons.dropzone}
                          size={36}
                          color="subdued"
                        />
                        <Text fontWeight="medium">
                          Drag and drop files here, or click to browse.
                        </Text>
                        <div className="flex flex-col items-center gap-2">
                          <Text variant="bodySm" color="subdued">
                            Supported file types:
                          </Text>
                          <div className="flex flex-wrap justify-center gap-2">
                            {RESOURCE_FILE_TYPES.map((type) => (
                              <span
                                key={type}
                                className="text-black rounded-full border-1 border-solid border-baseGraySlateSolid8 bg-baseGraySlateSolid3 px-2 text-75"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          kind="secondary"
                          className="rounded-2 border-1 border-solid border-baseGraySlateSolid8 bg-white text-[var(--base-default)]"
                        >
                          Browse File
                        </Button>
                        <Text variant="bodySm" color="subdued">
                          Maximum file size limit: 50MB
                        </Text>
                      </div>
                    </DropZone>
                  </SectionCard>
                  <SectionCard title={`Uploaded Files (${files.length})`}>
                    {files.length === 0 ? (
                      <Text
                        variant="bodySm"
                        color="subdued"
                        alignment="center"
                        as="p"
                      >
                        No files uploaded yet.
                      </Text>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {files.map((file) => {
                          const extension =
                            file.name.split('.').pop()?.toUpperCase() || 'FILE';
                          return (
                            <FileCard
                              key={fileKey([file])}
                              name={file.name.replace(/\.[^/.]+$/, '')}
                              format={extension}
                              size={formatFileSize(file.size)}
                              uploadedAt="—"
                              originalName={file.name}
                              status="ready"
                              onDelete={() => {
                                setFiles((current) =>
                                  current.filter(
                                    (item) =>
                                      fileKey([item]) !== fileKey([file])
                                  )
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>
                </div>
              </TabPanel>
              <TabPanel
                value="platform"
                forceMount
                style={tab === 'platform' ? undefined : { display: 'none' }}
              >
                <div className="pt-4">
                  <DatasetEditStatusProvider>
                    <PublicPlatformImport />
                  </DatasetEditStatusProvider>
                </div>
              </TabPanel>
            </Tabs>

            <SectionCard title="Dataset Details">
              <div className="flex flex-col gap-4">
                <TextField
                  name="datasetName"
                  label="Dataset Name"
                  requiredIndicator
                  value={form.name}
                  placeholder="e.g. Maternal Health Indicator Dataset"
                  error={errors.name}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, name: value }))
                  }
                />
                <TextField
                  name="description"
                  label="Description"
                  requiredIndicator
                  multiline={4}
                  value={form.description}
                  placeholder={descriptionPlaceholder}
                  error={errors.description}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, description: value }))
                  }
                />
                <Combobox
                  displaySelected
                  name="sectors"
                  label="Sector"
                  requiredIndicator
                  list={sectors}
                  selectedValue={form.sectors}
                  error={errors.sector}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      sectors: selectedSectors(value),
                    }))
                  }
                />
              </div>
            </SectionCard>

            <SectionCard title="License & Access">
              <div className="flex flex-col gap-4">
                <RadioGroup
                  name="accessType"
                  title="Access Type"
                  requiredIndicator
                  variant="card"
                  value={form.accessType}
                  error={errors.accessType}
                  onChange={(selected) => {
                    if (!isAccess(selected)) return;
                    setForm((current) => ({
                      ...current,
                      accessType: selected,
                    }));
                  }}
                >
                  <div className="flex flex-row gap-4">
                    <RadioItem
                      value={DatasetAccessType.Public}
                      helpText="Anyone can browse and download"
                      className="flex-1"
                    >
                      Open Access
                    </RadioItem>
                    <RadioItem
                      className="flex-1"
                      value={DatasetAccessType.Restricted}
                      helpText="Requires approval to access"
                    >
                      Restricted Access
                    </RadioItem>
                  </div>
                </RadioGroup>
                <Select
                  name="license"
                  label="License"
                  requiredIndicator
                  placeholder="Select a license..."
                  options={LICENSE_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  value={form.license}
                  error={errors.license}
                  onChange={(value) => {
                    if (!isLicense(value)) return;
                    setForm((current) => ({ ...current, license: value }));
                  }}
                />
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-4">
          <Button kind="tertiary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            kind="primary"
            className="rounded-2 bg-[var(--blue-primary-color)] text-white hover:bg-[var(--blue-primary-text)]"
            onClick={() => {
              void handleSave();
            }}
            loading={saving}
          >
            Create & Add Dataset
          </Button>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
