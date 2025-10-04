'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  MetadataModels,
  TypeMetadata,
  TypeSector,
  TypeTag,
  UpdateUseCaseMetadataInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Combobox, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';

const FetchUseCasedetails: any = graphql(`
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
      }
    }
  }
`);

const UpdateUseCaseMetadataMutation: any = graphql(`
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
const sectorsListQueryDoc: any = graphql(`
  query SectorList {
    sectors {
      id
      name
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

const tagsListQueryDoc: any = graphql(`
  query TagsList {
    tags {
      id
      value
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

  const useCaseData: { data: any; isLoading: boolean } = useQuery(
    [`fetch_UseCaseData_Metadata`],
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

  const defaultValuesPrepFn = (data: any) => {
    let defaultVal: {
      [key: string]: any;
    } = {};

    if (!data) {
      return {
        sectors: [],
        geographies: [],
        tags: [],
      };
    }

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
      data?.sectors?.map((sector: TypeSector) => {
        return {
          label: sector.name,
          value: sector.id,
        };
      }) || [];

    defaultVal['geographies'] =
      data?.geographies?.map((geo: any) => {
        return {
          label: geo.name,
          value: geo.id,
        };
      }) || [];

    defaultVal['tags'] =
      data?.tags?.map((tag: TypeTag) => {
        return {
          label: tag.value,
          value: tag.id,
        };
      }) || [];

    return defaultVal;
  };

  const [formData, setFormData] = useState(
    defaultValuesPrepFn(useCaseData?.data?.useCases?.[0] || {})
  );
  const [previousFormData, setPreviousFormData] = useState(formData);

  useEffect(() => {
    if (useCaseData.data?.useCases[0]) {
      const updatedData = defaultValuesPrepFn(useCaseData.data.useCases[0]);
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }, [useCaseData.data]);

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
  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

  // Update mutation
  const updateUseCase = useMutation(
    (data: { updateMetadataInput: UpdateUseCaseMetadataInput }) =>
      GraphQL(UpdateUseCaseMetadataMutation, {
        [params.entityType]: params.entitySlug,
      }, data),
    {
      onSuccess: (res: any) => {
        toast('Use case updated successfully');
        const updatedData = defaultValuesPrepFn(res.addUpdateUsecaseMetadata);
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

  useEffect(() => {
    setStatus(updateUseCase.isLoading ? 'loading' : 'success'); // update based on mutation state
  }, [updateUseCase.isLoading]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = (updatedData: any) => {
    if (JSON.stringify(updatedData) !== JSON.stringify(previousFormData)) {
      // Ensure metadata exists before mapping
      setPreviousFormData(updatedData);
      const transformedValues = Object.keys(updatedData)?.reduce(
        (acc: any, key) => {
          acc[key] = Array.isArray(updatedData[key])
            ? updatedData[key].map((item: any) => item.value || item).join(', ')
            : updatedData[key];
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
                  !['sectors', 'tags', 'geographies'].includes(valueItem) &&
                  transformedValues[valueItem] !== ''
              )
              .map((key) => {
                return {
                  id: key,
                  value: transformedValues[key] || '',
                };
              }),
          ],
          sectors: updatedData.sectors?.map((item: any) => item.value) || [],
          tags: updatedData.tags?.map((item: any) => item.label) || [],
          geographies: updatedData.geographies?.map((item: any) => parseInt(item.value, 10)) || [],
        },
      });
    }
  };

  if (
    getSectorsList.isLoading ||
    getTagsList.isLoading ||
    useCaseData.isLoading
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
              name="tags"
              label="Tags"
              creatable
              list={
                getTagsList?.data.tags?.map((item: TypeTag) => ({
                  label: item.value,
                  value: item.id,
                })) || []
              }
              key={`tags-${getTagsList.data?.tags?.length}`} // forces remount on change
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
                getSectorsList?.data.sectors?.map((item: TypeSector) => ({
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
            <Combobox
              displaySelected
              label="Geographies"
              name="geographies"
              list={
                getGeographiesList?.data?.geographies?.map((item: any) => ({
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
          {metadataFields?.metadata?.map((item) =>
            renderInputField(item as TypeMetadata)
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;
