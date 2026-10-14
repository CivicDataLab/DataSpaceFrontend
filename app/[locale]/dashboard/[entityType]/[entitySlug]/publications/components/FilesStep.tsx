'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DropZone, FileCard, Icon, Spinner, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { usePublicationDraft } from '../context';
import {
  errorText,
  fileDisplayTitle,
  formatFileSize,
  formatUploadedAt,
  isAllowedPublicationFile,
  MAX_PUBLICATION_FILE_BYTES,
  mutationMessage,
  PUBLICATION_FILE_ACCEPT,
  PUBLICATION_FILE_EXTENSIONS,
  youtubeVideoId,
  type PendingBlock,
} from '../model';
import {
  addPublicationFileMutation,
  addPublicationYoutubeMutation,
  createPublicationMutation,
  publicationEditorQuery,
  removePublicationBlockMutation,
  reorderPublicationBlocksMutation,
  updatePublicationBlockMutation,
  type EditorBlock,
} from '../queries';

function blockKind(blockType: string) {
  return blockType.toUpperCase().includes('YOUTUBE') ? 'video' : 'file';
}

function displayTitle(block: {
  title?: string | null;
  blockType?: string;
  fileName?: string | null;
  kind?: 'file' | 'video';
}) {
  if (block.title?.trim()) return block.title.trim();
  const video =
    block.kind === 'video' ||
    (block.blockType ? blockKind(block.blockType) === 'video' : false);
  return video ? 'YouTube video' : block.fileName || 'Untitled file';
}

function editorHref(
  entityType: string,
  entitySlug: string,
  id: string,
  step: string
) {
  return `/dashboard/${entityType}/${entitySlug}/publications/edit/${id}/${step}`;
}

export function FilesStep({ publicationId }: { publicationId?: string }) {
  const router = useRouter();
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const headers = { [params.entityType]: params.entitySlug };
  const queryClient = useQueryClient();
  const {
    details,
    pendingBlocks,
    setPendingBlocks,
    setStatus,
    registerBeforeNavigateHandler,
  } = usePublicationDraft();
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const detailsRef = useRef(details);
  const pendingRef = useRef(pendingBlocks);
  const draftIdRef = useRef<string | null>(publicationId ?? null);
  const ensurePromise = useRef<Promise<string> | null>(null);

  useEffect(() => {
    detailsRef.current = details;
    pendingRef.current = pendingBlocks;
    if (publicationId) draftIdRef.current = publicationId;
  }, [details, pendingBlocks, publicationId]);

  const blocksQuery = useQuery(
    ['publication_editor', publicationId],
    () =>
      GraphQL(publicationEditorQuery, headers, {
        publicationId: publicationId ?? '',
      }),
    { enabled: Boolean(publicationId) }
  );

  const serverBlocks: EditorBlock[] = [
    ...(blocksQuery.data?.getPublication?.blocks ?? []),
  ].sort((a, b) => a.position - b.position);

  const invalidate = (id?: string) =>
    queryClient.invalidateQueries({
      queryKey: ['publication_editor', id ?? publicationId],
    });

  const onError = (error: unknown) => {
    setStatus('unsaved');
    toast(errorText(error, 'Something went wrong.'));
  };

  const ensureDraft = async () => {
    if (publicationId) return publicationId;
    if (draftIdRef.current) return draftIdRef.current;
    if (!ensurePromise.current) {
      ensurePromise.current = (async () => {
        const title = detailsRef.current.title.trim();
        const created = await GraphQL(createPublicationMutation, headers, {
          input: title ? { title } : {},
        });
        const message = mutationMessage(
          created.createPublication,
          'Could not create the publication.'
        );
        const id = created.createPublication?.data?.id;
        if (message || !id) {
          ensurePromise.current = null;
          throw new Error(message || 'Could not create the publication.');
        }
        draftIdRef.current = id;
        return id;
      })();
    }
    return ensurePromise.current;
  };

  const uploadFile = async (
    id: string,
    file: File,
    title: string,
    description: string
  ) => {
    const uploaded = await GraphQL(addPublicationFileMutation, headers, {
      publicationId: id,
      file,
      title,
      description: description || null,
    });
    const message = mutationMessage(
      uploaded.addPublicationFileBlock,
      `${file.name} could not be uploaded.`
    );
    if (message) throw new Error(message);
  };

  const uploadVideo = async (
    id: string,
    url: string,
    title: string,
    description: string
  ) => {
    const uploaded = await GraphQL(addPublicationYoutubeMutation, headers, {
      publicationId: id,
      youtubeUrl: url,
      title: title || null,
      description: description || null,
    });
    const message = mutationMessage(
      uploaded.addPublicationYoutubeBlock,
      'Enter a valid YouTube URL.'
    );
    if (message) throw new Error(message);
  };

  const uploadPending = async (id: string, block: PendingBlock) => {
    if (block.kind === 'file') {
      await uploadFile(id, block.file, block.title, block.description);
      return;
    }
    await uploadVideo(id, block.url, block.title, block.description);
  };

  const saveBeforeNavigateRef = useRef<() => Promise<{ id: string }>>(
    async () => ({ id: publicationId ?? '' })
  );
  useEffect(() => {
    saveBeforeNavigateRef.current = async () => {
      const queued = [...pendingRef.current];
      setStatus('loading');
      try {
        const id = await ensureDraft();
        for (const block of queued) {
          await uploadPending(id, block);
          setPendingBlocks((items) =>
            items.filter((item) => item.id !== block.id)
          );
        }
        setStatus('success');
        return { id };
      } catch (error) {
        setStatus('unsaved');
        toast(errorText(error, 'Could not save the publication.'));
        throw error;
      }
    };
  });

  useEffect(() => {
    registerBeforeNavigateHandler(() => saveBeforeNavigateRef.current());
    return () => registerBeforeNavigateHandler(null);
  }, [registerBeforeNavigateHandler]);

  const fileMutation = useMutation(
    (file: File) =>
      GraphQL(addPublicationFileMutation, headers, {
        publicationId: publicationId ?? draftIdRef.current ?? '',
        file,
        title: fileDisplayTitle(file.name),
      }),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: (result) => {
        const message = mutationMessage(
          result.addPublicationFileBlock,
          'File could not be uploaded.'
        );
        if (message) {
          setStatus('unsaved');
          toast(message);
          return;
        }
        setStatus('success');
        void invalidate(draftIdRef.current ?? undefined);
      },
      onError,
    }
  );

  const videoMutation = useMutation(
    (url: string) =>
      GraphQL(addPublicationYoutubeMutation, headers, {
        publicationId: publicationId ?? draftIdRef.current ?? '',
        youtubeUrl: url,
      }),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: (result) => {
        const message = mutationMessage(
          result.addPublicationYoutubeBlock,
          'Enter a valid YouTube URL.'
        );
        if (message) {
          setStatus('unsaved');
          toast(message);
          return;
        }
        setVideoUrl('');
        setShowVideoInput(false);
        setStatus('success');
        void invalidate(draftIdRef.current ?? undefined);
      },
      onError,
    }
  );

  const removeMutation = useMutation(
    (blockId: string) =>
      GraphQL(removePublicationBlockMutation, headers, { blockId }),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: (result) => {
        const message = mutationMessage(
          result.removePublicationBlock,
          'Could not remove that file.'
        );
        if (message) {
          setStatus('unsaved');
          toast(message);
          return;
        }
        setStatus('success');
        void invalidate();
      },
      onError,
    }
  );

  const reorderMutation = useMutation(
    (blockIds: string[]) =>
      GraphQL(reorderPublicationBlocksMutation, headers, {
        publicationId: publicationId ?? '',
        blockIds,
      }),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: (result) => {
        const message = mutationMessage(
          result.reorderPublicationBlocks,
          'Could not reorder files.'
        );
        if (message) {
          setStatus('unsaved');
          toast(message);
          return;
        }
        setStatus('success');
        void invalidate();
      },
      onError,
    }
  );

  const renameMutation = useMutation(
    (variables: { blockId: string; title?: string; description?: string }) =>
      GraphQL(updatePublicationBlockMutation, headers, variables),
    {
      onMutate: () => setStatus('loading'),
      onSuccess: (result) => {
        const message = mutationMessage(
          result.updatePublicationBlock,
          'Could not update that file.'
        );
        if (message) {
          setStatus('unsaved');
          toast(message);
          return;
        }
        setStatus('success');
        toast('Publication updated successfully', {
          id: 'publication-save-success',
        });
        void invalidate();
      },
      onError,
    }
  );

  const openSavedDraft = (id: string) => {
    if (publicationId) return;
    router.replace(editorHref(params.entityType, params.entitySlug, id, 'files'));
  };

  const addPendingFiles = (files: File[]) => {
    const accepted: PendingBlock[] = [];
    files.forEach((file) => {
      if (!isAllowedPublicationFile(file)) {
        toast(`${file.name} is not a supported file type.`);
        return;
      }
      if (file.size > MAX_PUBLICATION_FILE_BYTES) {
        toast(`${file.name} is larger than the 50 MB limit.`);
        return;
      }
      accepted.push({
        id: `pending-${file.name}-${file.size}-${file.lastModified}`,
        kind: 'file',
        file,
        addedAt: new Date().toISOString(),
        title: fileDisplayTitle(file.name),
        description: '',
      });
    });
    if (accepted.length === 0) return;
    setPendingBlocks((current) => [...current, ...accepted]);
    setStatus('unsaved');
  };

  const handleDrop = async (_dropped: File[], acceptedFiles: File[]) => {
    const accepted = acceptedFiles.filter((file) => {
      if (!isAllowedPublicationFile(file)) {
        toast(`${file.name} is not a supported file type.`);
        return false;
      }
      if (file.size > MAX_PUBLICATION_FILE_BYTES) {
        toast(`${file.name} is larger than the 50 MB limit.`);
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;

    if (publicationId) {
      accepted.forEach((file) => fileMutation.mutate(file));
      return;
    }

    setStatus('loading');
    try {
      const id = await ensureDraft();
      for (const file of accepted) {
        await uploadFile(id, file, fileDisplayTitle(file.name), '');
      }
      setStatus('success');
      openSavedDraft(id);
      void invalidate(id);
    } catch (error) {
      addPendingFiles(accepted);
      onError(error);
    }
  };

  const addVideo = async () => {
    const videoId = youtubeVideoId(videoUrl);
    if (!videoId) {
      toast('Enter a valid YouTube URL.');
      return;
    }
    const url = videoUrl.trim();
    if (publicationId) {
      videoMutation.mutate(url);
      return;
    }
    setStatus('loading');
    try {
      const id = await ensureDraft();
      await uploadVideo(id, url, '', '');
      setVideoUrl('');
      setShowVideoInput(false);
      setStatus('success');
      openSavedDraft(id);
      void invalidate(id);
    } catch (error) {
      setPendingBlocks((current) => [
        ...current,
        {
          id: `pending-video-${videoId}-${Date.now()}`,
          kind: 'video',
          url,
          videoId,
          addedAt: new Date().toISOString(),
          title: '',
          description: '',
        },
      ]);
      onError(error);
    }
  };

  const movePending = (index: number, direction: -1 | 1) => {
    setPendingBlocks((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    setStatus('unsaved');
  };

  const moveServer = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= serverBlocks.length) return;
    const ids = serverBlocks.map((block) => block.id);
    const [item] = ids.splice(index, 1);
    ids.splice(target, 0, item);
    reorderMutation.mutate(ids);
  };

  const updatePending = (
    id: string,
    patch: Partial<Pick<PendingBlock, 'title' | 'description'>>
  ) => {
    setPendingBlocks((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.kind === 'file') return { ...item, ...patch };
        return { ...item, ...patch };
      })
    );
    setStatus('unsaved');
  };

  const visiblePending = publicationId ? [] : pendingBlocks;
  const itemCount = serverBlocks.length + visiblePending.length;

  if (publicationId && blocksQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6">
      <div className="rounded-3 border-1 border-solid border-borderSubdued p-4">
        <Text fontWeight="semibold">Upload Files</Text>
        <div className="mt-4">
          <DropZone
            accept={PUBLICATION_FILE_ACCEPT}
            name="publicationFiles"
            label="Upload files"
            labelHidden
            allowMultiple
            onDrop={handleDrop}
            disabled={fileMutation.isLoading}
          >
            <div className="flex flex-col items-center gap-3 py-8">
              <Icon source={Icons.dropzone} size={36} color="subdued" />
              <Text fontWeight="medium">
                Drag and drop files here, or click to browse.
              </Text>
              <Text variant="bodySm" color="subdued">
                Supported file types:
              </Text>
              <div className="flex flex-wrap justify-center gap-2">
                {PUBLICATION_FILE_EXTENSIONS.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border-1 border-solid border-baseGraySlateSolid8 bg-baseGraySlateSolid3 px-2 text-75"
                  >
                    {type.toUpperCase()}
                  </span>
                ))}
              </div>
              <Button
                kind="secondary"
                className="rounded-2 border-1 border-solid border-baseGraySlateSolid8 bg-white text-[var(--base-default)]"
                disabled={fileMutation.isLoading}
              >
                Browse File
              </Button>
              <Text variant="bodySm" color="subdued">
                Maximum file size limit: 50MB
              </Text>
            </div>
          </DropZone>
        </div>
        <div className="mt-4">
          <Button kind="tertiary" onClick={() => setShowVideoInput(true)}>
            + Add a YouTube video instead
          </Button>
          {showVideoInput ? (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-[240px] flex-1">
                <TextField
                  name="youtubeUrl"
                  label="YouTube URL"
                  value={videoUrl}
                  onChange={setVideoUrl}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <Button
                kind="primary"
                loading={videoMutation.isLoading}
                onClick={() => void addVideo()}
              >
                Add video
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-3 border-1 border-solid border-borderSubdued p-4">
        <div className="flex items-center justify-between gap-3">
          <Text fontWeight="semibold">Files ({itemCount})</Text>
          {itemCount > 0 ? (
            <Text variant="bodySm" className="text-textSuccess">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Ready
            </Text>
          ) : null}
        </div>
        {itemCount === 0 ? (
          <div className="mt-4">
            <Text color="subdued">No files uploaded yet.</Text>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {serverBlocks.map((block, index) => {
              const video = blockKind(block.blockType) === 'video';
              return (
                <BlockRow
                  key={block.id}
                  title={displayTitle(block)}
                  description={block.description ?? ''}
                  format={
                    video
                      ? 'VIDEO'
                      : block.fileFormat?.replace('.', '').toUpperCase() || 'FILE'
                  }
                  size={
                    video || block.fileSize == null
                      ? '—'
                      : formatFileSize(block.fileSize)
                  }
                  uploadedAt={formatUploadedAt(block.created)}
                  originalName={video ? block.youtubeUrl || '' : block.fileName || ''}
                  thumbnail={
                    block.youtubeVideoId
                      ? `https://img.youtube.com/vi/${block.youtubeVideoId}/hqdefault.jpg`
                      : undefined
                  }
                  isFirst={index === 0}
                  isLast={index === serverBlocks.length - 1}
                  onMoveUp={() => moveServer(index, -1)}
                  onMoveDown={() => moveServer(index, 1)}
                  onRename={(title) =>
                    renameMutation.mutate({ blockId: block.id, title })
                  }
                  onDescription={(description) =>
                    renameMutation.mutate({ blockId: block.id, description })
                  }
                  onRemove={() => removeMutation.mutate(block.id)}
                />
              );
            })}
            {visiblePending.map((block, index) => (
              <BlockRow
                key={block.id}
                title={displayTitle(block)}
                description={block.description}
                format={
                  block.kind === 'video' ? 'VIDEO' : fileExtensionLabel(block.file.name)
                }
                size={
                  block.kind === 'video' ? '—' : formatFileSize(block.file.size)
                }
                uploadedAt={formatUploadedAt(block.addedAt)}
                originalName={block.kind === 'video' ? block.url : block.file.name}
                thumbnail={
                  block.kind === 'video'
                    ? `https://img.youtube.com/vi/${block.videoId}/hqdefault.jpg`
                    : undefined
                }
                readyLabel="Waiting to save"
                isFirst={serverBlocks.length === 0 && index === 0}
                isLast={index === visiblePending.length - 1}
                onMoveUp={() => movePending(index, -1)}
                onMoveDown={() => movePending(index, 1)}
                onRename={(title) => updatePending(block.id, { title })}
                onDescription={(description) =>
                  updatePending(block.id, { description })
                }
                onRemove={() =>
                  setPendingBlocks((current) =>
                    current.filter((item) => item.id !== block.id)
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function fileExtensionLabel(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE';
}

function BlockRow({
  title,
  description,
  format,
  size,
  uploadedAt,
  originalName,
  thumbnail,
  readyLabel = 'Ready',
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRename,
  onDescription,
  onRemove,
}: {
  title: string;
  description: string;
  format: string;
  size: string;
  uploadedAt: string;
  originalName?: string;
  thumbnail?: string;
  readyLabel?: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (title: string) => void;
  onDescription: (description: string) => void;
  onRemove: () => void;
}) {
  const [draftDescription, setDraftDescription] = useState(description);
  const [syncedDescription, setSyncedDescription] = useState(description);
  if (description !== syncedDescription) {
    setSyncedDescription(description);
    setDraftDescription(description);
  }

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col pt-2">
        <Button
          kind="tertiary"
          accessibilityLabel="Move up"
          disabled={isFirst}
          onClick={onMoveUp}
          icon={<IconChevronUp size={16} />}
        />
        <Button
          kind="tertiary"
          accessibilityLabel="Move down"
          disabled={isLast}
          onClick={onMoveDown}
          icon={<IconChevronDown size={16} />}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <FileCard
          name={title}
          format={format}
          size={size}
          uploadedAt={uploadedAt || '—'}
          originalName={originalName}
          status="ready"
          statusLabel={readyLabel}
          onRename={onRename}
          onDelete={onRemove}
          confirmDelete
        />
        {thumbnail ? (
          // YouTube thumbnails are not in the image allow-list.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className="h-24 w-40 rounded-2 object-cover"
          />
        ) : null}
        <TextField
          name="blockDescription"
          label="Description"
          labelHidden
          placeholder="Add a description (optional)"
          value={draftDescription}
          multiline={2}
          onChange={setDraftDescription}
          onBlur={() => {
            if (draftDescription.trim() !== description.trim()) {
              onDescription(draftDescription.trim());
            }
          }}
        />
      </div>
    </div>
  );
}
