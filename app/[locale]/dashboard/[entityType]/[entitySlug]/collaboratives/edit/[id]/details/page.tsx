'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { CollaborativeInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DropZone, Select, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';
import Metadata from '../metadata/page';

const UpdateCollaborativeMutation: any = graphql(`
  mutation updateCollaborative($data: CollaborativeInputPartial!) {
    updateCollaborative(data: $data) {
      __typename
      id
      title
      summary
      created
      modified
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

const FetchCollaborative: any = graphql(`
  query CollaborativeData($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      summary
      platformUrl
      logo {
        name
        path
        url
      }
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

  const CollaborativeData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_CollaborativeData_details`],
    () =>
      GraphQL(
        FetchCollaborative,
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

  const CollaborativesData =
    CollaborativeData?.data?.collaboratives && 
    Array.isArray(CollaborativeData?.data?.collaboratives) && 
    CollaborativeData?.data?.collaboratives?.length > 0 
      ? CollaborativeData?.data?.collaboratives[0] 
      : null;

  const initialFormData = {
    title: '',
    summary: '',
    logo: null as File | null,
    slug: '',
    status: '',
    startedOn: null,
    completedOn: null,
    platformUrl: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [previousFormData, setPreviousFormData] = useState(initialFormData);

  useEffect(() => {
    if (CollaborativesData) {
      const updatedData = {
        title: CollaborativesData.title || '',
        summary: CollaborativesData.summary || '',
        logo: CollaborativesData.logo || null,
        slug: CollaborativesData.slug || '',
        status: CollaborativesData.status || '',
        startedOn: CollaborativesData.startedOn || '',
        completedOn: CollaborativesData.completedOn || '',
        platformUrl: CollaborativesData.platformUrl || '',
      };
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }, [params.id, CollaborativesData]);

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: CollaborativeInputPartial }) =>
      GraphQL(
        UpdateCollaborativeMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res: any) => {
        toast('Collaborative updated successfully');
        setFormData((prev) => ({
          ...prev,
          ...res.updateCollaborative,
        }));
        setPreviousFormData((prev) => ({
          ...prev,
          ...res.updateCollaborative,
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
          startedOn: (updatedData.startedOn as Date) || null,
          completedOn: (updatedData.completedOn as Date) || null,
          platformUrl: updatedData.platformUrl || '',
        },
      });
    }
  };

  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(editMutationLoading ? 'loading' : 'success');
  }, [editMutationLoading, setStatus]);

  // Show loading state while fetching data
  if (CollaborativeData.isLoading) {
    return <div>Loading collaborative data...</div>;
  }

  // Show error if no data found
  if (!CollaborativesData) {
    return <div>No collaborative data found</div>;
  }

  return (
    <div className=" flex flex-col gap-6">
      <div>
        <TextField
          label="Summary *"
          name="summary"
          value={formData.summary}
          multiline={7}
          helpText={`Character limit: ${formData?.summary?.length}/10000`}
          onChange={(e) => handleChange('summary', e)}
          onBlur={() => handleSave(formData)}
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
          <TextField
            label="Completed On"
            name="completedOn"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            min={formData.startedOn || ''}
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
              formData.logo && typeof formData.logo === 'object' && 'name' in formData.logo
                ? (formData.logo as any).name?.split('/').pop() || 'Logo file'
                : 'Name of the logo'
            }
          />
        </DropZone>
      </div>
    </div>
  );
};

export default Details;
