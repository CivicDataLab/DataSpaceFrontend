'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { MetadataModels } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Combobox, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';

const FetchCollaborativeMetadata: any = graphql(`
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

const sectorsListQueryDoc: any = graphql(`
  query SectorList {
    sectors {
      id
      name
    }
  }
`);

const sdgsListQueryDoc: any = graphql(`
  query SDGList {
    sdgs {
      id
      code
      name
      number
    }
  }
`);

const tagsListQueryDoc: any = graphql(`
  query TagsList {
    tags {
      id
      value
    }
  }
`);

const geographiesListQueryDoc: any = graphql(`
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

const UpdateCollaborativeMetadata: any = graphql(`
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

  const collaborativeData: { data: any; isLoading: boolean } = useQuery(
    [`fetch_CollaborativeData_Metadata`],
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

  const { data: metadataFields, isLoading: isMetadataFieldsLoading } = useQuery(
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

  const defaultValuesPrepFn = (data: any) => {
    let defaultVal: {
      [key: string]: any;
    } = {};

    data?.metadata?.map((field: any) => {
      if (field.metadataItem.dataType === 'MULTISELECT' && field.value !== '') {
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
      data?.sectors?.map((sector: any) => {
        return {
          label: sector.name,
          value: sector.id,
        };
      }) || [];

    defaultVal['sdgs'] =
      data?.sdgs?.map((sdg: any) => {
        const num = String(sdg.number || 0).padStart(2, '0');
        return {
          label: `${num}. ${sdg.name}`,
          value: sdg.id,
        };
      }) || [];

    defaultVal['tags'] =
      data?.tags?.map((tag: any) => {
        return {
          label: tag.value,
          value: tag.id,
        };
      }) || [];

    defaultVal['geographies'] =
      data?.geographies?.map((geo: any) => {
        return {
          label: geo.name,
          value: geo.id,
        };
      }) || [];

    return defaultVal;
  };

  const [formData, setFormData] = useState(
    defaultValuesPrepFn(collaborativeData?.data?.collaboratives?.[0] || {})
  );
  const [previousFormData, setPreviousFormData] = useState(formData);

  useEffect(() => {
    if (collaborativeData.data?.collaboratives?.[0]) {
      const updatedData = defaultValuesPrepFn(collaborativeData.data.collaboratives[0]);
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }, [collaborativeData.data]);

  const getSectorsList: { data: any; isLoading: boolean; error: any } =
    useQuery([`sectors_list_query`], () =>
      GraphQL(
        sectorsListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      )
    );

  const getSDGsList: { data: any; isLoading: boolean; error: any } =
    useQuery([`sdgs_list_query`], () =>
      GraphQL(
        sdgsListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      )
    );

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
      []
    )
  );

  const getGeographiesList: { data: any; isLoading: boolean; error: any } =
    useQuery([`geographies_list_query`], () =>
      GraphQL(
        geographiesListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      )
    );
  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

  // Update mutation
  const updateCollaborative = useMutation(
    (data: { updateMetadataInput: any }) =>
      GraphQL(UpdateCollaborativeMetadata, {
        [params.entityType]: params.entitySlug,
      }, data),
    {
      onSuccess: (res: any) => {
        toast('Collaborative updated successfully');
        const updatedData = defaultValuesPrepFn(res.addUpdateCollaborativeMetadata);
        if (isTagsListUpdated) {
          getTagsList.refetch();
          setIsTagsListUpdated(false);
        }
        setFormData(updatedData);
        setPreviousFormData(updatedData);
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const handleChange = (field: string, value: any) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = (updatedData: any) => {
    if (JSON.stringify(updatedData) !== JSON.stringify(previousFormData)) {
      setPreviousFormData(updatedData);

      updateCollaborative.mutate({
        updateMetadataInput: {
          id: params.id,
          metadata: Object.keys(updatedData)
            .filter(
              (key) =>
                !['tags', 'sectors', 'sdgs'].includes(key) &&
                metadataFields?.metadata?.find((item: any) => item.id === key)
            )
            .map((key) => ({
              id: key,
              value: Array.isArray(updatedData[key])
                ? updatedData[key].map((item: any) => item.value || item).join(', ')
                : updatedData[key],
            })),
          sectors: updatedData.sectors?.map((item: any) => item.value) || [],
          sdgs: updatedData.sdgs?.map((item: any) => item.value) || [],
          tags: updatedData.tags?.map((item: any) => item.label) || [],
          geographies: updatedData.geographies?.map((item: any) => parseInt(item.value, 10)) || [],
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

  function renderInputField(metadataFormItem: any) {
    if (metadataFormItem.dataType === 'SELECT') {
      return (
        <div key={metadataFormItem.id} className="w-full py-4 pr-4 sm:w-1/2">
          <Combobox
            name={metadataFormItem.id}
            list={metadataFormItem.options?.map((option: string) => ({
              label: option,
              value: option,
            }))}
            label={metadataFormItem.label}
            selectedValue={formData[metadataFormItem.id]}
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
              ...(metadataFormItem.options.map((option: string) => ({
                label: option,
                value: option,
              })) || []),
            ]}
            label={metadataFormItem.label + ' *'}
            selectedValue={formData[metadataFormItem.id]}
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
                getSDGsList?.data?.sdgs?.map((item: any) => {
                  const num = String(item.number || 0).padStart(2, '0');
                  return {
                    label: `${num}. ${item.name}`,
                    value: item.id,
                  };
                }) || []
              }
              selectedValue={formData.sdgs}
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
                getTagsList?.data.tags?.map((item: any) => ({
                  label: item.value,
                  value: item.id,
                })) || []
              }
              key={`tags-${getTagsList.data?.tags?.length}`}
              selectedValue={formData.tags}
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
                getSectorsList?.data.sectors?.map((item: any) => ({
                  label: item.name,
                  value: item.id,
                })) || []
              }
              selectedValue={formData.sectors}
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
                getGeographiesList?.data.geographies?.map((item: any) => ({
                  label: `${item.name}${item.parentId ? ` (${item.parentId.name})` : ''}`,
                  value: item.id,
                })) || []
              }
              selectedValue={formData.geographies}
              onChange={(value) => {
                handleChange('geographies', value);
                handleSave({ ...formData, geographies: value });
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap">
          {metadataFields?.metadata?.map((item: any) =>
            renderInputField(item)
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
