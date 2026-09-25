'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  AiModelType,
  PromptDomain,
  UpdateAiModelInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Combobox,
  SectionCard,
  Select,
  Spinner,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { enumValues } from '@/lib/enumValues';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import { plainText } from '../../aimodel-summary';
import { useEditStatus } from '../../context';

interface SelectOption {
  label: string;
  value: string;
}

interface ModelMetadataFields {
  targetUsers?: string;
  intendedUse?: string;
  modelWebsite?: string;
  usageLicense?: string;
}

interface AIModelFormData {
  name: string;
  modelType: string;
  domain: string;
  description: string;
  targetUsers: string;
  intendedUse: string;
  sectors: SelectOption[];
  tags: SelectOption[];
  maxTokens: string;
  supportedLanguages: SelectOption[];
  modelWebsite: string;
  geographies: SelectOption[];
  usageLicense: string;
  accessType: 'open' | 'restricted';
}

function asModelMetadata(value: unknown): ModelMetadataFields {
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    return {
      targetUsers:
        typeof record.targetUsers === 'string' ? record.targetUsers : '',
      intendedUse:
        typeof record.intendedUse === 'string' ? record.intendedUse : '',
      modelWebsite:
        typeof record.modelWebsite === 'string' ? record.modelWebsite : '',
      usageLicense:
        typeof record.usageLicense === 'string' ? record.usageLicense : '',
    };
  }
  return {};
}

function emptyAIModelForm(): AIModelFormData {
  return {
    name: '',
    modelType: 'TEXT_GENERATION',
    domain: '',
    description: '',
    targetUsers: '',
    intendedUse: '',
    sectors: [],
    tags: [],
    maxTokens: '',
    supportedLanguages: [],
    modelWebsite: '',
    geographies: [],
    usageLicense: '',
    accessType: 'open',
  };
}

function formDataFromModel(model: {
  displayName?: string | null;
  name?: string | null;
  modelType?: string | null;
  domain?: string | null;
  description?: string | null;
  metadata?: unknown;
  sectors?: Array<{ id: string; name: string }> | null;
  tags?: Array<{ id: string; value: string }> | null;
  maxTokens?: number | null;
  supportedLanguages?: unknown;
  geographies?: Array<{ id: string; name: string }> | null;
  isPublic?: boolean | null;
}): AIModelFormData {
  const metadata = asModelMetadata(model.metadata);
  return {
    name: model.displayName || model.name || '',
    modelType: model.modelType || 'TEXT_GENERATION',
    domain: model.domain || '',
    description: model.description || '',
    targetUsers: metadata.targetUsers || '',
    intendedUse: metadata.intendedUse || '',
    sectors: model.sectors?.map((s) => ({ label: s.name, value: s.id })) || [],
    tags: model.tags?.map((t) => ({ label: t.value, value: t.id })) || [],
    maxTokens: model.maxTokens?.toString() || '',
    supportedLanguages: Array.isArray(model.supportedLanguages)
      ? model.supportedLanguages
          .filter((l): l is string => typeof l === 'string')
          .map((l) => ({
            label:
              LANGUAGE_OPTIONS.find((option) => option.value === l)?.label || l,
            value: l,
          }))
      : [],
    modelWebsite: metadata.modelWebsite || '',
    geographies:
      model.geographies?.map((g) => ({
        label: g.name,
        value: g.id,
      })) || [],
    usageLicense: metadata.usageLicense || '',
    accessType: model.isPublic ? 'open' : 'restricted',
  };
}

function toSelectOptions(value: string | SelectOption[]): SelectOption[] {
  return Array.isArray(value) ? value : [];
}

function comboboxSingle(value: string | Array<{ value: string }>): string {
  if (typeof value === 'string') return value;
  return value[0]?.value ?? '';
}

const TARGET_USER_OPTIONS = [
  { label: 'General public', value: 'General public' },
  { label: 'Researchers', value: 'Researchers' },
  { label: 'Policymakers', value: 'Policymakers' },
  { label: 'Developers', value: 'Developers' },
  { label: 'Government agencies', value: 'Government agencies' },
  { label: 'Civil society', value: 'Civil society' },
];

const tagsListQueryDoc = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

const sectorsListQueryDoc = graphql(`
  query AIModelSectorsList {
    sectors {
      id
      name
    }
  }
`);

const geographiesListQueryDoc = graphql(`
  query AIModelGeographiesList {
    geographies {
      id
      name
      code
      type
      parentId {
        id
        name
      }
    }
  }
`);

const FetchAIModelDetails = graphql(`
  query AIModelDetails($filters: AIModelFilter) {
    aiModels(filters: $filters) {
      id
      name
      displayName
      description
      modelType
      domain
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
      supportedLanguages
      maxTokens
      isPublic
      metadata
    }
  }
`);

const UpdateAIModelMutation = graphql(`
  mutation updateAIModelDetails($input: UpdateAIModelInput!) {
    updateAiModel(input: $input) {
      success
      data {
        id
        name
        displayName
        description
      }
    }
  }
`);

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Marathi', value: 'mr' },
];

export default function AIModelDetailsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { setStatus, setInfoCompleted, stepShowErrors, setStepShowErrors } =
    useEditStatus();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyAIModelForm());

  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);
  const SAVE_SUCCESS_TOAST_ID = 'ai-model-details-save-success';
  const SAVE_ERROR_TOAST_ID = 'ai-model-details-save-error';
  const AI_MODEL_VALIDATION_TOAST_ID = 'ai-model-details-validation-toast';
  const isValidHttpUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getTagsList = useQuery([`tags_list_query`], () =>
    GraphQL(tagsListQueryDoc, {
      [params.entityType]: params.entitySlug,
    })
  );

  const getSectorsList = useQuery([`sectors_list_query`], () =>
    GraphQL(sectorsListQueryDoc, {
      [params.entityType]: params.entitySlug,
    })
  );

  const getGeographiesList = useQuery([`geographies_list_query`], () =>
    GraphQL(geographiesListQueryDoc, {
      [params.entityType]: params.entitySlug,
    })
  );

  const AIModelData = useQuery(
    [`fetch_AIModelDetails`, params.id, params.entityType, params.entitySlug],
    () =>
      GraphQL(
        FetchAIModelDetails,
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
      refetchOnReconnect: true,
    }
  );

  const model = AIModelData.data?.aiModels?.[0];

  const { mutate } = useMutation(
    (data: Omit<UpdateAiModelInput, 'id'>) =>
      GraphQL(
        UpdateAIModelMutation,
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
        toast('AI Model updated successfully', { id: SAVE_SUCCESS_TOAST_ID });
        setStatus('saved');
        if (isTagsListUpdated) {
          getTagsList.refetch();
          setIsTagsListUpdated(false);
        }
        AIModelData.refetch();
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_AIModelForPublish`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_AIModelData`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
      },
      onError: (error: unknown) => {
        const errorMessage =
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string' &&
          error.message.trim()
            ? error.message.trim()
            : 'Unable to update AI Model right now. Please try again.';
        toast(`Error: ${errorMessage}`, { id: SAVE_ERROR_TOAST_ID });
        setStatus('unsaved');
      },
    }
  );

  const [prevId, setPrevId] = useState(params.id);
  if (params.id !== prevId) {
    setPrevId(params.id);
    setFormData(emptyAIModelForm());
  }

  const [prevModel, setPrevModel] = useState<typeof model | undefined>(
    undefined
  );
  if (model !== prevModel) {
    setPrevModel(model);
    if (model) {
      setFormData(formDataFromModel(model));
    }
  }

  const handleInputChange = (
    field: keyof AIModelFormData,
    value: AIModelFormData[keyof AIModelFormData]
  ) => {
    console.log('handleInputChange', field, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus('unsaved');
  };

  const handleWebsiteBlur = () => {
    const trimmedWebsite = formData.modelWebsite.trim();

    if (!trimmedWebsite) {
      if (formData.modelWebsite !== '') {
        setFormData((prev) => ({ ...prev, modelWebsite: '' }));
      }
      handleSave({ ...formData, modelWebsite: '' });
      return;
    }

    if (!isValidHttpUrl(trimmedWebsite)) {
      toast('Please enter a valid URL that includes http or https.', {
        id: AI_MODEL_VALIDATION_TOAST_ID,
      });
      return;
    }

    if (trimmedWebsite !== formData.modelWebsite) {
      setFormData((prev) => ({ ...prev, modelWebsite: trimmedWebsite }));
    }

    handleSave({ ...formData, modelWebsite: trimmedWebsite });
  };

  const handleSave = (overrideData?: AIModelFormData) => {
    setStatus('saving');
    const dataToUse = overrideData || formData;

    const updateData: Omit<UpdateAiModelInput, 'id'> = {
      ...(dataToUse.name.trim() ? { displayName: dataToUse.name.trim() } : {}),
      description: dataToUse.description,
      modelType: (Object.values(AiModelType) as string[]).includes(
        dataToUse.modelType
      )
        ? (dataToUse.modelType as AiModelType)
        : AiModelType.TextGeneration,
      domain:
        dataToUse.domain &&
        (Object.values(PromptDomain) as string[]).includes(dataToUse.domain)
          ? (dataToUse.domain as PromptDomain)
          : null,
      tags: dataToUse.tags.map((item) => item.label),
      sectors: dataToUse.sectors.map((item) => item.label),
      geographies: dataToUse.geographies.map((item) =>
        parseInt(item.value, 10)
      ),
      supportedLanguages: dataToUse.supportedLanguages.map(
        (item) => item.value
      ),
      maxTokens: parseInt(dataToUse.maxTokens) || null,
      isPublic: true,
      metadata: {
        targetUsers: dataToUse.targetUsers,
        intendedUse: dataToUse.intendedUse,
        modelWebsite: dataToUse.modelWebsite,
        usageLicense: dataToUse.usageLicense,
      },
    };
    mutate(updateData);
  };

  const domainOptions = [
    { label: 'Click to select from dropdown', value: '' },
    ...enumValues(PromptDomain).map((name) => ({
      label: name
        .toLowerCase()
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value: name,
    })),
  ];

  const modelTypeOptions = [
    { label: 'Translation', value: 'TRANSLATION' },
    { label: 'Text Generation', value: 'TEXT_GENERATION' },
    { label: 'Summarization', value: 'SUMMARIZATION' },
    { label: 'Question Answering', value: 'QUESTION_ANSWERING' },
    { label: 'Sentiment Analysis', value: 'SENTIMENT_ANALYSIS' },
    { label: 'Text Classification', value: 'TEXT_CLASSIFICATION' },
    { label: 'Named Entity Recognition', value: 'NAMED_ENTITY_RECOGNITION' },
    { label: 'Text to Speech', value: 'TEXT_TO_SPEECH' },
    { label: 'Speech to Text', value: 'SPEECH_TO_TEXT' },
    { label: 'Other', value: 'OTHER' },
  ];

  const languageOptions = LANGUAGE_OPTIONS;

  const licenseOptions = [
    { label: 'Select a license...', value: '' },
    { label: 'MIT License', value: 'MIT' },
    { label: 'Apache 2.0', value: 'Apache-2.0' },
    { label: 'GPL v3', value: 'GPL-3.0' },
    { label: 'BSD 3-Clause', value: 'BSD-3-Clause' },
    { label: 'Creative Commons BY 4.0', value: 'CC-BY-4.0' },
    { label: 'Creative Commons BY-SA 4.0', value: 'CC-BY-SA-4.0' },
    { label: 'Creative Commons BY-NC 4.0', value: 'CC-BY-NC-4.0' },
    { label: 'Proprietary', value: 'Proprietary' },
    { label: 'Other', value: 'Other' },
  ];

  useEffect(() => {
    setInfoCompleted(
      formData.name.trim().length > 0 &&
        Boolean(formData.modelType) &&
        plainText(formData.description).length > 0 &&
        Boolean(formData.domain) &&
        formData.sectors.length > 0 &&
        formData.supportedLanguages.length > 0 &&
        Boolean(formData.usageLicense)
    );
  }, [formData, setInfoCompleted]);

  useEffect(() => {
    if (AIModelData.isLoading) return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    setStepShowErrors(true);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [AIModelData.isLoading, setStepShowErrors]);

  if (AIModelData.isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Spinner size={32} />
      </div>
    );
  }
  const nameError =
    stepShowErrors && !formData.name.trim() ? 'Enter a model name.' : undefined;
  const typeError =
    stepShowErrors && !formData.modelType ? 'Select a model type.' : undefined;
  const descriptionError =
    stepShowErrors && !plainText(formData.description)
      ? 'Add a description of the model.'
      : undefined;
  const domainError =
    stepShowErrors && !formData.domain ? 'Select a domain.' : undefined;
  const sectorError =
    stepShowErrors && formData.sectors.length === 0
      ? 'Select at least one sector.'
      : undefined;
  const languageError =
    stepShowErrors && formData.supportedLanguages.length === 0
      ? 'Define how language support applies to this model.'
      : undefined;
  const licenseError =
    stepShowErrors && !formData.usageLicense
      ? 'Select a usage license.'
      : undefined;

  const targetUserList =
    formData.targetUsers &&
    !TARGET_USER_OPTIONS.some((option) => option.value === formData.targetUsers)
      ? [
          { label: formData.targetUsers, value: formData.targetUsers },
          ...TARGET_USER_OPTIONS,
        ]
      : TARGET_USER_OPTIONS;

  return (
    <div className="flex flex-col gap-6 ">
      <SectionCard
        title="Basic Information"
        description="Name and describe this model so people can find and understand it."
      >
        <div id="basic-information" className="flex flex-col gap-5">
          <div id="model-name">
            <TextField
              name="modelName"
              label="Model Name"
              required
              requiredIndicator
              value={formData.name}
              error={nameError}
              helpText="Use a clear name that identifies the model."
              placeholder="Enter the model name"
              onChange={(value) => handleInputChange('name', value)}
              onBlur={() => handleSave()}
            />
          </div>
          <div id="model-type">
            <Combobox
              name="modelType"
              label="Model Type"
              required
              requiredIndicator
              displaySelected
              error={typeError}
              placeholder="Search and select a model type..."
              list={modelTypeOptions}
              selectedValue={formData.modelType}
              onChange={(value) => {
                const next = comboboxSingle(value);
                handleInputChange('modelType', next);
                handleSave({ ...formData, modelType: next });
              }}
            />
          </div>
          <div id="description">
            <RichTextEditor
              label="Description *"
              value={formData.description}
              error={descriptionError}
              placeholder="Describe what this model does, the problem it addresses, and what users should know about it."
              onChange={(value) => handleInputChange('description', value)}
              onBlur={() => handleSave()}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Purpose & Audience"
        description="Help people understand who can use this model and what it is intended for."
      >
        <div className="flex flex-col gap-5">
          <Combobox
            name="targetUsers"
            label="Target Users"
            displaySelected
            creatable
            placeholder="Select target users..."
            list={targetUserList}
            selectedValue={formData.targetUsers}
            onChange={(value) => {
              const next = comboboxSingle(value);
              handleInputChange('targetUsers', next);
              handleSave({ ...formData, targetUsers: next });
            }}
          />
          <TextField
            name="intendedUse"
            label="Intended Use"
            value={formData.intendedUse}
            multiline={4}
            placeholder="Describe what this model is intended to be used for."
            onChange={(value) => handleInputChange('intendedUse', value)}
            onBlur={() => handleSave()}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Classification"
        description="Add sectors and topics to help people discover this content."
      >
        <div id="classification" className="flex flex-col gap-5">
          <div id="domain">
            <Combobox
              name="domain"
              label="Domain"
              required
              requiredIndicator
              displaySelected
              error={domainError}
              placeholder="Search and select a domain..."
              list={domainOptions.filter((option) => option.value !== '')}
              selectedValue={formData.domain}
              onChange={(value) => {
                const next = comboboxSingle(value);
                handleInputChange('domain', next);
                handleSave({ ...formData, domain: next });
              }}
            />
          </div>
          <div id="sectors">
            <Combobox
              displaySelected
              name="sectors"
              list={
                getSectorsList.data?.sectors?.map((item) => ({
                  label: item.name,
                  value: item.id,
                })) || []
              }
              key={`sectors-${getSectorsList.data?.sectors?.length || 0}-${formData.sectors.length}`}
              label="Sectors"
              placeholder="Select sectors..."
              selectedValue={formData.sectors || []}
              error={sectorError}
              onChange={(value) => {
                const next = toSelectOptions(value);
                handleInputChange('sectors', next);
                handleSave({ ...formData, sectors: next });
              }}
              required
              requiredIndicator
            />
          </div>
          <Combobox
            displaySelected
            name="tags"
            list={
              getTagsList.data?.tags?.map((item) => ({
                label: item.value,
                value: item.id,
              })) || []
            }
            key={`tags-${getTagsList.data?.tags?.length || 0}-${formData.tags.length}`}
            label="Tags"
            creatable
            placeholder="Type a tag and press Enter..."
            selectedValue={formData.tags || []}
            onChange={(value) => {
              const next = toSelectOptions(value);
              setIsTagsListUpdated(true);
              handleInputChange('tags', next);
              handleSave({ ...formData, tags: next });
            }}
          />
          <div id="language-support">
            <Combobox
              displaySelected
              name="supportedLanguages"
              list={languageOptions}
              label="Language Support"
              placeholder="Select language support..."
              key={`languages-${formData.supportedLanguages.length}`}
              selectedValue={formData.supportedLanguages || []}
              error={languageError}
              onChange={(value) => {
                const next = toSelectOptions(value);
                handleInputChange('supportedLanguages', next);
                handleSave({ ...formData, supportedLanguages: next });
              }}
              required
              requiredIndicator
            />
          </div>
          <Combobox
            displaySelected
            name="geographies"
            list={
              getGeographiesList.data?.geographies?.map((item) => ({
                label: `${item.name}${item.parentId ? ` (${item.parentId.name})` : ''}`,
                value: item.id,
              })) || []
            }
            key={`geographies-${getGeographiesList.data?.geographies?.length || 0}-${formData.geographies.length}`}
            label="Geography"
            placeholder="Select geography..."
            selectedValue={formData.geographies || []}
            onChange={(value) => {
              const next = toSelectOptions(value);
              handleInputChange('geographies', next);
              handleSave({ ...formData, geographies: next });
            }}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Additional Information"
        description="Add a website and the license that applies to this model."
      >
        <div className="flex flex-col gap-5">
          <TextField
            name="modelWebsite"
            label="Model Website"
            value={formData.modelWebsite}
            onChange={(value) => handleInputChange('modelWebsite', value)}
            onBlur={handleWebsiteBlur}
            placeholder="https://example.org/model"
            helpText="Add the model's official website or documentation page."
          />
          <div id="usage-license">
            <Select
              name="usageLicense"
              label="Usage License"
              required
              requiredIndicator
              options={licenseOptions}
              value={formData.usageLicense}
              error={licenseError}
              helpText="Use suggested default — CC BY 4.0"
              onChange={(value) => {
                handleInputChange('usageLicense', value);
                handleSave({ ...formData, usageLicense: value });
              }}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
