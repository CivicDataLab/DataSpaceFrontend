'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { CollaborativeInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DropZone, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useEditStatus } from '../../context';
import Metadata from '../metadata/page';

interface UploadedImage {
  name?: string | null;
  path?: string | null;
  url?: string | null;
}

interface CollaborativeFormData {
  title: string;
  summary: string;
  logo: File | UploadedImage | null;
  coverImage: File | UploadedImage | null;
  slug: string;
  status: string;
  startedOn: string | null;
  completedOn: string | null;
  platformUrl: string;
}

// prettier-ignore
const UpdateCollaborativeMutation = graphql(`
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
      coverImage {
        name
        path
        url
      }
    }
  }
`);

//prettier-ignore
const FetchCollaborative = graphql(`
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
      coverImage {
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

  const queryClient = useQueryClient();
  const COLLAB_DETAILS_TOAST_ID = 'collaboratives-details-toast';

  const CollaborativeData =
    useQuery(
      [
        `fetch_CollaborativeData_details`,
        params.entityType,
        params.entitySlug,
        params.id,
      ],
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
    logo: null as File | UploadedImage | null,
    coverImage: null as File | UploadedImage | null,
    slug: '',
    status: '',
    startedOn: null as string | null,
    completedOn: null as string | null,
    platformUrl: '',
  };

  const [formData, setFormData] =
    useState<CollaborativeFormData>(initialFormData);
  const [previousFormData, setPreviousFormData] =
    useState<CollaborativeFormData>(initialFormData);
  const [slugError, setSlugError] = useState<string | null>(null);

  const validateSlug = (value: string) => {
    const v = (value ?? '').trim();
    if (!v) return 'URL subdomain is required.';
    if (v.length > 80) return 'URL subdomain must be 80 characters or less.';
    if (v !== v.toLowerCase()) return 'Use lowercase letters only.';
    // lowercase letters, digits, hyphens; no leading/trailing hyphen; no consecutive hyphens
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) {
      return 'URL subdomain can contain only lowercase letters, numbers, and single hyphens (no spaces).';
    }
    return null;
  };

  const [prevCollaborativesData, setPrevCollaborativesData] = useState<
    typeof CollaborativesData | undefined
  >(undefined);
  const [prevDetailsId, setPrevDetailsId] = useState(params.id);
  if (
    params.id !== prevDetailsId ||
    CollaborativesData !== prevCollaborativesData
  ) {
    setPrevDetailsId(params.id);
    setPrevCollaborativesData(CollaborativesData);
    if (CollaborativesData) {
      const updatedData = {
        title: CollaborativesData.title || '',
        summary: CollaborativesData.summary || '',
        logo: CollaborativesData.logo || null,
        coverImage: CollaborativesData.coverImage || null,
        slug: CollaborativesData.slug || '',
        status: CollaborativesData.status || '',
        startedOn: CollaborativesData.startedOn || '',
        completedOn: CollaborativesData.completedOn || '',
        platformUrl: CollaborativesData.platformUrl || '',
      };
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }

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
      onSuccess: (res) => {
        toast('Collaborative updated successfully', {
          id: COLLAB_DETAILS_TOAST_ID,
        });
        setFormData((prev) => ({
          ...prev,
          title: res.updateCollaborative.title ?? prev.title,
          summary: res.updateCollaborative.summary ?? prev.summary,
          logo: res.updateCollaborative.logo ?? prev.logo,
          coverImage: res.updateCollaborative.coverImage ?? prev.coverImage,
          slug: res.updateCollaborative.slug ?? prev.slug,
          status: res.updateCollaborative.status ?? prev.status,
          startedOn: res.updateCollaborative.startedOn ?? prev.startedOn,
          completedOn: res.updateCollaborative.completedOn ?? prev.completedOn,
          platformUrl: res.updateCollaborative.platformUrl ?? prev.platformUrl,
        }));
        setPreviousFormData((prev) => ({
          ...prev,
          title: res.updateCollaborative.title ?? prev.title,
          summary: res.updateCollaborative.summary ?? prev.summary,
          logo: res.updateCollaborative.logo ?? prev.logo,
          coverImage: res.updateCollaborative.coverImage ?? prev.coverImage,
          slug: res.updateCollaborative.slug ?? prev.slug,
          status: res.updateCollaborative.status ?? prev.status,
          startedOn: res.updateCollaborative.startedOn ?? prev.startedOn,
          completedOn: res.updateCollaborative.completedOn ?? prev.completedOn,
          platformUrl: res.updateCollaborative.platformUrl ?? prev.platformUrl,
        }));

        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeData_details`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
      },
      onError: (error: unknown) => {
        let msg = 'Something went wrong';
        if (typeof error === 'object' && error !== null) {
          if (
            'response' in error &&
            typeof error.response === 'object' &&
            error.response !== null &&
            'errors' in error.response &&
            Array.isArray(error.response.errors) &&
            typeof error.response.errors[0]?.message === 'string'
          ) {
            msg = error.response.errors[0].message;
          } else if ('message' in error && typeof error.message === 'string') {
            msg = error.message;
          }
        }
        toast(`Error: ${msg}`, { id: COLLAB_DETAILS_TOAST_ID });
      },
    }
  );

  const handleChange = useCallback(
    (field: keyof CollaborativeFormData, value: CollaborativeFormData[keyof CollaborativeFormData]) => {
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

  const onCoverImageDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      mutate({
        data: {
          id: params.id.toString(),
          coverImage: acceptedFiles[0],
        },
      });
    },
    [mutate, params.id]
  );

  const handleSave = (updatedData: CollaborativeFormData) => {
    const slugErr = validateSlug(updatedData?.slug || '');
    if (slugErr) {
      return;
    }

    if (JSON.stringify(updatedData) !== JSON.stringify(previousFormData)) {
      setPreviousFormData(updatedData);

      mutate({
        data: {
          id: params.id.toString(),
          title: updatedData.title,
          summary: updatedData.summary,
          startedOn: updatedData.startedOn || null,
          completedOn: updatedData.completedOn || null,
          platformUrl: updatedData.platformUrl || '',
          slug: updatedData.slug || '',
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
        <RichTextEditor
          label="Summary *"
          value={formData.summary}
          onChange={(value) => handleChange('summary', value)}
          onBlur={() => handleSave(formData)}
          placeholder="Enter collaborative summary with rich formatting..."
          helpText={`Character limit: ${formData?.summary?.length || 0}/10000`}
        />
      </div>
      <div className="flex flex-wrap gap-1 md:flex-nowrap lg:flex-nowrap">
        <div className="w-full pr-3">
          <TextField
            label="External Link"
            name="platformUrl"
            type="url"
            value={formData.platformUrl}
            onChange={(e) => handleChange('platformUrl', e)}
            onBlur={() => handleSave(formData)}
          />
        </div>
        <div className="flex w-full flex-row items-start gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              label="Collaborative URL"
              name="slug"
              type="text"
              required
              requiredIndicator
              value={formData.slug}
              onChange={(e) => {
                setSlugError(null);
                handleChange('slug', e);
              }}
              onBlur={() => {
                const slugErr = validateSlug(formData.slug || '');
                setSlugError(slugErr);
                // if (slugErr) {
                //   toast(`Error: ${slugErr}`, { id: COLLAB_DETAILS_TOAST_ID });
                //   return;
                // }
                handleSave(formData);
              }}
            />
            {slugError ? (
              <Text variant="bodySm" color="critical" className="mt-2">
                {slugError}
              </Text>
            ) : null}
          </div>

          <Text
            variant="bodyMd"
            color="highlight"
            className="shrink-0 pr-8 pt-9"
          >
            .
            {process.env.NEXT_PUBLIC_PLATFORM_DOMAIN?.includes('localhost')
              ? `${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}:${process.env.NEXT_PUBLIC_PLATFORM_PORT}`
              : process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}
          </Text>
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
            actionHint="Only one image can be added. Recommended resolution: Square (400x400) - Supported File Types: PNG/JPG/SVG "
            actionTitle={
              formData.logo &&
              typeof formData.logo === 'object' &&
              'name' in formData.logo
                ? formData.logo.name?.split('/').pop() || 'Logo file'
                : 'Name of the logo'
            }
          />
        </DropZone>
      </div>

      <div>
        <DropZone
          label={
            !formData?.coverImage ? 'Cover Image *' : 'Change Cover Image *'
          }
          onDrop={onCoverImageDrop}
          name={'CoverImage'}
          required
        >
          <DropZone.FileUpload
            actionHint="Only one image can be added. Recommended resolution: 16:9 - (1280x720), (1920x1080) - Supported File Types: PNG/JPG "
            actionTitle={
              formData.coverImage &&
              typeof formData.coverImage === 'object' &&
              'name' in formData.coverImage
                ? formData.coverImage.name?.split('/').pop() ||
                  'Cover image file'
                : 'Name of the cover image'
            }
          />
        </DropZone>
      </div>
    </div>
  );
};

export default Details;
