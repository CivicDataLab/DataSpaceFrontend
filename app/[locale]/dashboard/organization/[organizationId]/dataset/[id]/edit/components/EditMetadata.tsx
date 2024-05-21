'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingPage from '@/app/[locale]/dashboard/loading';
import { graphql } from '@/gql';
import {
  TypeDatasetMetadata,
  TypeMetadata,
  UpdateDatasetInput,
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

const datasetMetadataQueryDoc: any = graphql(`
  query MetadataValues($filters: DatasetFilter) {
    datasets(filters: $filters) {
      title
      id
      description
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

const updateDatasetMutationDoc: any = graphql(`
  mutation SaveDatasetDescTags($updateDatasetInput: UpdateDatasetInput!) {
    updateDataset(updateDatasetInput: $updateDatasetInput) {
      __typename
      ... on TypeDataset {
        id
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

export function EditMetadata({
  id,
  // defaultValues,
  // description,
}: {
  id: string;
  // defaultValues: any;
  // description: string;
}) {
  // const submitRef = React.useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const params = useParams();

  const queryClient = useQueryClient();

  const [datasetDetailsMutationFlag, setDatasetDetailsMutationFlag] =
    useState(false);
  const [metadataDetailsMutationFlag, setMetadataDetailsMutationFlag] =
    useState(false);
  useEffect(() => {
    if (datasetDetailsMutationFlag && metadataDetailsMutationFlag) {
      toast('Details updated successfully!');

      queryClient.invalidateQueries({
        queryKey: [`metadata_values_query_${id}`, `metadata_fields_list_${id}`],
      });

      getMetaDataListQuery.refetch();
      getDatasetMetadata.refetch();

      router.push(
        `/dashboard/organization/${params.organizationId}/dataset/${id}/edit/publish`
      );
    }
  }, [datasetDetailsMutationFlag, metadataDetailsMutationFlag]);

  const getMetaDataListQuery: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`metadata_fields_list_${id}`], () =>
      GraphQL(metadataQueryDoc, {
        filters: {
          model: 'DATASET',
          enabled: true,
        },
      })
    );

  const getDatasetMetadata: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`metadata_values_query_${id}`], () =>
      GraphQL(datasetMetadataQueryDoc, { filters: { id: id } })
    );

  const updateMetadataMutation = useMutation(
    (data: { UpdateMetadataInput: UpdateMetadataInput }) =>
      GraphQL(updateMetadataMutationDoc, data),
    {
      onSuccess: (data: any) => {
        // queryClient.invalidateQueries({
        //   queryKey: [`create_dataset_${'52'}`],
        // });

        setMetadataDetailsMutationFlag(!metadataDetailsMutationFlag);
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const updateDatasetMutation = useMutation(
    (data: { updateDatasetInput: UpdateDatasetInput }) =>
      GraphQL(updateDatasetMutationDoc, data),
    {
      onSuccess: (data: any) => {
        setDatasetDetailsMutationFlag(!datasetDetailsMutationFlag);
      },
      onError: (err: any) => {
        toast('Error:  ' + err.message.split(':')[0]);
      },
    }
  );

  const defaultValuesPrepFn = (metadataArray: Array<TypeDatasetMetadata>) => {
    let defaultVal: {
      [key: string]: string | number | undefined;
    } = {};

    metadataArray?.map((field) => {
      defaultVal[field.metadataItem.id] = field.value;
    });

    return defaultVal;
  };

  return (
    <>
      {getMetaDataListQuery?.isLoading ? (
        <LoadingPage />
      ) : (
        <Form
          onSubmit={(values) => {
            updateDatasetMutation.mutate({
              updateDatasetInput: {
                dataset: id,
                title: getDatasetMetadata?.data?.datasets[0]?.title,
                description: values.description,
                tags: [],
              },
            });

            updateMetadataMutation.mutate({
              UpdateMetadataInput: {
                dataset: id,
                metadata: [
                  ...Object.keys(values)
                    .filter(
                      (valueItem) =>
                        valueItem !== 'description' && valueItem !== 'tags'
                    )
                    .map((key) => {
                      return {
                        id: key,
                        value: values[key] || '',
                      };
                    }),
                ],
              },
            });
          }}
          formOptions={{
            resetOptions: {
              keepValues: true,
              keepDirtyValues: true,
            },
            defaultValues: defaultValuesPrepFn(
              getDatasetMetadata?.data?.datasets[0]?.metadata
            ),
          }}
        >
          <>
            <div className="flex flex-col gap-1">
              <Text variant="headingMd">Add Metadata</Text>
            </div>
            <div className="my-4">
              <Divider />
            </div>

            <div className="pt-3">
              <FormLayout>
                <Input
                  key="description"
                  multiline
                  name="description"
                  label={'Description'}
                  defaultValue={
                    getDatasetMetadata?.data?.datasets[0].description
                  }
                />

                <div className="flex flex-wrap">
                  <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
                    <Combobox name={'tags'} list={[]} label={'Tags'} />
                  </div>
                  <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"></div>
                </div>

                <div className="flex flex-wrap">
                  {getMetaDataListQuery?.data?.metadata?.length > 0 ? (
                    getMetaDataListQuery?.data?.metadata?.map(
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
                    )
                  ) : (
                    <></>
                  )}
                </div>

                {/* <FormLayout.Group>
                  <Select
                    name="update_frequency"
                    label="Update Frequency"
                    helpText="How often is this dataset updated?"
                    options={[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Monthly', value: 'monthly' },
                      { label: 'Yearly', value: 'yearly' },
                    ]}
                    placeholder="Select"
                    required
                    error="This field is required"
                    disabled={getMetaDataListQuery.isLoading}
                  />
                  <Select
                    name="language"
                    label="Language"
                    helpText="What language is this dataset in?"
                    options={[
                      { label: 'English', value: 'english' },
                      { label: 'Hindi', value: 'hindi' },
                      { label: 'Spanish', value: 'spanish' },
                      { label: 'French', value: 'french' },
                    ]}
                    placeholder="Select"
                    required
                    error="This field is required"
                    disabled={getMetaDataListQuery.isLoading}
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <Combobox
                    name="geo_list"
                    label="Geography"
                    // helpText="Which geography does this data belong to?"
                    placeholder="Search Locations"
                    list={[
                      {
                        label: 'India',
                        value: 'india',
                      },
                      {
                        label: 'USA',
                        value: 'usa',
                      },
                      {
                        label: 'UK',
                        value: 'uk',
                      },
                    ]}
                    displaySelected
                    required
                    error="This field is required"
                  />
                  <Combobox
                    name="tags_list"
                    label="Tags"
                    placeholder="Search Tags"
                    // helpText="Any other tags or keywords that can help people discover your dataset"
                    list={[
                      {
                        label: 'Health',
                        value: 'health',
                      },
                      {
                        label: 'Education',
                        value: 'education',
                      },
                      {
                        label: 'Agriculture',
                        value: 'agriculture',
                      },
                    ]}
                    displaySelected
                    required
                    error="This field is required"
                  />
                </FormLayout.Group> */}
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
      )}
    </>
  );
}
