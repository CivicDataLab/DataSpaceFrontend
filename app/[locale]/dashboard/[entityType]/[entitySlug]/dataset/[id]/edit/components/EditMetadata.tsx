'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  MetadataModels,
  UpdateMetadataInput,
  UpdatePromptMetadataInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Checkbox,
  Combobox,
  Form,
  FormLayout,
  Input,
  Select,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import DatasetLoading from '../../../components/loading-dataset';
import { useDatasetEditStatus } from '../context';

const sectorsListQueryDoc = graphql(`
  query SectorList {
    sectors {
      id
      name
    }
  }
`);

const tagsListQueryDoc = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

const geographiesListQueryDoc = graphql(`
  query GeographiesList {
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

const datasetMetadataQueryDoc = graphql(`
  query MetadataValues($filters: DatasetFilter) {
    datasets(filters: $filters) {
      title
      id
      description
      datasetType
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
        code
        type
      }
      license
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
      accessType
      promptMetadata
    }
  }
`);

const metadataQueryDoc = graphql(`
  query MetaDataList($filters: MetadataFilter) {
    metadata(filters: $filters) {
      id
      label
      dataStandard
      urn
      dataType
      options
      validator
      type
      model
      enabled
      filterable
    }
  }
`);

// Introspection query to get PromptTaskType enum values from schema
const promptTaskTypeEnumQuery = graphql(`
  query PromptTaskTypeEnum {
    __type(name: "PromptTaskType") {
      enumValues {
        name
        description
      }
    }
  }
`);

// Introspection query to get PromptDomain enum values from schema
const promptDomainEnumQuery = graphql(`
  query PromptDomainEnum {
    __type(name: "PromptDomain") {
      enumValues {
        name
        description
      }
    }
  }
`);

// Introspection query to get TargetLanguage enum values from schema
const targetLanguageEnumQuery = graphql(`
  query TargetLanguageEnum {
    __type(name: "TargetLanguage") {
      enumValues {
        name
        description
      }
    }
  }
`);

// Introspection query to get TargetModelType enum values from schema
const targetModelTypeEnumQuery = graphql(`
  query TargetModelTypeEnum {
    __type(name: "TargetModelType") {
      enumValues {
        name
        description
      }
    }
  }
`);

// Mutation to update prompt-specific metadata
const updatePromptMetadataMutationDoc = graphql(`
  mutation UpdatePromptMetadata($updateInput: UpdatePromptMetadataInput!) {
    updatePromptMetadata(updateInput: $updateInput) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
        nonFieldErrors
      }
      data {
        id
        taskType
        targetLanguages
        domain
      }
    }
  }
`);

const updateMetadataMutationDoc = graphql(`
  mutation SaveMetadata($UpdateMetadataInput: UpdateMetadataInput!) {
    addUpdateDatasetMetadata(updateMetadataInput: $UpdateMetadataInput) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
        nonFieldErrors
      }
      data {
        id
        description
        title
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
          code
          type
        }
        license
        accessType
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          id
          value
        }
      }
    }
  }
`);

interface DatasetMetadataSource {
  description?: string | null;
  license?: string | null;
  metadata?: Array<{
    value?: string | null;
    metadataItem: { id: string; dataType: string };
  }> | null;
  sectors?: Array<{ id: string; name?: string | null }> | null;
  tags?: Array<{ id: string; value?: string | null }> | null;
  geographies?: Array<{ id: string; name?: string | null }> | null;
}

interface MetadataFormItem {
  id: string;
  label: string;
  dataType: string;
  options?: string[] | null;
  enabled?: boolean | null;
  value?: string | null;
}

interface OptionItem {
  label: string;
  value: string;
}

type FormFieldValue =
  | string
  | number
  | boolean
  | null
  | OptionItem
  | OptionItem[];

interface MetadataFormData {
  [key: string]: FormFieldValue;
  description: string;
  sectors: OptionItem[];
  license: string | null;
  tags: OptionItem[];
  geographies: OptionItem[];
  isPublic: boolean;
}

function optionValue(item: unknown): unknown {
  if (typeof item === 'object' && item !== null && 'value' in item) {
    return item.value;
  }
  return item;
}

function asOptionItems(value: FormFieldValue | undefined): OptionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is OptionItem =>
      typeof item === 'object' &&
      item !== null &&
      'label' in item &&
      'value' in item
  );
}

export function EditMetadata({ id }: { id: string }) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const queryClient = useQueryClient();
  const PROMPT_METADATA_SUCCESS_TOAST_ID = 'dataset-prompt-metadata-success';
  const PROMPT_METADATA_ERROR_TOAST_ID = 'dataset-prompt-metadata-error';
  const DATASET_METADATA_SUCCESS_TOAST_ID = 'dataset-metadata-save-success';
  const DATASET_METADATA_ERROR_TOAST_ID = 'dataset-metadata-save-error';
  const getErrorMessage = (err: unknown, fallback: string) =>
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
      ? err.message.trim()
      : fallback;

  const getDatasetMetadata = useQuery(
    [`metadata_values_query_${params.id}`],
    () =>
      GraphQL(
        datasetMetadataQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { filters: { id: params.id } }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  const getSectorsList = useQuery([`sectors_list_query`], () =>
    GraphQL(sectorsListQueryDoc, {
      [params.entityType]: params.entitySlug,
    })
  );

  const getTagsList = useQuery([`tags_list_query`], () =>
    GraphQL(tagsListQueryDoc, {
      [params.entityType]: params.entitySlug,
    })
  );

  const getGeographiesList = useQuery([`geographies_list_query`], () =>
    GraphQL(geographiesListQueryDoc, {
      [params.entityType]: params.entitySlug,
    })
  );

  const getMetaDataListQuery = useQuery([`metadata_fields_list_${id}`], () =>
    GraphQL(
      metadataQueryDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      {
        filters: {
          model: 'DATASET' as MetadataModels,
          enabled: true,
        },
      }
    )
  );

  // Fetch PromptTaskType enum values from GraphQL schema
  const getPromptTaskTypeEnum = useQuery(
    ['prompt_task_type_enum'],
    () => GraphQL(promptTaskTypeEnumQuery),
    { staleTime: Infinity }
  );

  const getPromptDomainEnum = useQuery(
    ['prompt_domain_enum'],
    () => GraphQL(promptDomainEnumQuery),
    { staleTime: Infinity }
  );

  const getTargetLanguageEnum = useQuery(
    ['target_language_enum'],
    () => GraphQL(targetLanguageEnumQuery),
    { staleTime: Infinity }
  );

  const getTargetModelTypeEnum = useQuery(
    ['target_model_type_enum'],
    () => GraphQL(targetModelTypeEnumQuery),
    { staleTime: Infinity }
  );

  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

  // State for prompt metadata fields
  const [promptMetadataState, setPromptMetadataState] = useState<{
    taskType?: string;
    domain?: string;
    targetLanguages?: string[];
    targetModelTypes?: string[];
  }>({});

  // Mutation for updating prompt metadata
  const updatePromptMetadataMutation = useMutation(
    (data: { updateInput: UpdatePromptMetadataInput }) =>
      GraphQL(
        updatePromptMetadataMutationDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res) => {
        if (res.updatePromptMetadata.success) {
          toast('Prompt metadata updated successfully!', {
            id: PROMPT_METADATA_SUCCESS_TOAST_ID,
          });
          queryClient.invalidateQueries({
            queryKey: [`metadata_values_query_${params.id}`],
          });
        } else {
          const responseError =
            res.updatePromptMetadata?.errors?.fieldErrors?.[0]?.messages?.[0] ||
            res.updatePromptMetadata?.errors?.nonFieldErrors?.[0] ||
            'Unable to update prompt metadata right now. Please try again.';
          toast(`Error: ${responseError}`, {
            id: PROMPT_METADATA_ERROR_TOAST_ID,
          });
        }
      },
      onError: (err: unknown) => {
        toast(
          `Error: ${getErrorMessage(err, 'Unable to update prompt metadata right now. Please try again.')}`,
          { id: PROMPT_METADATA_ERROR_TOAST_ID }
        );
      },
    }
  );

  // Function to save prompt metadata
  const savePromptMetadata = (updates: Partial<typeof promptMetadataState>) => {
    const newState = { ...promptMetadataState, ...updates };
    setPromptMetadataState(newState);

    updatePromptMetadataMutation.mutate({
      updateInput: {
        dataset: params.id,
        taskType: newState.taskType as UpdatePromptMetadataInput['taskType'],
        domain: newState.domain as UpdatePromptMetadataInput['domain'],
        targetLanguages: newState.targetLanguages,
        targetModelTypes: newState.targetModelTypes,
      },
    });
  };

  const updateMetadataMutation = useMutation(
    (data: { UpdateMetadataInput: UpdateMetadataInput }) =>
      GraphQL(
        updateMetadataMutationDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res) => {
        if (res.addUpdateDatasetMetadata.success) {
          toast('Details updated successfully!', {
            id: DATASET_METADATA_SUCCESS_TOAST_ID,
          });
          queryClient.invalidateQueries({
            queryKey: [`metadata_values_query_${params.id}`],
          });
          queryClient.invalidateQueries({
            queryKey: [`metadata_fields_list_${id}`],
          });
          const updatedData = defaultValuesPrepFn(
            res.addUpdateDatasetMetadata.data ?? undefined
          );
          if (isTagsListUpdated) {
            getTagsList.refetch();
            setIsTagsListUpdated(false);
          }
          setFormData(updatedData);
          setPreviousFormData(updatedData);
        } else {
          const responseError =
            res.addUpdateDatasetMetadata?.errors?.fieldErrors?.[0]
              ?.messages?.[0] ||
            res.addUpdateDatasetMetadata?.errors?.nonFieldErrors?.[0] ||
            'Unable to update details right now. Please try again.';
          toast(`Error: ${responseError}`, {
            id: DATASET_METADATA_ERROR_TOAST_ID,
          });
        }
      },
      onError: (err: unknown) => {
        toast(
          `Error: ${getErrorMessage(err, 'Unable to update details right now. Please try again.')}`,
          { id: DATASET_METADATA_ERROR_TOAST_ID }
        );
      },
    }
  );

  const defaultValuesPrepFn = (
    dataset?: DatasetMetadataSource
  ): MetadataFormData => {
    const defaultVal: MetadataFormData = {
      description: '',
      sectors: [],
      license: null,
      tags: [],
      geographies: [],
      isPublic: true,
    };

    if (!dataset) {
      return defaultVal;
    }

    if ((dataset?.metadata || []).length > 0) {
      (dataset?.metadata || []).map((field) => {
        if (
          field.metadataItem.dataType === 'MULTISELECT' &&
          field.value
        ) {
          defaultVal[field.metadataItem.id] = field.value
            .split(', ')
            .map((value: string) => ({
              label: value,
              value: value,
            }));
        } else if (!field.value) {
          defaultVal[field.metadataItem.id] = null;
        } else {
          defaultVal[field.metadataItem.id] = field.value;
        }
      });
    }

    defaultVal['description'] = dataset?.description || '';

    defaultVal['sectors'] =
      dataset?.sectors?.map((sector) => {
        return {
          label: sector.name || '',
          value: sector.id,
        };
      }) || [];

    defaultVal['license'] = dataset?.license || null;

    defaultVal['tags'] =
      dataset?.tags?.map((tag) => {
        return {
          label: tag.value || '',
          value: tag.id,
        };
      }) || [];

    defaultVal['geographies'] =
      dataset?.geographies?.map((geo) => {
        return {
          label: geo.name || '',
          value: geo.id,
        };
      }) || [];

    defaultVal['isPublic'] = true;

    return defaultVal;
  };

  const [formData, setFormData] = useState(
    defaultValuesPrepFn(getDatasetMetadata?.data?.datasets?.[0])
  );
  const [previousFormData, setPreviousFormData] = useState(formData);
  const formDataRef = useRef(formData);
  const [prevMetadataData, setPrevMetadataData] = useState(
    getDatasetMetadata.data
  );
  if (getDatasetMetadata.data !== prevMetadataData) {
    setPrevMetadataData(getDatasetMetadata.data);
    const dataset = getDatasetMetadata.data?.datasets?.[0];
    if (dataset) {
      const updatedData = defaultValuesPrepFn(dataset);
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
    const promptMeta = dataset?.promptMetadata;
    if (promptMeta) {
      setPromptMetadataState({
        taskType: promptMeta.task_type || undefined,
        domain: promptMeta.domain || undefined,
        targetLanguages: promptMeta.target_languages || [],
        targetModelTypes: promptMeta.target_model_types || [],
      });
    }
  }

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleChange = (field: string, value: FormFieldValue) => {
    formDataRef.current = {
      ...formDataRef.current,
      [field]: value,
    };

    setFormData((prevData) => {
      const nextData = {
        ...prevData,
        [field]: value,
      };
      return nextData;
    });
  };

  const getUpdateInput = (
    updatedData: MetadataFormData
  ): UpdateMetadataInput | null => {
    const changedFields: Record<string, FormFieldValue> = {};

    for (const key in updatedData) {
      const newValue = updatedData[key];
      const prevValue = previousFormData[key];

      const isArray = Array.isArray(newValue);

      const normalize = (val: FormFieldValue) =>
        isArray && Array.isArray(val) ? val.map(optionValue) : val;

      const newNormalized = normalize(newValue);
      const prevNormalized = normalize(prevValue);

      const hasChanged = isArray
        ? JSON.stringify(newNormalized) !== JSON.stringify(prevNormalized)
        : newNormalized !== prevNormalized;

      if (hasChanged) {
        changedFields[key] = newValue;
      }
    }

    if (Object.keys(changedFields).length === 0) return null;

    const transformedValues = Object.keys(changedFields).reduce<
      Record<string, string>
    >((acc, key) => {
      const field = changedFields[key];
      acc[key] = Array.isArray(field)
        ? field.map(optionValue).join(', ')
        : String(field ?? '');
      return acc;
    }, {});

    return {
      dataset: id,
      metadata: Object.keys(transformedValues)
        .filter(
          (key) =>
            ![
              'sectors',
              'description',
              'tags',
              'geographies',
              'isPublic',
              'license',
            ].includes(key) && transformedValues[key] !== ''
        )
        .map((key) => ({
          id: key,
          value: transformedValues[key],
        })),
      ...(typeof changedFields.license === 'string' && {
        license: changedFields.license as UpdateMetadataInput['license'],
      }),
      ...(typeof changedFields.accessType === 'string' && {
        accessType:
          changedFields.accessType as UpdateMetadataInput['accessType'],
      }),
      ...(changedFields.description !== undefined && {
        description: String(changedFields.description),
      }),
      ...(changedFields.tags && {
        tags: asOptionItems(changedFields.tags).map((item) => item.label),
      }),
      ...(changedFields.sectors && {
        sectors: asOptionItems(changedFields.sectors).map((item) => item.value),
      }),
      ...(changedFields.geographies && {
        geographies: asOptionItems(changedFields.geographies).map((item) =>
          parseInt(item.value, 10)
        ),
      }),
    };
  };

  const handleSave = (updatedData: MetadataFormData) => {
    const updateInput = getUpdateInput(updatedData);
    if (!updateInput) return;

    updateMetadataMutation.mutate({ UpdateMetadataInput: updateInput });
  };

  const { setStatus, registerBeforeNavigateHandler } = useDatasetEditStatus();

  useEffect(() => {
    const handleSaveAsync = async (updatedData: MetadataFormData) => {
      const updateInput = getUpdateInput(updatedData);
      if (!updateInput) return;

      await updateMetadataMutation.mutateAsync({
        UpdateMetadataInput: updateInput,
      });
    };

    registerBeforeNavigateHandler(() => handleSaveAsync(formDataRef.current));

    return () => {
      registerBeforeNavigateHandler(null);
    };
    // getUpdateInput reads previousFormData; formDataRef is read at handler invocation time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerBeforeNavigateHandler, updateMetadataMutation]);

  function formValueAsString(value: FormFieldValue): string {
    return typeof value === 'string' ? value : '';
  }

  function renderInputField(metadataFormItem: MetadataFormItem) {
    if (metadataFormItem.dataType === 'STRING') {
      return (
        <div key={metadataFormItem.id} className="w-full ">
          <Input
            name={metadataFormItem.id}
            label={metadataFormItem.label}
            value={formValueAsString(formData[metadataFormItem.id])}
            onChange={(e) => handleChange(metadataFormItem.id, e)}
            onBlur={() => handleSave(formData)} // Save on blur
          />
        </div>
      );
    }

    if (metadataFormItem.dataType === 'SELECT') {
      return (
        <div key={metadataFormItem.id} className="w-full ">
          <Combobox
            name={metadataFormItem.id}
            list={(metadataFormItem.options || []).map((option) => ({
              label: option,
              value: option,
            }))}
            label={metadataFormItem.label}
            displaySelected
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({
                ...formData,
                [metadataFormItem.id]: value,
              });
            }}
          />
        </div>
      );
    }

    if (metadataFormItem.dataType === 'MULTISELECT') {
      const prefillData = metadataFormItem.value ? metadataFormItem.value : [];

      return (
        <div key={metadataFormItem.id} className="w-full ">
          <Combobox
            name={metadataFormItem.id}
            list={[
              ...((metadataFormItem.options || []).map((option) => ({
                label: option,
                value: option,
              })) || []),
            ]}
            label={metadataFormItem.label}
            displaySelected
            selectedValue={prefillData}
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({
                ...formData,
                [metadataFormItem.id]: value,
              });
            }}
          />
        </div>
      );
    }
    if (metadataFormItem.dataType === 'URL') {
      return (
        <div key={metadataFormItem.id} className="w-full">
          <Input
            name={metadataFormItem.id}
            type="url"
            value={formValueAsString(formData[metadataFormItem.id])}
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
            onChange={(e) => handleChange(metadataFormItem.id, e)}
            onBlur={() => handleSave(formData)} // Save on blur
          />
        </div>
      );
    }

    if (metadataFormItem.dataType === 'DATE') {
      return (
        <div key={metadataFormItem.id} className="w-full">
          <Input
            type="date"
            name={metadataFormItem.id}
            max={new Date().toISOString().split('T')[0]}
            value={formValueAsString(formData[metadataFormItem.id])}
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
            onChange={(e) => handleChange(metadataFormItem.id, e)}
            onBlur={() => handleSave(formData)} // Save on blur
          />
        </div>
      );
    }

    // Add more conditions for other data types as needed
    return null;
  }

  const licenseOptions = [
    {
      label: 'Government Open Data License',
      value: 'GOVERNMENT_OPEN_DATA_LICENSE',
    },
    {
      label: 'CC BY 4.0 (Attribution)',
      value: 'CC_BY_4_0_ATTRIBUTION',
    },
    {
      label: 'CC BY-SA 4.0 (Attribution-ShareAlike)',
      value: 'CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE',
    },
    {
      label: 'Open Data Commons By Attribution',
      value: 'OPEN_DATA_COMMONS_BY_ATTRIBUTION',
    },
    {
      label: 'Open Database License',
      value: 'OPEN_DATABASE_LICENSE',
    },
  ];

  useEffect(() => {
    setStatus(updateMetadataMutation.isLoading ? 'loading' : 'success'); // update based on mutation state
  }, [updateMetadataMutation.isLoading, setStatus]);

  return (
    <>
      {!getTagsList?.isLoading &&
      !getSectorsList?.isLoading &&
      !getGeographiesList?.isLoading &&
      !getDatasetMetadata.isLoading ? (
        <Form
          formOptions={{
            resetOptions: {
              keepValues: true,
              keepDirtyValues: true,
            },
            defaultValues: formData,
          }}
        >
          <>
            <FormLayout>
              <div className="mb-8 flex flex-col gap-8">
                <div className="w-full">
                  <RichTextEditor
                    label="Description *"
                    value={formData.description}
                    onChange={(value) => handleChange('description', value)}
                    onBlur={(value) =>
                      handleSave({ ...formData, description: value })
                    }
                    placeholder="Enter dataset description..."
                    helpText={`Character limit: ${formData?.description?.length || 0}/1000`}
                  />
                </div>

                <Combobox
                  displaySelected
                  label="Sectors *"
                  list={
                    getSectorsList.data?.sectors?.map((item) => {
                      return { label: item.name, value: item.id };
                    }) || []
                  }
                  name="sectors"
                  onChange={(value) => {
                    const next = Array.isArray(value) ? value : [];
                    handleChange('sectors', next);
                    handleSave({ ...formData, sectors: next });
                  }}
                />
                <Combobox
                  displaySelected
                  name="tags"
                  list={
                    getTagsList.data?.tags?.map((item) => ({
                      label: item.value,
                      value: item.id,
                    })) || []
                  }
                  key={`tags-${getTagsList.data?.tags?.length}`} // forces remount on change
                  label="Tags"
                  requiredIndicator
                  creatable
                  onChange={(value) => {
                    setIsTagsListUpdated(true);
                    const next = Array.isArray(value) ? value : [];
                    handleChange('tags', next);
                    handleSave({ ...formData, tags: next });
                  }}
                />
                <Combobox
                  displaySelected
                  label="Geographies"
                  name="geographies"
                  list={
                    getGeographiesList?.data?.geographies?.map((item) => ({
                      label: `${item.name}${item.parentId ? ` (${item.parentId.name})` : ''}`,
                      value: item.id,
                    })) || []
                  }
                  selectedValue={formData.geographies}
                  onChange={(value) => {
                    const next = Array.isArray(value) ? value : [];
                    handleChange('geographies', next);
                    handleSave({ ...formData, geographies: next });
                  }}
                />
              </div>
              <div className="mb-8 flex flex-col gap-8">
                {getMetaDataListQuery?.data?.metadata
                  ?.filter((item) => item.dataType === 'MULTISELECT')
                  .map((item) => (
                    <div key={item.id}>{renderInputField(item)}</div>
                  ))}
                <div className="grid gap-4 lg:grid-cols-2">
                  {getMetaDataListQuery?.data?.metadata
                    ?.filter((item) => item.dataType !== 'MULTISELECT')
                    .map((item) => renderInputField(item))}
                </div>
              </div>

              {/* Prompt-specific metadata fields - only shown for PROMPT type datasets */}
              {getDatasetMetadata.data?.datasets?.[0]?.datasetType ===
                'PROMPT' && (
                <div className="rounded-lg border bg-surfaceNeutralSubdued mb-8 border-borderSubdued p-6">
                  <Text variant="headingMd" as="h3" className="mb-4">
                    Prompt Dataset Metadata
                  </Text>
                  <Text variant="bodySm" color="subdued" className="mb-6">
                    Additional metadata specific to prompt datasets for AI/ML
                    use cases.
                  </Text>
                  <div className="flex flex-col gap-6">
                    <Combobox
                      name="taskType"
                      label="Task Type"
                      displaySelected
                      list={
                        getPromptTaskTypeEnum.data?.__type?.enumValues?.map(
                          (enumValue) => ({
                            label: enumValue.name
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: enumValue.name,
                          })
                        ) || []
                      }
                      selectedValue={
                        promptMetadataState.taskType
                          ? [
                              {
                                label: promptMetadataState.taskType
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (c: string) =>
                                    c.toUpperCase()
                                  ),
                                value: promptMetadataState.taskType,
                              },
                            ]
                          : []
                      }
                      onChange={(value) => {
                        const selectedValue = Array.isArray(value)
                          ? value[0]?.value
                          : value;
                        savePromptMetadata({ taskType: selectedValue });
                      }}
                    />
                    <Combobox
                      name="domain"
                      label="Domain"
                      displaySelected
                      list={
                        getPromptDomainEnum.data?.__type?.enumValues?.map(
                          (enumValue) => ({
                            label: enumValue.name
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: enumValue.name,
                          })
                        ) || []
                      }
                      selectedValue={
                        promptMetadataState.domain
                          ? [
                              {
                                label: promptMetadataState.domain
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (c: string) =>
                                    c.toUpperCase()
                                  ),
                                value: promptMetadataState.domain,
                              },
                            ]
                          : []
                      }
                      onChange={(value) => {
                        const selectedValue = Array.isArray(value)
                          ? value[0]?.value
                          : value;
                        savePromptMetadata({ domain: selectedValue });
                      }}
                    />
                    <Combobox
                      name="targetLanguages"
                      label="Target Languages"
                      displaySelected
                      creatable
                      list={
                        getTargetLanguageEnum.data?.__type?.enumValues?.map(
                          (enumValue) => ({
                            label: enumValue.name
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: enumValue.name,
                          })
                        ) || []
                      }
                      selectedValue={
                        promptMetadataState.targetLanguages?.map(
                          (lang: string) => ({
                            label: lang
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: lang,
                          })
                        ) || []
                      }
                      onChange={(value) => {
                        const languages = Array.isArray(value)
                          ? value.map((v) => v.value)
                          : [];
                        savePromptMetadata({ targetLanguages: languages });
                      }}
                    />
                    <Combobox
                      name="targetModelTypes"
                      label="Target Model Types"
                      displaySelected
                      creatable
                      list={
                        getTargetModelTypeEnum.data?.__type?.enumValues?.map(
                          (enumValue) => ({
                            label: enumValue.name
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: enumValue.name,
                          })
                        ) || []
                      }
                      selectedValue={
                        promptMetadataState.targetModelTypes?.map(
                          (model: string) => ({
                            label: model
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: model,
                          })
                        ) || []
                      }
                      onChange={(value) => {
                        const models = Array.isArray(value)
                          ? value.map((v) => v.value)
                          : [];
                        savePromptMetadata({ targetModelTypes: models });
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-8 lg:flex-row">
                <div className="flex w-full flex-wrap gap-2 md:flex-nowrap lg:w-2/4 lg:flex-nowrap">
                  <Checkbox
                    name="accessType"
                    checked={formData?.isPublic}
                    onChange={() => handleChange('accessType', 'PUBLIC')}
                  >
                    <div className="flex flex-col gap-1">
                      <Text>Open Access</Text>
                      <Text>
                        Dataset can be viewed and downloaded by everyone
                      </Text>
                    </div>
                  </Checkbox>
                  <Checkbox
                    name="isRestricted"
                    checked={false}
                    defaultChecked={false}
                    disabled
                  >
                    <div className="flex flex-col gap-1 " title="Coming Soon">
                      <Text className=" text-textDisabled">
                        Restricted Access
                      </Text>
                      <Text className=" text-iconDisabled">
                        Users would require to request access to the dataset to
                        view and download it. Recommended for sensitive data.
                      </Text>
                    </div>
                  </Checkbox>
                </div>
                <Select
                  name="license"
                  options={licenseOptions?.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  className="w-full lg:w-2/4"
                  label="License"
                  value={formData?.license ? formData?.license : ''}
                  onChange={(value) => {
                    handleChange('license', value);
                    handleSave({ ...formData, license: value }); // Save on change
                  }}
                />
              </div>
            </FormLayout>
          </>
        </Form>
      ) : (
        <DatasetLoading />
      )}
    </>
  );
}
