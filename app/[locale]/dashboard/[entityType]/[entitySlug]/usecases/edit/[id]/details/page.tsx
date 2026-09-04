'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseInputPartial, UseCaseRunningStatus } from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DropZone, Select, TextField, toast } from 'opub-ui';

// Assuming you are using these components

import { GraphQL } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useEditStatus } from '../../context';
import Metadata from '../metadata/page';

interface UploadedImage {
  name?: string | null;
  path?: string | null;
  url?: string | null;
}

interface UseCaseFormData {
  title: string;
  summary: string;
  logo: File | UploadedImage | null;
  website: string;
  contactEmail: string;
  slug: string;
  status: string;
  runningStatus: string | null;
  startedOn: string | null;
  completedOn: string | null;
  platformUrl: string;
}

const UpdateUseCaseMutation = graphql(`
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

const FetchUseCase = graphql(`
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

const Details = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const USECASE_EDIT_SUCCESS_TOAST_ID = 'usecase-edit-save-success';
  const USECASE_DETAILS_ERROR_TOAST_ID = 'usecase-details-save-error';
  const getErrorMessage = (error: unknown, fallback: string) =>
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
      ? error.message.trim()
      : fallback;

  const UseCaseData = useQuery(
    [
      `fetch_UseCaseData_details`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
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

  const UsecasesData =
    (UseCaseData?.data?.useCases?.length ?? 0) > 0 && UseCaseData?.data?.useCases?.[0];

  const initialFormData = {
    title: '',
    summary: '',
    logo: null as File | UploadedImage | null,
    website: '',
    contactEmail: '',
    slug: '',
    status: '',
    runningStatus: null as string | null,
    startedOn: null as string | null,
    completedOn: null as string | null,
    platformUrl: '',
  };

  const runningStatus = [
    {
      label: 'Initiated',
      value: 'INITIATED',
    },
    {
      label: 'On Going',
      value: 'ON_GOING',
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
    },
    {
      label: 'Cancelled',
      value: 'CANCELLED',
    },
  ];

  const [formData, setFormData] = useState(initialFormData);

  const [, setPreviousFormData] = useState(initialFormData);

  const [prevUsecasesData, setPrevUsecasesData] = useState<
    typeof UsecasesData | undefined
  >(undefined);
  const [prevDetailsId, setPrevDetailsId] = useState(params.id);
  if (params.id !== prevDetailsId || UsecasesData !== prevUsecasesData) {
    setPrevDetailsId(params.id);
    setPrevUsecasesData(UsecasesData);
    if (UsecasesData) {
      const updatedData = {
        title: UsecasesData.title || '',
        summary: UsecasesData.summary || '',
        logo: UsecasesData.logo || null,
        website: UsecasesData.website || '',
        contactEmail: UsecasesData.contactEmail || '',
        slug: UsecasesData.slug || '',
        status: UsecasesData.status || '',
        runningStatus: UsecasesData.runningStatus || null,
        startedOn: UsecasesData.startedOn || '',
        completedOn: UsecasesData.completedOn || '',
        platformUrl: UsecasesData.platformUrl || '',
      };
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }

  const queryClient = useQueryClient();

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
      onSuccess: (res) => {
        toast('Use case updated successfully', {
          id: USECASE_EDIT_SUCCESS_TOAST_ID,
        });
        setFormData((prev) => ({
          ...prev,
          title: res.updateUseCase.title ?? prev.title,
          summary: res.updateUseCase.summary ?? prev.summary,
          logo: res.updateUseCase.logo ?? prev.logo,
          website: res.updateUseCase.website ?? prev.website,
          slug: res.updateUseCase.slug ?? prev.slug,
          status: res.updateUseCase.status ?? prev.status,
          runningStatus: res.updateUseCase.runningStatus ?? prev.runningStatus,
          startedOn: res.updateUseCase.startedOn ?? prev.startedOn,
          completedOn: res.updateUseCase.completedOn ?? prev.completedOn,
          platformUrl: res.updateUseCase.platformUrl ?? prev.platformUrl,
        }));
        setPreviousFormData((prev) => ({
          ...prev,
          title: res.updateUseCase.title ?? prev.title,
          summary: res.updateUseCase.summary ?? prev.summary,
          logo: res.updateUseCase.logo ?? prev.logo,
          website: res.updateUseCase.website ?? prev.website,
          slug: res.updateUseCase.slug ?? prev.slug,
          status: res.updateUseCase.status ?? prev.status,
          runningStatus: res.updateUseCase.runningStatus ?? prev.runningStatus,
          startedOn: res.updateUseCase.startedOn ?? prev.startedOn,
          completedOn: res.updateUseCase.completedOn ?? prev.completedOn,
          platformUrl: res.updateUseCase.platformUrl ?? prev.platformUrl,
        }));
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_UseCaseData_details`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_UsecaseDetails`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to update use case right now. Please try again.')}`,
          { id: USECASE_DETAILS_ERROR_TOAST_ID }
        );
      },
    }
  );

  const handleChange = useCallback(
    (field: keyof UseCaseFormData, value: UseCaseFormData[keyof UseCaseFormData]) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  },
    []
  );

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

  const handleSave = (updatedData: UseCaseFormData) => {
    const updatedSnapshot = JSON.stringify(updatedData);
    setPreviousFormData((prevData) => {
      if (JSON.stringify(prevData) === updatedSnapshot) {
        return prevData;
      }

      mutate({
        data: {
          id: params.id.toString(),
          title: updatedData.title,
          summary: updatedData.summary,
          website: updatedData.website,
          contactEmail: updatedData.contactEmail,
          runningStatus:
            updatedData.runningStatus &&
            (Object.values(UseCaseRunningStatus) as string[]).includes(
              updatedData.runningStatus
            )
              ? (updatedData.runningStatus as UseCaseRunningStatus)
              : null,
          startedOn: updatedData.startedOn || null,
          completedOn: updatedData.completedOn || null,
          platformUrl: updatedData.platformUrl || '',
        },
      });

      return updatedData;
    });
  };
  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(editMutationLoading ? 'loading' : 'success'); // update based on mutation state
  }, [editMutationLoading, setStatus]);

  return (
    <div className=" flex flex-col gap-6">
      <div>
        <RichTextEditor
          label="Summary *"
          value={formData.summary}
          onChange={(value) => handleChange('summary', value)}
          onBlur={(value) => handleSave({ ...formData, summary: value })}
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
            onBlur={() => handleSave(formData)}
          />
        </div>
        <div className="w-full">
          <Select
            name={'runningStatus'}
            options={runningStatus?.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            label="Running Status"
            value={formData?.runningStatus ? formData.runningStatus : ''}
            onChange={(value) => {
              handleChange('runningStatus', value);
              handleSave({ ...formData, runningStatus: value });
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
            onBlur={() => handleSave(formData)}
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
            onBlur={() => handleSave(formData)}
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
                ? (typeof formData.logo.name === 'string'
                    ? formData.logo.name.split('/').pop()
                    : 'Name of the logo')
                : 'Name of the logo'
            }
          />
        </DropZone>
      </div>
      {/* <div>
          <TextField
            label="Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e)}
            onBlur={() => handleSave(formData)}
          />
        </div>
        <div>
          <TextField
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleChange('contactEmail', e)}
            onBlur={() => handleSave(formData)}
          />
        </div> */}
    </div>
  );
};

export default Details;
