'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  TypeDataset,
  TypeMetadata,
  TypeSector,
  TypeTag,
  UpdateMetadataInput,
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
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import DatasetLoading from '../../../components/loading-dataset';
import { useDatasetEditStatus } from '../context';

const sectorsListQueryDoc: any = graphql(`
  query SectorList {
    sectors {
      id
      name
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

const datasetMetadataQueryDoc: any = graphql(`
  query MetadataValues($filters: DatasetFilter) {
    datasets(filters: $filters) {
      title
      id
      description
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
    }
  }
`);

const metadataQueryDoc: any = graphql(`
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

const updateMetadataMutationDoc: any = graphql(`
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

export function EditMetadata({ id }: { id: string }) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const queryClient = useQueryClient();

  const getDatasetMetadata: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
  } = useQuery(
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

  const getMetaDataListQuery: {
    data: any;
    isLoading: boolean;
    refetch: any;
  } = useQuery([`metadata_fields_list_${id}`], () =>
    GraphQL(
      metadataQueryDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      {
        filters: {
          model: 'DATASET',
          enabled: true,
        },
      }
    )
  );

  const [isTagsListUpdated, setIsTagsListUpdated] = useState(false);

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
      onSuccess: (res: any) => {
        if (res.addUpdateDatasetMetadata.success) {
          toast('Details updated successfully!');
          queryClient.invalidateQueries({
            queryKey: [
              `metadata_values_query_${params.id}`,
              `metadata_fields_list_${id}`,
            ],
          });
          const updatedData = defaultValuesPrepFn(
            res.addUpdateDatasetMetadata.data
          );
          if (isTagsListUpdated) {
            getTagsList.refetch();
            setIsTagsListUpdated(false);
          }
          setFormData(updatedData);
          setPreviousFormData(updatedData);
        } else {
          toast(
            'Error: ' +
              (res.addUpdateDatasetMetadata?.errors?.fieldErrors
                ? res.addUpdateDatasetMetadata?.errors?.fieldErrors[0]
                    ?.messages[0]
                : res.addUpdateDatasetMetadata?.errors?.nonFieldErrors[0])
          );
        }
      },
    }
  );

  const defaultValuesPrepFn = (dataset?: TypeDataset) => {
    let defaultVal: {
      [key: string]: any;
    } = {};

    if (!dataset) {
      return {
        description: '',
        sectors: [],
        license: null,
        tags: [],
        geographies: [],
        isPublic: true,
      };
    }

    (dataset?.metadata || []).length > 0 &&
      (dataset?.metadata || []).map((field) => {
        if (
          field.metadataItem.dataType === 'MULTISELECT' &&
          field.value !== ''
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

    defaultVal['description'] = dataset?.description || '';

    defaultVal['sectors'] =
      dataset?.sectors?.map((sector: TypeSector) => {
        return {
          label: sector.name,
          value: sector.id,
        };
      }) || [];

    defaultVal['license'] = dataset?.license || null;

    defaultVal['tags'] =
      dataset?.tags?.map((tag: TypeTag) => {
        return {
          label: tag.value,
          value: tag.id,
        };
      }) || [];

    defaultVal['geographies'] =
      dataset?.geographies?.map((geo: any) => {
        return {
          label: geo.name,
          value: geo.id,
        };
      }) || [];

    defaultVal['isPublic'] = true;

    return defaultVal;
  };

  const [formData, setFormData] = useState(
    defaultValuesPrepFn(getDatasetMetadata?.data?.datasets?.[0] || {} as TypeDataset)
  );
  const [previousFormData, setPreviousFormData] = useState(formData);

  useEffect(() => {
    if (getDatasetMetadata.data?.datasets[0]) {
      const updatedData = defaultValuesPrepFn(
        getDatasetMetadata.data.datasets[0]
      );
      setFormData(updatedData);
      setPreviousFormData(updatedData);
    }
  }, [getDatasetMetadata.data]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = (updatedData: any) => {
    const changedFields: any = {};

    for (const key in updatedData) {
      const newValue = updatedData[key];
      const prevValue = previousFormData[key];

      const isArray = Array.isArray(newValue);

      const normalize = (val: any) =>
        isArray ? val?.map((item: any) => item?.value || item) : val;

      const newNormalized = normalize(newValue);
      const prevNormalized = normalize(prevValue);

      const hasChanged = isArray
        ? JSON.stringify(newNormalized) !== JSON.stringify(prevNormalized)
        : newNormalized !== prevNormalized;

      if (hasChanged) {
        changedFields[key] = newValue;
      }
    }

    // Exit early if nothing changed
    if (Object.keys(changedFields).length === 0) return;

    setPreviousFormData(updatedData); // Update local copy

    const transformedValues = Object.keys(changedFields).reduce(
      (acc: any, key) => {
        acc[key] = Array.isArray(changedFields[key])
          ? changedFields[key]
              .map((item: any) => item?.value || item)
              .join(', ')
          : changedFields[key];
        return acc;
      },
      {}
    );

    updateMetadataMutation.mutate({
      UpdateMetadataInput: {
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
        ...(changedFields.license && { license: changedFields.license }),
        ...(changedFields.accessType && {
          accessType: changedFields.accessType,
        }),
        ...(changedFields.description !== undefined && {
          description: changedFields.description,
        }),
        ...(changedFields.tags && {
          tags: changedFields.tags.map((item: any) => item.label),
        }),
        ...(changedFields.sectors && {
          sectors: changedFields.sectors.map((item: any) => item.value),
        }),
        ...(changedFields.geographies && {
          geographies: changedFields.geographies.map((item: any) => parseInt(item.value, 10)),
        }),
      },
    });
  };

  function renderInputField(metadataFormItem: any) {
    if (metadataFormItem.dataType === 'STRING') {
      return (
        <div key={metadataFormItem.id} className="w-full ">
          <Input
            name={metadataFormItem.id}
            label={metadataFormItem.label}
            value={formData[metadataFormItem.id] || ''}
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
            list={metadataFormItem.options.map((option: string) => ({
              label: option,
              value: option,
            }))}
            label={metadataFormItem.label}
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
      const prefillData = metadataFormItem.value ? metadataFormItem.value : [];

      return (
        <div key={metadataFormItem.id} className="w-full ">
          <Combobox
            name={metadataFormItem.id}
            list={[
              ...(metadataFormItem.options.map((option: string) => ({
                label: option,
                value: option,
              })) || []),
            ]}
            label={metadataFormItem.label}
            displaySelected
            selectedValue={prefillData}
            onChange={(value) => {
              handleChange(metadataFormItem.id, value);
              handleSave({ ...formData, [metadataFormItem.id]: value }); // Save on change
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
            value={formData[metadataFormItem.id] || ''}
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
            value={formData[metadataFormItem.id] || ''}
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

  const { setStatus } = useDatasetEditStatus();

  useEffect(() => {
    setStatus(updateMetadataMutation.isLoading ? 'loading' : 'success'); // update based on mutation state
  }, [updateMetadataMutation.isLoading]);

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
                  <TextField
                    key="description"
                    multiline={4}
                    name="description"
                    label="Description *"
                    value={formData.description}
                    helpText={`Character limit: ${formData?.description?.length}/1000`}
                    onChange={(e) => handleChange('description', e)}
                    onBlur={() => handleSave(formData)} // Save on blur
                  />
                </div>

                <Combobox
                  displaySelected
                  label="Sectors *"
                  list={getSectorsList.data?.sectors?.map(
                    (item: TypeSector) => {
                      return { label: item.name, value: item.id };
                    }
                  )}
                  name="sectors"
                  onChange={(value) => {
                    handleChange('sectors', value);
                    handleSave({ ...formData, sectors: value }); // Save on change
                  }}
                />
                <Combobox
                  displaySelected
                  name="tags"
                  list={getTagsList.data?.tags?.map((item: TypeTag) => ({
                    label: item.value,
                    value: item.id,
                  }))}
                  key={`tags-${getTagsList.data?.tags?.length}`} // forces remount on change
                  label="Tags *"
                  creatable
                  onChange={(value) => {
                    setIsTagsListUpdated(true);
                    handleChange('tags', value);
                    handleSave({ ...formData, tags: value });
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
              <div className="mb-8 flex flex-col gap-8">
                {getMetaDataListQuery?.data?.metadata
                  ?.filter(
                    (item: TypeMetadata) => item.dataType === 'MULTISELECT'
                  )
                  .map((item: TypeMetadata) => (
                    <div key={item.id}>{renderInputField(item)}</div>
                  ))}
                <div className="grid gap-4 lg:grid-cols-2">
                  {getMetaDataListQuery?.data?.metadata
                    ?.filter(
                      (item: TypeMetadata) => item.dataType !== 'MULTISELECT'
                    )
                    .map((item: TypeMetadata) => renderInputField(item))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 lg:flex-row">
                <div className="flex w-full flex-wrap gap-2 md:flex-nowrap lg:w-2/4 lg:flex-nowrap">
                  <Checkbox
                    name="accessType"
                    checked={formData?.isPublic}
                    onChange={(e) => handleChange('accessType', 'PUBLIC')}
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
