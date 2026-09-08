'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  MetadataModels,
  UpdateUseCaseMetadataInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Combobox, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';

interface SelectOption {
  label: string;
  value: string;
}

interface MetadataField {
  id: string;
  label: string;
  dataType: string;
  options?: string[] | null;
}

type MetadataFormValue = string | SelectOption[] | SelectOption | undefined;

interface MetadataFormData {
  [key: string]: MetadataFormValue;
}

interface MetadataSource {
  metadata?: Array<{
    value?: string | null;
    metadataItem: { id: string; dataType: string };
  }> | null;
  sectors?: Array<{ id: string; name?: string | null }> | null;
  sdgs?: Array<{
    id: string;
    name?: string | null;
    code?: string | null;
    number?: number | null;
  }> | null;
  tags?: Array<{ id: string; value?: string | null }> | null;
  geographies?: Array<{ id: string; name?: string | null }> | null;
}

function comboValues(value: MetadataFormValue, key: 'value' | 'label'): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return String(item[key] ?? '');
    }
    return String(item);
  });
}

function asSelectOptions(value: MetadataFormValue): SelectOption[] {
  return Array.isArray(value) ? value : [];
}

function comboboxSelected(
  value: MetadataFormValue
): string | SelectOption[] | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value;
  return [value];
}

function metadataValue(value: MetadataFormValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => item.value || String(item)).join(', ');
  }
  if (typeof value === 'string') return value;
  return value?.value ?? '';
}

const FetchUseCasedetails = graphql(`
  query UseCasesDetails($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
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
      sdgs {
        id
        code
        name
        number
      }
    }
  }
`);

const UpdateUseCaseMetadataMutation = graphql(`
  mutation addUpdateUsecaseMetadata($updateMetadataInput: UpdateUseCaseMetadataInput!) {
    addUpdateUsecaseMetadata(updateMetadataInput: $updateMetadataInput) {
      ... on TypeUseCase {
      id
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
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
      sdgs {
        id
        code
        name
        number
        }
      }
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
const sectorsListQueryDoc = graphql(`
  query SectorList {
    sectors {
      id
      name
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

const tagsListQueryDoc = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

const sdgsListQueryDoc = graphql(`
  query SDGList {
    sdgs {
      id
      code
      name
      number
    }
  }
`);

const Metadata = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const USECASE_EDIT_SUCCESS_TOAST_ID = 'usecase-edit-save-success';
  const USECASE_METADATA_ERROR_TOAST_ID = 'usecase-metadata-save-error';
  const getErrorMessage = (error: unknown, fallback: string) =>
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
      ? error.message.trim()
      : fallback;

  const { setStatus } = useEditStatus();

  const useCaseData = useQuery(
    [
      `fetch_UseCaseData_Metadata`,
      params.id,
      params.entityType,
      params.entitySlug,
    ],
    () =>
      GraphQL(
        FetchUseCasedetails,
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
  const { data: metadataFields } = useQuery(
    [`metadata_fields_USECASE_${params.id}`],
    () =>
      GraphQL(
        metadataQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            model: 'USECASE' as MetadataModels,
            enabled: true,
          },
        }
      )
  );

  const defaultValuesPrepFn = (data: MetadataSource | null | undefined): MetadataFormData => {
    const defaultVal: MetadataFormData = {};

    if (!data) {
      return {
        sectors: [],
        geographies: [],
        tags: [],
        sdgs: [],
      };
    }

    data?.metadata?.map((field) => {
      if (field.metadataItem.dataType === 'MULTISELECT' && field.value) {
        defaultVal[field.metadataItem.id] = field.value
          .split(', ')
          .map((value: string) => ({
            label: value,
            value: value,
          }));
      } else if (!field.value) {
        defaultVal[field.metadataItem.id] = [];
      } else {
        defaultVal[field.metadataItem.id] = field.value;
      }
    });

    defaultVal['sectors'] =
      data?.sectors?.map((sector) => {
        return {
          label: sector.name ?? '',
          value: sector.id,
        };
      }) || [];

    defaultVal['geographies'] =
      data?.geographies?.map((geo) => {
        return {
          label: geo.name ?? '',
          value: geo.id,
        };
      }) || [];

    defaultVal['sdgs'] =
      data?.sdgs?.map((sdg) => {
        const num = sdg.number
          ? String(sdg.number).padStart(2, '0')
          : (sdg.code ?? '').replace('SDG', '').padStart(2, '0');
        return {
          label: `${num}. ${sdg.name ?? ''}`,
          value: sdg.id,
        };
      }) || [];

    defaultVal['tags'] =
      data?.tags?.map((tag) => {
        return {
          label: tag.value ?? '',
          value: tag.id,
        };
      }) || [];

    return defaultVal;
  };

  const [formData, setFormData] = useState(
    defaultValuesPrepFn(useCaseData?.data?.useCases?.[0] || {})
  );
  const [, setPreviousFormData] = useState(formData);
  const [prevUseCaseData, setPrevUseCaseData] = useState(useCaseData.data);
  if (useCaseData.data !== prevUseCaseData) {
    setPrevUseCaseData(useCaseData.data);
    if (useCaseData.data?.useCases?.[0]) {
      const updatedData = defaultValuesPrepFn(useCaseData.data.useCases[0]);
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }

  const getSectorsList =
    useQuery([`sectors_list_query`], () =>
      GraphQL(
        sectorsListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        })
    );

  const getGeographiesList =
    useQuery([`geographies_list_query`], () =>
      GraphQL(
        geographiesListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        })
    );

  const getSDGsList = useQuery(
    [`sdgs_list_query`],
    () =>
      GraphQL(
        sdgsListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        })
  );

  const getTagsList = useQuery([`tags_list_query`], () =>
    GraphQL(
      tagsListQueryDoc,
      {
        [params.entityType]: params.entitySlug,
      })
  );
  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

  const queryClient = useQueryClient();

  // Update mutation
  const updateUseCase = useMutation(
    (data: { updateMetadataInput: UpdateUseCaseMetadataInput }) =>
      GraphQL(
        UpdateUseCaseMetadataMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res) => {
        toast('Use case updated successfully', {
          id: USECASE_EDIT_SUCCESS_TOAST_ID,
        });
        const result = res.addUpdateUsecaseMetadata;
        if (result && result.__typename === 'TypeUseCase') {
          const updatedData = defaultValuesPrepFn(result);
          if (isTagsListUpdated) {
            getTagsList.refetch();
            setIsTagsListUpdated(false);
          }
          setFormData(updatedData);
          setPreviousFormData(updatedData);
        }
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_UseCaseData_Metadata`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_UsecaseDetails`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to update use case metadata right now. Please try again.')}`,
          { id: USECASE_METADATA_ERROR_TOAST_ID }
        );
      },
    }
  );

  useEffect(() => {
    setStatus(updateUseCase.isLoading ? 'loading' : 'success'); // update based on mutation state
  }, [updateUseCase.isLoading, setStatus]);

  const handleChange = (field: string, value: MetadataFormValue) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = (updatedData: MetadataFormData) => {
    const updatedSnapshot = JSON.stringify(updatedData);
    setPreviousFormData((prevData) => {
      if (JSON.stringify(prevData) === updatedSnapshot) {
        return prevData;
      }

      const transformedValues = Object.keys(updatedData)?.reduce(
        (acc: Record<string, string>, key) => {
          acc[key] = metadataValue(updatedData[key]);
          return acc;
        },
        {}
      );

      updateUseCase.mutate({
        updateMetadataInput: {
          id: params.id,
          metadata: [
            ...Object.keys(transformedValues)
              .filter(
                (valueItem) =>
                  !['sectors', 'tags', 'geographies', 'sdgs'].includes(
                    valueItem
                  ) && transformedValues[valueItem] !== ''
              )
              .map((key) => {
                return {
                  id: key,
                  value: transformedValues[key] || '',
                };
              }),
          ],
          sectors: comboValues(updatedData.sectors, 'value'),
          tags: comboValues(updatedData.tags, 'label'),
          sdgs: comboValues(updatedData.sdgs, 'value'),
          geographies: comboValues(updatedData.geographies, 'value').map((value) =>
              parseInt(value, 10)
            ),
        },
      });

      return updatedData;
    });
  };

  if (
    getSectorsList.isLoading ||
    getTagsList.isLoading ||
    getSDGsList.isLoading ||
    getGeographiesList.isLoading ||
    useCaseData.isLoading
  ) {
    return (
      <div className="flex h-36 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  function renderInputField(metadataFormItem: MetadataField) {
    if (metadataFormItem.dataType === 'SELECT') {
      return (
        <div key={metadataFormItem.id} className="w-full py-4 pr-4 sm:w-1/2">
          <Combobox
            name={metadataFormItem.id}
            list={
              metadataFormItem.options?.map((option: string) => ({
                label: option,
                value: option,
              })) || []
            }
            label={metadataFormItem.label}
            selectedValue={comboboxSelected(formData[metadataFormItem.id]) || ''}
            displaySelected
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({ ...formData, [metadataFormItem.id]: value }); // Save on change
            }}
          />
        </div>
      );
    }

    if (metadataFormItem.dataType === 'MULTISELECT') {
      return (
        <div key={metadataFormItem.id} className="w-full py-4 pr-4 sm:w-1/2">
          <Combobox
            name={metadataFormItem.id}
            list={[
              ...(metadataFormItem.options?.map((option: string) => ({
                label: option,
                value: option,
              })) || []),
            ]}
            label={metadataFormItem.label + ' *'}
            selectedValue={comboboxSelected(formData[metadataFormItem.id]) || []}
            displaySelected
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({ ...formData, [metadataFormItem.id]: value }); // Save on change
            }}
          />
        </div>
      );
    }
  }

  return (
    <div>
      <div>
        <div className="flex flex-wrap">
          <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
            <Combobox
              displaySelected
              label="SDG Goals"
              name="sdgs"
              required
              requiredIndicator={true}
              list={
                getSDGsList?.data?.sdgs?.map((item) => {
                  const num = item.number
                    ? String(item.number).padStart(2, '0')
                    : item.code.replace('SDG', '').padStart(2, '0');
                  return {
                    label: `${num}. ${item.name}`,
                    value: item.id,
                  };
                }) || []
              }
              selectedValue={asSelectOptions(formData.sdgs)}
              onChange={(value) => {
                handleChange('sdgs', value);
                handleSave({ ...formData, sdgs: value });
              }}
            />
          </div>
          <div className="w-full py-4 pl-2 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
            <Combobox
              displaySelected
              name="tags"
              label="Tags"
              creatable
              list={
                getTagsList?.data?.tags?.map((item) => ({
                  label: item.value ?? '',
                  value: item.id,
                })) || []
              }
              key={`tags-${getTagsList.data?.tags?.length}`} // forces remount on change
              selectedValue={asSelectOptions(formData.tags)}
              onChange={(value) => {
                setIsTagsListUpdated(true);
                handleChange('tags', value);
                handleSave({ ...formData, tags: value });
              }}
            />
          </div>
          <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
            <Combobox
              displaySelected
              label="Sectors"
              name="sectors"
              required
              requiredIndicator={true}
              list={
                getSectorsList?.data?.sectors?.map((item) => ({
                  label: item.name,
                  value: item.id,
                })) || []
              }
              selectedValue={asSelectOptions(formData.sectors)}
              onChange={(value) => {
                handleChange('sectors', value);
                handleSave({ ...formData, sectors: value });
              }}
            />
            <div className="mt-8 w-full">
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
                selectedValue={asSelectOptions(formData.geographies)}
                onChange={(value) => {
                  handleChange('geographies', value);
                  handleSave({ ...formData, geographies: value });
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          {metadataFields?.metadata?.map((item) =>
            renderInputField(item)
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
