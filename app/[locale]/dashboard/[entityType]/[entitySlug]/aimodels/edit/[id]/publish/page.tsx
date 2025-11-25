'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, FormLayout, Select, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';

const FetchAIModelStatus: any = graphql(`
  query AIModelStatus($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      name
      displayName
      description
      status
      isPublic
      isActive
      endpoints {
        id
      }
    }
  }
`);

const UpdateAIModelStatusMutation: any = graphql(`
  mutation updateAIModelStatus($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        status
        isPublic
        isActive
      }
    }
  }
`);

export default function PublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();
  const { setStatus } = useEditStatus();

  const StatusData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_AIModelStatus_${params.id}`],
    () =>
      GraphQL(
        FetchAIModelStatus,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: parseInt(params.id),
          },
        }
      ),
    {
      refetchOnMount: true,
    }
  );

  console.log('StatusData:', StatusData.data);
  console.log('aiModels array:', StatusData.data?.aiModels);
  
  const model = StatusData.data?.aiModels?.[0];

  const { mutate, isLoading: updateLoading } = useMutation(
    (data: any) =>
      GraphQL(
        UpdateAIModelStatusMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            id: parseInt(params.id),
            ...data,
          },
        }
      ),
    {
      onSuccess: () => {
        toast('Model status updated successfully');
        setStatus('saved');
        StatusData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
        setStatus('unsaved');
      },
    }
  );

  const [formData, setFormData] = useState({
    status: 'REGISTERED',
    isPublic: false,
    isActive: true,
  });

  useEffect(() => {
    if (model) {
      setFormData({
        status: model.status || 'REGISTERED',
        isPublic: model.isPublic || false,
        isActive: model.isActive !== undefined ? model.isActive : true,
      });
    }
  }, [model]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus('unsaved');
  };

  const handlePublish = () => {
    setStatus('saving');
    mutate(
      {
        status: 'ACTIVE',
        isPublic: true,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast('Model published successfully');
          router.push(`/dashboard/${params.entityType}/${params.entitySlug}/aimodels`);
        },
      }
    );
  };

  const handleSave = () => {
    setStatus('saving');
    mutate(formData);
  };

  const statusOptions = [
    { label: 'Registered', value: 'REGISTERED' },
    { label: 'Validating', value: 'VALIDATING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Auditing', value: 'AUDITING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Flagged', value: 'FLAGGED' },
    { label: 'Deprecated', value: 'DEPRECATED' },
  ];

  if (StatusData.isLoading) {
    return <div>Loading...</div>;
  }

  if (!model) {
    return <div>Model not found</div>;
  }

  console.log('Model data:', model);
  console.log('Checklist checks:', {
    hasName: !!model?.name,
    hasDisplayName: !!model?.displayName,
    hasDescription: !!model?.description,
    hasEndpoints: model?.endpoints?.length > 0,
    endpointsLength: model?.endpoints?.length
  });

  const isPublished = model?.status === 'ACTIVE' && model?.isPublic;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Publication Status
        </Text>
        
        {isPublished ? (
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <Text variant="headingSm" className="text-green-800">
              ✓ Model is Published and Active
            </Text>
            <Text variant="bodySm" className="mt-2 text-green-700">
              Your AI model is now publicly accessible and can be discovered by
              other users.
            </Text>
          </div>
        ) : (
          <div className="mb-6 rounded-lg bg-yellow-50 p-4">
            <Text variant="headingSm" className="text-yellow-800">
              Model is not published
            </Text>
            <Text variant="bodySm" className="mt-2 text-yellow-700">
              Your AI model is currently in draft mode. Publish it to make it
              available to other users.
            </Text>
          </div>
        )}

        <FormLayout>
          <Select
            name="status"
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            helpText="Current status of the model in the lifecycle"
          />

          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  handleInputChange('isPublic', e.target.checked)
                }
                className="h-4 w-4"
              />
              <div>
                <Text variant="bodyMd">Public</Text>
                <Text variant="bodySm" color="subdued">
                  Make this model visible to all users
                </Text>
              </div>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange('isActive', e.target.checked)
                }
                className="h-4 w-4"
              />
              <div>
                <Text variant="bodyMd">Active</Text>
                <Text variant="bodySm" color="subdued">
                  Model is currently operational and can accept requests
                </Text>
              </div>
            </label>
          </div>
        </FormLayout>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Publication Checklist
        </Text>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!model.name && !!model.displayName}
              disabled
              className="mt-1 h-4 w-4"
            />
            <div>
              <Text variant="bodyMd">Model name and display name set</Text>
              <Text variant="bodySm" color="subdued">
                Basic information is required
              </Text>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!model?.description}
              disabled
              className="mt-1 h-4 w-4"
            />
            <div>
              <Text variant="bodyMd">Description provided</Text>
              <Text variant="bodySm" color="subdued">
                Help users understand your model&apos;s capabilities
              </Text>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={model?.endpoints?.length > 0}
              disabled
              className="mt-1 h-4 w-4"
            />
            <div>
              <Text variant="bodyMd">At least one endpoint configured</Text>
              <Text variant="bodySm" color="subdued">
                Required for model to be functional
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={handleSave} loading={updateLoading}>
          Save Changes
        </Button>
        {!isPublished && (
          <Button
            onClick={handlePublish}
            loading={updateLoading}
            variant="basic"
          >
            Publish Model
          </Button>
        )}
      </div>
    </div>
  );
}
