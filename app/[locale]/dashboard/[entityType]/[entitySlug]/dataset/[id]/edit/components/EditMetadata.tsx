'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  MetadataModels,
  PromptDomain,
  PromptTaskType,
  TargetLanguage,
  TargetModelType,
  UpdateDatasetInput,
  UpdateMetadataInput,
  UpdatePromptMetadataInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Combobox,
  Form,
  RadioGroup,
  RadioItem,
  SectionCard,
  Select,
  TextField,
  toast,
} from 'opub-ui';
import { useFormContext } from 'react-hook-form';

import { GraphQL } from '@/lib/api';
import { enumValues } from '@/lib/enumValues';
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

const updateDatasetTitleMutationDoc = graphql(`
  mutation SaveTitle($updateDatasetInput: UpdateDatasetInput!) {
    updateDataset(updateDatasetInput: $updateDatasetInput) {
      __typename
      ... on TypeDataset {
        id
        title
        created
      }
      ... on OperationInfo {
        messages {
          kind
          message
        }
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
  title?: string | null;
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
  string | number | boolean | null | OptionItem | OptionItem[];

interface MetadataFormData {
  [key: string]: FormFieldValue;
  title: string;
  description: string;
  sectors: OptionItem[];
  license: string | null;
  tags: OptionItem[];
  geographies: OptionItem[];
  isPublic: boolean;
}

function isRichTextEmpty(html?: string | null): boolean {
  if (!html) return true;
  return html.replace(/<(.|\n)*?>/g, '').trim().length === 0;
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

function SyncStepErrors({
  license,
  errors,
}: {
  license: string;
  errors: { sectors?: string; tags?: string; license?: string };
}) {
  const { setError, clearErrors, setValue } = useFormContext();

  useEffect(() => {
    setValue('license', license);
  }, [license, setValue]);

  useEffect(() => {
    if (errors.sectors) {
      setError('sectors', { type: 'manual', message: errors.sectors });
    } else {
      clearErrors('sectors');
    }
  }, [errors.sectors, setError, clearErrors]);

  useEffect(() => {
    if (errors.tags) {
      setError('tags', { type: 'manual', message: errors.tags });
    } else {
      clearErrors('tags');
    }
  }, [errors.tags, setError, clearErrors]);

  useEffect(() => {
    if (errors.license) {
      setError('license', { type: 'manual', message: errors.license });
    } else {
      clearErrors('license');
    }
  }, [errors.license, setError, clearErrors]);

  return null;
}

const metadataFormOptions = {
  defaultValues: {
    license: '',
  },
};

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
          void queryClient.invalidateQueries({
            queryKey: [`dataset_title_${params.id}`],
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

  const DATASET_TITLE_SAVE_ERROR_TOAST_ID = 'dataset-title-save-error';
  const updateDatasetTitleMutation = useMutation(
    (data: { updateDatasetInput: UpdateDatasetInput }) =>
      GraphQL(
        updateDatasetTitleMutationDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [`dataset_title_${params.id}`],
        });
        void queryClient.invalidateQueries({
          queryKey: [`metadata_values_query_${params.id}`],
        });
      },
      onError: (err: unknown) => {
        toast(
          getErrorMessage(err, 'Unable to update dataset title right now.'),
          {
            id: DATASET_TITLE_SAVE_ERROR_TOAST_ID,
          }
        );
      },
    }
  );

  const defaultValuesPrepFn = (
    dataset?: DatasetMetadataSource
  ): MetadataFormData => {
    const defaultVal: MetadataFormData = {
      title: '',
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
        if (field.metadataItem.dataType === 'MULTISELECT' && field.value) {
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

    defaultVal['title'] = dataset?.title || '';
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
              'title',
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

  const {
    stepShowErrors,
    setStatus,
    registerBeforeNavigateHandler,
    setMetadataCompleted,
  } = useDatasetEditStatus();

  useEffect(() => {
    const handleSaveAsync = async (updatedData: MetadataFormData) => {
      const trimmedTitle = String(updatedData.title ?? '').trim();
      const currentTitle = getDatasetMetadata.data?.datasets?.[0]?.title;
      if (trimmedTitle && trimmedTitle !== currentTitle) {
        await updateDatasetTitleMutation.mutateAsync({
          updateDatasetInput: {
            dataset: params.id,
            title: trimmedTitle,
          },
        });
      }

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
  }, [
    registerBeforeNavigateHandler,
    updateMetadataMutation,
    updateDatasetTitleMutation,
    params.id,
    getDatasetMetadata.data,
  ]);

  function formValueAsString(value: FormFieldValue): string {
    return typeof value === 'string' ? value : '';
  }

  function renderInputField(metadataFormItem: MetadataFormItem) {
    if (metadataFormItem.dataType === 'STRING') {
      return (
        <div key={metadataFormItem.id} className="w-full ">
          <TextField
            name={metadataFormItem.id}
            label={metadataFormItem.label}
            value={formValueAsString(formData[metadataFormItem.id])}
            onChange={(e) => handleChange(metadataFormItem.id, e)}
            onBlur={() => handleSave(formData)}
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
          <TextField
            name={metadataFormItem.id}
            type="url"
            value={formValueAsString(formData[metadataFormItem.id])}
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
            onChange={(e) => handleChange(metadataFormItem.id, e)}
            onBlur={() => handleSave(formData)}
          />
        </div>
      );
    }

    if (metadataFormItem.dataType === 'DATE') {
      return (
        <div key={metadataFormItem.id} className="w-full">
          <TextField
            type="date"
            name={metadataFormItem.id}
            max={new Date().toISOString().split('T')[0]}
            value={formValueAsString(formData[metadataFormItem.id])}
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
            onChange={(e) => handleChange(metadataFormItem.id, e)}
            onBlur={() => handleSave(formData)}
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
    setStatus(
      updateMetadataMutation.isLoading || updateDatasetTitleMutation.isLoading
        ? 'loading'
        : 'success'
    );
  }, [
    updateMetadataMutation.isLoading,
    updateDatasetTitleMutation.isLoading,
    setStatus,
  ]);

  useEffect(() => {
    setMetadataCompleted(
      Boolean(formData.title?.trim()) &&
        !isRichTextEmpty(formData.description) &&
        asOptionItems(formData.sectors).length > 0 &&
        asOptionItems(formData.tags).length > 0 &&
        Boolean(formData.license)
    );
  }, [
    formData.title,
    formData.description,
    formData.sectors,
    formData.tags,
    formData.license,
    setMetadataCompleted,
  ]);

  const saveTitle = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === getDatasetMetadata.data?.datasets?.[0]?.title) {
      return;
    }
    updateDatasetTitleMutation.mutate({
      updateDatasetInput: {
        dataset: params.id,
        title: trimmed,
      },
    });
  };

  const metadataFields = getMetaDataListQuery?.data?.metadata ?? [];
  const sourceUrlFields = metadataFields.filter(
    (item) => item.dataType === 'URL'
  );
  const sourceDateFields = metadataFields.filter(
    (item) => item.dataType === 'DATE'
  );
  const additionalMetadataFields = metadataFields.filter(
    (item) => item.dataType !== 'URL' && item.dataType !== 'DATE'
  );

  const metadataReady =
    !getTagsList?.isLoading &&
    !getSectorsList?.isLoading &&
    !getGeographiesList?.isLoading &&
    !getDatasetMetadata.isLoading;

  useEffect(() => {
    if (!metadataReady) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [metadataReady]);

  const sectorsError =
    stepShowErrors && asOptionItems(formData.sectors).length === 0
      ? 'Sector is required'
      : undefined;
  const tagsError =
    stepShowErrors && asOptionItems(formData.tags).length === 0
      ? 'Tags are required'
      : undefined;
  const licenseError =
    stepShowErrors && !formData.license ? 'License is required' : undefined;

  return (
    <>
      {metadataReady ? (
        <Form formOptions={metadataFormOptions}>
          <SyncStepErrors
            license={formData.license ?? ''}
            errors={{
              sectors: sectorsError,
              tags: tagsError,
              license: licenseError,
            }}
          />
          <div className="flex flex-col gap-4">
            <div id="basic-information">
              <SectionCard title="Basic Information">
                <div className="flex flex-col gap-4">
                  <TextField
                    name="title"
                    label="Dataset name"
                    requiredIndicator
                    value={formData.title}
                    error={
                      stepShowErrors && !formData.title.trim()
                        ? 'Dataset name is required'
                        : undefined
                    }
                    onChange={(value) => handleChange('title', value)}
                    onBlur={() => saveTitle(formData.title)}
                  />
                  <RichTextEditor
                    label="Description *"
                    value={formData.description}
                    onChange={(value) => handleChange('description', value)}
                    onBlur={(value) =>
                      handleSave({ ...formData, description: value })
                    }
                    placeholder="Enter dataset description..."
                    helpText={`Character limit: ${formData?.description?.length || 0}/1000`}
                    error={
                      stepShowErrors && isRichTextEmpty(formData.description)
                        ? 'Description is required'
                        : undefined
                    }
                  />
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Classification">
              <div className="flex flex-col gap-4">
                <Combobox
                  displaySelected
                  label="Sector"
                  requiredIndicator
                  list={
                    getSectorsList.data?.sectors?.map((item) => {
                      return { label: item.name, value: item.id };
                    }) || []
                  }
                  name="sectors"
                  selectedValue={formData.sectors}
                  error={sectorsError}
                  onChange={(value) => {
                    const next = Array.isArray(value) ? value : [];
                    handleChange('sectors', next);
                    handleSave({ ...formData, sectors: next });
                  }}
                />
                <Combobox
                  displaySelected
                  label="Geography"
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
                <Combobox
                  displaySelected
                  name="tags"
                  list={
                    getTagsList.data?.tags?.map((item) => ({
                      label: item.value,
                      value: item.id,
                    })) || []
                  }
                  key={`tags-${getTagsList.data?.tags?.length}`}
                  label="Tags"
                  requiredIndicator
                  creatable
                  selectedValue={formData.tags}
                  error={tagsError}
                  onChange={(value) => {
                    setIsTagsListUpdated(true);
                    const next = Array.isArray(value) ? value : [];
                    handleChange('tags', next);
                    handleSave({ ...formData, tags: next });
                  }}
                />
              </div>
            </SectionCard>

            {sourceUrlFields.length > 0 || sourceDateFields.length > 0 ? (
              <SectionCard title="Source Information">
                <div className="grid gap-4 lg:grid-cols-2">
                  {sourceUrlFields.map((item) => renderInputField(item))}
                  {sourceDateFields.map((item) => renderInputField(item))}
                </div>
              </SectionCard>
            ) : null}

            {additionalMetadataFields.length > 0 ? (
              <SectionCard title="Additional Information">
                <div className="flex flex-col gap-4">
                  {additionalMetadataFields
                    .filter((item) => item.dataType === 'MULTISELECT')
                    .map((item) => (
                      <div key={item.id}>{renderInputField(item)}</div>
                    ))}
                  <div className="grid gap-4 lg:grid-cols-2">
                    {additionalMetadataFields
                      .filter((item) => item.dataType !== 'MULTISELECT')
                      .map((item) => renderInputField(item))}
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <div id="publishing-settings">
              <SectionCard title="Publishing Settings">
                <div className="flex flex-col gap-4">
                  <RadioGroup
                    name="accessType"
                    title="Access type"
                    requiredIndicator
                    variant="card"
                    value={formData.isPublic ? 'PUBLIC' : 'RESTRICTED'}
                    onChange={(selected) => {
                      handleChange('accessType', selected);
                      handleChange('isPublic', selected === 'PUBLIC');
                    }}
                  >
                    <RadioItem
                      value="PUBLIC"
                      helpText="Anyone can browse and download"
                    >
                      Open Access
                    </RadioItem>
                    <RadioItem
                      value="RESTRICTED"
                      disabled
                      helpText="Requires approval to access"
                      title="Coming Soon"
                    >
                      Restricted Access
                    </RadioItem>
                  </RadioGroup>
                  <Select
                    name="license"
                    requiredIndicator
                    options={licenseOptions.map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                    label="License"
                    placeholder="Select a license"
                    value={formData.license ? formData.license : ''}
                    helpText="CC BY 4.0 is recommended for open government data."
                    error={licenseError}
                    onChange={(value) => {
                      handleChange('license', value);
                      handleSave({ ...formData, license: value });
                    }}
                  />
                </div>
              </SectionCard>
            </div>

            {getDatasetMetadata.data?.datasets?.[0]?.datasetType ===
            'PROMPT' ? (
              <div id="prompt-metadata">
                <SectionCard
                  title="Prompt Dataset Metadata"
                  description="Additional metadata specific to prompt datasets for AI/ML use cases."
                >
                  <div className="flex flex-col gap-6">
                    <Combobox
                      name="taskType"
                      label="Task Type"
                      displaySelected
                      list={enumValues(PromptTaskType).map((name) => ({
                        label: name
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        value: name,
                      }))}
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
                      list={enumValues(PromptDomain).map((name) => ({
                        label: name
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        value: name,
                      }))}
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
                      list={enumValues(TargetLanguage).map((name) => ({
                        label: name
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        value: name,
                      }))}
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
                      list={enumValues(TargetModelType).map((name) => ({
                        label: name
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        value: name,
                      }))}
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
                </SectionCard>
              </div>
            ) : null}
          </div>
        </Form>
      ) : (
        <DatasetLoading />
      )}
    </>
  );
}
