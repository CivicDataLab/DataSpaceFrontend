'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { FileCard, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { updateResourceDoc, updateResourceList } from './query';

export interface UploadedResource {
  id: string;
  name: string;
  type: string;
  created?: string | null;
  fileDetails?: {
    format?: string | null;
    size?: number | null;
    created?: string | null;
    file?: {
      name?: string | null;
    } | null;
  } | null;
}

interface ResourceListProps {
  data: UploadedResource[];
  pendingFiles?: File[];
  refetch: () => void;
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

function resourceFormat(item: UploadedResource): string {
  const fromDetails = item.fileDetails?.format?.replace('.', '').toUpperCase();
  if (fromDetails) return fromDetails;
  const fromType = item.type?.split('.').pop()?.toUpperCase();
  if (fromType && fromType !== 'FILE') return fromType;
  const original = item.fileDetails?.file?.name || item.name;
  const ext = original.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

function originalName(item: UploadedResource): string | undefined {
  const name = item.fileDetails?.file?.name;
  if (!name) return undefined;
  return name.replace(/^resources\//, '');
}

export const ResourceListView = ({
  data,
  pendingFiles = [],
  refetch,
}: ResourceListProps) => {
  const RESOURCE_DELETE_ERROR_TOAST_ID = 'dataset-resource-delete-error';
  const RESOURCE_RENAME_ERROR_TOAST_ID = 'dataset-resource-rename-error';
  const getErrorMessage = (err: unknown, fallback: string) =>
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
      ? err.message.trim()
      : fallback;

  const [, setResourceId] = useQueryState('id', parseAsString);
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    (variables: { resourceId: string }) =>
      GraphQL(
        updateResourceList,
        {
          [params.entityType]: params.entitySlug,
        },
        variables
      ),
    {
      onSuccess: () => {
        refetch();
        void queryClient.invalidateQueries({
          queryKey: [`dataset_title_${params.id}`],
        });
        toast('Resource deleted successfully');
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to delete resource right now.'), {
          id: RESOURCE_DELETE_ERROR_TOAST_ID,
        });
      },
    }
  );

  const renameMutation = useMutation(
    (variables: { fileResourceInput: { id: string; name: string } }) =>
      GraphQL(
        updateResourceDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        variables
      ),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (err: unknown) => {
        toast(getErrorMessage(err, 'Unable to rename resource right now.'), {
          id: RESOURCE_RENAME_ERROR_TOAST_ID,
        });
      },
    }
  );

  if (data.length === 0 && pendingFiles.length === 0) {
    return null;
  }

  const pendingToShow = pendingFiles.filter(
    (file) => !data.some((item) => originalName(item) === file.name)
  );

  return (
    <div className="flex flex-col gap-3">
      {pendingToShow.map((file) => {
        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        return (
          <FileCard
            key={`pending-${file.name}-${file.size}`}
            name={file.name.replace(/\.[^/.]+$/, '')}
            format={ext}
            size={formatFileSize(file.size)}
            uploadedAt="—"
            originalName={file.name}
            status="processing"
          />
        );
      })}
      {data.map((item) => (
        <FileCard
          key={item.id}
          name={item.name}
          format={resourceFormat(item)}
          size={formatFileSize(item.fileDetails?.size)}
          uploadedAt={formatUploadedAt(
            item.fileDetails?.created || item.created
          )}
          originalName={originalName(item)}
          status="ready"
          onRename={(name) => {
            renameMutation.mutate({
              fileResourceInput: {
                id: item.id,
                name,
              },
            });
          }}
          onView={() => {
            void setResourceId(item.id);
          }}
          confirmDelete={true}
          onDelete={() => {
            deleteMutation.mutate({ resourceId: item.id });
          }}
        />
      ))}
    </div>
  );
};
