'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DropZone, Select, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useEditStatus } from '../../context';
import Metadata from '../metadata/page';

const UpdateUseCaseMutation: any = graphql(`
  mutation updateUseCase($data: UseCaseInputPartial!) {
    updateUseCase(data: $data) {
      __typename
      id
      title
      summary
      created
      modified
      website
      runningStatus
      slug
      status
      startedOn
      completedOn
      platformUrl
      logo {
        name
        path
        url
      }
    }
  }
`);

const FetchUseCase: any = graphql(`
  query UseCaseData($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
      summary
      website
      platformUrl
      logo {
        name
        path
        url
      }
      runningStatus
      contactEmail
      status
      slug
      startedOn
      completedOn
    }
  }
`);

type DetailsFormData = {
  title: string;
  summary: string;
  logo: File | null | any;
  website: string;
  contactEmail: string;
  slug: string;
  status: string;
  runningStatus: string | null;
  startedOn: string | null;
  completedOn: string | null;
  platformUrl: string;
};

const initialFormData: DetailsFormData = {
  title: '',
  summary: '',
  logo: null,
  website: '',
  contactEmail: '',
  slug: '',
  status: '',
  runningStatus: null,
  startedOn: null,
  completedOn: null,
  platformUrl: '',
};

const RUNNING_STATUS_OPTIONS = [
  { label: 'Initiated', value: 'INITIATED' },
  { label: 'On Going', value: 'ON_GOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const mapUseCaseToForm = (usecase: any): DetailsFormData => ({
  title: usecase.title || '',
  summary: usecase.summary || '',
  logo: usecase.logo || null,
  website: usecase.website || '',
  contactEmail: usecase.contactEmail || '',
  slug: usecase.slug || '',
  status: usecase.status || '',
  runningStatus: usecase.runningStatus || null,
  startedOn: usecase.startedOn || '',
  completedOn: usecase.completedOn || '',
  platformUrl: usecase.platformUrl || '',
});

const Details = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const USECASE_EDIT_SUCCESS_TOAST_ID = 'usecase-edit-save-success';
  const USECASE_DETAILS_ERROR_TOAST_ID = 'usecase-details-save-error';
  const getErrorMessage = (error: any, fallback: string) =>
    typeof error?.message === 'string' && error.message.trim()
      ? error.message.trim()
      : fallback;

  const queryKey = ['fetch_UseCaseData_details', params.id];

  const { data: useCaseQueryData }: { data: any } = useQuery(
    queryKey,
    () =>
      GraphQL(
        FetchUseCase,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: params.id,
          },
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const [formData, setFormData] = useState<DetailsFormData>(initialFormData);
  const [previousFormData, setPreviousFormData] =
    useState<DetailsFormData>(initialFormData);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const previousFormDataRef = useRef(previousFormData);
  previousFormDataRef.current = previousFormData;
  const hydratedIdRef = useRef<string | null>(null);
  const lastHydratedSnapshotRef = useRef<string | null>(null);
  // Survives tab unmount — in-memory ref alone is lost when leaving Details
  const pendingRunningStatusKey = `usecase-pending-runningStatus-${params.id}`;

  const readPendingRunningStatus = () => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(pendingRunningStatusKey);
    } catch {
      return null;
    }
  };

  const writePendingRunningStatus = (value: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (value) {
        sessionStorage.setItem(pendingRunningStatusKey, value);
      } else {
        sessionStorage.removeItem(pendingRunningStatusKey);
      }
    } catch {
      // ignore storage errors
    }
  };

  // Reset local form when switching to a different use case
  useEffect(() => {
    hydratedIdRef.current = null;
    lastHydratedSnapshotRef.current = null;
    setFormData(initialFormData);
    setPreviousFormData(initialFormData);
  }, [params.id]);

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: UseCaseInputPartial }) =>
      GraphQL(
        UpdateUseCaseMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: async (res: any, variables: { data: UseCaseInputPartial }) => {
        toast('Use case updated successfully', {
          id: USECASE_EDIT_SUCCESS_TOAST_ID,
        });
        const updated = res.updateUseCase;
        const sent = variables?.data || { id: params.id.toString() };

        await queryClient.cancelQueries({ queryKey });

        // Only patch fields that were actually sent. Spreading the full response
        // was overwriting runningStatus back to INITIATED when summary/url/dates saved.
        const patchFromSent = (
          current: DetailsFormData | Record<string, any>
        ): DetailsFormData => {
          const next = { ...current } as DetailsFormData;

          if (sent.summary !== undefined) {
            next.summary = updated.summary ?? sent.summary ?? '';
          }
          if (sent.website !== undefined) {
            next.website = updated.website ?? sent.website ?? '';
          }
          if (sent.contactEmail !== undefined) {
            next.contactEmail = updated.contactEmail ?? sent.contactEmail ?? '';
          }
          if (sent.platformUrl !== undefined) {
            next.platformUrl = updated.platformUrl ?? sent.platformUrl ?? '';
          }
          if (sent.startedOn !== undefined) {
            next.startedOn = updated.startedOn ?? sent.startedOn ?? null;
          }
          if (sent.completedOn !== undefined) {
            next.completedOn = updated.completedOn ?? sent.completedOn ?? null;
          }
          if (sent.logo !== undefined) {
            next.logo = updated.logo ?? sent.logo ?? null;
          }
          if (sent.runningStatus !== undefined) {
            // Keep the value we sent; don't let a lagging response/refetch reset it
            next.runningStatus = String(sent.runningStatus);
            writePendingRunningStatus(null);
          }
          if (updated.title !== undefined && updated.title !== null) {
            next.title = updated.title;
          }
          if (updated.status !== undefined && updated.status !== null) {
            next.status = updated.status;
          }
          if (updated.slug !== undefined && updated.slug !== null) {
            next.slug = updated.slug;
          }

          return next;
        };

        setFormData((prev) => {
          const merged = patchFromSent(prev);
          formDataRef.current = merged;
          return merged;
        });
        setPreviousFormData((prev) => {
          const merged = patchFromSent(prev);
          previousFormDataRef.current = merged;
          return merged;
        });

        queryClient.setQueryData(queryKey, (old: any) => {
          const current = old?.useCases?.[0] || {};
          const merged = patchFromSent(current);
          lastHydratedSnapshotRef.current = JSON.stringify(
            mapUseCaseToForm(merged)
          );
          return {
            ...(old || {}),
            useCases: [merged, ...(old?.useCases?.slice(1) || [])],
          };
        });
      },
      onError: (error: any) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to update use case right now. Please try again.')}`,
          { id: USECASE_DETAILS_ERROR_TOAST_ID }
        );
      },
    }
  );

  // Hydrate from query/cache. Skip while a save is in flight so a late
  // refetch cannot wipe values the user just saved.
  useEffect(() => {
    if (editMutationLoading) return;

    const usecase = useCaseQueryData?.useCases?.[0];
    if (!usecase) return;

    const mapped = mapUseCaseToForm(usecase);
    const pendingStatus = readPendingRunningStatus();

    // Restore optimistic running status after tab remount
    if (pendingStatus) {
      if (mapped.runningStatus === pendingStatus) {
        writePendingRunningStatus(null);
      } else {
        mapped.runningStatus = pendingStatus;
      }
    }

    const mappedSnapshot = JSON.stringify(mapped);

    if (lastHydratedSnapshotRef.current === mappedSnapshot) {
      return;
    }

    const isFirstHydration = hydratedIdRef.current !== params.id;
    const isDirty =
      JSON.stringify(formDataRef.current) !==
      JSON.stringify(previousFormDataRef.current);

    if (isFirstHydration || !isDirty) {
      hydratedIdRef.current = params.id;
      lastHydratedSnapshotRef.current = mappedSnapshot;
      setFormData(mapped);
      setPreviousFormData(mapped);
      formDataRef.current = mapped;
      previousFormDataRef.current = mapped;
    }
  }, [useCaseQueryData, editMutationLoading, params.id]);

  const handleChange = useCallback((field: keyof DetailsFormData, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  const onDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      mutate({
        data: {
          id: params.id.toString(),
          logo: acceptedFiles[0],
        },
      });
    },
    [mutate, params.id]
  );

  const applyLocalForm = (next: DetailsFormData) => {
    formDataRef.current = next;
    previousFormDataRef.current = next;
    setFormData(next);
    setPreviousFormData(next);
  };

  const saveRunningStatus = (nextValue: string) => {
    if (!nextValue || nextValue === formDataRef.current.runningStatus) {
      return;
    }

    const next = {
      ...formDataRef.current,
      runningStatus: nextValue,
    };

    writePendingRunningStatus(nextValue);
    applyLocalForm(next);

    // Optimistic cache write so remount/hydration cannot flash back to INITIATED
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.useCases?.[0]) {
        return { useCases: [{ id: params.id, runningStatus: nextValue }] };
      }
      const merged = {
        ...old.useCases[0],
        runningStatus: nextValue,
      };
      lastHydratedSnapshotRef.current = JSON.stringify(mapUseCaseToForm(merged));
      return {
        ...old,
        useCases: [merged, ...old.useCases.slice(1)],
      };
    });

    mutate({
      data: {
        id: params.id.toString(),
        runningStatus: nextValue as UseCaseInputPartial['runningStatus'],
      },
    });
  };

  // Only send changed fields so a wiped/empty local value cannot overwrite
  // a previously saved platformUrl / runningStatus on the server.
  const handleSave = (updatedData: DetailsFormData) => {
    const prev = previousFormDataRef.current;
    const changed: UseCaseInputPartial = {
      id: params.id.toString(),
    };

    if (updatedData.summary !== prev.summary) {
      changed.summary = updatedData.summary;
    }
    if (updatedData.website !== prev.website) {
      changed.website = updatedData.website;
    }
    if (updatedData.contactEmail !== prev.contactEmail) {
      changed.contactEmail = updatedData.contactEmail;
    }
    // runningStatus is saved through saveRunningStatus — do not include here
    if (updatedData.startedOn !== prev.startedOn) {
      changed.startedOn = (updatedData.startedOn as any) || null;
    }
    if (updatedData.completedOn !== prev.completedOn) {
      changed.completedOn = (updatedData.completedOn as any) || null;
    }
    if (updatedData.platformUrl !== prev.platformUrl) {
      changed.platformUrl = updatedData.platformUrl || '';
    }

    // Nothing changed
    if (Object.keys(changed).length === 1) {
      return;
    }

    previousFormDataRef.current = updatedData;
    setPreviousFormData(updatedData);
    mutate({ data: changed });
  };

  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(editMutationLoading ? 'loading' : 'success');
  }, [editMutationLoading, setStatus]);

  return (
    <div className=" flex flex-col gap-6">
      <div>
        <RichTextEditor
          label="Summary *"
          value={formData.summary}
          onChange={(value) => handleChange('summary', value)}
          onBlur={(value) =>
            handleSave({ ...formDataRef.current, summary: value })
          }
          placeholder="Enter use case summary with rich formatting..."
          helpText={`Character limit: ${formData?.summary?.length || 0}/10000`}
        />
      </div>
      <div className="flex flex-wrap gap-6 md:flex-nowrap lg:flex-nowrap">
        <div className="w-full">
          <TextField
            label="Platform Url"
            name="platformUrl"
            type="url"
            value={formData.platformUrl}
            onChange={(e) => handleChange('platformUrl', e)}
            onBlur={() => handleSave(formDataRef.current)}
          />
        </div>
        <div className="w-full">
          <Select
            key={`running-status-${formData.runningStatus || 'empty'}`}
            name="runningStatus"
            options={RUNNING_STATUS_OPTIONS}
            label="Running Status"
            value={formData.runningStatus || 'INITIATED'}
            onChange={(value: string) => {
              saveRunningStatus(value);
            }}
          />
        </div>
      </div>

      <Metadata />
      <div className="flex flex-wrap gap-6 md:flex-nowrap lg:flex-nowrap">
        <div className="w-full">
          <TextField
            label="Started On"
            name="startedOn"
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={formData.startedOn || ''}
            onChange={(e) => {
              handleChange('startedOn', e);
            }}
            onBlur={() => handleSave(formDataRef.current)}
          />
        </div>

        <div className="w-full">
          <TextField
            label="Completed On"
            name="completedOn"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            min={formData.startedOn || ''}
            disabled={
              formData.runningStatus === 'ON_GOING' ||
              formData.runningStatus === 'INITIATED'
            }
            value={formData.completedOn || ''}
            onChange={(e) => {
              handleChange('completedOn', e);
            }}
            onBlur={() => handleSave(formDataRef.current)}
          />
        </div>
      </div>
      <div>
        <DropZone
          label={!formData?.logo ? 'Logo *' : 'Change Logo *'}
          onDrop={onDrop}
          name={'Logo'}
        >
          <DropZone.FileUpload
            actionHint="Only one image can be added. Recommended resolution of 16:9 - (1280x720), (1920x1080) - Supported File Types: PNG/JPG/SVG "
            actionTitle={
              formData.logo
                ? formData.logo.name.split('/').pop()
                : 'Name of the logo'
            }
          />
        </DropZone>
      </div>
    </div>
  );
};

export default Details;
