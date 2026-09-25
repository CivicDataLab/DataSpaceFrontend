'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DropZone,
  SectionCard,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { ContentEditor } from '../../components/ContentEditor';
import {
  extractEmbedUrl,
  parseUseCaseContent,
  serializeUseCaseContent,
  type UseCaseContentDocument,
} from '../../content-document';
import { useUseCaseEditStatus } from '../../context';
import styles from '../../edit.module.scss';
import { isUseCaseBuilderComplete } from '../../usecase-summary';

interface UploadedImage {
  name?: string | null;
  path?: string | null;
  url?: string | null;
}

const FetchUseCaseBuilder = graphql(`
  query UseCaseBuilderData($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
      summary
      logo {
        name
        path
        url
      }
    }
  }
`);

const UpdateUseCaseBuilder = graphql(`
  mutation updateUseCaseBuilder($data: UseCaseInputPartial!) {
    updateUseCase(data: $data) {
      __typename
      id
      title
      summary
      logo {
        name
        path
        url
      }
    }
  }
`);

const dashboardListQuery = graphql(`
  query useCaseBuilderDashboards($usecaseId: Int!) {
    usecaseDashboards(usecaseId: $usecaseId) {
      id
      name
      link
    }
  }
`);

const addDashboardMutation = graphql(`
  mutation addUseCaseBuilderDashboard(
    $usecaseId: Int!
    $name: String
    $link: String
  ) {
    addUsecaseDashboard(usecaseId: $usecaseId, name: $name, link: $link) {
      success
      data {
        id
        name
        link
      }
    }
  }
`);

const updateDashboardMutation = graphql(`
  mutation updateUseCaseBuilderDashboard(
    $id: String!
    $name: String
    $link: String
  ) {
    updateUsecaseDashboard(id: $id, name: $name, link: $link) {
      success
      data {
        id
        name
        link
      }
    }
  }
`);

const chartListQuery = graphql(`
  query UseCaseWizardCharts {
    getChartData {
      __typename
      ... on TypeResourceChart {
        name
        id
      }
      ... on TypeResourceChartImage {
        name
        id
      }
    }
  }
`);

const MAX_THUMBNAIL_BYTES = 20 * 1024 * 1024;

function mediaUrl(file?: UploadedImage | null) {
  const raw = file?.url || file?.path;
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${raw.replace('/code/files/', '')}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes >= 10 ? Math.round(megabytes) : megabytes.toFixed(1)}MB`;
}

function thumbnailName(file: File | UploadedImage) {
  if (file instanceof File) return file.name;
  const raw = file.name || file.path || 'Thumbnail';
  return raw.split('/').pop() || raw;
}

export default function BuilderPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const {
    setStatus,
    setBuilderCompleted,
    registerBeforeNavigateHandler,
    stepShowErrors,
  } = useUseCaseEditStatus();

  const usecaseId = Number.parseInt(params.id, 10);
  const ownerArgs = { [params.entityType]: params.entitySlug };

  const builderQuery = useQuery(
    [`fetch_UseCaseBuilder`, params.id, params.entityType, params.entitySlug],
    () =>
      GraphQL(FetchUseCaseBuilder, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: true }
  );

  const dashboardsQuery = useQuery(
    [`fetch_UseCaseBuilderDashboards`, params.id],
    () => GraphQL(dashboardListQuery, ownerArgs, { usecaseId }),
    { enabled: !Number.isNaN(usecaseId) }
  );

  const chartsQuery = useQuery([`use_case_wizard_charts`], () =>
    GraphQL(chartListQuery, ownerArgs)
  );

  const useCase = builderQuery.data?.useCases?.[0];
  const savedDashboard = dashboardsQuery.data?.usecaseDashboards?.[0];

  const [title, setTitle] = useState('');
  const [logo, setLogo] = useState<File | UploadedImage | null>(null);
  const [knownBytes, setKnownBytes] = useState<number | null>(null);
  const [remoteBytes, setRemoteBytes] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [contentDoc, setContentDoc] = useState<UseCaseContentDocument>({
    version: 1,
    subtitle: '',
    blocks: [],
  });
  const [embedCode, setEmbedCode] = useState('');
  const contentDocRef = useRef(contentDoc);
  contentDocRef.current = contentDoc;
  const titleRef = useRef(title);
  titleRef.current = title;

  useEffect(() => {
    if (!useCase) return;
    setTitle(useCase.title ?? '');
    setLogo(useCase.logo ?? null);
    setContentDoc(parseUseCaseContent(useCase.summary));
  }, [useCase]);

  useEffect(() => {
    if (savedDashboard?.link) {
      setEmbedCode(savedDashboard.link);
    }
  }, [savedDashboard]);

  const { mutate: updateUseCase, isLoading: savingUseCase } = useMutation(
    (data: { data: UseCaseInputPartial }) =>
      GraphQL(UpdateUseCaseBuilder, ownerArgs, data),
    {
      onSuccess: (res) => {
        const next = res.updateUseCase;
        if (next && 'logo' in next) {
          setLogo(next.logo ?? null);
        }
        void queryClient.invalidateQueries({
          queryKey: [`usecase_wizard_${params.id}`],
        });
        void queryClient.invalidateQueries({
          queryKey: [
            `fetch_UseCaseBuilder`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
      },
      onError: (error: unknown) => {
        toast(
          typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : 'Unable to save use case right now.'
        );
      },
    }
  );

  const { mutate: addDashboard, isLoading: addingDashboard } = useMutation(
    (input: { usecaseId: number; name: string; link: string }) =>
      GraphQL(addDashboardMutation, ownerArgs, input),
    {
      onSuccess: () => {
        void dashboardsQuery.refetch();
        toast('Dashboard saved');
      },
    }
  );

  const { mutate: saveDashboard, isLoading: savingDashboard } = useMutation(
    (input: { id: string; name: string; link: string }) =>
      GraphQL(updateDashboardMutation, ownerArgs, input),
    {
      onSuccess: () => {
        void dashboardsQuery.refetch();
        toast('Dashboard saved');
      },
    }
  );

  const persistBuilder = useCallback(
    (next?: {
      title?: string;
      document?: UseCaseContentDocument;
      logo?: File | null;
    }) => {
      updateUseCase({
        data: {
          id: params.id,
          title: next?.title ?? titleRef.current,
          summary: serializeUseCaseContent(
            next?.document ?? contentDocRef.current
          ),
          ...(next && 'logo' in next ? { logo: next.logo } : {}),
        },
      });
    },
    [params.id, updateUseCase]
  );

  const applyThumbnail = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_THUMBNAIL_BYTES) {
      toast('Image must be 20MB or smaller.');
      return;
    }
    setKnownBytes(file.size);
    setLogo(file);
    persistBuilder({ logo: file });
  };

  const removeThumbnail = () => {
    setKnownBytes(null);
    setLogo(null);
    persistBuilder({ logo: null });
  };

  useEffect(() => {
    registerBeforeNavigateHandler(() => persistBuilder());
    return () => registerBeforeNavigateHandler(null);
  }, [persistBuilder, registerBeforeNavigateHandler]);

  useEffect(() => {
    setStatus(
      savingUseCase || addingDashboard || savingDashboard
        ? 'loading'
        : 'success'
    );
  }, [savingUseCase, addingDashboard, savingDashboard, setStatus]);

  useEffect(() => {
    setBuilderCompleted(isUseCaseBuilderComplete({ title, logo }));
  }, [title, logo, setBuilderCompleted]);

  const handleSaveDashboard = () => {
    const link = extractEmbedUrl(embedCode);
    if (!link) {
      toast('Paste a dashboard URL or iframe embed code first.');
      return;
    }
    const name = title.trim() || 'Use Case Dashboard';
    if (savedDashboard?.id) {
      saveDashboard({ id: savedDashboard.id, name, link });
      return;
    }
    addDashboard({ usecaseId, name, link });
  };

  useEffect(() => {
    if (!logo) {
      setThumbnailPreview('');
      return;
    }
    if (!(logo instanceof File)) {
      setThumbnailPreview(mediaUrl(logo));
      return;
    }
    const url = URL.createObjectURL(logo);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  useEffect(() => {
    if (!logo || logo instanceof File) {
      setRemoteBytes(null);
      return;
    }
    const url = mediaUrl(logo);
    if (!url) return;
    const controller = new AbortController();
    fetch(url, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        const length = Number(response.headers.get('content-length'));
        if (Number.isFinite(length) && length > 0) setRemoteBytes(length);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [logo]);

  const thumbnailBytes =
    logo instanceof File ? logo.size : (knownBytes ?? remoteBytes);

  const chartOptions = (chartsQuery.data?.getChartData ?? [])
    .map((item) => {
      const record = item as {
        id?: string;
        name?: string;
        __typename?: string;
      };
      return {
        id: record.id ?? '',
        name: record.name ?? record.id ?? 'Untitled chart',
        kind: record.__typename,
      };
    })
    .filter((item) => item.id);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    window.document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (builderQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const titleError =
    stepShowErrors && !title.trim() ? 'Enter a use case title' : undefined;
  const thumbnailError =
    stepShowErrors && !logo ? 'Upload a thumbnail image' : undefined;

  return (
    <div className="flex flex-col gap-6 px-6">
      <SectionCard
        title="Basic Information"
        description="Introduce your use case with a title, short summary and image."
      >
        <div id="basic-information" className="flex flex-col gap-5">
          <div>
            <div className="flex flex-col gap-1">
              <Text variant="bodyMd" fontWeight="medium">
                Thumbnail
                <span className="ml-2 text-[#D43131]">*</span>
              </Text>
              <Text variant="bodySm" color="subdued">
                Upload an image that represents this Use Case.
              </Text>
            </div>
            <div className="mt-3">
              <input
                ref={thumbnailInputRef}
                className={styles.thumbnailInput}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  applyThumbnail(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
              {thumbnailPreview ? (
                <div className="flex flex-col gap-2">
                  <div className={styles.thumbnailRow}>
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      width={200}
                      height={200}
                      loading="lazy"
                      className={styles.thumbnailPreview}
                    />
                    <div className={styles.thumbnailMeta}>
                      <Text variant="bodyMd" fontWeight="semibold" truncate>
                        {logo ? thumbnailName(logo) : 'Thumbnail'}
                      </Text>
                      {thumbnailBytes ? (
                        <Text variant="bodySm" color="subdued">
                          {formatFileSize(thumbnailBytes)}
                        </Text>
                      ) : null}
                    </div>
                    <div className={styles.thumbnailActions}>
                      <Button
                        kind="neutral"
                        size="medium"
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                      <Button
                        kind="tertiary"
                        size="slim"
                        onClick={removeThumbnail}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <Text variant="bodySm" color="disabled">
                    JPG, PNG or WEBP. Max 20MB.
                  </Text>
                </div>
              ) : (
                <DropZone
                  name="thumbnail"
                  type="image"
                  accept=".jpg,.jpeg,.png,.webp"
                  allowMultiple={false}
                  error={thumbnailError}
                  onDrop={(_files, accepted) => applyThumbnail(accepted[0])}
                >
                  <DropZone.FileUpload
                    actionTitle="Browse File"
                    actionHint="Drag and drop an image here, or click to browse. JPG, PNG or WEBP. Max 20MB."
                  />
                </DropZone>
              )}
            </div>
          </div>
          <TextField
            label="Use Case Title"
            name="useCaseTitle"
            required
            requiredIndicator
            error={titleError}
            placeholder="e.g. Maternal Health Monitoring in Rural Districts"
            value={title}
            onChange={setTitle}
            onBlur={() => persistBuilder({ title })}
          />
          <TextField
            label="Subtitle"
            name="useCaseSubtitle"
            helpText="Add a short, one-line summary."
            placeholder="Keep it concise..."
            value={contentDoc.subtitle}
            onChange={(value) =>
              setContentDoc((prev) => ({ ...prev, subtitle: value }))
            }
            onBlur={() =>
              persistBuilder({
                document: {
                  ...contentDocRef.current,
                  subtitle: contentDoc.subtitle,
                },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Content"
        description="Add the main information that explains this content."
        className={styles.overflowVisible}
      >
        <div id="content">
          <ContentEditor
            blocks={contentDoc.blocks}
            chartOptions={chartOptions}
            onChange={(blocks) =>
              setContentDoc((prev) => ({ ...prev, blocks }))
            }
            onSave={(blocks) =>
              persistBuilder({
                document: { ...contentDocRef.current, blocks },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Embedded Dashboard"
        description="Add one external dashboard to help users explore the data behind this content."
      >
        <div id="embedded-dashboard" className="flex flex-col gap-3">
          <TextField
            label="Dashboard embed code"
            name="dashboardEmbed"
            multiline
            placeholder="Paste your dashboard iframe embed code here..."
            value={embedCode}
            onChange={setEmbedCode}
          />
          <Text variant="bodySm" color="subdued">
            Copy the iframe embed code from your dashboard provider, such as
            Superset.
          </Text>
          <div>
            <Button
              onClick={handleSaveDashboard}
              className="hover:bg-[var(--blue-primary-text)]"
            >
              Save Dashboard
            </Button>
          </div>
          <Text variant="bodySm" color="subdued">
            You can add one external dashboard to this Use Case.
          </Text>
        </div>
      </SectionCard>
    </div>
  );
}
