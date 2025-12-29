'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';

const FetchAIModelForPublish: any = graphql(`
  query AIModelForPublish($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      name
      displayName
      description
      modelType
      status
      isPublic
      isActive
      tags {
        id
        value
      }
      sectors {
        id
        name
      }
      geographies {
        id
        name
      }
      versions {
        id
        version
        lifecycleStage
        isLatest
        providers {
          id
          provider
          providerModelId
          isPrimary
        }
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

  const { data, isLoading, refetch } = useQuery(
    [`fetch_AIModelForPublish_${params.id}`],
    () =>
      GraphQL(
        FetchAIModelForPublish,
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

  const model = (data as any)?.aiModels?.[0];
  const versions = model?.versions || [];
  const primaryVersion = versions.find((v: any) => v.isLatest) || versions[0];
  const hasProviders = versions.some((v: any) => v.providers?.length > 0);

  const { mutate, isLoading: updateLoading } = useMutation(
    (mutationData: any) =>
      GraphQL(
        UpdateAIModelStatusMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          input: {
            id: parseInt(params.id),
            ...mutationData,
          },
        }
      ),
    {
      onSuccess: () => {
        toast('Model status updated successfully');
        setStatus('saved');
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
        setStatus('unsaved');
      },
    }
  );

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

  // Model type display names
  const modelTypeLabels: Record<string, string> = {
    LLM: 'Large Language Model',
    VISION: 'Vision Model',
    AUDIO: 'Audio Model',
    MULTIMODAL: 'Multimodal Model',
    EMBEDDING: 'Embedding Model',
    CLASSIFICATION: 'Classification Model',
    GENERATION: 'Generation Model',
    CUSTOM: 'Custom Model',
  };

  // Lifecycle stage display names
  const lifecycleLabels: Record<string, string> = {
    DEVELOPMENT: 'Development',
    TESTING: 'Testing',
    BETA: 'Beta Testing',
    STAGING: 'Staging',
    PRODUCTION: 'Production',
    DEPRECATED: 'Deprecated',
    RETIRED: 'Retired',
  };

  // Checklist items
  const checklistItems = [
    {
      id: 'name',
      label: 'Model name added',
      checked: !!model?.name && !!model?.displayName,
    },
    {
      id: 'description',
      label: 'Model description added',
      checked: !!model?.description,
    },
    {
      id: 'type',
      label: 'Model type selected',
      checked: !!model?.modelType,
    },
    {
      id: 'tags',
      label: 'Tags added',
      checked: model?.tags?.length > 0,
    },
    {
      id: 'sectors',
      label: 'Sectors selected',
      checked: model?.sectors?.length > 0,
    },
    {
      id: 'geographies',
      label: 'Geographies selected',
      checked: model?.geographies?.length > 0,
    },
    {
      id: 'version',
      label: 'At least one version created',
      checked: versions.length > 0,
    },
    {
      id: 'primaryVersion',
      label: 'Primary version selected',
      checked: !!primaryVersion,
    },
    {
      id: 'provider',
      label: 'At least one access method configured',
      checked: hasProviders,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.checked).length;
  const allComplete = completedCount === checklistItems.length;

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!model) {
    return <div className="p-6">Model not found</div>;
  }

  const isPublished = model?.status === 'ACTIVE' && model?.isPublic;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Summary Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-6">
          Model Summary
        </Text>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {/* Left Column */}
          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Model Name
            </Text>
            <Text variant="bodyMd" fontWeight="semibold">
              {model.displayName || model.name || '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Primary Version
            </Text>
            <Text variant="bodyMd" fontWeight="semibold">
              {primaryVersion ? `Version ${primaryVersion.version}` : '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Model Type
            </Text>
            <Text variant="bodyMd">
              {modelTypeLabels[model.modelType] || model.modelType || '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Lifecycle Stage
            </Text>
            <Text variant="bodyMd">
              {primaryVersion
                ? lifecycleLabels[primaryVersion.lifecycleStage] ||
                  primaryVersion.lifecycleStage
                : '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Tags
            </Text>
            <Text variant="bodyMd">
              {model.tags?.length > 0
                ? model.tags.map((t: any) => t.value).join(', ')
                : '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Total Versions
            </Text>
            <Text variant="bodyMd">{versions.length}</Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Sectors
            </Text>
            <Text variant="bodyMd">
              {model.sectors?.length > 0
                ? model.sectors.map((s: any) => s.name).join(', ')
                : '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Access Methods
            </Text>
            <Text variant="bodyMd">
              {primaryVersion?.providers?.length || 0} configured
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Geographies
            </Text>
            <Text variant="bodyMd">
              {model.geographies?.length > 0
                ? model.geographies.map((g: any) => g.name).join(', ')
                : '-'}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            <Text variant="bodySm" color="subdued">
              Description
            </Text>
            <Text variant="bodyMd">
              {model.description
                ? model.description.length > 100
                  ? `${model.description.substring(0, 100)}...`
                  : model.description
                : '-'}
            </Text>
          </div>
        </div>
      </div>

      {/* Publication Checklist */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <Text variant="headingMd" as="h2">
            Publication Checklist
          </Text>
          <Text variant="bodySm" color="subdued">
            {completedCount} of {checklistItems.length} complete
          </Text>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.checked}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <Text
                variant="bodyMd"
                color={item.checked ? 'default' : 'subdued'}
              >
                {item.label}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Publication Status */}
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
              {allComplete
                ? 'All checklist items are complete. You can now publish your model.'
                : 'Complete all checklist items before publishing your model.'}
            </Text>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {!isPublished && (
          <Button
            onClick={handlePublish}
            loading={updateLoading}
            disabled={!allComplete}
          >
            PUBLISH MODEL
          </Button>
        )}
      </div>
    </div>
  );
}
