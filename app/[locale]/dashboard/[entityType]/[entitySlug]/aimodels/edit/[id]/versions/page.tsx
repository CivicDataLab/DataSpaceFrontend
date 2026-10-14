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
  IconAlertTriangle,
  IconCheck,
  IconCircle,
  IconClock,
  IconFileAlert,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconShield,
  IconTrash,
  IconWifiOff,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  Button,
  Checkbox,
  FormLayout,
  IconButton,
  SectionCard,
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
import { isAccessMethodComplete } from '../../aimodel-summary';
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

type ApiKeyLocation = 'header' | 'query';

function readConfigObject(config: unknown): Record<string, unknown> {
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
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function accessMethodName(config: unknown): string {
  const name = readConfigObject(config).name;
  return typeof name === 'string' ? name : '';
}

function apiKeyLocationFromConfig(config: unknown): ApiKeyLocation {
  return readConfigObject(config).apiKeyLocation === 'query'
    ? 'query'
    : 'header';
}

const CUSTOM_AUTH_OPTIONS = [
  { label: 'None', value: 'NONE' },
  { label: 'Bearer Token', value: 'BEARER' },
  { label: 'API Key', value: 'API_KEY' },
  { label: 'Custom Header', value: 'CUSTOM' },
];

const API_KEY_LOCATION_OPTIONS = [
  { label: 'Header', value: 'header' },
  { label: 'Query Parameter', value: 'query' },
];

function authNeedsCredential(authType: string): boolean {
  return (
    authType === 'BEARER' ||
    authType === 'API_KEY' ||
    authType === 'CUSTOM' ||
    authType === 'BASIC' ||
    authType === 'OAUTH2'
  );
}

type CustomApiTestStatus =
  | 'success'
  | 'auth-failed'
  | 'connection-failed'
  | 'invalid-request'
  | 'response-extraction-failed'
  | 'timeout'
  | 'incomplete';

type CustomApiDisplayStatus =
  CustomApiTestStatus | 'not-tested' | 'testing' | 'stale';

type CustomApiTestStep = {
  stage: string;
  status: 'pass' | 'fail';
  message: string;
};

type CustomApiTestResult = {
  status: CustomApiTestStatus;
  steps: CustomApiTestStep[];
  signature: string;
};

const CUSTOM_TEST_STATUS: Record<
  CustomApiDisplayStatus,
  { label: string; color: 'success' | 'critical' | 'subdued' }
> = {
  success: { label: 'Success', color: 'success' },
  'auth-failed': { label: 'Authentication Failed', color: 'critical' },
  'connection-failed': { label: 'Connection Failed', color: 'critical' },
  'invalid-request': {
    label: 'Invalid Request Configuration',
    color: 'critical',
  },
  'response-extraction-failed': {
    label: 'Response Extraction Failed',
    color: 'critical',
  },
  timeout: { label: 'Request Timed Out', color: 'critical' },
  incomplete: { label: 'Configuration Incomplete', color: 'critical' },
  'not-tested': { label: 'Not Tested', color: 'subdued' },
  testing: { label: 'Testing...', color: 'subdued' },
  stale: { label: 'Configuration Changed — Test Again', color: 'subdued' },
};

function customApiDisplayStatus(
  provider: VersionProviderRow,
  testInput: string,
  result: CustomApiTestResult | undefined,
  isTesting: boolean
): CustomApiDisplayStatus {
  if (isTesting) return 'testing';
  if (!result) return 'not-tested';
  if (result.signature !== customApiSignature(provider, testInput))
    return 'stale';
  return result.status;
}

function isCustomTestFailure(status: CustomApiDisplayStatus) {
  return (
    status === 'auth-failed' ||
    status === 'connection-failed' ||
    status === 'invalid-request' ||
    status === 'response-extraction-failed' ||
    status === 'timeout' ||
    status === 'incomplete'
  );
}

function customTestSummaryHeadline(counts: {
  successful: number;
  failed: number;
  notTested: number;
  testing: number;
  stale: number;
}) {
  if (counts.testing > 0) return 'Testing access methods';
  if (counts.failed > 0) return 'Some access methods failed';
  if (counts.stale > 0) return 'Configuration changed — test again';
  if (counts.successful > 0 && counts.notTested === 0) {
    return 'All access methods passed';
  }
  if (counts.successful > 0) return 'Some access methods passed';
  return 'No access methods tested';
}

function customTestStatusIcon(status: CustomApiDisplayStatus) {
  if (status === 'testing')
    return <IconLoader2 size={14} className="animate-spin" />;
  if (status === 'success') return <IconCheck size={14} />;
  if (status === 'auth-failed') return <IconShield size={14} />;
  if (status === 'connection-failed') return <IconWifiOff size={14} />;
  if (status === 'timeout') return <IconClock size={14} />;
  if (status === 'response-extraction-failed')
    return <IconFileAlert size={14} />;
  if (status === 'invalid-request' || status === 'incomplete') {
    return <IconAlertTriangle size={14} />;
  }
  if (status === 'stale') return <IconRefresh size={14} />;
  return <IconCircle size={14} />;
}

function customApiSignature(
  provider: VersionProviderRow,
  testInput: string
): string {
  return JSON.stringify({
    url: provider.apiEndpointUrl,
    method: provider.apiHttpMethod,
    timeout: provider.apiTimeoutSeconds,
    auth: provider.apiAuthType,
    header: provider.apiAuthHeaderName,
    key: provider.apiKey,
    prefix: provider.apiKeyPrefix,
    location: apiKeyLocationFromConfig(provider.config),
    template: provider.apiRequestTemplate,
    path: provider.apiResponsePath,
    modelId: provider.providerModelId,
    headers: provider.apiHeaders,
    testInput,
  });
}

function fillTemplatePlaceholders(
  value: unknown,
  input: string,
  modelId: string
): unknown {
  if (typeof value === 'string') {
    return value
      .replaceAll('{input}', input)
      .replaceAll('{prompt}', input)
      .replaceAll('{model_id}', modelId)
      .replaceAll('{temperature}', '0.7')
      .replaceAll('{max_tokens}', '256');
  }
  if (Array.isArray(value)) {
    return value.map((item) => fillTemplatePlaceholders(item, input, modelId));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        fillTemplatePlaceholders(item, input, modelId),
      ])
    );
  }
  return value;
}

function readResponsePath(data: unknown, path: string): unknown {
  const keys = path.split(/\.|\[|\]/).filter(Boolean);
  let current = data;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = Array.isArray(current)
      ? current[Number(key)]
      : (current as Record<string, unknown>)[key];
  }
  return current;
}

function customRequest(
  provider: VersionProviderRow,
  testInput: string
): {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
} {
  const modelId = provider.providerModelId || '';
  let url = provider.apiEndpointUrl || '';
  if (
    provider.apiAuthType === 'API_KEY' &&
    apiKeyLocationFromConfig(provider.config) === 'query' &&
    provider.apiKey
  ) {
    const parsed = new URL(url);
    parsed.searchParams.set(
      provider.apiAuthHeaderName || 'api_key',
      provider.apiKey
    );
    url = parsed.toString();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(provider.apiHeaders || {}),
  };
  if (provider.apiKey && provider.apiAuthType !== 'NONE') {
    const sendInQuery =
      provider.apiAuthType === 'API_KEY' &&
      apiKeyLocationFromConfig(provider.config) === 'query';
    if (!sendInQuery) {
      const name = provider.apiAuthHeaderName || 'Authorization';
      let value = provider.apiKey;
      if (provider.apiAuthType === 'BEARER') {
        value =
          `${provider.apiKeyPrefix || 'Bearer'} ${provider.apiKey}`.trim();
      } else if (provider.apiAuthType === 'BASIC') {
        value = `Basic ${btoa(provider.apiKey)}`;
      }
      headers[name] = value;
    }
  }

  const template = provider.apiRequestTemplate;
  const body = fillTemplatePlaceholders(
    template && typeof template === 'object'
      ? template
      : { input: '{input}', model: '{model_id}' },
    testInput,
    modelId
  );
  return {
    url,
    method: provider.apiHttpMethod || 'POST',
    headers,
    body,
  };
}

async function testCustomApi(
  provider: VersionProviderRow,
  testInput: string
): Promise<CustomApiTestResult> {
  const signature = customApiSignature(provider, testInput);
  const steps: CustomApiTestStep[] = [];
  const finish = (status: CustomApiTestStatus): CustomApiTestResult => ({
    status,
    steps,
    signature,
  });

  if (!isAccessMethodComplete(provider)) {
    steps.push({
      stage: 'Configuration Validation',
      status: 'fail',
      message: 'Required fields for this Custom API are missing.',
    });
    return finish('incomplete');
  }
  steps.push({
    stage: 'Configuration Validation',
    status: 'pass',
    message: 'All required fields for this provider are present.',
  });

  let request: ReturnType<typeof customRequest>;
  try {
    request = customRequest(provider, testInput);
  } catch {
    steps.push({
      stage: 'Request',
      status: 'fail',
      message: 'The endpoint URL is not a valid HTTP address.',
    });
    return finish('invalid-request');
  }

  const timeoutMs = Math.max(1, provider.apiTimeoutSeconds || 30) * 1000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' ? undefined : JSON.stringify(request.body),
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      steps.push({
        stage: 'Authentication Setup',
        status: 'fail',
        message: 'The provider rejected the configured credentials.',
      });
      return finish('auth-failed');
    }
    steps.push({
      stage: 'Authentication Setup',
      status: 'pass',
      message: 'The provider accepted the configured credentials.',
    });

    if (!response.ok) {
      steps.push({
        stage: 'Request',
        status: 'fail',
        message: `The provider returned HTTP ${response.status}.`,
      });
      return finish('invalid-request');
    }
    steps.push({
      stage: 'Request',
      status: 'pass',
      message: 'The provider accepted the request.',
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      steps.push({
        stage: 'Response Extraction',
        status: 'fail',
        message: 'The provider did not return JSON.',
      });
      return finish('response-extraction-failed');
    }
    const data: unknown = await response.json();
    const path = provider.apiResponsePath?.trim() || '';
    const extracted = path ? readResponsePath(data, path) : data;
    if (path && (extracted === undefined || extracted === null)) {
      steps.push({
        stage: 'Response Extraction',
        status: 'fail',
        message: `No value at ${path}.`,
      });
      return finish('response-extraction-failed');
    }
    const preview =
      typeof extracted === 'string' ? extracted : JSON.stringify(extracted);
    steps.push({
      stage: 'Response Extraction',
      status: 'pass',
      message: preview
        ? preview.slice(0, 180)
        : 'The provider returned a response.',
    });
    return finish('success');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      steps.push({
        stage: 'Connection',
        status: 'fail',
        message: 'The request timed out.',
      });
      return finish('timeout');
    }
    steps.push({
      stage: 'Connection',
      status: 'fail',
      message: 'The request could not reach the Custom API.',
    });
    return finish('connection-failed');
  } finally {
    clearTimeout(timer);
  }
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

  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
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
  const [testResults, setTestResults] = useState<
    Record<number, CustomApiTestResult>
  >({});
  const [testingIds, setTestingIds] = useState<number[]>([]);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const hashHandled = useRef(false);
  const pendingAccessRef = useRef(false);
  const [editingProvider, setEditingProvider] =
    useState<VersionProviderRow | null>(null);

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
    apiKeyLocation: 'header' as ApiKeyLocation,
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
      apiKeyLocation: 'header' as ApiKeyLocation,
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
    setTestResults({});
    setTestingIds([]);
    setExpandedTestId(null);
    setSheetMode('add');
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
        apiAuthHeaderName:
          provider.provider === 'CUSTOM' && provider.apiAuthType === 'NONE'
            ? provider.apiAuthHeaderName || ''
            : provider.apiAuthHeaderName || 'Authorization',
        apiKey: provider.apiKey || '',
        apiKeyPrefix: provider.apiKeyPrefix || 'Bearer',
        apiKeyLocation: apiKeyLocationFromConfig(provider.config),
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

    if (
      providerFormData.provider === 'CUSTOM' &&
      authNeedsCredential(providerFormData.apiAuthType)
    ) {
      if (!providerFormData.apiAuthHeaderName.trim()) {
        const headerLabel =
          providerFormData.apiAuthType === 'API_KEY'
            ? 'Header or parameter name'
            : providerFormData.apiAuthType === 'CUSTOM'
              ? 'Header name'
              : 'Authentication header name';
        toast(`${headerLabel} is required.`, {
          id: VERSIONS_VALIDATION_TOAST_ID,
        });
        return;
      }
      if (!providerFormData.apiKey.trim()) {
        const credentialLabel =
          providerFormData.apiAuthType === 'BEARER'
            ? 'Bearer token'
            : providerFormData.apiAuthType === 'CUSTOM'
              ? 'Header value'
              : providerFormData.apiAuthType === 'BASIC'
                ? 'Basic auth credential'
                : providerFormData.apiAuthType === 'OAUTH2'
                  ? 'OAuth2 token'
                  : 'API key';
        toast(`${credentialLabel} is required.`, {
          id: VERSIONS_VALIDATION_TOAST_ID,
        });
        return;
      }
    }

    if (
      providerFormData.provider === 'CUSTOM' &&
      (!Number.isFinite(providerFormData.apiTimeoutSeconds) ||
        providerFormData.apiTimeoutSeconds < 1)
    ) {
      toast('Timeout must be at least 1 second.', {
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

    const previousConfig = readConfigObject(editingProvider?.config);
    const isCustomProvider = providerFormData.provider === 'CUSTOM';
    const customAuth = String(providerFormData.apiAuthType);
    const nextConfig: Record<string, unknown> = {
      ...previousConfig,
      name: providerFormData.accessName.trim(),
    };
    if (isCustomProvider && customAuth === 'API_KEY') {
      nextConfig.apiKeyLocation = providerFormData.apiKeyLocation;
    } else {
      delete nextConfig.apiKeyLocation;
    }
    const baseData = {
      providerModelId: providerFormData.providerModelId,
      isPrimary: providerFormData.isPrimary,
      config: nextConfig,
      // API Endpoint Configuration
      apiEndpointUrl: providerFormData.apiEndpointUrl || null,
      apiHttpMethod: providerFormData.apiHttpMethod || EndpointHttpMethod.Post,
      apiTimeoutSeconds: providerFormData.apiTimeoutSeconds,
      // Authentication Configuration
      apiAuthType: isCustomProvider
        ? providerFormData.apiAuthType
        : providerFormData.apiAuthType || EndpointAuthType.Bearer,
      apiAuthHeaderName: isCustomProvider
        ? providerFormData.apiAuthHeaderName
        : providerFormData.apiAuthHeaderName || 'Authorization',
      apiKey:
        isCustomProvider && customAuth === 'NONE'
          ? null
          : providerFormData.apiKey || null,
      apiKeyPrefix:
        !isCustomProvider || customAuth === 'BEARER'
          ? providerFormData.apiKeyPrefix || 'Bearer'
          : '',
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
    const version =
      hash === 'access-methods' && hashTarget
        ? versions.find((item) => item.id === hashTarget)
        : undefined;
    window.setTimeout(() => {
      if (version) {
        setSheetMode('edit');
        setSheetVersionId(version.id);
        setSheetName(version.version);
        setSheetLifecycle(version.lifecycleStage || 'DEVELOPMENT');
        setSheetPrimary(Boolean(version.isLatest));
      }
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
    const row = toVersionRow(version);
    queueMicrotask(() => handleOpenProviderModal(row));
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
    setTestResults({});
    setTestingIds([]);
    setExpandedTestId(null);
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

  const customProviders = sheetProviders.filter(
    (provider) => provider.provider === 'CUSTOM'
  );
  const customTestRows = customProviders.map((provider) => {
    const result = testResults[provider.id];
    const isTesting = testingIds.includes(provider.id);
    const status = customApiDisplayStatus(
      provider,
      versionTestInput,
      result,
      isTesting
    );
    return { provider, result, isTesting, status };
  });
  const testCounts = customTestRows.reduce(
    (counts, row) => {
      if (row.status === 'testing') counts.testing += 1;
      else if (row.status === 'success') counts.successful += 1;
      else if (isCustomTestFailure(row.status)) counts.failed += 1;
      else if (row.status === 'stale') counts.stale += 1;
      else counts.notTested += 1;
      return counts;
    },
    { successful: 0, failed: 0, notTested: 0, testing: 0, stale: 0 }
  );
  const testedCount = testCounts.successful + testCounts.failed;
  const notTestedCount =
    testCounts.notTested + testCounts.stale + testCounts.testing;

  const runCustomTest = async (providers: VersionProviderRow[]) => {
    const targets = providers.filter(
      (provider) => provider.provider === 'CUSTOM'
    );
    if (targets.length === 0) return;
    setTestingIds((current) => [
      ...new Set([...current, ...targets.map((provider) => provider.id)]),
    ]);
    await Promise.all(
      targets.map(async (provider) => {
        const result = await testCustomApi(provider, versionTestInput);
        setTestResults((current) => ({ ...current, [provider.id]: result }));
        setTestingIds((current) => current.filter((id) => id !== provider.id));
      })
    );
  };

  return (
    <div id="versions" className="flex flex-col gap-6 px-1">
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
                          icon={() => <IconPencil size={20} stroke={1.5} />}
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
                          icon={() => <IconTrash size={20} strokeWidth={1.5} />}

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
                            setProviderFormData((prev) => {
                              const provider = (
                                Object.values(AiModelProvider) as string[]
                              ).includes(value)
                                ? (value as AiModelProvider)
                                : prev.provider;
                              const isCustom = provider === 'CUSTOM';
                              return {
                                ...prev,
                                provider,
                                providerModelId: '',
                                apiKey: '',
                                apiEndpointUrl: '',
                                apiAuthType: isCustom
                                  ? EndpointAuthType.None
                                  : EndpointAuthType.Bearer,
                                apiAuthHeaderName: isCustom
                                  ? ''
                                  : 'Authorization',
                                apiKeyPrefix: 'Bearer',
                                apiKeyLocation: 'header',
                                apiTimeoutSeconds: isCustom ? 30 : 60,
                                apiRequestTemplate: '',
                                apiResponsePath: '',
                                hfAuthToken: '',
                                hfModelClass: '',
                              };
                            })
                          }
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

                        {/* Custom API — endpoint, then only the fields the auth type needs */}
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
                              placeholder="https://api.example.org/v1/predict"
                              required
                              requiredIndicator={true}
                            />
                            <Select
                              name="apiAuthType"
                              label="Authentication Type"
                              options={
                                providerFormData.apiAuthType === 'BASIC' ||
                                providerFormData.apiAuthType === 'OAUTH2'
                                  ? [
                                      ...CUSTOM_AUTH_OPTIONS,
                                      {
                                        label:
                                          providerFormData.apiAuthType ===
                                          'BASIC'
                                            ? 'Basic Auth'
                                            : 'OAuth2',
                                        value: providerFormData.apiAuthType,
                                      },
                                    ]
                                  : CUSTOM_AUTH_OPTIONS
                              }
                              value={providerFormData.apiAuthType}
                              onChange={(value) =>
                                setProviderFormData((prev) => {
                                  const nextAuth = (
                                    Object.values(EndpointAuthType) as string[]
                                  ).includes(value)
                                    ? (value as EndpointAuthType)
                                    : prev.apiAuthType;
                                  return {
                                    ...prev,
                                    apiAuthType: nextAuth,
                                    apiAuthHeaderName:
                                      nextAuth === 'BEARER'
                                        ? 'Authorization'
                                        : '',
                                    apiKeyLocation: 'header',
                                    apiKey: '',
                                    apiKeyPrefix:
                                      nextAuth === 'BEARER' ? 'Bearer' : '',
                                  };
                                })
                              }
                            />

                            {providerFormData.apiAuthType === 'BEARER' && (
                              <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                  name="apiAuthHeaderName"
                                  label="Authentication Header Name"
                                  value={providerFormData.apiAuthHeaderName}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiAuthHeaderName: value,
                                    }))
                                  }
                                  placeholder="Authorization"
                                  required
                                  requiredIndicator={true}
                                />
                                <TextField
                                  name="apiKey"
                                  label="Bearer Token"
                                  type="password"
                                  value={providerFormData.apiKey}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiKey: value,
                                    }))
                                  }
                                  placeholder="Enter bearer token"
                                  required
                                  requiredIndicator={true}
                                />
                              </div>
                            )}

                            {providerFormData.apiAuthType === 'API_KEY' && (
                              <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                  name="apiAuthHeaderName"
                                  label="Header or Parameter Name"
                                  value={providerFormData.apiAuthHeaderName}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiAuthHeaderName: value,
                                    }))
                                  }
                                  placeholder="e.g. X-API-Key"
                                  required
                                  requiredIndicator={true}
                                />
                                <Select
                                  name="apiKeyLocation"
                                  label="Send key in"
                                  options={API_KEY_LOCATION_OPTIONS}
                                  value={providerFormData.apiKeyLocation}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiKeyLocation:
                                        value === 'query' ? 'query' : 'header',
                                    }))
                                  }
                                />
                                <div className="md:col-span-2">
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
                                    placeholder="Enter API key"
                                    required
                                    requiredIndicator={true}
                                  />
                                </div>
                              </div>
                            )}

                            {providerFormData.apiAuthType === 'CUSTOM' && (
                              <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                  name="apiAuthHeaderName"
                                  label="Header Name"
                                  value={providerFormData.apiAuthHeaderName}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiAuthHeaderName: value,
                                    }))
                                  }
                                  placeholder="e.g. X-Custom-Auth"
                                  required
                                  requiredIndicator={true}
                                />
                                <TextField
                                  name="apiKey"
                                  label="Header Value"
                                  type="password"
                                  value={providerFormData.apiKey}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiKey: value,
                                    }))
                                  }
                                  placeholder="Enter header value"
                                  required
                                  requiredIndicator={true}
                                />
                              </div>
                            )}

                            {(providerFormData.apiAuthType === 'BASIC' ||
                              providerFormData.apiAuthType === 'OAUTH2') && (
                              <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                  name="apiAuthHeaderName"
                                  label="Authentication Header Name"
                                  value={providerFormData.apiAuthHeaderName}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiAuthHeaderName: value,
                                    }))
                                  }
                                  placeholder="Authorization"
                                  required
                                  requiredIndicator={true}
                                />
                                <TextField
                                  name="apiKey"
                                  label={
                                    providerFormData.apiAuthType === 'BASIC'
                                      ? 'Basic Auth Credential'
                                      : 'OAuth2 Token'
                                  }
                                  type="password"
                                  value={providerFormData.apiKey}
                                  onChange={(value) =>
                                    setProviderFormData((prev) => ({
                                      ...prev,
                                      apiKey: value,
                                    }))
                                  }
                                  required
                                  requiredIndicator={true}
                                />
                              </div>
                            )}

                            <div className={styles.requestTemplate}>
                              <TextField
                                name="apiRequestTemplate"
                                label="Request Body Template"
                                multiline={4}
                                monospaced
                                value={providerFormData.apiRequestTemplate}
                                onChange={(value) =>
                                  setProviderFormData((prev) => ({
                                    ...prev,
                                    apiRequestTemplate: value,
                                  }))
                                }
                                placeholder='{ "model": "{model_id}", "input": "{prompt}" }'
                                helpText="Optional JSON template. Supports {input}, {prompt}, {model_id}, {temperature} and {max_tokens} placeholders."
                              />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
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
                                placeholder="e.g. choices[0].message.content"
                              />
                              <TextField
                                name="apiTimeoutSeconds"
                                label="Timeout (seconds)"
                                type="number"
                                value={providerFormData.apiTimeoutSeconds.toString()}
                                onChange={(value) =>
                                  setProviderFormData((prev) => ({
                                    ...prev,
                                    apiTimeoutSeconds: parseInt(value, 10) || 0,
                                  }))
                                }
                                placeholder="30"
                              />
                            </div>
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
                <div className="flex flex-col gap-1">
                  <Text fontWeight="semibold">Test Access Methods</Text>
                  <Text variant="bodySm" color="subdued">
                    Test the configured access methods for this version and
                    review the connection and response results.
                  </Text>
                </div>
                {customProviders.length === 0 ? (
                  <div className="rounded-2 bg-surfaceSubdued px-4 py-6 text-center">
                    <Text variant="bodySm" color="subdued">
                      {sheetProviders.length === 0
                        ? 'Add and save a Custom API access method before testing.'
                        : 'Only Custom API access methods can be tested.'}
                    </Text>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Text fontWeight="semibold">Test Input</Text>
                      <Text variant="bodySm" color="subdued">
                        Enter a sample prompt or input to test the configured
                        access methods.
                      </Text>
                    </div>
                    <TextField
                      name="versionTestInput"
                      label="Test Input"
                      labelHidden
                      multiline={4}
                      value={versionTestInput}
                      onChange={setVersionTestInput}
                      placeholder="Enter a sample prompt or input for testing..."
                    />
                    <div>
                      <Button
                        kind="neutral"
                        size="medium"
                        disabled={testingIds.length > 0}
                        onClick={() => runCustomTest(customProviders)}
                      >
                        Test All Access Methods
                      </Button>
                    </div>
                    <div className={styles.testSummary}>
                      <Text fontWeight="semibold">Test Results</Text>
                      <Text
                        variant="bodySm"
                        color="subdued"

                        className={styles.testSummaryText}
                      >
                        {`${testedCount} Tested · ${testCounts.successful} Successful · ${testCounts.failed} Failed · ${notTestedCount} Not Tested`}
                      </Text>
                      <div className={styles.testSummaryMessage}>
                        <Text fontWeight="semibold">
                          {customTestSummaryHeadline(testCounts)}
                        </Text>
                        <Text variant="bodySm" color="subdued">
                          Results reflect the current configuration and Test
                          Input — editing either marks a result as changed.
                        </Text>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {customTestRows.map(
                        ({ provider, result, isTesting, status }) => {
                          const meta = CUSTOM_TEST_STATUS[status];
                          const expanded = expandedTestId === provider.id;
                          const name =
                            accessMethodName(provider.config) || 'Custom API';
                          const statusTone =
                            meta.color === 'success'
                              ? styles.testStatusSuccess
                              : meta.color === 'critical'
                                ? styles.testStatusCritical
                                : styles.testStatusSubdued;
                          return (
                            <SectionCard
                              key={provider.id}
                              className={styles.testResult}
                              expandable
                              expanded={expanded}
                              onExpandedChange={(open) =>
                                setExpandedTestId(open ? provider.id : null)
                              }
                              title={
                                <span className={styles.testTitleRow}>
                                  <span className={styles.testTitleText}>
                                    {name}
                                  </span>
                                  <span
                                    className={`${styles.testStatus} ${statusTone}`}
                                  >
                                    {customTestStatusIcon(status)}
                                    <Text
                                      as="span"
                                      variant="bodySm"
                                      color={meta.color}
                                      fontWeight="medium"
                                    >
                                      {meta.label}
                                    </Text>
                                  </span>
                                </span>
                              }
                              description={
                                <>
                                  {`Custom API${
                                    provider.providerModelId
                                      ? ` · ${provider.providerModelId}`
                                      : ''
                                  }`}
                                  {provider.isPrimary ? (
                                    <>
                                      {' '}
                                      <Tag
                                        fillColor="#E8F1FB"
                                        textColor="#1D4E89"
                                      >
                                        Primary
                                      </Tag>
                                    </>
                                  ) : null}
                                </>
                              }
                            >
                              <div className={styles.diagnosticsHeader}>
                                <Text
                                  variant="bodySm"
                                  color="subdued"
                                  fontWeight="semibold"
                                  className={styles.diagnosticsLabel}
                                >
                                  Diagnostics
                                </Text>
                                <Button
                                  kind="tertiary"
                                  variant="basic"
                                  size="slim"
                                  icon={<IconRefresh size={16} />}
                                  disabled={isTesting}
                                  onClick={() => runCustomTest([provider])}
                                >
                                  Test{' '}
                                  {testCounts.failed > 0 ||
                                  testCounts.stale > 0 ||
                                  testCounts.successful > 0
                                    ? 'Again'
                                    : ''}
                                </Button>
                              </div>
                              {isTesting ? (
                                <div className="mt-2">
                                  <Text variant="bodySm" color="subdued">
                                    Running test...
                                  </Text>
                                </div>
                              ) : null}
                              {!isTesting && status === 'not-tested' ? (
                                <div className="mt-2">
                                  <Text variant="bodySm" color="subdued">
                                    This access method has not been tested yet.
                                  </Text>
                                </div>
                              ) : null}
                              {!isTesting && status === 'stale' ? (
                                <div className="mt-2">
                                  <Text variant="bodySm" color="subdued">
                                    The configuration or test input changed
                                    since the last test. Test again to refresh
                                    the result.
                                  </Text>
                                </div>
                              ) : null}
                              {!isTesting &&
                              status !== 'not-tested' &&
                              status !== 'stale' &&
                              result ? (
                                <div className={styles.diagnosticsBox}>
                                  <Text
                                    variant="bodySm"
                                    color="subdued"
                                    className="font-mono"
                                  >
                                    Test Started
                                  </Text>
                                  {result.steps.map((step) => (
                                    <Text
                                      key={step.stage}
                                      variant="bodySm"
                                      color={
                                        step.status === 'pass'
                                          ? 'success'
                                          : 'critical'
                                      }

                                      className="font-mono"
                                    >
                                      {step.status === 'pass' ? '✓' : '✕'}{' '}
                                      {step.stage} — {step.message}
                                    </Text>
                                  ))}
                                  <div className={styles.diagnosticsResult}>
                                    <Text
                                      variant="bodySm"
                                      className="font-mono"
                                    >
                                      Result:{' '}
                                      <Text
                                        as="span"
                                        variant="bodySm"
                                        fontWeight="semibold"
                                        color={
                                          CUSTOM_TEST_STATUS[result.status]
                                            .color
                                        }
                                        className="font-mono"
                                      >
                                        {
                                          CUSTOM_TEST_STATUS[result.status]
                                            .label
                                        }
                                      </Text>
                                    </Text>
                                  </div>
                                </div>
                              ) : null}
                            </SectionCard>
                          );
                        }
                      )}
                    </div>
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
