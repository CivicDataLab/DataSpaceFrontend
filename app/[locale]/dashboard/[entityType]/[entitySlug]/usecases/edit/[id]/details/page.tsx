'use client';

import { graphql } from '@/gql';
import { UseCaseInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  DropZone,
  Icon,
  Select,
  Spinner,
  Text,
  TextField,
  toast
} from 'opub-ui';
import React, { useCallback, useEffect, useState } from 'react';

// Assuming you are using these components

import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';

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
    logo: null,
    website: '',
    contactEmail: '',
    slug: '',
    status: '',
    runningStatus: null,
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
      };
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }, [params.id, UsecasesData]);

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { data: UseCaseInputPartial }) =>
      GraphQL(UpdateUseCaseMutation, {}, data),
    {
      onSuccess: () => {
        toast('Use case updated successfully');
        // Optionally, reset form or perform other actions
        UseCaseData.refetch();
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

  // const handleFileChange = (file: File | null) => {
  //   setFormData((prev: any) => ({ ...prev, logo: file }));
  //   saveData({ ...formData, logo: file }); // Auto-save on file change
  // };
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
        },
      });
    }
  };

  return (
    <div className="mt-3 rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
      <div className="flex justify-end gap-2">
        <Text color="highlight">Auto Save </Text>
        {editMutationLoading ? <Spinner /> : <Icon source={Icons.checkmark} />}
      </div>
      <div className=" flex flex-col gap-5">
        <div>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e)}
            onBlur={() => handleSave(formData)}
          />
        </div>
        <div>
          <TextField
            label="Summary"
            name="summary"
            value={formData.summary}
            multiline={3}
            onChange={(e) => handleChange('summary', e)}
            onBlur={() => handleSave(formData)}
          />
        </div>
        <div>
          <DropZone
            label={!UsecasesData?.logo ? 'Logo' : 'Change Logo'}
            onDrop={onDrop}
            name={'Logo'}
          >
            <DropZone.FileUpload
              actionTitle={
                UsecasesData && UsecasesData?.logo?.name.split('/').pop()
              }
            />
          </DropZone>
        </div>
        <div>
          <Select
            name={'runningStatus'}
            options={runningStatus?.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            label="Running Status"
            value={formData?.runningStatus? formData.runningStatus : ''}
            onChange={(value: any) => {
              handleChange('runningStatus', value);
              handleSave(formData); // Save on change
            }}
          />
        </div>
        <div>
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
        </div>
      </div>
    </div>
  );
};

export default Details;
