'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
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
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';

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
        lifecycleStage
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
          hfUsePipeline
          hfAuthToken
          hfModelClass
          hfAttnImplementation
          framework
          config
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


export default function VersionsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();

  // Invalidate cache on mount to force fresh fetch
  useEffect(() => {
    queryClient.invalidateQueries([`fetch_model_versions_${params.id}`]);
  }, [params.id, queryClient]);

  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isWhatsThisModalOpen, setIsWhatsThisModalOpen] = useState(false);
  const [isPrimaryConfirmModalOpen, setIsPrimaryConfirmModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [pendingPrimaryVersionId, setPendingPrimaryVersionId] = useState<number | null>(null);

  const [newVersionData, setNewVersionData] = useState({
    version: '',
    lifecycleStage: 'DEVELOPMENT',
    copyFromVersionId: null as number | null,
    isLatest: false,
  });

  const [providerFormData, setProviderFormData] = useState({
    provider: 'CUSTOM',
    providerModelId: '',
    isPrimary: false,
    // Huggingface-specific
    hfUsePipeline: false,
    hfModelClass: '',
    hfAuthToken: '',
    hfAttnImplementation: 'flash_attention_2',
    framework: '',
    // API-based providers (OpenAI, Llama, Custom)
    apiKey: '',
    baseUrl: '',
    authType: 'BEARER',
  });

  // Fetch model versions - override default refetchOnMount: false
  const { data, isLoading, refetch } = useQuery(
    [`fetch_model_versions_${params.id}`],
    () =>
      GraphQL(
        fetchModelVersions,
        { [params.entityType]: params.entitySlug },
        { filters: { id: parseInt(params.id) } } as any
      ),
    {
      enabled: !!params.id,
      staleTime: 0, // Always consider data stale
      refetchOnMount: true, // Override global default
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
      onSuccess: async (response: any) => {
        toast('New version created successfully!');
        setIsNewVersionModalOpen(false);
        resetVersionForm();
        // Select the newly created version after refetch
        const newVersionId = response?.createAiModelVersion?.data?.id;
        const result = await refetch();
        if (newVersionId && result.data) {
          // Find and select the new version from refetched data
          const refetchedVersions = (result.data as any)?.aiModels?.[0]?.versions || [];
          const newVersion = refetchedVersions.find((v: any) => v.id === newVersionId);
          if (newVersion) {
            setSelectedVersion(newVersion);
          }
        }
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

  const resetVersionForm = () => {
    setNewVersionData({
      version: '',
      lifecycleStage: 'DEVELOPMENT',
      copyFromVersionId: null,
      isLatest: false,
    });
  };

  const resetProviderForm = () => {
    setProviderFormData({
      provider: 'CUSTOM',
      providerModelId: '',
      isPrimary: false,
      hfUsePipeline: false,
      hfModelClass: '',
      hfAuthToken: '',
      hfAttnImplementation: 'flash_attention_2',
      framework: '',
      apiKey: '',
      baseUrl: '',
      authType: 'BEARER',
    });
  };

  const handleCreateNewVersion = () => {
    // Suggest next version number
    let suggestedVersion = '1.0';
    if (latestVersion?.version) {
      const parts = latestVersion.version.split('.');
      if (parts.length >= 2) {
        const minor = parseInt(parts[1]) + 1;
        suggestedVersion = `${parts[0]}.${minor}`;
      }
    }

    setNewVersionData({
      version: suggestedVersion,
      lifecycleStage: 'DEVELOPMENT',
      copyFromVersionId: latestVersion?.id || null,
      isLatest: false,
    });
    setIsNewVersionModalOpen(true);
  };

  const handleSaveNewVersion = () => {
    if (!newVersionData.version) {
      toast('Please enter a version number');
      return;
    }
    if (!newVersionData.lifecycleStage) {
      toast('Please select a lifecycle stage');
      return;
    }

    createVersion({
      modelId: parseInt(params.id),
      version: newVersionData.version,
      lifecycleStage: newVersionData.lifecycleStage,
      copyFromVersionId: newVersionData.copyFromVersionId,
      isLatest: newVersionData.isLatest,
    });
  };

  const handleOpenProviderModal = (version: any, provider?: any) => {
    setSelectedVersion(version);
    if (provider) {
      setEditingProvider(provider);
      const config = provider.config || {};
      setProviderFormData({
        provider: provider.provider,
        providerModelId: provider.providerModelId || '',
        isPrimary: provider.isPrimary,
        hfUsePipeline: provider.hfUsePipeline || false,
        hfModelClass: provider.hfModelClass || '',
        hfAuthToken: provider.hfAuthToken || '',
        hfAttnImplementation: provider.hfAttnImplementation || 'flash_attention_2',
        framework: provider.framework || '',
        apiKey: config.apiKey || '',
        baseUrl: config.baseUrl || '',
        authType: config.authType || 'BEARER',
      });
    } else {
      setEditingProvider(null);
      resetProviderForm();
    }
    setIsProviderModalOpen(true);
  };

  const handleSaveProvider = () => {
    if (!selectedVersion) return;

    // Build config object for API-based providers
    const config: Record<string, any> = {};
    if (providerFormData.apiKey) {
      config.apiKey = providerFormData.apiKey;
    }
    if (providerFormData.baseUrl) {
      config.baseUrl = providerFormData.baseUrl;
    }
    if (providerFormData.authType && providerFormData.authType !== 'BEARER') {
      config.authType = providerFormData.authType;
    }

    const baseData = {
      providerModelId: providerFormData.providerModelId,
      isPrimary: providerFormData.isPrimary,
      hfUsePipeline: providerFormData.hfUsePipeline,
      hfModelClass: providerFormData.hfModelClass || null,
      hfAuthToken: providerFormData.hfAuthToken || null,
      hfAttnImplementation: providerFormData.hfAttnImplementation || null,
      framework: providerFormData.framework || null,
      config: Object.keys(config).length > 0 ? config : null,
    };

    if (editingProvider) {
      updateProvider({
        id: editingProvider.id,
        ...baseData,
      });
    } else {
      createProvider({
        versionId: selectedVersion.id,
        provider: providerFormData.provider,
        ...baseData,
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

  const lifecycleStageOptions = [
    { label: 'Select Lifecycle Stage', value: '' },
    { label: 'Development', value: 'DEVELOPMENT' },
    { label: 'Testing', value: 'TESTING' },
    { label: 'Beta Testing', value: 'BETA' },
    { label: 'Staging', value: 'STAGING' },
    { label: 'Production', value: 'PRODUCTION' },
    { label: 'Deprecated', value: 'DEPRECATED' },
    { label: 'Retired', value: 'RETIRED' },
  ];


  // Update version mutation for lifecycle stage changes
  const { mutate: updateVersion } = useMutation(
    (input: any) =>
      GraphQL(
        updateVersionMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: () => {
        toast('Version updated successfully!');
        refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const handleLifecycleChange = (versionId: number, lifecycleStage: string) => {
    // Optimistically update local state - always set selectedVersion if not set
    const currentVersion = selectedVersion || latestVersion;
    if (currentVersion?.id === versionId) {
      setSelectedVersion({ ...currentVersion, lifecycleStage });
    }
    updateVersion({ id: versionId, lifecycleStage });
  };

  const handleSetPrimaryVersion = (versionId: number, isLatest: boolean) => {
    if (isLatest) {
      // Show confirmation dialog before setting as primary
      setPendingPrimaryVersionId(versionId);
      setIsPrimaryConfirmModalOpen(true);
    } else {
      // Unchecking - just update directly
      const currentVersion = selectedVersion || latestVersion;
      if (currentVersion?.id === versionId) {
        setSelectedVersion({ ...currentVersion, isLatest: false });
      }
      updateVersion({ id: versionId, isLatest: false });
    }
  };

  const confirmSetPrimaryVersion = () => {
    if (pendingPrimaryVersionId) {
      const currentVersion = selectedVersion || latestVersion;
      if (currentVersion?.id === pendingPrimaryVersionId) {
        setSelectedVersion({ ...currentVersion, isLatest: true });
      }
      updateVersion({ id: pendingPrimaryVersionId, isLatest: true });
    }
    setIsPrimaryConfirmModalOpen(false);
    setPendingPrimaryVersionId(null);
  };

  // Get provider display name
  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      OPENAI: 'OpenAI',
      LLAMA_OLLAMA: 'Llama (Ollama)',
      LLAMA_TOGETHER: 'Together AI',
      LLAMA_REPLICATE: 'Replicate',
      LLAMA_CUSTOM: 'Llama Custom',
      CUSTOM: 'Custom API',
      HUGGINGFACE: 'HuggingFace',
    };
    return names[provider] || provider;
  };

  // Get endpoint URL from provider config
  const getEndpointUrl = (provider: any) => {
    if (provider.provider === 'HUGGINGFACE') {
      return `api.huggingface.com/${provider.providerModelId || ''}`;
    }
    if (provider.config?.baseUrl) {
      return provider.config.baseUrl;
    }
    if (provider.provider === 'OPENAI') {
      return 'api.openai.com';
    }
    return provider.providerModelId || '-';
  };

  // Get access priority label
  const getAccessPriority = (provider: any) => {
    return provider.isPrimary ? 'Primary Source' : 'Alternate Source';
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header with Version Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            name="versionSelector"
            label=""
            options={versions.map((v: any) => ({
              label: `Version ${v.version}`,
              value: v.id.toString(),
            }))}
            value={selectedVersion?.id?.toString() || latestVersion?.id?.toString() || ''}
            onChange={(value) => {
              const version = versions.find((v: any) => v.id.toString() === value);
              setSelectedVersion(version);
            }}
          />
        </div>
        <Button onClick={handleCreateNewVersion}>NEW VERSION</Button>
      </div>

      {/* Selected Version Details */}
      {versions.length > 0 ? (
        (() => {
          const currentVersion = selectedVersion || latestVersion;
          if (!currentVersion) return null;
          
          return (
            <div className="space-y-6">
              {/* Lifecycle Stage */}
              <div className="flex flex-col gap-2">
                <Text variant="bodyMd" fontWeight="semibold">
                  Lifecycle Stage <span className="text-red-500">*</span>
                </Text>
                <Select
                  name="lifecycleStage"
                  label=""
                  options={lifecycleStageOptions.filter((o) => o.value !== '')}
                  value={currentVersion.lifecycleStage || 'DEVELOPMENT'}
                  onChange={(value) => handleLifecycleChange(currentVersion.id, value)}
                />
              </div>

              {/* Select as Primary Version */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={currentVersion.isLatest}
                  onChange={(e) => handleSetPrimaryVersion(currentVersion.id, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <span>Select as Primary Version</span>
                <span
                  onClick={() => setIsWhatsThisModalOpen(true)}
                  className="cursor-pointer text-sm text-secondaryOrange underline"
                >
                  What&apos;s this?
                </span>
              </div>

              {/* Providers Table */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        PROVIDER
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        ENDPOINT URL
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        ACCESS PRIORITY
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentVersion.providers?.length > 0 ? (
                      currentVersion.providers.map((provider: any) => (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {getProviderDisplayName(provider.provider)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getEndpointUrl(provider)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getAccessPriority(provider)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <IconButton
                                size="medium"
                                icon={Icons.pencil}
                                onClick={() => handleOpenProviderModal(currentVersion, provider)}
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No access methods configured
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Access Method Button */}
              <div className="flex justify-center">
                <Button
                  kind="tertiary"
                  onClick={() => handleOpenProviderModal(currentVersion)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">+</span> Add Access Method
                  </span>
                </Button>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12">
          <Icon source={Icons.light} size={48} color="subdued" />
          <Text variant="headingSm" color="subdued" className="mt-4">
            No versions yet
          </Text>
          <Text variant="bodySm" color="subdued" className="mt-2">
            Create your first version to configure access methods
          </Text>
          <Button onClick={handleCreateNewVersion} className="mt-4">
            Create First Version
          </Button>
        </div>
      )}

      {/* New Version Modal */}
      <Dialog open={isNewVersionModalOpen} onOpenChange={setIsNewVersionModalOpen}>
        {isNewVersionModalOpen && (
          <Dialog.Content title="Add a New Version">
            <FormLayout>
              <TextField
                name="version"
                label="Version Name"
                value={newVersionData.version}
                onChange={(value) =>
                  setNewVersionData((prev) => ({ ...prev, version: value }))
                }
                helpText="E.g Version 1.2"
                required
              />
              <Select
                name="lifecycleStage"
                label="Lifecycle Stage"
                options={lifecycleStageOptions}
                value={newVersionData.lifecycleStage}
                onChange={(value) =>
                  setNewVersionData((prev) => ({ ...prev, lifecycleStage: value }))
                }
                required
              />
              {!newVersionData.lifecycleStage && (
                <Text variant="bodySm" color="critical">
                  Lifecycle Stage is required
                </Text>
              )}
              <Select
                name="copyFromVersionId"
                label="Duplicate Endpoints From"
                options={[
                  { label: 'Create without duplicating', value: '' },
                  ...versions.map((v: any) => ({
                    label: `Version ${v.version}`,
                    value: v.id.toString(),
                  })),
                ]}
                value={newVersionData.copyFromVersionId?.toString() || ''}
                onChange={(value) =>
                  setNewVersionData((prev) => ({
                    ...prev,
                    copyFromVersionId: value ? parseInt(value) : null,
                  }))
                }
                required
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newVersionData.isLatest}
                  onChange={(e) =>
                    setNewVersionData((prev) => ({
                      ...prev,
                      isLatest: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                <span>Select as Primary Version</span>
              </label>
              <Text variant="bodySm" color="subdued">
                This will be the default version for audits
              </Text>

              <div className="flex justify-center pt-4">
                <Button onClick={handleSaveNewVersion} loading={createLoading} fullWidth>
                  SAVE AND CLOSE
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

              {/* OpenAI-specific fields */}
              {providerFormData.provider === 'OPENAI' && (
                <>
                  <TextField
                    name="apiKey"
                    label="API Key"
                    type="password"
                    value={providerFormData.apiKey}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, apiKey: value }))
                    }
                    helpText="Your OpenAI API key"
                    required
                  />
                </>
              )}

              {/* Llama variants - Together AI, Replicate */}
              {(providerFormData.provider === 'LLAMA_TOGETHER' ||
                providerFormData.provider === 'LLAMA_REPLICATE') && (
                <>
                  <TextField
                    name="apiKey"
                    label="API Key"
                    type="password"
                    value={providerFormData.apiKey}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, apiKey: value }))
                    }
                    helpText={`Your ${providerFormData.provider === 'LLAMA_TOGETHER' ? 'Together AI' : 'Replicate'} API key`}
                    required
                  />
                </>
              )}

              {/* Llama Ollama - needs base URL */}
              {providerFormData.provider === 'LLAMA_OLLAMA' && (
                <>
                  <TextField
                    name="baseUrl"
                    label="Ollama Base URL"
                    value={providerFormData.baseUrl}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, baseUrl: value }))
                    }
                    placeholder="http://localhost:11434"
                    helpText="URL where Ollama is running"
                    required
                  />
                </>
              )}

              {/* Llama Custom - needs base URL and API key */}
              {providerFormData.provider === 'LLAMA_CUSTOM' && (
                <>
                  <TextField
                    name="baseUrl"
                    label="API Base URL"
                    value={providerFormData.baseUrl}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, baseUrl: value }))
                    }
                    placeholder="https://your-api.com/v1"
                    helpText="Base URL for your custom Llama API"
                    required
                  />
                  <TextField
                    name="apiKey"
                    label="API Key"
                    type="password"
                    value={providerFormData.apiKey}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, apiKey: value }))
                    }
                    helpText="API key for authentication (if required)"
                  />
                </>
              )}

              {/* Custom API - needs base URL, API key, and auth type */}
              {providerFormData.provider === 'CUSTOM' && (
                <>
                  <TextField
                    name="baseUrl"
                    label="API Base URL"
                    value={providerFormData.baseUrl}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, baseUrl: value }))
                    }
                    placeholder="https://your-api.com/v1"
                    helpText="Base URL for your custom API"
                    required
                  />
                  <TextField
                    name="apiKey"
                    label="API Key / Token"
                    type="password"
                    value={providerFormData.apiKey}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, apiKey: value }))
                    }
                    helpText="API key or token for authentication"
                  />
                  <Select
                    name="authType"
                    label="Authentication Type"
                    options={[
                      { label: 'Bearer Token', value: 'BEARER' },
                      { label: 'API Key Header', value: 'API_KEY' },
                      { label: 'Basic Auth', value: 'BASIC' },
                      { label: 'OAuth2', value: 'OAUTH2' },
                      { label: 'Custom', value: 'CUSTOM' },
                    ]}
                    value={providerFormData.authType}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, authType: value }))
                    }
                  />
                </>
              )}

              {/* Huggingface-specific fields */}
              {providerFormData.provider === 'HUGGINGFACE' && (
                <>
                  <TextField
                    name="hfAuthToken"
                    label="Huggingface Auth Token"
                    type="password"
                    value={providerFormData.hfAuthToken}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({ ...prev, hfAuthToken: value }))
                    }
                    helpText="Required for gated models"
                  />
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
                    required
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
                  <TextField
                    name="hfAttnImplementation"
                    label="Attention Implementation"
                    value={providerFormData.hfAttnImplementation}
                    onChange={(value) =>
                      setProviderFormData((prev) => ({
                        ...prev,
                        hfAttnImplementation: value,
                      }))
                    }
                    helpText="e.g., flash_attention_2, eager, sdpa"
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

      {/* What is Primary Version Modal */}
      <Dialog open={isWhatsThisModalOpen} onOpenChange={setIsWhatsThisModalOpen}>
        {isWhatsThisModalOpen && (
          <Dialog.Content title="What is a Primary Version?">
            <div className="space-y-4">
              <Text>
                When you set up multiple versions of your AI model, you can select one version to
                be the Primary Version.
              </Text>
              <Text>
                The Primary Version will be selected by default for audits. You can switch to
                another version before starting your audits.
              </Text>
              <Text>
                If your model is shared publicly, your primary version will be displayed at the top
                of the list of versions.
              </Text>
              <div className="flex justify-center pt-4">
                <Button onClick={() => setIsWhatsThisModalOpen(false)} fullWidth>
                  CLOSE
                </Button>
              </div>
            </div>
          </Dialog.Content>
        )}
      </Dialog>

      {/* Primary Version Confirmation Modal */}
      <Dialog open={isPrimaryConfirmModalOpen} onOpenChange={setIsPrimaryConfirmModalOpen}>
        {isPrimaryConfirmModalOpen && (
          <Dialog.Content title="Select as Primary Version?">
            <div className="space-y-4">
              {(() => {
                const currentPrimary = versions.find((v: any) => v.isLatest);
                const pendingVersion = versions.find((v: any) => v.id === pendingPrimaryVersionId);
                return (
                  <>
                    {currentPrimary && currentPrimary.id !== pendingPrimaryVersionId && (
                      <Text>
                        If you confirm, version {currentPrimary.version} will no longer be your primary version.
                      </Text>
                    )}
                    <Text>
                      Do you want to make version {pendingVersion?.version} your primary version?
                    </Text>
                  </>
                );
              })()}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    setIsPrimaryConfirmModalOpen(false);
                    setPendingPrimaryVersionId(null);
                  }}
                  kind="secondary"
                  fullWidth
                >
                  CANCEL
                </Button>
                <Button onClick={confirmSetPrimaryVersion} fullWidth>
                  SELECT AS PRIMARY
                </Button>
              </div>
            </div>
          </Dialog.Content>
        )}
      </Dialog>
    </div>
  );
}
