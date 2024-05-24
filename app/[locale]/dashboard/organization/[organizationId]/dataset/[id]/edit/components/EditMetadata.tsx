'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  TypeCategory,
  TypeDataset,
  TypeDatasetMetadata,
  TypeMetadata,
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
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';

const categoriesListQueryDoc: any = graphql(`
  query CategoryList {
    categories {
      id
      name
    }
  }
`);

const datasetMetadataQueryDoc: any = graphql(`
  query MetadataValues($filters: DatasetFilter) {
    datasets(filters: $filters) {
      title
      id
      description
      categories {
        id
        name
      }
      metadata {
        metadataItem {
          id
          label
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

  const getCategoriesList: { data: any; isLoading: boolean; error: any } =
    useQuery([`categories_list_query`], () =>
      GraphQL(categoriesListQueryDoc, [])
    );

  const getMetaDataListQuery: {
    data: any;
    isLoading: boolean;
    refetch: Function;
  } = useQuery([`metadata_fields_list_${id}`], () =>
    GraphQL(metadataQueryDoc, {
      filters: {
        model: 'DATASET',
        enabled: true,
      },
    })
  );

  const getDatasetMetadata: {
    data: any;
    isLoading: boolean;
    refetch: Function;
    error: any;
  } = useQuery([`metadata_values_query_${id}`], () =>
    GraphQL(datasetMetadataQueryDoc, { filters: { id: id } })
  );

  const updateMetadataMutation = useMutation(
    (data: { UpdateMetadataInput: UpdateMetadataInput }) =>
      GraphQL(updateMetadataMutationDoc, data),
    {
      onSuccess: (data: any) => {
        toast('Details updated successfully!');

        queryClient.invalidateQueries({
          queryKey: [
            `metadata_values_query_${id}`,
            `metadata_fields_list_${id}`,
          ],
        });

        getMetaDataListQuery.refetch();
        getDatasetMetadata.refetch();

        router.push(
          `/dashboard/organization/${params.organizationId}/dataset/${id}/edit/publish`
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

    dataset.metadata?.map((field) => {
      defaultVal[field.metadataItem.id] = field.value;
    });

    defaultVal['description'] = dataset.description || '';

    defaultVal['categories'] = dataset.categories?.map(
      (category: TypeCategory) => {
        return {
          label: category.name,
          value: category.id,
        };
      }
    );

    return defaultVal;
  };

  return (
    <>
      <Form
        onSubmit={(values) => {
          updateMetadataMutation.mutate({
            UpdateMetadataInput: {
              dataset: id,
              metadata: [
                ...Object.keys(values)
                  .filter(
                    (valueItem) =>
                      !['categories', 'description', 'tags'].includes(valueItem)
                  )
                  .map((key) => {
                    return {
                      id: key,
                      value: values[key] || '',
                    };
                  }),
              ],
              description: values.description || '',
              tags: values.tags || [],
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
            getDatasetMetadata.isLoading || getDatasetMetadata.error
              ? {}
              : getDatasetMetadata?.data?.datasets[0]
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
                  <Combobox name={'tags'} list={[]} label={'Tags'} />
                </div>
                <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
                  <Combobox
                    displaySelected
                    label="Categories"
                    list={
                      getCategoriesList.isLoading || getCategoriesList.error
                        ? []
                        : getCategoriesList.data?.categories?.map(
                            (item: TypeCategory) => {
                              return { label: item.name, value: item.id };
                            }
                          ) || []
                    }
                    name="categories"
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
                                  getMetaDataListQuery.isLoading ||
                                  !metadataFormItem.enabled
                                }
                              />
                            </div>
                          );
                        }
                        return null;
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
    </>
  );
}
