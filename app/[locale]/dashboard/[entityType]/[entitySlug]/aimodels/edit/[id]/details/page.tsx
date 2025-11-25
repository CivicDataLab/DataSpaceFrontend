'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Combobox,
  FormLayout,
  Select,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
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
      version
      modelType
      provider
      providerModelId
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
      supportsStreaming
      maxTokens
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

export default function AIModelDetailsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { setStatus } = useEditStatus();

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    version: '',
    modelType: 'TEXT_GENERATION',
    provider: 'CUSTOM',
    providerModelId: '',
    tags: [] as Array<{ label: string; value: string }>,
    sectors: [] as Array<{ label: string; value: string }>,
    geographies: [] as Array<{ label: string; value: string }>,
    supportedLanguages: '',
    supportsStreaming: false,
    maxTokens: 0,
  });

  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

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

  const AIModelData: { data: any; isLoading: boolean; refetch: any } = useQuery(
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
    }
  );

  const model = AIModelData.data?.aiModels[0];

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
        toast('AI Model updated successfully');
        setStatus('saved');
        if (isTagsListUpdated) {
          getTagsList.refetch();
          setIsTagsListUpdated(false);
        }
        AIModelData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
        setStatus('unsaved');
      },
    }
  );

  useEffect(() => {
    if (model) {
      setFormData({
        name: model.name || '',
        displayName: model.displayName || '',
        description: model.description || '',
        version: model.version || '',
        modelType: model.modelType || 'TEXT_GENERATION',
        provider: model.provider || 'CUSTOM',
        providerModelId: model.providerModelId || '',
        tags: model.tags?.map((tag: any) => ({
          label: tag.value,
          value: tag.id,
        })) || [],
        sectors: model.sectors?.map((sector: any) => ({
          label: sector.name,
          value: sector.id,
        })) || [],
        geographies: model.geographies?.map((geography: any) => ({
          label: geography.name,
          value: geography.id,
        })) || [],
        supportedLanguages: model.supportedLanguages?.join(', ') || '',
        supportsStreaming: model.supportsStreaming || false,
        maxTokens: model.maxTokens || 0,
      });
    }
  }, [model]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus('unsaved');
  };

  const handleSave = (overrideData?: any) => {
    setStatus('saving');
    const dataToUse = overrideData || formData;
    const updateData: any = {
      name: dataToUse.name,
      displayName: dataToUse.displayName,
      description: dataToUse.description,
      modelType: dataToUse.modelType,
      provider: dataToUse.provider,
      version: dataToUse.version,
      providerModelId: dataToUse.providerModelId,
      tags: dataToUse.tags.map((item: any) => item.label),
      sectors: dataToUse.sectors.map((item: any) => item.label),
      geographies: dataToUse.geographies.map((item: any) => item.label),
      supportedLanguages: dataToUse.supportedLanguages
        .split(',')
        .map((l: string) => l.trim())
        .filter(Boolean),
      supportsStreaming: dataToUse.supportsStreaming,
      maxTokens: parseInt(dataToUse.maxTokens.toString()) || 0,
    };
    mutate(updateData);
  };

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

  const providerOptions = [
    { label: 'OpenAI', value: 'OPENAI' },
    { label: 'Llama (Ollama)', value: 'LLAMA_OLLAMA' },
    { label: 'Llama (Together AI)', value: 'LLAMA_TOGETHER' },
    { label: 'Llama (Replicate)', value: 'LLAMA_REPLICATE' },
    { label: 'Llama (Custom)', value: 'LLAMA_CUSTOM' },
    { label: 'Custom API', value: 'CUSTOM' },
  ];

  if (AIModelData.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Basic Information
        </Text>
        <FormLayout>
          <TextField
            name="modelname"
            label="Model Name"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            onBlur={() => handleSave()}
            helpText="Unique identifier for the model (e.g., gpt-4-turbo)"
            required
          />
          <TextField
            name="displayname"
            label="Display Name"
            value={formData.displayName}
            onChange={(value) => handleInputChange('displayName', value)}
            onBlur={() => handleSave()}
            helpText="Human-readable name for the model"
            required
          />
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            onBlur={() => handleSave()}
            multiline={4}
            helpText="Describe the model's capabilities and use cases"
            required
          />
          <TextField
            name="version"
            label="Version"
            value={formData.version}
            onChange={(value) => handleInputChange('version', value)}
            onBlur={() => handleSave()}
            helpText="Model version (e.g., 1.0, v2.5)"
          />
        </FormLayout>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Model Configuration
        </Text>
        <FormLayout>
          <Select
            name="modeltype"
            label="Model Type"
            options={modelTypeOptions}
            value={formData.modelType}
            onChange={(value) => {
              handleInputChange('modelType', value);
              handleSave();
            }}
            required
          />
          <Select
            name="provider"
            label="Provider"
            options={providerOptions}
            value={formData.provider}
            onChange={(value) => {
              handleInputChange('provider', value);
              handleSave();
            }}
            required
          />
          <TextField
            name="providermodelid"
            label="Provider Model ID"
            value={formData.providerModelId}
            onChange={(value) => handleInputChange('providerModelId', value)}
            onBlur={() => handleSave()}
            helpText="Provider's model identifier (e.g., gpt-4, claude-3-opus)"
          />
        </FormLayout>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text variant="headingMd" as="h2" className="mb-4">
          Capabilities
        </Text>
        <FormLayout>
          <Combobox
            displaySelected
            name="tags"
            list={
              getTagsList.data?.tags?.map((item: any) => ({
                label: item.value,
                value: item.id,
              })) || []
            }
            key={`tags-${getTagsList.data?.tags?.length || 0}`}
            label="Tags *"
            creatable
            selectedValue={formData.tags}
            onChange={(value) => {
              setIsTagsListUpdated(true);
              handleInputChange('tags', value);
              handleSave({ ...formData, tags: value });
            }}
          />
          <Combobox
            displaySelected
            name="sectors"
            list={
              getSectorsList.data?.sectors?.map((item: any) => ({
                label: item.name,
                value: item.id,
              })) || []
            }
            key={`sectors-${getSectorsList.data?.sectors?.length || 0}`}
            label="Sectors"
            selectedValue={formData.sectors}
            onChange={(value) => {
              handleInputChange('sectors', value);
              handleSave({ ...formData, sectors: value });
            }}
          />
          <Combobox
            displaySelected
            name="geographies"
            list={
              getGeographiesList.data?.geographies?.map((item: any) => ({
                label: item.name,
                value: item.id,
              })) || []
            }
            key={`geographies-${getGeographiesList.data?.geographies?.length || 0}`}
            label="Geographies"
            selectedValue={formData.geographies}
            onChange={(value) => {
              handleInputChange('geographies', value);
              handleSave({ ...formData, geographies: value });
            }}
          />
          <TextField
            name="supportedlanguages"
            label="Supported Languages"
            value={formData.supportedLanguages}
            onChange={(value) => handleInputChange('supportedLanguages', value)}
            onBlur={() => handleSave()}
            helpText="Comma-separated language codes (e.g., en, es, fr)"
          />
          <TextField
            name="maxtokens"
            label="Max Tokens"
            type="number"
            value={formData.maxTokens.toString()}
            onChange={(value) => handleInputChange('maxTokens', value)}
            onBlur={() => handleSave()}
            helpText="Maximum number of tokens the model can process"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.supportsStreaming}
              onChange={(e) => {
                handleInputChange('supportsStreaming', e.target.checked);
                handleSave();
              }}
              className="h-4 w-4"
            />
            <span>Supports Streaming</span>
          </label>
        </FormLayout>
      </div>

    </div>
  );
}
