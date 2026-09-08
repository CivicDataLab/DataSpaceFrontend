'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { AiModelType, PromptDomain, UpdateAiModelInput } from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Checkbox,
  Combobox,
  FormLayout,
  Labelled,
  Select,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
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
    sectors:
      model.sectors?.map((s) => ({ label: s.name, value: s.id })) || [],
    tags: model.tags?.map((t) => ({ label: t.value, value: t.id })) || [],
    maxTokens: model.maxTokens?.toString() || '',
    supportedLanguages: Array.isArray(model.supportedLanguages)
      ? model.supportedLanguages
          .filter((l): l is string => typeof l === 'string')
          .map((l) => ({
            label:
              LANGUAGE_OPTIONS.find((option) => option.value === l)?.label ||
              l,
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

const promptDomainEnumValuesQueryDoc = graphql(`
  query PromptDomainEnum {
    __type(name: "PromptDomain") {
      enumValues {
        name
        description
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

  const { setStatus } = useEditStatus();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyAIModelForm());

  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);
  const SAVE_SUCCESS_TOAST_ID = 'ai-model-details-save-success';
  const SAVE_ERROR_TOAST_ID = 'ai-model-details-save-error';
  const AI_MODEL_VALIDATION_TOAST_ID = 'ai-model-details-validation-toast';
  const OPEN_ACCESS_REQUIRED_TOAST_ID = SAVE_SUCCESS_TOAST_ID;
  const isValidHttpUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getTagsList = useQuery([`tags_list_query`], () =>
    GraphQL(
      tagsListQueryDoc,
      {
        [params.entityType]: params.entitySlug,
      }
    )
  );

  const getSectorsList =
    useQuery([`sectors_list_query`], () =>
      GraphQL(
        sectorsListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        }
      )
    );

  const getGeographiesList =
    useQuery([`geographies_list_query`], () =>
      GraphQL(
        geographiesListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        }
      )
    );

  const getPromptDomainEnumValues =
    useQuery([`prompt_domain_enum_values_query`], () =>
      GraphQL(promptDomainEnumValuesQueryDoc, {})
    );

  const AIModelData = useQuery(
    [
      `fetch_AIModelDetails`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
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
          typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.trim()
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

    // Ensure access type is always 'open' (required field)
    if (dataToUse.accessType !== 'open') {
      toast('Open access is required for all models', {
        id: OPEN_ACCESS_REQUIRED_TOAST_ID,
      });
      setStatus('unsaved');
      return;
    }

    const updateData: Omit<UpdateAiModelInput, 'id'> = {
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
      isPublic: dataToUse.accessType === 'open',
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
    ...(
      getPromptDomainEnumValues.data?.__type?.enumValues?.map((item: { name: string }) => ({
        label: item.name
          .toLowerCase()
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        value: item.name,
      })) || []
    ),
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

  const maxTokensOptions = [
    { label: 'Click to select from dropdown', value: '' },
    { label: '1024', value: '1024' },
    { label: '2048', value: '2048' },
    { label: '4096', value: '4096' },
    { label: '8192', value: '8192' },
    { label: '16384', value: '16384' },
    { label: '32768', value: '32768' },
    { label: '65536', value: '65536' },
    { label: '131072', value: '131072' },
  ];

  const languageOptions = LANGUAGE_OPTIONS;

  const licenseOptions = [
    { label: 'Click to select from dropdown', value: '' },
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

  if (AIModelData.isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Spinner size={32} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 py-6">
      {/* Model Type & Domain - side by side */}
      <FormLayout>
        <FormLayout.Group>
          <Select
            name="modelType"
            label="Model Type"
            requiredIndicator={true}
            options={modelTypeOptions}
            value={formData.modelType}
            onChange={(value) => {
              handleInputChange('modelType', value);
              handleSave({ ...formData, modelType: value });
            }}
            required
          />
          <Select
            name="domain"
            label="Domain"
            options={domainOptions}
            value={formData.domain}
            onChange={(value) => {
              handleInputChange('domain', value);
              handleSave({ ...formData, domain: value });
            }}
          />
        </FormLayout.Group>
      </FormLayout>

      {/* Description */}
      <RichTextEditor
        label="Description"
        value={formData.description}
        onChange={(value) => handleInputChange('description', value)}
        onBlur={() => handleSave()}
        placeholder="Enter model description with rich formatting..."
        helpText={`Character limit: ${formData?.description?.length || 0}/1000`}
      />

      {/* Target Users & Intended Use - side by side */}
      <FormLayout>
        <FormLayout.Group>
          <TextField
            name="targetUsers"
            label="Target Users"
            value={formData.targetUsers}
            onChange={(value) => handleInputChange('targetUsers', value)}
            onBlur={() => handleSave()}
            multiline={3}
            required
            requiredIndicator={true}
          />
          <TextField
            name="intendedUse"
            label="Intended Use"
            value={formData.intendedUse}
            onChange={(value) => handleInputChange('intendedUse', value)}
            onBlur={() => handleSave()}
            multiline={3}
            required
            requiredIndicator={true}
          />
        </FormLayout.Group>
      </FormLayout>

      {/* Sectors */}
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
        selectedValue={formData.sectors || []}
        onChange={(value) => {
          const next = toSelectOptions(value);
          handleInputChange('sectors', next);
          handleSave({ ...formData, sectors: next });
        }}
        required
        requiredIndicator={true}
      />

      {/* Tags */}
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
        selectedValue={formData.tags || []}
        requiredIndicator
        onChange={(value) => {
          const next = toSelectOptions(value);
          setIsTagsListUpdated(true);
          handleInputChange('tags', next);
          handleSave({ ...formData, tags: next });
        }}
      />

      {/* Maximum Tokens & Languages - side by side */}
      <FormLayout>
        <FormLayout.Group>
          <Select
            name="maxTokens"
            label="Maximum Tokens"
            options={maxTokensOptions}
            value={formData.maxTokens}
            onChange={(value) => {
              handleInputChange('maxTokens', value);
              handleSave({ ...formData, maxTokens: value });
            }}
            required
            requiredIndicator={true}
          />
          <Combobox
            displaySelected
            name="supportedLanguages"
            list={languageOptions}
            label="Languages"
            key={`languages-${formData.supportedLanguages.length}`}
            selectedValue={formData.supportedLanguages || []}
            onChange={(value) => {
              const next = toSelectOptions(value);
              handleInputChange('supportedLanguages', next);
              handleSave({ ...formData, supportedLanguages: next });
            }}
            required
            requiredIndicator={true}
          />
        </FormLayout.Group>
      </FormLayout>

      {/* Model Website & Locations/Geography - side by side */}
      <FormLayout>
        <FormLayout.Group>
          <TextField
            name="modelWebsite"
            label="Model Website"
            value={formData.modelWebsite}
            onChange={(value) => handleInputChange('modelWebsite', value)}
            onBlur={handleWebsiteBlur}
            placeholder="https://www.model.com"
            required
            requiredIndicator={true}
          />
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
            label="Locations / Geography"
            requiredIndicator
            selectedValue={formData.geographies || []}
            onChange={(value) => {
              const next = toSelectOptions(value);
              handleInputChange('geographies', next);
              handleSave({ ...formData, geographies: next });
            }}
          />
        </FormLayout.Group>
      </FormLayout>

      {/* Usage License & Access Type - side by side */}
      <FormLayout>
        <FormLayout.Group>
          <Select
            name="usageLicense"
            label="Usage License"
            options={licenseOptions}
            value={formData.usageLicense}
            onChange={(value) => {
              handleInputChange('usageLicense', value);
              handleSave({ ...formData, usageLicense: value });
            }}
          />
          <Labelled
            id="accessType"
            label="Select Access Type"
            requiredIndicator
            error={
              formData.accessType !== 'open'
                ? 'Open access is required for all models'
                : undefined
            }
          >
            <div className="flex gap-6">
              <Checkbox
                name="accessType"
                checked={formData.accessType === 'open'}
                onChange={() => {
                  handleInputChange('accessType', 'open');
                  handleSave({ ...formData, accessType: 'open' });
                }}
                required
              >
                <div className="flex flex-col gap-1">
                  <Text>Open Access</Text>
                  <Text>Model can be viewed and used by everyone</Text>
                </div>
              </Checkbox>
              <Checkbox
                name="isRestricted"
                checked={false}
                defaultChecked={false}
                disabled
              >
                <div className="flex flex-col gap-1" title="Coming Soon">
                  <Text className="text-textDisabled">Restricted Access</Text>
                  <Text className="text-iconDisabled">
                    Users would require to request access to the model.
                    Recommended for sensitive models.
                  </Text>
                </div>
              </Checkbox>
            </div>
          </Labelled>
        </FormLayout.Group>
      </FormLayout>
    </div>
  );
}
