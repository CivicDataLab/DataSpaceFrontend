'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  CollaborativeInputPartial,
  UpdateCollaborativeMetadataInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  DropZone,
  SectionCard,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  errorMessage,
  isCollaborativeAboutComplete,
  plainSummary,
} from '../../collaborative-summary';
import { useCollaborativeEditStatus } from '../../context';
import styles from '../../edit.module.scss';
import {
  FetchCollaborative,
  FetchCollaborativeMetadata,
  geographiesListQueryDoc,
  sdgsListQueryDoc,
  sectorsListQueryDoc,
  tagsListQueryDoc,
  UpdateCollaborativeMetadata,
  UpdateCollaborativeMutation,
} from '../../wizard-documents';

interface SelectOption {
  label: string;
  value: string;
}

interface UploadedImage {
  name?: string | null;
  path?: string | null;
  url?: string | null;
}

interface AboutForm {
  title: string;
  summary: string;
  platformUrl: string;
  slug: string;
  sectors: SelectOption[];
  sdgs: SelectOption[];
  tags: SelectOption[];
  geographies: SelectOption[];
}

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function mediaUrl(file?: UploadedImage | null) {
  const raw = file?.url || file?.path;
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${raw.replace('/code/files/', '')}`;
}

function imageName(file: File | UploadedImage) {
  if (file instanceof File) return file.name;
  const raw = file.name || file.path || 'Collaborative image';
  return raw.split('/').pop() || raw;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes >= 10 ? Math.round(megabytes) : megabytes.toFixed(1)}MB`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sdgLabel(item: {
  number?: number | null;
  code?: string | null;
  name?: string | null;
}) {
  const num = item.number
    ? String(item.number).padStart(2, '0')
    : (item.code ?? '').replace('SDG', '').padStart(2, '0');
  return `${num}. ${item.name ?? ''}`;
}

function asOptions(value: unknown): SelectOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return [{ label: item, value: item }];
    if (item && typeof item === 'object' && 'value' in item) {
      const record = item as { label?: string; value?: string };
      const optionValue = String(record.value ?? '');
      if (!optionValue && !record.label) return [];
      return [{ label: record.label ?? optionValue, value: optionValue }];
    }
    return [];
  });
}

function comboValues(value: SelectOption[], key: 'value' | 'label') {
  return value.map((item) => String(item[key] ?? ''));
}

function CollaborativeImageField({
  label,
  description,
  hint,
  name,
  image,
  onSelect,
  onRemove,
}: {
  label: string;
  description: string;
  hint: string;
  name: string;
  image: File | UploadedImage | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [knownBytes, setKnownBytes] = useState<number | null>(null);

  useEffect(() => {
    if (!image) {
      setPreview('');
      setKnownBytes(null);
      return;
    }
    if (!(image instanceof File)) {
      setPreview(mediaUrl(image));
      setKnownBytes(null);
      return;
    }
    setKnownBytes(image.size);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <Text variant="bodyMd" fontWeight="medium">
          {label}
        </Text>
        <Text variant="bodySm" color="subdued">
          {description}
        </Text>
      </div>
      <div className="mt-3">
        <input
          ref={inputRef}
          className={styles.thumbnailInput}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
            event.target.value = '';
          }}
        />
        {preview ? (
          <div className="flex flex-col gap-2">
            <div className={styles.thumbnailRow}>
              <Image
                src={preview}
                alt={label}
                width={200}
                height={200}
                loading="lazy"
                className={styles.thumbnailPreview}
              />
              <div className={styles.thumbnailMeta}>
                <Text variant="bodyMd" fontWeight="semibold" truncate>
                  {image ? imageName(image) : label}
                </Text>
                {knownBytes ? (
                  <Text variant="bodySm" color="subdued">
                    {formatFileSize(knownBytes)}
                  </Text>
                ) : null}
              </div>
              <div className={styles.thumbnailActions}>
                <Button
                  kind="neutral"
                  size="medium"
                  onClick={() => inputRef.current?.click()}
                >
                  Replace
                </Button>
                <Button kind="tertiary" size="slim" onClick={onRemove}>
                  Remove
                </Button>
              </div>
            </div>
            <Text variant="bodySm" color="disabled">
              {hint}
            </Text>
          </div>
        ) : (
          <DropZone
            name={name}
            type="image"
            accept=".jpg,.jpeg,.png,.webp,.svg"
            allowMultiple={false}
            onDrop={(_files, accepted) => {
              if (accepted[0]) onSelect(accepted[0]);
            }}
          >
            <DropZone.FileUpload
              actionTitle="Browse File"
              actionHint={`Drag and drop an image here, or click to browse. ${hint}`}
            />
          </DropZone>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const {
    setStatus,
    setAboutCompleted,
    setStepShowErrors,
    registerBeforeNavigateHandler,
    stepShowErrors,
  } = useCollaborativeEditStatus();
  const ownerArgs = { [params.entityType]: params.entitySlug };

  const basicQuery = useQuery(
    [`fetch_collaborative_about_${params.id}`],
    () =>
      GraphQL(FetchCollaborative, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: true }
  );
  const metadataQuery = useQuery(
    [`fetch_collaborative_about_metadata_${params.id}`],
    () =>
      GraphQL(FetchCollaborativeMetadata, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: true }
  );
  const sectorsQuery = useQuery([`collaborative_wizard_sectors`], () =>
    GraphQL(sectorsListQueryDoc, ownerArgs)
  );
  const tagsQuery = useQuery([`collaborative_wizard_tags`], () =>
    GraphQL(tagsListQueryDoc, ownerArgs)
  );
  const sdgsQuery = useQuery([`collaborative_wizard_sdgs`], () =>
    GraphQL(sdgsListQueryDoc, ownerArgs)
  );
  const geosQuery = useQuery([`collaborative_wizard_geos`], () =>
    GraphQL(geographiesListQueryDoc, ownerArgs)
  );

  const basic = basicQuery.data?.collaboratives?.[0];
  const classified = metadataQuery.data?.collaboratives?.[0];

  const [form, setForm] = useState<AboutForm>({
    title: '',
    summary: '',
    platformUrl: '',
    slug: '',
    sectors: [],
    sdgs: [],
    tags: [],
    geographies: [],
  });
  const formRef = useRef(form);
  formRef.current = form;
  const [logo, setLogo] = useState<File | UploadedImage | null>(null);
  const [coverImage, setCoverImage] = useState<File | UploadedImage | null>(
    null
  );

  const hydratedBasic = useRef(false);
  const hydratedClass = useRef(false);

  useEffect(() => {
    if (!basic || hydratedBasic.current) return;
    hydratedBasic.current = true;
    setForm((prev) => ({
      ...prev,
      title: basic.title ?? '',
      summary: basic.summary ?? '',
      platformUrl: basic.platformUrl ?? '',
      slug: basic.slug ?? '',
    }));
    setLogo(basic.logo ?? null);
    setCoverImage(basic.coverImage ?? null);
  }, [basic]);

  useEffect(() => {
    if (!classified || hydratedClass.current) return;
    hydratedClass.current = true;
    setForm((prev) => ({
      ...prev,
      sectors:
        classified.sectors?.map((item) => ({
          label: item.name ?? '',
          value: item.id,
        })) ?? [],
      sdgs:
        classified.sdgs?.map((item) => ({
          label: sdgLabel(item),
          value: item.id,
        })) ?? [],
      tags:
        classified.tags?.map((item) => ({
          label: item.value ?? '',
          value: item.id,
        })) ?? [],
      geographies:
        classified.geographies?.map((item) => ({
          label: item.name ?? '',
          value: item.id,
        })) ?? [],
    }));
  }, [classified]);

  useEffect(() => {
    setAboutCompleted(isCollaborativeAboutComplete(form));
  }, [form, setAboutCompleted]);

  const { mutateAsync: saveCollaborative, isLoading: savingCollaborative } =
    useMutation(
      (data: { data: CollaborativeInputPartial }) =>
        GraphQL(UpdateCollaborativeMutation, ownerArgs, data),
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [`collaborative_wizard_${params.id}`],
          });
          void basicQuery.refetch();
        },
        onError: (error: unknown) => {
          toast(errorMessage(error, 'Unable to save this collaborative.'));
        },
      }
    );

  const { mutate: saveMetadata, isLoading: savingMetadata } = useMutation(
    (input: UpdateCollaborativeMetadataInput) =>
      GraphQL(UpdateCollaborativeMetadata, ownerArgs, {
        updateMetadataInput: input,
      }),
    {
      onSuccess: () => {
        void metadataQuery.refetch();
        void tagsQuery.refetch();
        void queryClient.invalidateQueries({
          queryKey: [`collaborative_wizard_${params.id}`],
        });
      },
      onError: (error: unknown) => {
        toast(errorMessage(error, 'Unable to save classification right now.'));
      },
    }
  );

  const persistAbout = useCallback(
    async (next = formRef.current) => {
      const slug = next.slug.trim() || slugify(next.title);
      await saveCollaborative({
        data: {
          id: params.id,
          title: next.title,
          summary: next.summary,
          platformUrl: next.platformUrl,
          ...(slug ? { slug } : {}),
        },
      });
    },
    [params.id, saveCollaborative]
  );

  const persistMetadata = useCallback(
    (next = formRef.current) => {
      saveMetadata({
        id: params.id,
        metadata:
          classified?.metadata?.map((item) => ({
            id: item.metadataItem.id,
            value: item.value ?? '',
          })) ?? [],
        sectors: comboValues(next.sectors, 'value'),
        tags: comboValues(next.tags, 'label'),
        sdgs: comboValues(next.sdgs, 'value'),
        geographies: comboValues(next.geographies, 'value').map((value) =>
          parseInt(value, 10)
        ),
      });
    },
    [classified?.metadata, params.id, saveMetadata]
  );

  const saveImage = (field: 'logo' | 'coverImage', file: File | null) => {
    if (file && file.size > MAX_IMAGE_BYTES) {
      toast('Image must be 20MB or smaller.');
      return;
    }
    if (field === 'logo') setLogo(file);
    else setCoverImage(file);
    void saveCollaborative({
      data: {
        id: params.id,
        [field]: file,
      },
    })
      .then((res) => {
        const next = res.updateCollaborative;
        if (!next || !('logo' in next)) return;
        if (field === 'logo') setLogo(next.logo ?? null);
        else setCoverImage(next.coverImage ?? null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    registerBeforeNavigateHandler(() => persistAbout());
    return () => registerBeforeNavigateHandler(null);
  }, [persistAbout, registerBeforeNavigateHandler]);

  useEffect(() => {
    setStatus(savingCollaborative || savingMetadata ? 'loading' : 'success');
  }, [savingCollaborative, savingMetadata, setStatus]);

  const formReady =
    !basicQuery.isLoading &&
    !metadataQuery.isLoading &&
    !sectorsQuery.isLoading &&
    !tagsQuery.isLoading &&
    !sdgsQuery.isLoading &&
    !geosQuery.isLoading;

  useEffect(() => {
    if (!formReady) return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    setStepShowErrors(true);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [formReady, setStepShowErrors]);

  if (!formReady) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const titleError =
    stepShowErrors && !form.title.trim()
      ? 'Enter a Collaborative name'
      : undefined;
  const summaryError =
    stepShowErrors && !plainSummary(form.summary)
      ? 'Add a description to continue'
      : undefined;
  const sectorError =
    stepShowErrors && form.sectors.length === 0
      ? 'Select at least one sector'
      : undefined;
  const sdgError =
    stepShowErrors && form.sdgs.length === 0
      ? 'Select at least one SDG goal'
      : undefined;

  const handleClassChange = (field: keyof AboutForm, value: unknown) => {
    const next = { ...formRef.current, [field]: asOptions(value) };
    setForm(next);
    persistMetadata(next);
  };

  return (
    <div className="flex flex-col gap-6 px-6">
      <SectionCard
        title="Basic Information"
        description="Introduce this content with a title, summary and image."
      >
        <div id="basic-information" className="flex flex-col gap-5">
          <CollaborativeImageField
            label="Cover Image"
            description="Add a wide image that represents this Collaborative."
            hint="JPG, PNG, WEBP or SVG. 16:9 recommended (1280x720). Max 20MB."
            name="coverImage"
            image={coverImage}
            onSelect={(file) => saveImage('coverImage', file)}
            onRemove={() => saveImage('coverImage', null)}
          />
          <CollaborativeImageField
            label="Logo"
            description="Optional. Add a square logo for this Collaborative."
            hint="JPG, PNG, WEBP or SVG. Square image recommended (400x400). Max 20MB."
            name="logo"
            image={logo}
            onSelect={(file) => saveImage('logo', file)}
            onRemove={() => saveImage('logo', null)}
          />

          <div id="collaborative-name">
            <TextField
              label="Collaborative Name"
              name="title"
              required
              requiredIndicator
              value={form.title}
              error={titleError}
              helpText="Use a clear name that describes the initiative."
              onChange={(value) =>
                setForm((prev) => ({ ...prev, title: value }))
              }
              onBlur={() => persistAbout()}
            />
          </div>
          <div id="description">
          <RichTextEditor
            label="Description *"
            value={form.summary}
            error={summaryError}
            helpText="Describe the problem this Collaborative addresses, why collaboration is needed, and what the initiative aims to achieve."
            placeholder="Describe this Collaborative..."
            onChange={(value) =>
              setForm((prev) => ({ ...prev, summary: value }))
            }
            onBlur={(value) => {
              const next = { ...formRef.current, summary: value };
              setForm(next);
              persistAbout(next);
            }}
          />
          </div>
          <TextField
            label="External Link"
            name="platformUrl"
            type="url"
            value={form.platformUrl}
            helpText="Add a link to the Collaborative's website or external resource."
            onChange={(value) =>
              setForm((prev) => ({ ...prev, platformUrl: value }))
            }
            onBlur={() => persistAbout()}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Classification"
        description="Add sectors and topics to help people discover this content."
      >
        <div id="classification" className="grid gap-5">
          <div id="sectors">
          <Combobox
            displaySelected
            required
            requiredIndicator
            name="sectors"
            label="Sectors"
            error={sectorError}
            list={
              sectorsQuery.data?.sectors?.map((item) => ({
                label: item.name,
                value: item.id,
              })) || []
            }
            selectedValue={form.sectors}
            onChange={(value) => handleClassChange('sectors', value)}
          />
          </div>
          <div id="sdgs">
          <Combobox
            displaySelected
            required
            requiredIndicator
            name="sdgs"
            label="SDG Goals"
            error={sdgError}
            list={
              sdgsQuery.data?.sdgs?.map((item) => ({
                label: sdgLabel(item),
                value: item.id,
              })) || []
            }
            selectedValue={form.sdgs}
            onChange={(value) => handleClassChange('sdgs', value)}
          />
          </div>
          <Combobox
            displaySelected
            creatable
            name="tags"
            label="Tags"
            placeholder="Type a tag and press Enter..."
            list={
              tagsQuery.data?.tags?.map((item) => ({
                label: item.value ?? '',
                value: item.id,
              })) || []
            }
            selectedValue={form.tags}
            onChange={(value) => handleClassChange('tags', value)}
          />
          <Combobox
            displaySelected
            name="geographies"
            label="Geography"
            placeholder="Select geographies..."
            list={
              geosQuery.data?.geographies?.map((item) => ({
                label: `${item.name}${item.parentId ? ` (${item.parentId.name})` : ''}`,
                value: item.id,
              })) || []
            }
            selectedValue={form.geographies}
            onChange={(value) => handleClassChange('geographies', value)}
          />
        </div>
      </SectionCard>
    </div>
  );
}
