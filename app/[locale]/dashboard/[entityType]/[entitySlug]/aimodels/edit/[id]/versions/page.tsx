'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  AiModelLifecycleStage,
  AiModelProvider,
  CreateAiModelVersionInput,
  CreateVersionProviderInput,
  EndpointAuthType,
  EndpointHttpMethod,
  UpdateAiModelVersionInput,
  UpdateVersionProviderInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  DataTable,
  Dialog,
  Divider,
  FormLayout,
  Icon,
  IconButton,
  Select,
  Spinner,
  Tag,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const fetchModelVersions = graphql(`
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
          # API Configuration
          apiEndpointUrl
          apiHttpMethod
          apiTimeoutSeconds
          apiAuthType
          apiAuthHeaderName
          apiKey
          apiKeyPrefix
          apiHeaders
          apiRequestTemplate
          apiResponsePath
          # HuggingFace Configuration
          hfUsePipeline
          hfAuthToken
          hfModelClass
          hfAttnImplementation
          hfTrustRemoteCode
          hfTorchDtype
          hfDeviceMap
          framework
          config
        }
      }
    }
  }
`);

const createVersionMutation = graphql(`
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

const updateVersionMutation = graphql(`
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

const createProviderMutation = graphql(`
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

const updateProviderMutation = graphql(`
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

const deleteProviderMutation = graphql(`
  mutation DeleteModelVersionProvider($providerId: Int!) {
    deleteVersionProvider(providerId: $providerId) {
      success
    }
  }
`);

interface VersionProviderRow {
  id: number;
  provider: string;
  providerModelId?: string | null;
  isPrimary: boolean;
  isActive?: boolean;
  apiEndpointUrl?: string | null;
  apiHttpMethod?: string | null;
  apiTimeoutSeconds?: number | null;
  apiAuthType?: string | null;
  apiAuthHeaderName?: string | null;
  apiKey?: string | null;
  apiKeyPrefix?: string | null;
  apiHeaders?: Record<string, string> | null;
  apiRequestTemplate?: unknown;
  apiResponsePath?: string | null;
  hfUsePipeline?: boolean | null;
  hfAuthToken?: string | null;
  hfModelClass?: string | null;
  hfAttnImplementation?: string | null;
  hfTrustRemoteCode?: boolean | null;
  hfTorchDtype?: string | null;
  hfDeviceMap?: string | null;
  framework?: string | null;
}

interface ModelVersionRow {
  id: number;
  version: string;
  versionNotes?: string | null;
  status?: string | null;
  lifecycleStage?: AiModelLifecycleStage | null;
  isLatest: boolean;
  supportsStreaming?: boolean;
  maxTokens?: number | null;
  supportedLanguages?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  providers: VersionProviderRow[];
}

export default function VersionsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const versionsQueryKey = [
    `fetch_model_versions`,
    params.id,
    params.entityType,
    params.entitySlug,
  ];
  const invalidateVersionQueries = () => {
    queryClient.invalidateQueries({
      queryKey: versionsQueryKey,
    });
    queryClient.invalidateQueries({
      queryKey: [
        `fetch_AIModelForPublish`,
        params.id,
        params.entityType,
        params.entitySlug,
      ],
    });
  };

  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isWhatsThisModalOpen, setIsWhatsThisModalOpen] = useState(false);
  const [isPrimaryConfirmModalOpen, setIsPrimaryConfirmModalOpen] =
    useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ModelVersionRow | null>(
    null
  );
  const [editingProvider, setEditingProvider] =
    useState<VersionProviderRow | null>(null);
  const [pendingPrimaryVersionId, setPendingPrimaryVersionId] = useState<
    number | null
  >(null);

  const [newVersionData, setNewVersionData] = useState({
    version: '',
    lifecycleStage: AiModelLifecycleStage.Development,
    copyFromVersionId: null as number | null,
    isLatest: false,
  });

  const [providerFormData, setProviderFormData] = useState({
    provider: AiModelProvider.Custom,
    providerModelId: '',
    isPrimary: false,
    // API Endpoint Configuration
    apiEndpointUrl: '',
    apiHttpMethod: EndpointHttpMethod.Post,
    apiTimeoutSeconds: 60,
    // Authentication Configuration
    apiAuthType: EndpointAuthType.Bearer,
    apiAuthHeaderName: 'Authorization',
    apiKey: '',
    apiKeyPrefix: 'Bearer',
    // Request/Response Configuration
    apiHeaders: {} as Record<string, string>,
    apiRequestTemplate: '',
    apiResponsePath: '',
    // HuggingFace Configuration
    hfUsePipeline: false,
    hfAuthToken: '',
    hfModelClass: '',
    hfAttnImplementation: 'flash_attention_2',
    hfTrustRemoteCode: true,
    hfTorchDtype: 'auto',
    hfDeviceMap: 'auto',
    framework: '',
  });

  const VERSIONS_ACTION_TOAST_ID = 'aimodel-versions-action-toast';
  const VERSIONS_VALIDATION_TOAST_ID = 'aimodel-versions-validation-toast';
  // Fetch model versions - override default refetchOnMount: false
  const { data, isLoading, refetch } = useQuery(
    versionsQueryKey,
    () =>
      GraphQL(fetchModelVersions, { [params.entityType]: params.entitySlug }, {
        filters: { id: parseInt(params.id) },
      }),
    {
      enabled: !!params.id,
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const model = data?.aiModels?.[0];
  const versions = model?.versions || [];
  const latestVersion = versions.find((v) => v.isLatest) || versions[0];

  // Mutations
  const { mutate: createVersion, isLoading: createLoading } = useMutation(
    (input: CreateAiModelVersionInput) =>
      GraphQL(
        createVersionMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: async (response) => {
        toast('New version created successfully!',{id: VERSIONS_ACTION_TOAST_ID});
        setIsNewVersionModalOpen(false);
        resetVersionForm();
        invalidateVersionQueries();

        // Force refetch and update selected version
        const result = await refetch();
        const newVersionId = response?.createAiModelVersion?.data?.id;

        if (newVersionId && result.data) {
          const refetchedVersions =
            result.data?.aiModels?.[0]?.versions || [];
          const newVersion = refetchedVersions.find(
            (v) => v.id === newVersionId
          );
          if (newVersion) {
            setSelectedVersion(newVersion);
          }
        }
      },
      onError: (error: unknown) => {
        toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,{id: VERSIONS_ACTION_TOAST_ID});
      },
    }
  );

  const { mutate: createProvider, isLoading: createProviderLoading } =
    useMutation(
      (input: CreateVersionProviderInput) =>
        GraphQL(
          createProviderMutation,
          { [params.entityType]: params.entitySlug },
          { input }
        ),
      {
        onSuccess: async () => {
          toast('Provider added successfully!',{id: VERSIONS_ACTION_TOAST_ID});
          setIsProviderModalOpen(false);
          resetProviderForm();
          invalidateVersionQueries();

          // Force refetch and update selected version with new provider
          const result = await refetch();
          if (result.data && selectedVersion) {
            const refetchedVersions =
              result.data?.aiModels?.[0]?.versions || [];
            const updatedVersion = refetchedVersions.find(
              (v) => v.id === selectedVersion.id
            );
            if (updatedVersion) {
              setSelectedVersion(updatedVersion);
            }
          }
        },
        onError: (error: unknown) => {
          toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,{id: VERSIONS_ACTION_TOAST_ID});
        },
      }
    );
  const { mutate: updateProvider, isLoading: updateProviderLoading } =
    useMutation(
      (input: UpdateVersionProviderInput) =>
        GraphQL(
          updateProviderMutation,
          { [params.entityType]: params.entitySlug },
          { input }
        ),
      {
        onSuccess: async () => {
          toast('Provider updated successfully!',{id: VERSIONS_ACTION_TOAST_ID});
          setIsProviderModalOpen(false);
          setEditingProvider(null);
          resetProviderForm();
          invalidateVersionQueries();

          // Force refetch and update selected version with updated provider
          const result = await refetch();
          if (result.data && selectedVersion) {
            const refetchedVersions =
              result.data?.aiModels?.[0]?.versions || [];
            const updatedVersion = refetchedVersions.find(
              (v) => v.id === selectedVersion.id
            );
            if (updatedVersion) {
              setSelectedVersion(updatedVersion);
            }
          }
        },
        onError: (error: unknown) => {
          toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,{id: VERSIONS_ACTION_TOAST_ID});
        },
      }
    );

  const { mutate: deleteProvider } = useMutation(
    (providerId: number) =>
      GraphQL(
        deleteProviderMutation,
        { [params.entityType]: params.entitySlug },
        { providerId }
      ),
    {
      onSuccess: async () => {
        toast('Provider deleted successfully!',{id: VERSIONS_ACTION_TOAST_ID});
        invalidateVersionQueries();

        // Force refetch and update selected version after provider deletion
        const result = await refetch();
        if (result.data && selectedVersion) {
          const refetchedVersions =
            result.data?.aiModels?.[0]?.versions || [];
          const updatedVersion = refetchedVersions.find(
            (v) => v.id === selectedVersion.id
          );
          if (updatedVersion) {
            setSelectedVersion(updatedVersion);
          }
        }
      },
      onError: (error: unknown) => {
        toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,{id: VERSIONS_ACTION_TOAST_ID});
      },
    }
  );

  const resetVersionForm = () => {
    setNewVersionData({
      version: '',
      lifecycleStage: AiModelLifecycleStage.Development,
      copyFromVersionId: null,
      isLatest: false,
    });
  };

  const resetProviderForm = () => {
    setProviderFormData({
      provider: AiModelProvider.Custom,
      providerModelId: '',
      isPrimary: false,
      // API Endpoint Configuration
      apiEndpointUrl: '',
      apiHttpMethod: EndpointHttpMethod.Post,
      apiTimeoutSeconds: 60,
      // Authentication Configuration
      apiAuthType: EndpointAuthType.Bearer,
      apiAuthHeaderName: 'Authorization',
      apiKey: '',
      apiKeyPrefix: 'Bearer',
      // Request/Response Configuration
      apiHeaders: {},
      apiRequestTemplate: '',
      apiResponsePath: '',
      // HuggingFace Configuration
      hfUsePipeline: false,
      hfAuthToken: '',
      hfModelClass: '',
      hfAttnImplementation: 'flash_attention_2',
      hfTrustRemoteCode: true,
      hfTorchDtype: 'auto',
      hfDeviceMap: 'auto',
      framework: '',
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
      lifecycleStage: AiModelLifecycleStage.Development,
      copyFromVersionId: latestVersion?.id || null,
      isLatest: false,
    });
    setIsNewVersionModalOpen(true);
  };

  const handleSaveNewVersion = () => {
    if (!newVersionData.version) {
      toast('Please enter a version number', { id: VERSIONS_VALIDATION_TOAST_ID });
      return;
    }
    if (!newVersionData.lifecycleStage) {
      toast('Please select a lifecycle stage', { id: VERSIONS_VALIDATION_TOAST_ID });
      return;
    }

    createVersion({
      modelId: parseInt(params.id),
      version: newVersionData.version,
      lifecycleStage: newVersionData.lifecycleStage || AiModelLifecycleStage.Development,
      copyFromVersionId: newVersionData.copyFromVersionId,
      isLatest: newVersionData.isLatest,
    });
  };

  const handleOpenProviderModal = (
    version: ModelVersionRow,
    provider?: VersionProviderRow
  ) => {
    setSelectedVersion(version);
    if (provider) {
      setEditingProvider(provider);
      setProviderFormData({
        provider: (Object.values(AiModelProvider) as string[]).includes(
          provider.provider
        )
          ? (provider.provider as AiModelProvider)
          : AiModelProvider.Custom,
        providerModelId: provider.providerModelId || '',
        isPrimary: provider.isPrimary,
        // API Endpoint Configuration
        apiEndpointUrl: provider.apiEndpointUrl || '',
        apiHttpMethod: (Object.values(EndpointHttpMethod) as string[]).includes(
          provider.apiHttpMethod ?? ''
        )
          ? (provider.apiHttpMethod as EndpointHttpMethod)
          : EndpointHttpMethod.Post,
        apiTimeoutSeconds: provider.apiTimeoutSeconds || 60,
        // Authentication Configuration
        apiAuthType: (Object.values(EndpointAuthType) as string[]).includes(
          provider.apiAuthType ?? ''
        )
          ? (provider.apiAuthType as EndpointAuthType)
          : EndpointAuthType.Bearer,
        apiAuthHeaderName: provider.apiAuthHeaderName || 'Authorization',
        apiKey: provider.apiKey || '',
        apiKeyPrefix: provider.apiKeyPrefix || 'Bearer',
        // Request/Response Configuration
        apiHeaders: provider.apiHeaders || {},
        apiRequestTemplate: provider.apiRequestTemplate
          ? JSON.stringify(provider.apiRequestTemplate, null, 2)
          : '',
        apiResponsePath: provider.apiResponsePath || '',
        // HuggingFace Configuration
        hfUsePipeline: provider.hfUsePipeline || false,
        hfAuthToken: provider.hfAuthToken || '',
        hfModelClass: provider.hfModelClass || '',
        hfAttnImplementation:
          provider.hfAttnImplementation || 'flash_attention_2',
        hfTrustRemoteCode: provider.hfTrustRemoteCode ?? true,
        hfTorchDtype: provider.hfTorchDtype || 'auto',
        hfDeviceMap: provider.hfDeviceMap || 'auto',
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

    const endpointRequiredProviders = [
      'CUSTOM',
      'LLAMA_OLLAMA',
      'LLAMA_CUSTOM',
    ];
    const isEndpointRequired = endpointRequiredProviders.includes(
      providerFormData.provider
    );

    if (isEndpointRequired && !providerFormData.apiEndpointUrl?.trim()) {
      toast('Endpoint URL is required for the selected provider.', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }

    if (providerFormData.apiEndpointUrl?.trim()) {
      try {
        const url = new URL(providerFormData.apiEndpointUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          toast('Endpoint URL must use HTTP or HTTPS protocol.', {
            id: VERSIONS_VALIDATION_TOAST_ID,
          });
          return;
        }
      } catch {
        toast(
          'Please enter a valid endpoint URL (e.g., https://api.example.com/v1/chat)'
          ,{ id: VERSIONS_VALIDATION_TOAST_ID }
        );
        return;
      }
    }
    let parsedRequestTemplate = null;
    if (providerFormData.apiRequestTemplate) {
      try {
        parsedRequestTemplate = JSON.parse(providerFormData.apiRequestTemplate);
      } catch {
        toast(
          'Invalid JSON in Request Body Template. Please check the format.'
          ,{ id: VERSIONS_VALIDATION_TOAST_ID }
        );
        return;
      }
    }

    const baseData = {
      providerModelId: providerFormData.providerModelId,
      isPrimary: providerFormData.isPrimary,
      // API Endpoint Configuration
      apiEndpointUrl: providerFormData.apiEndpointUrl || null,
      apiHttpMethod: providerFormData.apiHttpMethod || EndpointHttpMethod.Post,
      apiTimeoutSeconds: providerFormData.apiTimeoutSeconds,
      // Authentication Configuration
      apiAuthType: providerFormData.apiAuthType || EndpointAuthType.Bearer,
      apiAuthHeaderName: providerFormData.apiAuthHeaderName || 'Authorization',
      apiKey: providerFormData.apiKey || null,
      apiKeyPrefix: providerFormData.apiKeyPrefix || 'Bearer',
      // Request/Response Configuration
      apiHeaders:
        Object.keys(providerFormData.apiHeaders).length > 0
          ? providerFormData.apiHeaders
          : null,
      apiRequestTemplate: parsedRequestTemplate,
      apiResponsePath: providerFormData.apiResponsePath || null,
      // HuggingFace Configuration
      hfUsePipeline: providerFormData.hfUsePipeline,
      hfAuthToken: providerFormData.hfAuthToken || null,
      hfModelClass: providerFormData.hfModelClass || null,
      hfAttnImplementation: providerFormData.hfAttnImplementation || null,
      hfTrustRemoteCode: providerFormData.hfTrustRemoteCode,
      hfTorchDtype: providerFormData.hfTorchDtype || 'auto',
      hfDeviceMap: providerFormData.hfDeviceMap || 'auto',
      framework: providerFormData.framework || null,
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
    // { label: 'Huggingface', value: 'HUGGINGFACE' },
  ];

  const hfModelClassOptions = [
    { label: 'Causal LM', value: 'AutoModelForCausalLM' },
    { label: 'Seq2Seq LM', value: 'AutoModelForSeq2SeqLM' },
    {
      label: 'Sequence Classification',
      value: 'AutoModelForSequenceClassification',
    },
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

  const { mutate: updateVersion } = useMutation(
    (input: UpdateAiModelVersionInput) =>
      GraphQL(
        updateVersionMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: () => {
        toast('Version updated successfully!',{id: VERSIONS_ACTION_TOAST_ID});
        refetch();
        invalidateVersionQueries();
      },
      onError: (error: unknown) => {
        toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,{id: VERSIONS_ACTION_TOAST_ID});
      },
    }
  );

  const handleLifecycleChange = (
    versionId: number,
    lifecycleStage: string
  ) => {
    const stage = (
      Object.values(AiModelLifecycleStage) as string[]
    ).includes(lifecycleStage)
      ? (lifecycleStage as AiModelLifecycleStage)
      : undefined;
    if (!stage) return;
    const currentVersion = selectedVersion || latestVersion;
    if (currentVersion?.id === versionId) {
      setSelectedVersion({ ...currentVersion, lifecycleStage: stage });
    }
    updateVersion({ id: versionId, lifecycleStage: stage });
  };

  const handleSetPrimaryVersion = (versionId: number, isLatest: boolean) => {
    if (isLatest) {
      setPendingPrimaryVersionId(versionId);
      setIsPrimaryConfirmModalOpen(true);
    } else {
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

  const getEndpointUrl = (provider: VersionProviderRow) => {
    if (provider.apiEndpointUrl) {
      return provider.apiEndpointUrl;
    }
    if (provider.provider === 'HUGGINGFACE') {
      return `huggingface.co/${provider.providerModelId || ''}`;
    }
    if (provider.provider === 'OPENAI') {
      return 'api.openai.com/v1/chat/completions';
    }
    return provider.providerModelId || '-';
  };

  const getAccessPriority = (provider: { isPrimary?: boolean }) => {
    return provider.isPrimary ? 'Primary Source' : 'Alternate Source';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {versions.length > 0 && (
            <Select
              name="versionSelector"
              label=""
              options={versions.map((v) => ({
                label: `Version ${v.version}`,
                value: v.id.toString(),
              }))}
              value={
                selectedVersion?.id?.toString() ||
                latestVersion?.id?.toString() ||
                ''
              }
              onChange={(value) => {
                const version = versions.find(
                  (v) => v.id.toString() === value
                );
                if (!version) {
                  setSelectedVersion(null);
                  return;
                }
                setSelectedVersion({
                  id: version.id,
                  version: version.version,
                  versionNotes: version.versionNotes,
                  status: version.status,
                  lifecycleStage: version.lifecycleStage,
                  isLatest: version.isLatest,
                  supportsStreaming: version.supportsStreaming,
                  maxTokens: version.maxTokens,
                  supportedLanguages: version.supportedLanguages,
                  createdAt: version.createdAt,
                  updatedAt: version.updatedAt,
                  publishedAt: version.publishedAt,
                  providers: version.providers,
                });
              }}
            />
          )}
        </div>
        <Button onClick={handleCreateNewVersion}>NEW VERSION</Button>
      </div>

      {versions.length > 0 ? (
        (() => {
          const currentVersion = selectedVersion || latestVersion;
          if (!currentVersion) return null;

          return (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Text variant="bodyMd" fontWeight="semibold">
                  Lifecycle Stage <span className="text-red-500">*</span>
                </Text>
                <Select
                  name="lifecycleStage"
                  label=""
                  options={lifecycleStageOptions.filter((o) => o.value !== '')}
                  value={currentVersion.lifecycleStage || 'DEVELOPMENT'}
                  onChange={(value) =>
                    handleLifecycleChange(currentVersion.id, value)
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  name="isLatest"
                  checked={currentVersion.isLatest}
                  onChange={() =>
                    handleSetPrimaryVersion(
                      currentVersion.id,
                      !currentVersion.isLatest
                    )
                  }
                >
                  Select as Primary Version
                </Checkbox>
                <span
                  onClick={() => setIsWhatsThisModalOpen(true)}
                  className="text-sm cursor-pointer text-secondaryOrange underline"
                >
                  What&apos;s this?
                </span>
              </div>

              <Divider />
              <div className="overflow-x-auto">
                {currentVersion.providers?.length > 0 ? (
                  <DataTable
                    columns={[
                      { accessorKey: 'provider', header: 'Provider' },
                      { accessorKey: 'endpoint', header: 'Endpoint URL' },
                      {
                        accessorKey: 'priority',
                        header: 'Access Priority',
                        cell: ({ row }: { row: { original: VersionProviderRow } }) => (
                          <Tag>{getAccessPriority(row.original)}</Tag>
                        ),
                      },
                      {
                        accessorKey: 'actions',
                        header: 'Actions',
                        cell: ({ row }: { row: { original: VersionProviderRow } }) => (
                          <div className="flex items-center gap-2">
                            <IconButton
                              size="medium"
                              icon={Icons.pencil}
                              onClick={() =>
                                handleOpenProviderModal(
                                  currentVersion,
                                  row.original
                                )
                              }
                            >
                              Edit
                            </IconButton>
                            <IconButton
                              size="medium"
                              icon={Icons.delete}
                              onClick={() => {
                                if (confirm('Delete this provider?')) {
                                  deleteProvider(row.original.id);
                                }
                              }}
                            >
                              Delete
                            </IconButton>
                          </div>
                        ),
                      },
                    ]}
                    rows={currentVersion.providers.map((provider) => ({
                      id: provider.id,
                      provider: getProviderDisplayName(provider.provider),
                      endpoint: getEndpointUrl(provider),
                      original: provider,
                    }))}
                    hideSelection
                    hideViewSelector
                    hideFooter
                  />
                ) : (
                  <div className="border flex flex-col items-center justify-center rounded-1 border-dashed border-borderDefault p-8">
                    <Text variant="bodySm" color="subdued">
                      No access methods configured
                    </Text>
                  </div>
                )}
              </div>

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
        <div className="border flex flex-col items-center justify-center rounded-1 border-dashed border-borderDefault p-12">
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

      <Dialog
        open={isNewVersionModalOpen}
        onOpenChange={setIsNewVersionModalOpen}
      >
        {isNewVersionModalOpen && (
          <Dialog.Content title="Add a New Version" limitHeight>
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
                requiredIndicator={true}
              />
              <Select
                name="lifecycleStage"
                label="Lifecycle Stage"
                options={lifecycleStageOptions}
                value={newVersionData.lifecycleStage}
                onChange={(value) =>
                  setNewVersionData((prev) => ({
                    ...prev,
                    lifecycleStage: (
                      Object.values(AiModelLifecycleStage) as string[]
                    ).includes(value)
                      ? (value as AiModelLifecycleStage)
                      : prev.lifecycleStage,
                  }))
                }
                required
                requiredIndicator={true}
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
                  ...versions.map((v) => ({
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
                requiredIndicator={true}
              />
              <Checkbox
                name="isLatestNewVersion"
                checked={newVersionData.isLatest}
                onChange={() =>
                  setNewVersionData((prev) => ({
                    ...prev,
                    isLatest: !prev.isLatest,
                  }))
                }
              >
                <div className="flex flex-col gap-1">
                  <Text>Select as Primary Version</Text>
                  <Text variant="bodySm" color="subdued">
                    This will be the default version for audits
                  </Text>
                </div>
              </Checkbox>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleSaveNewVersion}
                  loading={createLoading}
                  fullWidth
                >
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
            title={
              editingProvider ? 'Edit Access Method' : 'Add New Access Method'
            }
            limitHeight
          >
            <FormLayout>
              <div className="flex flex-col gap-6">
                <Select
                  name="provider"
                  label="Provider Type"
                  options={providerOptions}
                  value={providerFormData.provider}
                  onChange={(value) =>
                    setProviderFormData((prev) => ({
                      ...prev,
                      provider: (
                        Object.values(AiModelProvider) as string[]
                      ).includes(value)
                        ? (value as AiModelProvider)
                        : prev.provider,
                    }))
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
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiKey: value,
                        }))
                      }
                      helpText="Your OpenAI API key"
                      required
                      requiredIndicator={true}
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
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiKey: value,
                        }))
                      }
                      helpText={`Your ${providerFormData.provider === 'LLAMA_TOGETHER' ? 'Together AI' : 'Replicate'} API key`}
                      required
                      requiredIndicator={true}
                    />
                  </>
                )}

                {/* Llama Ollama - needs endpoint URL */}
                {providerFormData.provider === 'LLAMA_OLLAMA' && (
                  <>
                    <TextField
                      name="apiEndpointUrl"
                      label="Ollama Endpoint URL"
                      value={providerFormData.apiEndpointUrl}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiEndpointUrl: value,
                        }))
                      }
                      placeholder="http://localhost:11434/api/generate"
                      helpText="URL where Ollama is running"
                      required
                      requiredIndicator={true}
                    />
                  </>
                )}

                {/* Llama Custom - needs endpoint URL and API key */}
                {providerFormData.provider === 'LLAMA_CUSTOM' && (
                  <>
                    <TextField
                      name="apiEndpointUrl"
                      label="API Endpoint URL"
                      value={providerFormData.apiEndpointUrl}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiEndpointUrl: value,
                        }))
                      }
                      placeholder="https://your-api.com/v1/chat/completions"
                      helpText="Full endpoint URL for your custom Llama API"
                      required
                      requiredIndicator={true}
                    />
                    <TextField
                      name="apiKey"
                      label="API Key"
                      type="password"
                      value={providerFormData.apiKey}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiKey: value,
                        }))
                      }
                      helpText="API key for authentication (if required)"
                    />
                  </>
                )}

                {/* Custom API - full configuration */}
                {providerFormData.provider === 'CUSTOM' && (
                  <>
                    <TextField
                      name="apiEndpointUrl"
                      label="API Endpoint URL"
                      value={providerFormData.apiEndpointUrl}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiEndpointUrl: value,
                        }))
                      }
                      placeholder="https://your-api.com/v1/completions"
                      helpText="Full endpoint URL for your custom API"
                      required
                      requiredIndicator={true}
                    />
                    <TextField
                      name="apiKey"
                      label="API Key / Token"
                      type="password"
                      value={providerFormData.apiKey}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiKey: value,
                        }))
                      }
                      helpText="API key or token for authentication"
                    />
                    <Select
                      name="apiAuthType"
                      label="Authentication Type"
                      options={[
                        { label: 'Bearer Token', value: 'BEARER' },
                        { label: 'API Key Header', value: 'API_KEY' },
                        { label: 'Basic Auth', value: 'BASIC' },
                        { label: 'OAuth2', value: 'OAUTH2' },
                        { label: 'Custom', value: 'CUSTOM' },
                        { label: 'None', value: 'NONE' },
                      ]}
                      value={providerFormData.apiAuthType}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiAuthType: (
                            Object.values(EndpointAuthType) as string[]
                          ).includes(value)
                            ? (value as EndpointAuthType)
                            : prev.apiAuthType,
                        }))
                      }
                    />
                    <TextField
                      name="apiAuthHeaderName"
                      label="Auth Header Name"
                      value={providerFormData.apiAuthHeaderName}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiAuthHeaderName: value,
                        }))
                      }
                      placeholder="Authorization"
                      helpText="Header name for authentication (e.g., Authorization, X-API-Key)"
                    />
                    <TextField
                      name="apiRequestTemplate"
                      label="Request Body Template"
                      value={providerFormData.apiRequestTemplate}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiRequestTemplate: value,
                        }))
                      }
                      placeholder='{"model": "{model_id}",
                                  "messages": [{"role": "user", "content": "{input}"}]
                                  "temperature": {temperature},
                                  "max_tokens": {max_tokens}
                                  }'
                      helpText="Request body template with placeholders like {input}, {prompt}, {model_id}, {temperature}, {max_tokens}"
                    />
                    <TextField
                      name="apiResponsePath"
                      label="Response Path"
                      value={providerFormData.apiResponsePath}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiResponsePath: value,
                        }))
                      }
                      placeholder="choices[0].message.content"
                      helpText="JSON path to extract response text"
                    />
                    <TextField
                      name="apiTimeoutSeconds"
                      label="Timeout (seconds)"
                      type="number"
                      value={providerFormData.apiTimeoutSeconds.toString()}
                      onChange={(value) =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          apiTimeoutSeconds: parseInt(value) || 60,
                        }))
                      }
                      helpText="Request timeout in seconds"
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
                        setProviderFormData((prev) => ({
                          ...prev,
                          hfAuthToken: value,
                        }))
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
                      requiredIndicator={true}
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
                    <Checkbox
                      name="hfUsePipeline"
                      checked={providerFormData.hfUsePipeline}
                      onChange={() =>
                        setProviderFormData((prev) => ({
                          ...prev,
                          hfUsePipeline: !prev.hfUsePipeline,
                        }))
                      }
                    >
                      Use Pipeline API
                    </Checkbox>
                  </>
                )}

                <Checkbox
                  name="isPrimary"
                  checked={providerFormData.isPrimary}
                  onChange={() =>
                    setProviderFormData((prev) => ({
                      ...prev,
                      isPrimary: !prev.isPrimary,
                    }))
                  }
                >
                  Set as Primary Provider
                </Checkbox>

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
              </div>
            </FormLayout>
          </Dialog.Content>
        )}
      </Dialog>

      {/* What is Primary Version Modal */}
      <Dialog
        open={isWhatsThisModalOpen}
        onOpenChange={setIsWhatsThisModalOpen}
      >
        {isWhatsThisModalOpen && (
          <Dialog.Content title="What is a Primary Version?">
            <div className="space-y-4">
              <Text>
                When you set up multiple versions of your AI model, you can
                select one version to be the Primary Version.
              </Text>
              <Text>
                The Primary Version will be selected by default for audits. You
                can switch to another version before starting your audits.
              </Text>
              <Text>
                If your model is shared publicly, your primary version will be
                displayed at the top of the list of versions.
              </Text>
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setIsWhatsThisModalOpen(false)}
                  fullWidth
                >
                  CLOSE
                </Button>
              </div>
            </div>
          </Dialog.Content>
        )}
      </Dialog>

      {/* Primary Version Confirmation Modal */}
      <Dialog
        open={isPrimaryConfirmModalOpen}
        onOpenChange={setIsPrimaryConfirmModalOpen}
      >
        {isPrimaryConfirmModalOpen && (
          <Dialog.Content title="Select as Primary Version?">
            <div className="space-y-4">
              {(() => {
                const currentPrimary = versions.find((v) => v.isLatest);
                const pendingVersion = versions.find(
                  (v) => v.id === pendingPrimaryVersionId
                );
                return (
                  <>
                    {currentPrimary &&
                      currentPrimary.id !== pendingPrimaryVersionId && (
                        <Text>
                          If you confirm, version {currentPrimary.version} will
                          no longer be your primary version.
                        </Text>
                      )}
                    <Text>
                      Do you want to make version {pendingVersion?.version} your
                      primary version?
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
