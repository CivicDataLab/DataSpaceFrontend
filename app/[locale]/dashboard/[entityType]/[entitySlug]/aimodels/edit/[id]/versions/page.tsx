'use client';

import { useEffect, useRef, useState } from 'react';
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
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
  IconCheck,
  IconPencil,
  IconPlus,
  IconTestPipe,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  Button,
  Checkbox,
  Dialog,
  FormLayout,
  IconButton,
  Select,
  Sheet,
  Spinner,
  Tag,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { useEditStatus } from '../../context';
import styles from '../../edit.module.scss';

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

const deleteVersionMutation = `
  mutation deleteAIModelVersion($versionId: Int!) {
    deleteAiModelVersion(versionId: $versionId) {
      success
    }
  }
` as unknown as TypedDocumentNode<
  { deleteAiModelVersion: { success: boolean } },
  { versionId: number }
>;

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
  config?: unknown;
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

function accessMethodName(config: unknown): string {
  const value =
    typeof config === 'string'
      ? (() => {
          try {
            return JSON.parse(config) as unknown;
          } catch {
            return null;
          }
        })()
      : config;
  if (
    value &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string'
  ) {
    return value.name;
  }
  return '';
}

function modelIdPlaceholder(provider: string): string {
  if (provider === 'OPENAI') return 'e.g. gpt-4o-mini';
  if (provider === 'LLAMA_OLLAMA') return 'e.g. llama3';
  if (provider === 'LLAMA_TOGETHER')
    return 'e.g. meta-llama/Llama-3-8b-chat-hf';
  if (provider === 'LLAMA_REPLICATE') return 'e.g. stability-ai/sdxl';
  return 'e.g. your-model-id';
}

export default function VersionsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const { setVersionsCompleted, stepShowErrors } = useEditStatus();
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
  const [selectedVersion, setSelectedVersion] =
    useState<ModelVersionRow | null>(null);
  const [sheetVersionId, setSheetVersionId] = useState<number | null>(null);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [sheetLifecycle, setSheetLifecycle] = useState('DEVELOPMENT');
  const [sheetPrimary, setSheetPrimary] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<{
    id: number;
    version: string;
  } | null>(null);
  const [accessMethodToDelete, setAccessMethodToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [versionTestInput, setVersionTestInput] = useState('');
  const [testedProviderIds, setTestedProviderIds] = useState<number[]>([]);
  const hashHandled = useRef(false);
  const pendingAccessRef = useRef(false);
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
    accessName: '',
    provider: '' as AiModelProvider | '',
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
      GraphQL(
        fetchModelVersions,
        { [params.entityType]: params.entitySlug },
        {
          filters: { id: parseInt(params.id) },
        }
      ),
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
        toast('New version created successfully!', {
          id: VERSIONS_ACTION_TOAST_ID,
        });
        setIsNewVersionModalOpen(false);
        resetVersionForm();
        invalidateVersionQueries();

        // Force refetch and update selected version
        const result = await refetch();
        const newVersionId = response?.createAiModelVersion?.data?.id;

        if (newVersionId && result.data) {
          const refetchedVersions = result.data?.aiModels?.[0]?.versions || [];
          const newVersion = refetchedVersions.find(
            (v) => v.id === newVersionId
          );
          if (newVersion) {
            setSelectedVersion(newVersion);
            setSheetMode('edit');
            setSheetVersionId(newVersion.id);
            setSheetName(newVersion.version);
            setSheetLifecycle(newVersion.lifecycleStage || 'DEVELOPMENT');
            setSheetPrimary(
              Boolean(newVersion.isLatest) || versions.length === 0
            );
          }
        }
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,
          { id: VERSIONS_ACTION_TOAST_ID }
        );
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
          toast('Provider added successfully!', {
            id: VERSIONS_ACTION_TOAST_ID,
          });
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
          toast(
            `Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,
            { id: VERSIONS_ACTION_TOAST_ID }
          );
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
          toast('Provider updated successfully!', {
            id: VERSIONS_ACTION_TOAST_ID,
          });
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
          toast(
            `Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,
            { id: VERSIONS_ACTION_TOAST_ID }
          );
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
        toast('Provider deleted successfully!', {
          id: VERSIONS_ACTION_TOAST_ID,
        });
        invalidateVersionQueries();

        // Force refetch and update selected version after provider deletion
        const result = await refetch();
        if (result.data && selectedVersion) {
          const refetchedVersions = result.data?.aiModels?.[0]?.versions || [];
          const updatedVersion = refetchedVersions.find(
            (v) => v.id === selectedVersion.id
          );
          if (updatedVersion) {
            setSelectedVersion(updatedVersion);
          }
        }
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,
          { id: VERSIONS_ACTION_TOAST_ID }
        );
      },
    }
  );

  const { mutate: deleteVersion } = useMutation(
    (versionId: number) =>
      GraphQL(
        deleteVersionMutation,
        { [params.entityType]: params.entitySlug },
        { versionId }
      ),
    {
      onSuccess: () => {
        toast('Version removed', { id: VERSIONS_ACTION_TOAST_ID });
        setVersionToDelete(null);
        closeVersionSheet();
        void refetch();
        invalidateVersionQueries();
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,
          { id: VERSIONS_ACTION_TOAST_ID }
        );
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

  const resetProviderForm = (isPrimary = false) => {
    setProviderFormData({
      accessName: '',
      provider: '' as AiModelProvider | '',
      providerModelId: '',
      isPrimary,
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
    let suggestedVersion = '1.0';
    if (latestVersion?.version) {
      const parts = latestVersion.version.split('.');
      if (parts.length >= 2) {
        const minor = parseInt(parts[1]) + 1;
        suggestedVersion = `${parts[0]}.${minor}`;
      }
    }

    setIsProviderModalOpen(false);
    setEditingProvider(null);
    setSheetVersionId(null);
    setSelectedVersion(null);
    setSheetName(suggestedVersion);
    setSheetLifecycle(AiModelLifecycleStage.Development);
    setSheetPrimary(versions.length === 0);
    setVersionTestInput('');
    setTestedProviderIds([]);
    setSheetMode('add');
  };

  const handleSaveNewVersion = () => {
    if (!newVersionData.version) {
      toast('Please enter a version number', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }
    if (!newVersionData.lifecycleStage) {
      toast('Please select a lifecycle stage', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }

    createVersion({
      modelId: parseInt(params.id),
      version: newVersionData.version,
      lifecycleStage:
        newVersionData.lifecycleStage || AiModelLifecycleStage.Development,
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
        accessName: accessMethodName(provider.config),
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
      resetProviderForm(version.providers.length === 0);
    }
    setIsProviderModalOpen(true);
  };

  const handleSaveProvider = () => {
    if (!selectedVersion) return;

    if (!providerFormData.accessName.trim()) {
      toast('Access method name is required.', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }
    if (!providerFormData.provider) {
      toast('Select a provider type.', { id: VERSIONS_VALIDATION_TOAST_ID });
      return;
    }
    if (!providerFormData.providerModelId.trim()) {
      toast('Provider model ID is required.', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }

    const endpointRequiredProviders = [
      'CUSTOM',
      'LLAMA_OLLAMA',
      'LLAMA_CUSTOM',
    ];
    const isEndpointRequired = endpointRequiredProviders.includes(
      providerFormData.provider
    );
    const apiKeyRequired =
      providerFormData.provider === 'OPENAI' ||
      providerFormData.provider === 'LLAMA_TOGETHER' ||
      providerFormData.provider === 'LLAMA_REPLICATE';
    if (apiKeyRequired && !providerFormData.apiKey.trim()) {
      toast('API key is required for the selected provider.', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }

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
          'Please enter a valid endpoint URL (e.g., https://api.example.com/v1/chat)',
          { id: VERSIONS_VALIDATION_TOAST_ID }
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
          'Invalid JSON in Request Body Template. Please check the format.',
          { id: VERSIONS_VALIDATION_TOAST_ID }
        );
        return;
      }
    }

    const previousConfig: Record<string, unknown> =
      editingProvider?.config &&
      typeof editingProvider.config === 'object' &&
      !Array.isArray(editingProvider.config)
        ? (editingProvider.config as Record<string, unknown>)
        : {};
    const baseData = {
      providerModelId: providerFormData.providerModelId,
      isPrimary: providerFormData.isPrimary,
      config: {
        ...previousConfig,
        name: providerFormData.accessName.trim(),
      },
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
        provider: providerFormData.provider as AiModelProvider,
        ...baseData,
      });
    }
  };

  const providerOptions = [
    { label: 'OpenAI', value: 'OPENAI' },
    { label: 'Ollama', value: 'LLAMA_OLLAMA' },
    { label: 'Together AI', value: 'LLAMA_TOGETHER' },
    { label: 'Replicate', value: 'LLAMA_REPLICATE' },
    { label: 'Custom API', value: 'CUSTOM' },
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
        toast('Version updated successfully!', {
          id: VERSIONS_ACTION_TOAST_ID,
        });
        refetch();
        invalidateVersionQueries();
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`,
          { id: VERSIONS_ACTION_TOAST_ID }
        );
      },
    }
  );

  const handleLifecycleChange = (versionId: number, lifecycleStage: string) => {
    const stage = (Object.values(AiModelLifecycleStage) as string[]).includes(
      lifecycleStage
    )
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
      LLAMA_OLLAMA: 'Ollama',
      LLAMA_TOGETHER: 'Together AI',
      LLAMA_REPLICATE: 'Replicate',
      LLAMA_CUSTOM: 'Custom API',
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

  useEffect(() => {
    setVersionsCompleted(versions.length > 0);
  }, [versions.length, setVersionsCompleted]);

  const hashTarget = latestVersion?.id;
  useEffect(() => {
    if (isLoading || hashHandled.current) return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    if (hash === 'access-methods' && !hashTarget) return;
    hashHandled.current = true;
    if (hash === 'access-methods' && hashTarget) {
      const version = versions.find((item) => item.id === hashTarget);
      if (version) {
        setSheetMode('edit');
        setSheetVersionId(version.id);
        setSheetName(version.version);
        setSheetLifecycle(version.lifecycleStage || 'DEVELOPMENT');
        setSheetPrimary(Boolean(version.isLatest));
      }
    }
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 50);
  }, [isLoading, hashTarget, versions]);

  const toVersionRow = (
    version: (typeof versions)[number]
  ): ModelVersionRow => ({
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
    providers: (version.providers ?? []) as VersionProviderRow[],
  });

  useEffect(() => {
    if (!pendingAccessRef.current || sheetVersionId == null) return;
    const version = versions.find((item) => item.id === sheetVersionId);
    if (!version) return;
    pendingAccessRef.current = false;
    handleOpenProviderModal(toVersionRow(version));
  }, [sheetVersionId, versions]);

  const openVersionSheet = (version: (typeof versions)[number]) => {
    setIsProviderModalOpen(false);
    setEditingProvider(null);
    setSelectedVersion(toVersionRow(version));
    setSheetMode('edit');
    setSheetVersionId(version.id);
    setSheetName(version.version);
    setSheetLifecycle(version.lifecycleStage || 'DEVELOPMENT');
    setSheetPrimary(Boolean(version.isLatest) || versions.length === 1);
    setVersionTestInput('');
    setTestedProviderIds([]);
  };

  const closeVersionSheet = () => {
    setSheetMode(null);
    setSheetVersionId(null);
    setIsProviderModalOpen(false);
    setEditingProvider(null);
    pendingAccessRef.current = false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    );
  }

  const sheetSource = versions.find((version) => version.id === sheetVersionId);
  const sheetVersion = sheetSource ? toVersionRow(sheetSource) : null;
  const onlyVersion = versions.length === 1;

  const saveSheet = () => {
    const name = sheetName.trim();
    if (!name) {
      toast('Please enter a version number', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }
    const stage = (Object.values(AiModelLifecycleStage) as string[]).includes(
      sheetLifecycle
    )
      ? (sheetLifecycle as AiModelLifecycleStage)
      : AiModelLifecycleStage.Development;

    if (sheetMode === 'add' || !sheetVersion) {
      pendingAccessRef.current = false;
      createVersion({
        modelId: parseInt(params.id),
        version: name,
        lifecycleStage: stage,
        copyFromVersionId: null,
        isLatest: versions.length === 0 || sheetPrimary,
      });
      return;
    }

    updateVersion({
      id: sheetVersion.id,
      version: name,
      lifecycleStage: stage,
      isLatest: onlyVersion || sheetPrimary,
    });
    closeVersionSheet();
  };

  const beginAddAccessMethod = () => {
    if (sheetVersion) {
      handleOpenProviderModal(sheetVersion);
      return;
    }
    const name = sheetName.trim();
    if (!name) {
      toast('Enter a version name before adding an access method.', {
        id: VERSIONS_VALIDATION_TOAST_ID,
      });
      return;
    }
    const stage = (Object.values(AiModelLifecycleStage) as string[]).includes(
      sheetLifecycle
    )
      ? (sheetLifecycle as AiModelLifecycleStage)
      : AiModelLifecycleStage.Development;
    pendingAccessRef.current = true;
    createVersion({
      modelId: parseInt(params.id),
      version: name,
      lifecycleStage: stage,
      copyFromVersionId: null,
      isLatest: versions.length === 0 || sheetPrimary,
    });
  };

  const otherPrimary = versions.find(
    (version) => version.isLatest && version.id !== sheetVersion?.id
  );
  const soleVersion =
    sheetMode === 'add' ? versions.length === 0 : versions.length <= 1;
  const sheetProviders = sheetVersion?.providers ?? [];

  const accessReady = (provider: VersionProviderRow) => {
    const modelId = provider.providerModelId?.trim();
    const endpoint = provider.apiEndpointUrl?.trim();
    const key = provider.apiKey?.trim() || provider.hfAuthToken?.trim();
    if (provider.provider === 'LLAMA_OLLAMA')
      return Boolean(modelId && endpoint);
    if (
      provider.provider === 'CUSTOM' ||
      provider.provider === 'LLAMA_CUSTOM'
    ) {
      return Boolean(endpoint);
    }
    if (provider.provider === 'HUGGINGFACE') return Boolean(modelId);
    return Boolean(modelId && key);
  };

  const runAccessCheck = (providerIds: number[]) => {
    setTestedProviderIds((current) =>
      Array.from(new Set([...current, ...providerIds]))
    );
  };

  return (
    <div id="versions" className="flex flex-col gap-6 px-1">
      {/* <div>
        <Text variant="headingLg" fontWeight="semibold">
          Versions
        </Text>
        <div className="mt-1">
          <Text color="subdued">
            Configure releases and how each one can be accessed.
          </Text>
        </div>
      </div> */}

      {stepShowErrors && versions.length === 0 ? (
        <Text variant="bodySm" color="critical">
          Add a version to continue.
        </Text>
      ) : null}

      {versions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {versions.map((version) => {
            const providerCount = version.providers?.length ?? 0;
            const stageLabel =
              lifecycleStageOptions.find(
                (option) => option.value === version.lifecycleStage
              )?.label || version.lifecycleStage;
            const isPrimary = version.isLatest || versions.length === 1;
            return (
              <div
                key={version.id}
                className="flex items-center justify-between gap-3 rounded-4 border-1 border-solid border-borderSubdued bg-surfaceDefault px-4 py-4"
              >
                <div className="min-w-0">
                  <Text fontWeight="semibold">Version {version.version}</Text>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Text variant="bodySm" color="subdued">
                      {stageLabel}
                    </Text>
                    {isPrimary ? (
                      <Text
                        variant="bodySm"
                        className=" text-md inline-flex items-center gap-1 rounded-full bg-surfaceSelected px-1 py-1 text-[var(--blue-primary-color)]"
                      >
                        <IconCheck size={12} />
                        Primary
                      </Text>
                    ) : null}
                    <Text variant="bodySm" color="subdued">
                      · {providerCount} configured
                    </Text>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    size="slim"
                    className={styles.iconEdit}
                    icon={IconPencil}
                    onClick={() => openVersionSheet(version)}
                  >
                    Edit Version {version.version}
                  </IconButton>
                  <IconButton
                    size="slim"
                    className={styles.iconDelete}
                    icon={IconTrash}
                    onClick={() =>
                      setVersionToDelete({
                        id: version.id,
                        version: version.version,
                      })
                    }
                  >
                    Remove Version {version.version}
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2 border-1 border-dashed border-borderSubdued p-12 text-center">
          <Text variant="headingSm" color="subdued">
            No versions yet
          </Text>
          <Text variant="bodySm" color="subdued" className="mt-2">
            Create the first version of this model.
          </Text>
        </div>
      )}

      <div>
        <Button
          kind="neutral"
          onClick={handleCreateNewVersion}
          icon={<IconPlus size={16} />}
          size="medium"
        >
          Add Version
        </Button>
      </div>

      <Sheet
        open={sheetMode !== null}
        onOpenChange={(next) => {
          if (!next) {
            const menuOpen = Array.from(
              document.querySelectorAll(
                '[class*="Select-module_Popover__"], [class*="Combobox-module_Popover__"]'
              )
            ).some((node) => node instanceof HTMLElement && !node.hidden);
            if (menuOpen) return;
            closeVersionSheet();
          }
        }}
      >
        <Sheet.Content
          side="right"
          size="wide"
          title={sheetMode === 'add' ? 'Add Version' : 'Edit Version'}
          className={`flex !h-[100svh] !max-h-[100svh] flex-col !overflow-hidden p-0 ${styles.sheetActions}`}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b-1 border-solid border-baseGraySlateSolid6 px-6 pb-4 pt-6">
              <div>
                <Text
                  variant="headingLg"
                  as="h2"
                  className="text-[var(--blue-primary-color)]"
                >
                  {sheetMode === 'add' ? 'Add Version' : 'Edit Version'}
                </Text>
                <div className="mt-1">
                  <Text variant="bodySm" color="subdued">
                    {sheetMode === 'add'
                      ? 'Define this release and how it can be accessed.'
                      : 'Update this release and how it can be accessed.'}
                  </Text>
                </div>
              </div>
              <IconButton size="slim" icon={IconX} onClick={closeVersionSheet}>
                Close
              </IconButton>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-4 rounded-2 border-1 border-solid border-borderSubdued p-4">
                <Text fontWeight="semibold">Version Details</Text>
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    name="sheetVersionName"
                    label="Version Name"
                    required
                    requiredIndicator
                    value={sheetName}
                    onChange={setSheetName}
                  />
                  <Select
                    name="sheetLifecycleStage"
                    label="Lifecycle Stage"
                    required
                    requiredIndicator
                    options={lifecycleStageOptions.filter(
                      (option) => option.value !== ''
                    )}
                    value={sheetLifecycle || 'DEVELOPMENT'}
                    onChange={setSheetLifecycle}
                  />
                </div>
                <div className="flex flex-col gap-1 rounded-2 border-1 border-solid border-borderSubdued p-3">
                  <Checkbox
                    name="sheetPrimary"
                    checked={soleVersion || sheetPrimary}
                    disabled={soleVersion}
                    onChange={() => setSheetPrimary((current) => !current)}
                  >
                    Set as Primary Version
                  </Checkbox>
                  <Text variant="bodySm" color="subdued">
                    {soleVersion
                      ? 'The only version is automatically the Primary version.'
                      : otherPrimary
                        ? `Only one version can be Primary — this will replace "Version ${otherPrimary.version}" as the Primary version.`
                        : 'Only one version can be Primary — this will replace the current Primary version.'}
                  </Text>
                </div>
              </div>

              <div id="access-methods" className="flex flex-col gap-3">
                <Text fontWeight="semibold">Access Methods</Text>
                <Text variant="bodySm" color="subdued">
                  Configure how this version can be accessed. You can save this
                  version even if access methods are incomplete or missing —
                  they&apos;re only required when you publish the AI Model.
                </Text>

                {sheetProviders.length === 0 && !isProviderModalOpen ? (
                  <div className="flex flex-col items-center justify-center rounded-2 border-1 border-dashed border-borderSubdued p-8 text-center">
                    <Text fontWeight="semibold">
                      No access methods configured
                    </Text>
                    <div className="m-1">
                      <Text variant="bodySm" color="subdued">
                        Add one so this version can be reached by consumers.
                      </Text>
                    </div>
                    <Button
                      kind="primary"
                      onClick={beginAddAccessMethod}
                      loading={createLoading}
                      icon={<IconPlus size={16} />}
                    >
                      Add Access Method
                    </Button>
                  </div>
                ) : null}

                {sheetProviders.map((provider, index) =>
                  isProviderModalOpen &&
                  editingProvider?.id === provider.id ? null : (
                    <div
                      key={provider.id}
                      className={`flex items-center justify-between gap-3 rounded-2 border-1 border-solid border-borderSubdued p-3 ${
                        isProviderModalOpen ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <Text fontWeight="medium">
                          {accessMethodName(provider.config) ||
                            getProviderDisplayName(provider.provider)}
                          {provider.providerModelId
                            ? ` · ${provider.providerModelId}`
                            : ''}
                        </Text>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Text variant="bodySm" color="subdued">
                            {getEndpointUrl(provider)}
                          </Text>
                          {provider.isPrimary ? <Tag>Primary</Tag> : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <IconButton
                          size="slim"
                          icon={Icons.pencil}

                          disabled={isProviderModalOpen || !sheetVersion}
                          onClick={() =>
                            sheetVersion &&
                            handleOpenProviderModal(sheetVersion, provider)
                          }
                        >
                          Edit access method {index + 1}
                        </IconButton>
                        <IconButton
                          size="slim"
                          icon={Icons.delete}
                          disabled={isProviderModalOpen}
                          onClick={() =>
                            setAccessMethodToDelete({
                              id: provider.id,
                              name:
                                accessMethodName(provider.config) ||
                                getProviderDisplayName(provider.provider),
                            })
                          }
                        >
                          Remove access method {index + 1}
                        </IconButton>
                      </div>
                    </div>
                  )
                )}

                {isProviderModalOpen ? (
                  <div className="rounded-2 border-1 border-solid border-borderHighlightSubdued bg-surfaceSubdued p-4">
                    <div className="mb-10">
                      <Text variant="headingSm" fontWeight="semibold">
                        {editingProvider
                          ? 'Editing access method'
                          : 'New Access Method'}
                      </Text>
                    </div>
                    <FormLayout>
                      <div className="flex flex-col gap-6">
                        <TextField
                          name="accessName"
                          label="Access Method Name"
                          required
                          requiredIndicator
                          value={providerFormData.accessName}
                          placeholder="e.g. Production OpenAI, Local Llama"
                          onChange={(value) =>
                            setProviderFormData((prev) => ({
                              ...prev,
                              accessName: value,
                            }))
                          }
                        />
                        <Select
                          name="provider"
                          label="Provider Type"
                          required
                          requiredIndicator
                          placeholder="Select provider..."
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
                              providerModelId: '',
                              apiKey: '',
                              apiEndpointUrl: '',
                              apiAuthHeaderName: 'Authorization',
                              apiRequestTemplate: '',
                              apiResponsePath: '',
                              hfAuthToken: '',
                              hfModelClass: '',
                            }))
                          }
                          disabled={!!editingProvider}
                        />
                        {providerFormData.provider ? (
                          <TextField
                            name="providerModelId"
                            label="Provider Model ID"
                            required
                            requiredIndicator
                            value={providerFormData.providerModelId}
                            placeholder={modelIdPlaceholder(
                              providerFormData.provider
                            )}
                            onChange={(value) =>
                              setProviderFormData((prev) => ({
                                ...prev,
                                providerModelId: value,
                              }))
                            }
                          />
                        ) : null}

                        {/* OpenAI-specific fields */}
                        {providerFormData.provider === 'OPENAI' && (
                          <>
                            <TextField
                              name="apiKey"
                              label="OpenAI API Key"
                              type="password"
                              value={providerFormData.apiKey}
                              placeholder="Enter your OpenAI API Key"
                              onChange={(value) =>
                                setProviderFormData((prev) => ({
                                  ...prev,
                                  apiKey: value,
                                }))
                              }
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
                              label={
                                providerFormData.provider === 'LLAMA_TOGETHER'
                                  ? 'Together AI API Key'
                                  : 'Replicate API Token'
                              }
                              type="password"
                              value={providerFormData.apiKey}
                              placeholder={
                                providerFormData.provider === 'LLAMA_TOGETHER'
                                  ? 'Enter your Together AI API Key'
                                  : 'Enter your Replicate API Token'
                              }
                              onChange={(value) =>
                                setProviderFormData((prev) => ({
                                  ...prev,
                                  apiKey: value,
                                }))
                              }
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
                              helpText="No API key is needed for a standard Ollama deployment."
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

                        {providerFormData.provider ? (
                          <div className="flex flex-col gap-1 rounded-2 border-1 border-solid border-borderSubdued bg-surfaceDefault p-3">
                            <Checkbox
                              name="isPrimary"
                              checked={
                                sheetProviders.length === 0 ||
                                (Boolean(editingProvider) &&
                                  sheetProviders.length === 1) ||
                                providerFormData.isPrimary
                              }
                              disabled={
                                sheetProviders.length === 0 ||
                                (Boolean(editingProvider) &&
                                  sheetProviders.length === 1)
                              }
                              onChange={() =>
                                setProviderFormData((prev) => ({
                                  ...prev,
                                  isPrimary: !prev.isPrimary,
                                }))
                              }
                            >
                              Set as Primary access method
                            </Checkbox>
                            <Text variant="bodySm" color="subdued">
                              {sheetProviders.length === 0 ||
                              (editingProvider && sheetProviders.length === 1)
                                ? 'The only access method for this version is automatically Primary.'
                                : (() => {
                                    const current = sheetProviders.find(
                                      (item) =>
                                        item.isPrimary &&
                                        item.id !== editingProvider?.id
                                    );
                                    const name = current
                                      ? accessMethodName(current.config) ||
                                        getProviderDisplayName(current.provider)
                                      : '';
                                    return name
                                      ? `Only one access method can be Primary — this will replace "${name}" as the Primary access method.`
                                      : 'Only one access method can be Primary — this will replace the current Primary access method.';
                                  })()}
                            </Text>
                          </div>
                        ) : null}

                        <div className="flex justify-start gap-4 pt-4">
                          <Button
                            onClick={handleSaveProvider}
                            loading={
                              createProviderLoading || updateProviderLoading
                            }
                          >
                            {editingProvider
                              ? 'Save Access Method'
                              : 'Add Access Method'}
                          </Button>
                          <Button
                            onClick={() => setIsProviderModalOpen(false)}
                            kind="tertiary"
                            variant="basic"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </FormLayout>
                  </div>
                ) : null}

                {sheetProviders.length > 0 && !isProviderModalOpen ? (
                  <div>
                    <Button
                      kind="neutral"
                      onClick={beginAddAccessMethod}
                      size="medium"
                      icon={<IconPlus size={16} />}
                    >
                      Add Access Method
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4 border-t-1 border-solid border-borderSubdued pt-6">
                <Text fontWeight="semibold">Test Access Methods</Text>
                <Text variant="bodySm" color="subdued">
                  Test the configured access methods for this version and review
                  the connection and response results.
                </Text>
                {sheetProviders.length === 0 ? (
                  <div className="rounded-2 bg-surfaceSubdued px-4 py-6 text-center">
                    <Text variant="bodySm" color="subdued">
                      Add and save an access method before testing.
                    </Text>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <TextField
                      name="versionTestInput"
                      label="Test Input"
                      multiline={2}
                      value={versionTestInput}
                      onChange={setVersionTestInput}
                      helpText="Enter a sample prompt or input to test the configured access methods."
                      placeholder="Enter a sample prompt or input for testing..."
                    />
                    <div>
                      <Button
                        kind="neutral"
                        size="medium"
                        icon={<IconTestPipe size={16} />}
                        onClick={() =>
                          runAccessCheck(
                            sheetProviders.map((provider) => provider.id)
                          )
                        }
                      >
                        Test All Access Methods
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {sheetProviders.map((provider) => {
                        const tested = testedProviderIds.includes(provider.id);
                        const ready = accessReady(provider);
                        const label = !tested
                          ? 'Not Tested'
                          : ready
                            ? 'Configuration complete'
                            : 'Configuration Incomplete';
                        return (
                          <div
                            key={provider.id}
                            className="flex items-center justify-between gap-3 rounded-2 border-1 border-solid border-borderSubdued p-3"
                          >
                            <div className="min-w-0">
                              <Text fontWeight="medium">
                                {getProviderDisplayName(provider.provider)}
                              </Text>
                              <div className="mt-1">
                                <Text variant="bodySm" color="subdued">
                                  {provider.providerModelId || 'No model id'}
                                  {provider.isPrimary ? ' · Primary' : ''}
                                </Text>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <Text
                                variant="bodySm"
                                color={
                                  !tested
                                    ? 'subdued'
                                    : ready
                                      ? 'success'
                                      : 'critical'
                                }
                              >
                                {label}
                              </Text>
                              <Button
                                kind="tertiary"
                                size="slim"
                                onClick={() => runAccessCheck([provider.id])}
                              >
                                Test Again
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Text variant="bodySm" color="subdued">
                      This check confirms the saved configuration. It does not
                      send the test input to the provider.
                    </Text>
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-4">
              <Button kind="tertiary" onClick={closeVersionSheet}>
                Cancel
              </Button>
              <Button
                kind="primary"
                onClick={saveSheet}
                loading={createLoading}
              >
                Save Version
              </Button>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>

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
      <AlertDialog
        open={versionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setVersionToDelete(null);
        }}
      >
        <AlertDialog.Content
          title="Remove version?"
          primaryAction={{
            content: 'Remove',
            destructive: true,
            onAction: () => {
              if (!versionToDelete) return;
              deleteVersion(versionToDelete.id);
            },
          }}
          secondaryActions={[{ content: 'Cancel' }]}
        >
          {`Version ${versionToDelete?.version ?? ''} will be removed. This cannot be undone.`}
        </AlertDialog.Content>
      </AlertDialog>
      <AlertDialog
        open={accessMethodToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setAccessMethodToDelete(null);
        }}
      >
        <AlertDialog.Content
          title="Remove access method?"
          primaryAction={{
            content: 'Remove',
            destructive: true,
            onAction: () => {
              if (!accessMethodToDelete) return;
              deleteProvider(accessMethodToDelete.id);
              setAccessMethodToDelete(null);
            },
          }}
          secondaryActions={[{ content: 'Cancel' }]}
        >
          {`"${accessMethodToDelete?.name ?? 'This access method'}" will be removed. This cannot be undone.`}
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
}
