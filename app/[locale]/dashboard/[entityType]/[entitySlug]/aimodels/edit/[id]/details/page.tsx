'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Combobox,
  Select,
  TextField,
  toast,
} from 'opub-ui';
import { useEffect, useState } from 'react';

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

export default function AIModelDetailsPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { setStatus } = useEditStatus();

  const [formData, setFormData] = useState({
    name: '',
    modelType: 'TEXT_GENERATION',
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

  const AIModelData: { data: any; isLoading: boolean; refetch: any; error: any } = useQuery(
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
      const metadata = model.metadata || {};
      setFormData({
        name: model.displayName || model.name || '',
        modelType: model.modelType || 'TEXT_GENERATION',
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
            label: l,
            value: l,
          })) || [],
        modelWebsite: metadata.modelWebsite || '',
        geographies:
          model.geographies?.map((g: any) => ({ label: g.name, value: g.id })) ||
          [],
        usageLicense: metadata.usageLicense || '',
        accessType: model.isPublic ? 'open' : 'restricted',
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
      displayName: dataToUse.name,
      name: dataToUse.name.toLowerCase().replace(/\s+/g, '-'),
      description: dataToUse.description,
      modelType: dataToUse.modelType,
      tags: dataToUse.tags.map((item: any) => item.label),
      sectors: dataToUse.sectors.map((item: any) => item.label),
      geographies: dataToUse.geographies.map((item: any) => parseInt(item.value, 10)),
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

  const modelTypeOptions = [
    { label: 'Click to select from dropdown', value: '' },
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

  const languageOptions = [
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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      {/* Model Name */}
      <TextField
        name="name"
        label="Model Name"
        value={formData.name}
        onChange={(value) => handleInputChange('name', value)}
        onBlur={() => handleSave()}
        required
      />

      {/* Model Type */}
      <Select
        name="modelType"
        label="Model Type"
        options={modelTypeOptions}
        value={formData.modelType}
        onChange={(value) => {
          handleInputChange('modelType', value);
          handleSave({ ...formData, modelType: value });
        }}
        required
      />

      {/* Description */}
      <TextField
        name="description"
        label="Description"
        value={formData.description}
        onChange={(value) => handleInputChange('description', value)}
        onBlur={() => handleSave()}
        multiline={4}
      />

      {/* Target Users & Intended Use - side by side */}
      <div className="grid grid-cols-2 gap-4">
        <TextField
          name="targetUsers"
          label="Target Users"
          value={formData.targetUsers}
          onChange={(value) => handleInputChange('targetUsers', value)}
          onBlur={() => handleSave()}
          multiline={3}
          required
        />
        <TextField
          name="intendedUse"
          label="Intended Use"
          value={formData.intendedUse}
          onChange={(value) => handleInputChange('intendedUse', value)}
          onBlur={() => handleSave()}
          multiline={3}
          required
        />
      </div>

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
        onChange={(value) => {
          setIsTagsListUpdated(true);
          handleInputChange('tags', value);
          handleSave({ ...formData, tags: value });
        }}
      />

      {/* Maximum Tokens & Languages - side by side */}
      <div className="grid grid-cols-2 gap-4">
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
        />
      </div>

      {/* Model Website & Locations/Geography - side by side */}
      <div className="grid grid-cols-2 gap-4">
        <TextField
          name="modelWebsite"
          label="Model Website"
          value={formData.modelWebsite}
          onChange={(value) => handleInputChange('modelWebsite', value)}
          onBlur={() => handleSave()}
          placeholder="www.model.com"
          required
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
          selectedValue={formData.geographies}
          onChange={(value) => {
            handleInputChange('geographies', value);
            handleSave({ ...formData, geographies: value });
          }}
        />
      </div>

      {/* Usage License & Access Type - side by side */}
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="mb-2 block text-sm font-medium">
            Select Access Type
          </label>
          <div className="flex gap-6">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={formData.accessType === 'open'}
                onChange={() => {
                  handleInputChange('accessType', 'open');
                  handleSave({ ...formData, accessType: 'open' });
                }}
                className="mt-1 h-4 w-4"
              />
              <div>
                <span className="font-medium">Open Access</span>
                <p className="text-xs text-gray-500">
                  Model can be downloaded and used by everyone
                </p>
              </div>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={formData.accessType === 'restricted'}
                onChange={() => {
                  handleInputChange('accessType', 'restricted');
                  handleSave({ ...formData, accessType: 'restricted' });
                }}
                className="mt-1 h-4 w-4"
              />
              <div>
                <span className="font-medium">Restricted Access</span>
                <p className="text-xs text-gray-500">
                  Users will request access to be able to download the model
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
