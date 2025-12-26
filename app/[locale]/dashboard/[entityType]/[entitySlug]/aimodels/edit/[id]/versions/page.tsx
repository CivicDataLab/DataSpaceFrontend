'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  FormLayout,
  Icon,
  IconButton,
  Select,
  Text,
  TextField,
  toast
} from 'opub-ui';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const fetchModelVersions: any = graphql(`
  query FetchModelVersions($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      name
      displayName
      versions {
        id
        version
        versionNotes
        status
        isLatest
        supportsStreaming
        maxTokens
        supportedLanguages
        createdAt
        updatedAt
        publishedAt
        providers {
          id
          provider
          providerModelId
          isPrimary
          isActive
        }
      }
    }
  }
`);

const createVersionMutation: any = graphql(`
  mutation CreateNewModelVersion($input: CreateAIModelVersionInput!) {
    createAiModelVersion(input: $input) {
      success
      data {
        id
        version
        status
      }
    }
  }
`);

const updateVersionMutation: any = graphql(`
  mutation UpdateModelVersion($input: UpdateAIModelVersionInput!) {
    updateAiModelVersion(input: $input) {
      success
      data {
        id
        version
        status
      }
    }
  }
`);

const deleteVersionMutation: any = graphql(`
  mutation DeleteModelVersion($versionId: Int!) {
    deleteAiModelVersion(versionId: $versionId) {
      success
    }
  }
`);

const publishVersionMutation: any = graphql(`
  mutation PublishModelVersion($versionId: Int!) {
    publishAiModelVersion(versionId: $versionId) {
      success
      data {
        id
        status
        publishedAt
      }
    }
  }
`);

const createProviderMutation: any = graphql(`
  mutation CreateModelVersionProvider($input: CreateVersionProviderInput!) {
    createVersionProvider(input: $input) {
      success
      data {
        id
        provider
        providerModelId
        isPrimary
      }
    }
  }
`);

const updateProviderMutation: any = graphql(`
  mutation UpdateModelVersionProvider($input: UpdateVersionProviderInput!) {
    updateVersionProvider(input: $input) {
      success
      data {
        id
        provider
        providerModelId
        isPrimary
      }
    }
  }
`);

const deleteProviderMutation: any = graphql(`
  mutation DeleteModelVersionProvider($providerId: Int!) {
    deleteVersionProvider(providerId: $providerId) {
      success
    }
  }
`);

const setPrimaryProviderMutation: any = graphql(`
  mutation SetModelPrimaryProvider($providerId: Int!) {
    setPrimaryProvider(providerId: $providerId) {
      success
      data {
        id
        isPrimary
      }
    }
  }
`);

export default function VersionsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();

  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [editingProvider, setEditingProvider] = useState<any>(null);

  const [newVersionData, setNewVersionData] = useState({
    version: '',
    versionNotes: '',
    supportsStreaming: false,
    maxTokens: 4096,
    supportedLanguages: 'en',
  });

  const [providerFormData, setProviderFormData] = useState({
    provider: 'CUSTOM',
    providerModelId: '',
    isPrimary: false,
    hfUsePipeline: false,
    hfModelClass: '',
    framework: '',
  });

  // Fetch model versions
  const { data, isLoading, refetch } = useQuery(
    [`fetch_model_versions_${params.id}`],
    () =>
      GraphQL(
        fetchModelVersions,
        { [params.entityType]: params.entitySlug },
        { filters: { id: parseInt(params.id) } } as any
      ),
    {
      refetchOnMount: true,
    }
  );

  const model = (data as any)?.aiModels?.[0];
  const versions = model?.versions || [];
  const latestVersion = versions.find((v: any) => v.isLatest) || versions[0];

  // Mutations
  const { mutate: createVersion, isLoading: createLoading } = useMutation(
    (input: any) =>
      GraphQL(
        createVersionMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: () => {
        toast('New version created successfully!');
        setIsNewVersionModalOpen(false);
        resetVersionForm();
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: deleteVersion } = useMutation(
    (versionId: number) =>
      GraphQL(
        deleteVersionMutation,
        { [params.entityType]: params.entitySlug },
        { versionId } as any
      ),
    {
      onSuccess: () => {
        toast('Version deleted successfully!');
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: publishVersion } = useMutation(
    (versionId: number) =>
      GraphQL(
        publishVersionMutation,
        { [params.entityType]: params.entitySlug },
        { versionId } as any
      ),
    {
      onSuccess: () => {
        toast('Version published successfully!');
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: createProvider, isLoading: createProviderLoading } = useMutation(
    (input: any) =>
      GraphQL(
        createProviderMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: () => {
        toast('Provider added successfully!');
        setIsProviderModalOpen(false);
        resetProviderForm();
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: updateProvider, isLoading: updateProviderLoading } = useMutation(
    (input: any) =>
      GraphQL(
        updateProviderMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: () => {
        toast('Provider updated successfully!');
        setIsProviderModalOpen(false);
        setEditingProvider(null);
        resetProviderForm();
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: deleteProvider } = useMutation(
    (providerId: number) =>
      GraphQL(
        deleteProviderMutation,
        { [params.entityType]: params.entitySlug },
        { providerId } as any
      ),
    {
      onSuccess: () => {
        toast('Provider deleted successfully!');
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: setPrimary } = useMutation(
    (providerId: number) =>
      GraphQL(
        setPrimaryProviderMutation,
        { [params.entityType]: params.entitySlug },
        { providerId } as any
      ),
    {
      onSuccess: () => {
        toast('Primary provider updated!');
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const resetVersionForm = () => {
    setNewVersionData({
      version: '',
      versionNotes: '',
      supportsStreaming: false,
      maxTokens: 4096,
      supportedLanguages: 'en',
    });
  };

  const resetProviderForm = () => {
    setProviderFormData({
      provider: 'CUSTOM',
      providerModelId: '',
      isPrimary: false,
      hfUsePipeline: false,
      hfModelClass: '',
      framework: '',
    });
  };

  const handleCreateNewVersion = () => {
    // Suggest next version number
    let suggestedVersion = '1.0.0';
    if (latestVersion?.version) {
      const parts = latestVersion.version.split('.');
      if (parts.length >= 2) {
        const minor = parseInt(parts[1]) + 1;
        suggestedVersion = `${parts[0]}.${minor}.0`;
      }
    }

    setNewVersionData({
      ...newVersionData,
      version: suggestedVersion,
    });
    setIsNewVersionModalOpen(true);
  };

  const handleSaveNewVersion = () => {
    if (!newVersionData.version) {
      toast('Please enter a version number');
      return;
    }

    createVersion({
      modelId: parseInt(params.id),
      version: newVersionData.version,
      versionNotes: newVersionData.versionNotes,
      supportsStreaming: newVersionData.supportsStreaming,
      maxTokens: newVersionData.maxTokens,
      supportedLanguages: newVersionData.supportedLanguages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      copyFromVersionId: latestVersion?.id || null,
    });
  };

  const handleOpenProviderModal = (version: any, provider?: any) => {
    setSelectedVersion(version);
    if (provider) {
      setEditingProvider(provider);
      setProviderFormData({
        provider: provider.provider,
        providerModelId: provider.providerModelId || '',
        isPrimary: provider.isPrimary,
        hfUsePipeline: provider.hfUsePipeline || false,
        hfModelClass: provider.hfModelClass || '',
        framework: provider.framework || '',
      });
    } else {
      setEditingProvider(null);
      resetProviderForm();
    }
    setIsProviderModalOpen(true);
  };

  const handleSaveProvider = () => {
    if (!selectedVersion) return;

    if (editingProvider) {
      updateProvider({
        id: editingProvider.id,
        providerModelId: providerFormData.providerModelId,
        isPrimary: providerFormData.isPrimary,
        hfUsePipeline: providerFormData.hfUsePipeline,
        hfModelClass: providerFormData.hfModelClass || null,
        framework: providerFormData.framework || null,
      });
    } else {
      createProvider({
        versionId: selectedVersion.id,
        provider: providerFormData.provider,
        providerModelId: providerFormData.providerModelId,
        isPrimary: providerFormData.isPrimary,
        hfUsePipeline: providerFormData.hfUsePipeline,
        hfModelClass: providerFormData.hfModelClass || null,
        framework: providerFormData.framework || null,
      });
    }
  };

  const providerOptions = [
    { label: 'OpenAI', value: 'OPENAI' },
    { label: 'Llama (Ollama)', value: 'LLAMA_OLLAMA' },
    { label: 'Llama (Together AI)', value: 'LLAMA_TOGETHER' },
    { label: 'Llama (Replicate)', value: 'LLAMA_REPLICATE' },
    { label: 'Llama (Custom)', value: 'LLAMA_CUSTOM' },
    { label: 'Custom API', value: 'CUSTOM' },
    { label: 'Huggingface', value: 'HUGGINGFACE' },
  ];

  const hfModelClassOptions = [
    { label: 'Causal LM', value: 'AutoModelForCausalLM' },
    { label: 'Seq2Seq LM', value: 'AutoModelForSeq2SeqLM' },
    { label: 'Sequence Classification', value: 'AutoModelForSequenceClassification' },
    { label: 'Token Classification', value: 'AutoModelForTokenClassification' },
    { label: 'Question Answering', value: 'AutoModelForQuestionAnswering' },
    { label: 'Masked LM', value: 'AutoModelForMaskedLM' },
  ];

  const frameworkOptions = [
    { label: 'PyTorch', value: 'pt' },
    { label: 'TensorFlow', value: 'tf' },
  ];

  const statusColorMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    REGISTERED: 'bg-blue-100 text-blue-800',
    DEPRECATED: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="headingMd" as="h2">
            Model Versions
          </Text>
          <Text variant="bodySm" color="subdued">
            Manage versions and providers for {model?.displayName || 'this model'}
          </Text>
        </div>
        <Button onClick={handleCreateNewVersion}>Add New Version</Button>
      </div>

      {/* Versions List */}
      {versions.length > 0 ? (
        <div className="space-y-4">
          {versions.map((version: any) => (
            <div
              key={version.id}
              className={`rounded-lg border p-4 ${
                version.isLatest ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Version Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Text variant="headingSm">v{version.version}</Text>
                  {version.isLatest && (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      Latest
                    </span>
                  )}
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      statusColorMap[version.status] || 'bg-gray-100'
                    }`}
                  >
                    {version.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {version.status !== 'ACTIVE' && (
                    <Button
                      size="slim"
                      kind="tertiary"
                      onClick={() => publishVersion(version.id)}
                    >
                      Publish
                    </Button>
                  )}
                  {!version.isLatest && versions.length > 1 && (
                    <Button
                      size="slim"
                      kind="tertiary"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this version?')) {
                          deleteVersion(version.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Version Details */}
              <div className="mb-4 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <Text variant="bodySm" color="subdued">
                    Max Tokens
                  </Text>
                  <Text>{version.maxTokens || '-'}</Text>
                </div>
                <div>
                  <Text variant="bodySm" color="subdued">
                    Streaming
                  </Text>
                  <Text>{version.supportsStreaming ? 'Yes' : 'No'}</Text>
                </div>
                <div>
                  <Text variant="bodySm" color="subdued">
                    Languages
                  </Text>
                  <Text>{version.supportedLanguages?.join(', ') || '-'}</Text>
                </div>
                <div>
                  <Text variant="bodySm" color="subdued">
                    Created
                  </Text>
                  <Text>{formatDate(version.createdAt)}</Text>
                </div>
              </div>

              {version.versionNotes && (
                <div className="mb-4">
                  <Text variant="bodySm" color="subdued">
                    Notes
                  </Text>
                  <Text variant="bodySm">{version.versionNotes}</Text>
                </div>
              )}

              {/* Providers Section */}
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <Text variant="bodyMd" fontWeight="semibold">
                    Providers ({version.providers?.length || 0})
                  </Text>
                  <Button
                    size="slim"
                    kind="tertiary"
                    onClick={() => handleOpenProviderModal(version)}
                  >
                    Add Provider
                  </Button>
                </div>

                {version.providers?.length > 0 ? (
                  <div className="space-y-2">
                    {version.providers.map((provider: any) => (
                      <div
                        key={provider.id}
                        className={`flex items-center justify-between rounded border p-3 ${
                          provider.isPrimary
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Text fontWeight="medium">{provider.provider}</Text>
                          {provider.providerModelId && (
                            <Text variant="bodySm" color="subdued">
                              ({provider.providerModelId})
                            </Text>
                          )}
                          {provider.isPrimary && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!provider.isPrimary && (
                            <Button
                              size="slim"
                              kind="tertiary"
                              onClick={() => setPrimary(provider.id)}
                            >
                              Set Primary
                            </Button>
                          )}
                          <IconButton
                            size="medium"
                            icon={Icons.pencil}
                            onClick={() => handleOpenProviderModal(version, provider)}
                          >
                            Edit
                          </IconButton>
                          <IconButton
                            size="medium"
                            icon={Icons.delete}
                            onClick={() => {
                              if (confirm('Delete this provider?')) {
                                deleteProvider(provider.id);
                              }
                            }}
                          >
                            Delete
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-gray-300 p-4 text-center">
                    <Text color="subdued">No providers configured</Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12">
          <Icon source={Icons.light} size={48} color="subdued" />
          <Text variant="headingSm" color="subdued" className="mt-4">
            No versions yet
          </Text>
          <Text variant="bodySm" color="subdued" className="mt-2">
            Create your first version to configure providers
          </Text>
          <Button onClick={handleCreateNewVersion} className="mt-4">
            Create First Version
          </Button>
        </div>
      )}

      {/* New Version Modal */}
      <Dialog open={isNewVersionModalOpen} onOpenChange={setIsNewVersionModalOpen}>
        {isNewVersionModalOpen && (
          <Dialog.Content title="Create New Version">
            <FormLayout>
              <TextField
                name="version"
                label="Version Number"
                value={newVersionData.version}
                onChange={(value) =>
                  setNewVersionData((prev) => ({ ...prev, version: value }))
                }
                helpText="Semantic version (e.g., 1.0.0, 2.1.0)"
                required
              />
              <TextField
                name="versionNotes"
                label="Version Notes"
                value={newVersionData.versionNotes}
                onChange={(value) =>
                  setNewVersionData((prev) => ({ ...prev, versionNotes: value }))
                }
                multiline={3}
                helpText="Changelog or notes for this version"
              />
              <TextField
                name="maxTokens"
                label="Max Tokens"
                type="number"
                value={newVersionData.maxTokens.toString()}
                onChange={(value) =>
                  setNewVersionData((prev) => ({
                    ...prev,
                    maxTokens: parseInt(value) || 0,
                  }))
                }
              />
              <TextField
                name="supportedLanguages"
                label="Supported Languages"
                value={newVersionData.supportedLanguages}
                onChange={(value) =>
                  setNewVersionData((prev) => ({
                    ...prev,
                    supportedLanguages: value,
                  }))
                }
                helpText="Comma-separated language codes (e.g., en, es, fr)"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newVersionData.supportsStreaming}
                  onChange={(e) =>
                    setNewVersionData((prev) => ({
                      ...prev,
                      supportsStreaming: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                <span>Supports Streaming</span>
              </label>

              {latestVersion && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <Text variant="bodySm" className="text-blue-800">
                    <strong>Note:</strong> All providers from version{' '}
                    <strong>{latestVersion.version}</strong> will be copied to this
                    new version.
                  </Text>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  onClick={() => setIsNewVersionModalOpen(false)}
                  kind="secondary"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveNewVersion} loading={createLoading}>
                  Create Version
                </Button>
              </div>
            </FormLayout>
          </Dialog.Content>
        )}
      </Dialog>

      {/* Provider Modal */}
      <Dialog open={isProviderModalOpen} onOpenChange={setIsProviderModalOpen}>
        {isProviderModalOpen && (
          <Dialog.Content
            title={editingProvider ? 'Edit Provider' : 'Add New Provider'}
          >
            <FormLayout>
              <Select
                name="provider"
                label="Provider Type"
                options={providerOptions}
                value={providerFormData.provider}
                onChange={(value) =>
                  setProviderFormData((prev) => ({ ...prev, provider: value }))
                }
                disabled={!!editingProvider}
              />
              <TextField
                name="providerModelId"
                label="Provider Model ID"
                value={providerFormData.providerModelId}
                onChange={(value) =>
                  setProviderFormData((prev) => ({
                    ...prev,
                    providerModelId: value,
                  }))
                }
                helpText="e.g., gpt-4, meta-llama/Llama-2-7b-chat-hf"
              />

              {providerFormData.provider === 'HUGGINGFACE' && (
                <>
                  <Select
                    name="hfModelClass"
                    label="Model Class"
                    options={hfModelClassOptions}
                    value={providerFormData.hfModelClass}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({
                        ...prev,
                        hfModelClass: value,
                      }))
                    }
                  />
                  <Select
                    name="framework"
                    label="Framework"
                    options={frameworkOptions}
                    value={providerFormData.framework}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({
                        ...prev,
                        framework: value,
                      }))
                    }
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={providerFormData.hfUsePipeline}
                      onChange={(e) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          hfUsePipeline: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <span>Use Pipeline API</span>
                  </label>
                </>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={providerFormData.isPrimary}
                  onChange={(e) =>
                    setProviderFormData((prev) => ({
                      ...prev,
                      isPrimary: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                <span>Set as Primary Provider</span>
              </label>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  onClick={() => setIsProviderModalOpen(false)}
                  kind="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProvider}
                  loading={createProviderLoading || updateProviderLoading}
                >
                  {editingProvider ? 'Update' : 'Add Provider'}
                </Button>
              </div>
            </FormLayout>
          </Dialog.Content>
        )}
      </Dialog>
    </div>
  );
}
