'use client';

import { graphql } from '@/gql';
import {
  TypeDatasetMetadata,
  TypeMetadata,
  UpdateMetadataInput
} from '@/gql/generated/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
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

import { Loading } from '@/components/loading';
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
      <Form
        onSubmit={(values) => {
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
              description: values.description || '',
              tags: values.tags || [],
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
          <div className="pt-3">
            <FormLayout>
              <Input
                key="description"
                multiline
                name="description"
                label={'Description'}
                defaultValue={getDatasetMetadata?.data?.datasets[0].description}
              />

              <div className="flex flex-wrap">
                <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2">
                  <Combobox name={'tags'} list={[]} label={'Tags'} />
                </div>
                <div className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"></div>
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
