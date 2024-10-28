'use client';

import { graphql } from '@/gql';
import {
  TypeCategory,
  TypeDataset,
  TypeMetadata,
  TypeTag,
  UpdateMetadataInput
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Combobox,
  Divider,
  Form,
  FormLayout,
  Icon,
  Input,
  Spinner,
  Text,
  toast
} from 'opub-ui';

import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { GraphQL } from '@/lib/api';
import { useEffect, useState } from 'react';
import DatasetLoading from '../../../components/loading-dataset';

const categoriesListQueryDoc: any = graphql(`
  query CategoryList {
    categories {
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
      categories {
        id
        name
      }
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
      __typename
      ... on TypeDataset {
        id
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

  const getCategoriesList: { data: any; isLoading: boolean; error: any } =
    useQuery([`categories_list_query`], () =>
      GraphQL(
        categoriesListQueryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      )
    );

  const getTagsList: { data: any; isLoading: boolean; error: any } = useQuery(
    [`tags_list_query`],
    () =>
      GraphQL(
        tagsListQueryDoc,
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
      onSuccess: () => {
        toast('Details updated successfully!');
        queryClient.invalidateQueries({
          queryKey: [
            `metadata_values_query_${params.id}`,
            `metadata_fields_list_${id}`,
          ],
        });
        // getMetaDataListQuery.refetch();
        getDatasetMetadata.refetch();
       
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const defaultValuesPrepFn = (dataset: TypeDataset) => {
    let defaultVal: {
      [key: string]: any;
    } = {};

    dataset?.metadata.length > 0 &&
      dataset?.metadata?.map((field) => {
        if (field.metadataItem.dataType === 'MULTISELECT') {
          defaultVal[field.metadataItem.id] = field.value
            .split(', ')
            .map((value: string) => ({
              label: value,
              value: value,
            }));
        } else {
          defaultVal[field.metadataItem.id] = field.value;
        }
      });

    defaultVal['description'] = dataset?.description || '';

    defaultVal['categories'] =
      dataset?.categories?.map((category: TypeCategory) => {
        return {
          label: category.name,
          value: category.id,
        };
      }) || [];

    defaultVal['tags'] =
      dataset?.tags?.map((tag: TypeTag) => {
        return {
          label: tag.value,
          value: tag.id,
        };
      }) || [];

    return defaultVal;
  };

  const [formData, setFormData] = useState(defaultValuesPrepFn(getDatasetMetadata?.data?.datasets[0]));
  const [previousFormData, setPreviousFormData] = useState(formData);

  useEffect(() => {
    if (getDatasetMetadata.data?.datasets[0]) {
      const updatedData = defaultValuesPrepFn(getDatasetMetadata.data.datasets[0]);
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
    if (JSON.stringify(updatedData) !== JSON.stringify(previousFormData)) {
      setPreviousFormData(updatedData);

      const transformedValues = Object.keys(updatedData)?.reduce(
        (acc: any, key) => {
          acc[key] = Array.isArray(updatedData[key])
            ? updatedData[key]
                .map((item: any) => item.value || item)
                .join(', ')
            : updatedData[key];
          return acc;
        },
        {}
      );
      updateMetadataMutation.mutate({
        UpdateMetadataInput: {
          dataset: id,
          metadata: [
            ...Object.keys(transformedValues)
              .filter(
                (valueItem) =>
                  !['categories', 'description', 'tags'].includes(valueItem)
              )
              .map((key) => {
                return {
                  id: key,
                  value: transformedValues[key] || '',
                };
              }),
          ],
          description: updatedData.description || '',
          tags: updatedData.tags?.map((item: any) => item.label) || [],
          categories:
            updatedData.categories?.map((item: any) => item.value) || [],
        },
      });
    }
  };

  function renderInputField(metadataFormItem: any) {
    if (metadataFormItem.dataType === 'STRING') {
      return (
        <div
          key={metadataFormItem.id}
          className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
        >
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
        <div
          key={metadataFormItem.id}
          className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
        >
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
        <div
          key={metadataFormItem.id}
          className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
        >
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
        <div
          key={metadataFormItem.id}
          className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
        >
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
        <div
          key={metadataFormItem.id}
          className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
        >
          <Input
            type="date"
            name={metadataFormItem.id}
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

  return (
    <>
      {!getTagsList?.isLoading &&
      !getCategoriesList?.isLoading &&
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
          <div className="flex justify-end gap-2">
            <Text color="highlight">Auto Save </Text>
            {updateMetadataMutation.isLoading ? (
              <Spinner />
            ) : (
              <Icon source={Icons.checkmark} />
            )}
          </div>
            <div className="pt-3">
              <FormLayout>
                <div className="w-full py-4 pr-4">
                  <Input
                    key="description"
                    multiline
                    name="description"
                    label={'Description'}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e)}
                    onBlur={() => handleSave(formData)} // Save on blur
                  />
                </div>

                <div className="flex flex-wrap">
                  <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
                    <Combobox
                      displaySelected
                      name="tags"
                      list={getTagsList.data?.tags?.map((item: TypeTag) => {
                        return {
                          label: item.value,
                          value: item.id,
                        };
                      })}
                      label="Tags"
                      creatable
                      onChange={(value) => {
                        handleChange('tags', value);
                        handleSave({ ...formData, tags: value }); // Save on change
                      }}
                    />
                  </div>
                  <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
                    <Combobox
                      displaySelected
                      label="Categories"
                      list={getCategoriesList.data?.categories?.map(
                        (item: TypeCategory) => {
                          return { label: item.name, value: item.id };
                        }
                      )}
                      name="categories"
                      onChange={(value) => {
                        handleChange('categories', value);
                        handleSave({ ...formData, categories: value }); // Save on change
                      }}
                    />
                  </div>
                </div>

                {getMetaDataListQuery.isLoading ? (
                  <Loading />
                ) : getMetaDataListQuery?.data?.metadata?.length > 0 ? (
                  <>
                    <div className="my-4">
                      <Divider />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Text variant="headingMd">Add Metadata</Text>
                    </div>

                    <div className="my-4">
                      <Divider />
                    </div>

                    <div className="flex flex-wrap">
                      {getMetaDataListQuery?.data?.metadata?.map(
                        (metadataFormItem: TypeMetadata) => {
                          return renderInputField(metadataFormItem);
                        }
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </FormLayout>
            </div>
            <div className="mt-8">
              <Divider />
            </div>
           
          </>
        </Form>
      ) : (
        <DatasetLoading />
      )}
    </>
  );
}
