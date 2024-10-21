'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  TypeCategory,
  TypeDataset,
  TypeDatasetMetadata,
  TypeMetadata,
  TypeTag,
  UpdateMetadataInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  Divider,
  Form,
  FormLayout,
  Input,
  Select,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';
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
  const router = useRouter();
  const params = useParams();

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
          // Entity Headers if present
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
          // Entity Headers if present
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
          // Entity Headers if present
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
        // Entity Headers if present
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
          // Entity Headers if present
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

        getMetaDataListQuery.refetch();
        getDatasetMetadata.refetch();

        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${id}/edit/publish`
        );
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const defaultValuesPrepFn = (dataset: TypeDataset) => {
    // Function to set default values for the form

    let defaultVal: {
      [key: string]: any;
    } = {};

    dataset?.metadata.length > 0 &&
      dataset?.metadata?.map((field) => {
        if (field.metadataItem.dataType === 'MULTISELECT') {
          // Convert comma-separated string to array of {label, value} objects
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

    defaultVal['description'] = dataset.description || '';

    defaultVal['categories'] =
      dataset.categories?.map((category: TypeCategory) => {
        return {
          label: category.name,
          value: category.id,
        };
      }) || [];

    defaultVal['tags'] =
      dataset.tags?.map((tag: TypeTag) => {
        return {
          label: tag.value,
          value: tag.id,
        };
      }) || [];

    return defaultVal;
  };

  function renderInputField(metadataFormItem: any, getMetaDataListQuery: any) {
    // Check the data type and return the corresponding input

    if (metadataFormItem.dataType === 'STRING') {
      return (
        <div
          key={metadataFormItem.id}
          className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
        >
          <Input
            name={metadataFormItem.id}
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
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
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
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
          <Select
            name={metadataFormItem.id}
            options={metadataFormItem.options.map((option: string) => ({
              value: option,
              label: option,
            }))}
            label={metadataFormItem.label}
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
            label={metadataFormItem.label}
            disabled={
              getMetaDataListQuery.isLoading || !metadataFormItem.enabled
            }
          />
        </div>
      );
    }

    // Add more conditions if there are other data types you want to handle
    return null;
  }

  return (
    <>
      {!getTagsList?.isLoading &&
      !getCategoriesList?.isLoading &&
      !getDatasetMetadata.isLoading ? (
        <Form
          onSubmit={(values) => {
            const transformedValues = Object.keys(values)?.reduce(
              (acc: any, key) => {
                acc[key] = Array.isArray(values[key])
                  ? values[key]
                      .map((item: any) => item.value || item)
                      .join(', ')
                  : values[key];
                return acc;
              },
              {}
            );

            // Call the mutation to save both the static and dynamic metadata
            updateMetadataMutation.mutate({
              UpdateMetadataInput: {
                dataset: id,
                metadata: [
                  ...Object.keys(transformedValues)
                    .filter(
                      (valueItem) =>
                        !['categories', 'description', 'tags'].includes(
                          valueItem
                        )
                    )
                    .map((key) => {
                      return {
                        id: key,
                        value: transformedValues[key] || '',
                      };
                    }),
                ],
                description: values.description || '',
                tags: values.tags?.map((item: any) => item.label) || [],
                categories:
                  values.categories?.map((item: any) => item.value) || [],
              },
            });
          }}
          formOptions={{
            resetOptions: {
              keepValues: true,
              keepDirtyValues: true,
            },
            defaultValues: defaultValuesPrepFn(
              getDatasetMetadata?.data?.datasets[0]
            ),
          }}
        >
          <>
            <div className="pt-3">
              <FormLayout>
                <div className="w-full py-4 pr-4">
                  <Input
                    key="description"
                    multiline
                    name="description"
                    label={'Description'}
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
                    />
                  </div>
                  <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
                    {
                      <Combobox
                        displaySelected
                        label="Categories"
                        list={getCategoriesList.data?.categories?.map(
                          (item: TypeCategory) => {
                            return { label: item.name, value: item.id };
                          }
                        )}
                        name="categories"
                      />
                    }
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
                          return renderInputField(
                            metadataFormItem,
                            getMetaDataListQuery
                          );
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                id="exitAfterSave"
                disabled
                loading={updateMetadataMutation.isLoading}
              >
                Save & Exit
              </Button>
              <Button
                id="proceedAfterSave"
                submit
                loading={updateMetadataMutation.isLoading}
              >
                Save & Proceed
              </Button>
            </div>
          </>
        </Form>
      ) : (
        <DatasetLoading />
      )}
    </>
  );
}
