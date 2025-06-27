'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { UseCaseInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DropZone, Select, TextField, toast } from 'opub-ui';

// Assuming you are using these components

import { GraphQL } from '@/lib/api';
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

  const router = useRouter();

  const UseCaseData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UseCaseData`],
    () =>
      GraphQL(
        FetchUseCase,
        {},
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
    UseCaseData?.data?.useCases.length > 0 && UseCaseData?.data?.useCases[0];

  const initialFormData = {
    title: '',
    summary: '',
    logo: null as File | null,
    website: '',
    contactEmail: '',
    slug: '',
    status: '',
    runningStatus: null,
    startedOn: null,
    completedOn: null,
  };

  const runningStatus = [
    {
      label: 'Intitated',
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

  const [previousFormData, setPreviousFormData] = useState(initialFormData);

  useEffect(() => {
    if (UsecasesData) {
      // Ensure UsecasesData is available
      const updatedData = {
        title: UsecasesData.title || '', // Fallback to empty string if undefined
        summary: UsecasesData.summary || '',
        logo: UsecasesData.logo || null,
        website: UsecasesData.website || '',
        contactEmail: UsecasesData.contactEmail || '',
        slug: UsecasesData.slug || '',
        status: UsecasesData.status || '',
        runningStatus: UsecasesData.runningStatus || null,
        startedOn: UsecasesData.startedOn || '',
        completedOn: UsecasesData.completedOn || '',
      };
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }, [params.id, UsecasesData]);

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: UseCaseInputPartial }) =>
      GraphQL(UpdateUseCaseMutation, {}, data),
    {
      onSuccess: (res: any) => {
        toast('Use case updated successfully');
        setFormData((prev) => ({
          ...prev,
          ...res.updateUseCase,
        }));
        setPreviousFormData((prev) => ({
          ...prev,
          ...res.updateUseCase,
        }));
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const handleChange = useCallback((field: string, value: any) => {
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
    []
  );

  const handleSave = (updatedData: any) => {
    if (JSON.stringify(updatedData) !== JSON.stringify(previousFormData)) {
      setPreviousFormData(updatedData);

      mutate({
        data: {
          id: params.id.toString(),
          title: updatedData.title,
          summary: updatedData.summary,
          website: updatedData.website,
          contactEmail: updatedData.contactEmail,
          runningStatus: updatedData.runningStatus,
          startedOn: (updatedData.startedOn as Date) || null,
          completedOn: (updatedData.completedOn as Date) || null,
        },
      });
    }
  };
  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(editMutationLoading ? 'loading' : 'success'); // update based on mutation state
  }, [editMutationLoading]);

  return (
    <div className=" flex flex-col gap-6">
      <div>
        <TextField
          label="Summary *"
          name="summary"
          value={formData.summary}
          multiline={7}
          helpText="Character limit: 10000"
          onChange={(e) => handleChange('summary', e)}
          onBlur={() => handleSave(formData)}
        />
      </div>

      <Metadata />
      <div className="flex flex-wrap gap-6 md:flex-nowrap lg:flex-nowrap">
        <div className="w-full">
          <TextField
            label="Started On"
            name="startedOn"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={formData.startedOn || ''}
            onChange={(e) => {
              handleChange('startedOn', e);
            }}
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
            onChange={(value: any) => {
              handleChange('runningStatus', value);
              handleSave({ ...formData, runningStatus: value });
            }}
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
              formData.runningStatus === 'COMPLETED' ||
              formData.runningStatus === 'CANCELLED'
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
                ? formData.logo.name.split('/').pop()
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
