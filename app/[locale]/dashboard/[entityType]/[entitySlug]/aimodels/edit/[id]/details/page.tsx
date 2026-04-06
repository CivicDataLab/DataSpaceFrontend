'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
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

const tagsListQueryDoc: any = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

const sectorsListQueryDoc: any = graphql(`
  query AIModelSectorsList {
    sectors {
      id
      name
    }
  }
`);

const geographiesListQueryDoc: any = graphql(`
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

const FetchAIModelDetails: any = graphql(`
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

const UpdateAIModelMutation: any = graphql(`
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

  const [formData, setFormData] = useState({
    name: '',
    modelType: 'TEXT_GENERATION',
    domain: '',
    description: '',
    targetUsers: '',
    intendedUse: '',
    sectors: [] as Array<{ label: string; value: string }>,
    tags: [] as Array<{ label: string; value: string }>,
    maxTokens: '',
    supportedLanguages: [] as Array<{ label: string; value: string }>,
    modelWebsite: '',
    geographies: [] as Array<{ label: string; value: string }>,
    usageLicense: '',
    accessType: 'open' as 'open' | 'restricted',
  });

  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);
  const SAVE_SUCCESS_TOAST_ID = 'ai-model-details-save-success';
  const SAVE_ERROR_TOAST_ID = 'ai-model-details-save-error';
  const AI_MODEL_VALIDATION_TOAST_ID = 'ai-model-details-validation-toast';
  const isValidHttpUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getTagsList: {
    data: any;
    isLoading: boolean;
    error: any;
    refetch: any;
  } = useQuery([`tags_list_query`], () =>
    GraphQL(
      tagsListQueryDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      {} as any
    )
  );

  const getSectorsList: { data: any; isLoading: boolean; error: any } =
    useQuery([`sectors_list_query`], () =>
      GraphQL(
        sectorsListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        {} as any
      )
    );

  const getGeographiesList: { data: any; isLoading: boolean; error: any } =
    useQuery([`geographies_list_query`], () =>
      GraphQL(
        geographiesListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        {} as any
      )
    );

  const AIModelData: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
  } = useQuery(
    [`fetch_AIModelDetails_${params.id}`],
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
      keepPreviousData: false,
    }
  );

  const model = AIModelData.data?.aiModels?.[0];

  const { mutate } = useMutation(
    (data: any) =>
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
        queryClient.invalidateQueries([`fetch_AIModelForPublish_${params.id}`]);
      },
      onError: (error: any) => {
        const errorMessage =
          typeof error?.message === 'string' && error.message.trim()
            ? error.message.trim()
            : 'Unable to update AI Model right now. Please try again.';
        toast(`Error: ${errorMessage}`, { id: SAVE_ERROR_TOAST_ID });
        setStatus('unsaved');
      },
    }
  );

  useEffect(() => {
    setFormData({
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
    });
  }, [params.id]);

  useEffect(() => {
    if (model) {
      const metadata = model.metadata || {};
      setFormData({
        name: model.displayName || model.name || '',
        modelType: model.modelType || 'TEXT_GENERATION',
        domain: model.domain || '',
        description: model.description || '',
        targetUsers: metadata.targetUsers || '',
        intendedUse: metadata.intendedUse || '',
        sectors:
          model.sectors?.map((s: any) => ({ label: s.name, value: s.id })) ||
          [],
        tags:
          model.tags?.map((t: any) => ({ label: t.value, value: t.id })) || [],
        maxTokens: model.maxTokens?.toString() || '',
        supportedLanguages:
          model.supportedLanguages?.map((l: string) => ({
            label:
              LANGUAGE_OPTIONS.find((option) => option.value === l)?.label || l,
            value: l,
          })) || [],
        modelWebsite: metadata.modelWebsite || '',
        geographies:
          model.geographies?.map((g: any) => ({
            label: g.name,
            value: g.id,
          })) || [],
        usageLicense: metadata.usageLicense || '',
        accessType: model.isPublic ? 'open' : 'restricted',
      });
    }
  }, [model]);

  const handleInputChange = (field: string, value: any) => {
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
      toast('Please enter a valid URL that includes https.', {
        id: AI_MODEL_VALIDATION_TOAST_ID,
      });
      return;
    }

    if (trimmedWebsite !== formData.modelWebsite) {
      setFormData((prev) => ({ ...prev, modelWebsite: trimmedWebsite }));
    }

    handleSave({ ...formData, modelWebsite: trimmedWebsite });
  };

  const handleSave = (overrideData?: any) => {
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

    const updateData: any = {
      description: dataToUse.description,
      modelType: dataToUse.modelType,
      domain: dataToUse.domain || null,
      tags: dataToUse.tags.map((item: any) => item.label),
      sectors: dataToUse.sectors.map((item: any) => item.label),
      geographies: dataToUse.geographies.map((item: any) =>
        parseInt(item.value, 10)
      ),
      supportedLanguages: dataToUse.supportedLanguages.map(
        (item: any) => item.value
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
    { label: 'Healthcare', value: 'HEALTHCARE' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Legal', value: 'LEGAL' },
    { label: 'Finance', value: 'FINANCE' },
    { label: 'Agriculture', value: 'AGRICULTURE' },
    { label: 'Environment', value: 'ENVIRONMENT' },
    { label: 'Government', value: 'GOVERNMENT' },
    { label: 'Technology', value: 'TECHNOLOGY' },
    { label: 'Science', value: 'SCIENCE' },
    { label: 'Social Services', value: 'SOCIAL_SERVICES' },
    { label: 'Transportation', value: 'TRANSPORTATION' },
    { label: 'Energy', value: 'ENERGY' },
    { label: 'General', value: 'GENERAL' },
    { label: 'Other', value: 'OTHER' },
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
  const OPEN_ACCESS_REQUIRED_TOAST_ID = SAVE_SUCCESS_TOAST_ID;
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
          getSectorsList.data?.sectors?.map((item: any) => ({
            label: item.name,
            value: item.id,
          })) || []
        }
        key={`sectors-${getSectorsList.data?.sectors?.length || 0}-${formData.sectors.length}`}
        label="Sectors"
        selectedValue={formData.sectors}
        onChange={(value) => {
          handleInputChange('sectors', value);
          handleSave({ ...formData, sectors: value });
        }}
        required
        requiredIndicator={true}
      />

      {/* Tags */}
      <Combobox
        displaySelected
        name="tags"
        list={
          getTagsList.data?.tags?.map((item: any) => ({
            label: item.value,
            value: item.id,
          })) || []
        }
        key={`tags-${getTagsList.data?.tags?.length || 0}-${formData.tags.length}`}
        label="Tags"
        creatable
        selectedValue={formData.tags}
        requiredIndicator
        onChange={(value) => {
          setIsTagsListUpdated(true);
          handleInputChange('tags', value);
          handleSave({ ...formData, tags: value });
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
            selectedValue={formData.supportedLanguages}
            onChange={(value) => {
              handleInputChange('supportedLanguages', value);
              handleSave({ ...formData, supportedLanguages: value });
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
            placeholder="www.model.com"
            required
            requiredIndicator={true}
          />
          <Combobox
            displaySelected
            name="geographies"
            list={
              getGeographiesList.data?.geographies?.map((item: any) => ({
                label: `${item.name}${item.parentId ? ` (${item.parentId.name})` : ''}`,
                value: item.id,
              })) || []
            }
            key={`geographies-${getGeographiesList.data?.geographies?.length || 0}-${formData.geographies.length}`}
            label="Locations / Geography"
            requiredIndicator
            selectedValue={formData.geographies}
            onChange={(value) => {
              handleInputChange('geographies', value);
              handleSave({ ...formData, geographies: value });
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
