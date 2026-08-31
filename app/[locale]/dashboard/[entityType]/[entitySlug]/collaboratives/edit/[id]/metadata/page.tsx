'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  MetadataModels,
  UpdateCollaborativeMetadataInput,
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
    code: string;
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

// prettier-ignore
const FetchCollaborativeMetadata = graphql(`
  query CollaborativeMetadata($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
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
      sdgs {
        id
        code
        name
        number
      }
      geographies {
        id
        name
        code
        type
      }
    }
  }
`);

// prettier-ignore
const metadataQueryDoc = graphql(`
  query CollaborativeMetaDataList($filters: MetadataFilter) {
    metadata(filters: $filters) {
      id
      label
      dataStandard
      urn
      dataType
      options
      filterable
    }
  }
`);

// prettier-ignore
const sectorsListQueryDoc = graphql(`
  query SectorList {
    sectors {
      id
      name
    }
  }
`);

// prettier-ignore
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

// prettier-ignore
const tagsListQueryDoc = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

// prettier-ignore
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

// prettier-ignore
const UpdateCollaborativeMetadata = graphql(`
  mutation addUpdateCollaborativeMetadata($updateMetadataInput: UpdateCollaborativeMetadataInput!) {
    addUpdateCollaborativeMetadata(updateMetadataInput: $updateMetadataInput) {
      __typename
      ... on TypeCollaborative {
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
        sdgs {
          id
          code
          name
          number
        }
        geographies {
          id
          name
          code
          type
        }
      }
    }
  }
`);

const Metadata = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const { setStatus } = useEditStatus();
  const queryClient = useQueryClient();

  const collaborativeData = useQuery(
    [
      `fetch_CollaborativeData_Metadata`,
      params.entityType,
      params.entitySlug,
      params.id,
    ],
    () =>
      GraphQL(
        FetchCollaborativeMetadata,
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
    [`metadata_fields_COLLABORATIVE_${params.id}`],
    () =>
      GraphQL(
        metadataQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            model: 'COLLABORATIVE' as MetadataModels,
            enabled: true,
          },
        }
      )
  );

  const defaultValuesPrepFn = (data: MetadataSource): MetadataFormData => {
    const defaultVal: MetadataFormData = {};

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

    defaultVal['sdgs'] =
      data?.sdgs?.map((sdg) => {
        const num = sdg.number
          ? String(sdg.number).padStart(2, '0')
          : sdg.code.replace('SDG', '').padStart(2, '0');
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

    defaultVal['geographies'] =
      data?.geographies?.map((geo) => {
        return {
          label: geo.name ?? '',
          value: geo.id,
        };
      }) || [];

    return defaultVal;
  };

  const [formData, setFormData] = useState(
    defaultValuesPrepFn(collaborativeData?.data?.collaboratives?.[0] || {})
  );
  const [previousFormData, setPreviousFormData] = useState(formData);
  const [prevCollaborativeData, setPrevCollaborativeData] = useState(
    collaborativeData.data
  );
  if (collaborativeData.data !== prevCollaborativeData) {
    setPrevCollaborativeData(collaborativeData.data);
    if (collaborativeData.data?.collaboratives?.[0]) {
      const updatedData = defaultValuesPrepFn(
        collaborativeData.data.collaboratives[0]
      );
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

  const getGeographiesList =
    useQuery([`geographies_list_query`], () =>
      GraphQL(
        geographiesListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        })
    );
  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

  const COLLAB_METADATA_TOAST_ID = 'collaboratives-metadata-toast';

  // Update mutation
  const updateCollaborative = useMutation(
    (data: { updateMetadataInput: UpdateCollaborativeMetadataInput }) =>
      GraphQL(
        UpdateCollaborativeMetadata,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res) => {
        toast('Collaborative updated successfully', {
          id: COLLAB_METADATA_TOAST_ID,
        });
        const result = res.addUpdateCollaborativeMetadata;
        if (result.__typename === 'TypeCollaborative') {
          const updatedData = defaultValuesPrepFn(result);
          if (isTagsListUpdated) {
            getTagsList.refetch();
            setIsTagsListUpdated(false);
          }
          setFormData(updatedData);
          setPreviousFormData(updatedData);
        }

        // Keep other edit tabs in sync (Details/Publish) without requiring a full reload.
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeData_details`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeDetails`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeData_Metadata`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
      },
      onError: (error: unknown) => {
        toast(`Error: ${typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : String(error)}`, { id: COLLAB_METADATA_TOAST_ID });
      },
    }
  );

  const handleChange = (field: string, value: MetadataFormValue) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = (updatedData: MetadataFormData) => {
    if (JSON.stringify(updatedData) !== JSON.stringify(previousFormData)) {
      setPreviousFormData(updatedData);

      updateCollaborative.mutate({
        updateMetadataInput: {
          id: params.id,
          metadata: Object.keys(updatedData)
            .filter(
              (key) =>
                !['tags', 'sectors', 'sdgs'].includes(key) &&
                metadataFields?.metadata?.find((item) => item.id === key)
            )
            .map((key) => ({
              id: key,
              value: metadataValue(updatedData[key]),
            })),
          sectors: comboValues(updatedData.sectors, 'value'),
          sdgs: comboValues(updatedData.sdgs, 'value'),
          tags: comboValues(updatedData.tags, 'label'),
          geographies: comboValues(updatedData.geographies, 'value').map((value) =>
              parseInt(value, 10)
            ),
        },
      });
    }
  };

  useEffect(() => {
    setStatus(updateCollaborative.isLoading ? 'loading' : 'success');
  }, [updateCollaborative.isLoading, setStatus]);

  if (
    getSectorsList.isLoading ||
    getSDGsList.isLoading ||
    getTagsList.isLoading ||
    getGeographiesList.isLoading ||
    collaborativeData.isLoading
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
            selectedValue={comboboxSelected(formData[metadataFormItem.id])}
            displaySelected
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({ ...formData, [metadataFormItem.id]: value });
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
            selectedValue={comboboxSelected(formData[metadataFormItem.id])}
            displaySelected
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({ ...formData, [metadataFormItem.id]: value });
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
              label="SDG Goals *"
              name="sdgs"
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
          <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
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
              key={`tags-${getTagsList.data?.tags?.length}`}
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
              label="Sectors *"
              name="sectors"
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
          </div>
          <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
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

        <div className="flex flex-wrap">
          {metadataFields?.metadata?.map((item) => renderInputField(item))}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
