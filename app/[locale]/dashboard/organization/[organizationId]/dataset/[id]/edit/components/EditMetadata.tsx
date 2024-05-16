'use client';

import LoadingPage from '@/app/[locale]/dashboard/loading';
import { graphql } from '@/gql';
import { TypeMetadata, UpdateMetadataInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button, Divider, Form, FormLayout, Input, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';

const metadataQueryDoc: any = graphql(`
  query MetaDataQuery {
    metadata {
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
  defaultValues,
}: {
  id: string;
  defaultValues: any;
}) {
  // const submitRef = React.useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const params = useParams();

  const getMetaDataQueryRes: { data: any; isLoading: boolean } = useQuery(
    [`dataset_meta_${id}`],
    () => GraphQL(metadataQueryDoc, [])
  );

  const updateMetadataMutation = useMutation(
    (data: { UpdateMetadataInput: UpdateMetadataInput }) =>
      GraphQL(updateMetadataMutationDoc, data),
    {
      onSuccess: (data: any) => {
        // queryClient.invalidateQueries({
        //   queryKey: [`create_dataset_${'52'}`],
        // });

        router.push(
          `/dashboard/organization/${params.organizationId}/dataset/${params.id}/edit/publish`
        );
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  return (
    <>
      {getMetaDataQueryRes?.isLoading ? (
        <LoadingPage />
      ) : (
        <Form
          onSubmit={(values) => {
            updateMetadataMutation.mutate({
              UpdateMetadataInput: {
                dataset: id,
                metadata: [
                  ...Object.keys(values).map((key) => {
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
            defaultValues: defaultValues,
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
                {getMetaDataQueryRes?.data?.metadata?.length > 0 ? (
                  getMetaDataQueryRes?.data?.metadata
                    ?.filter((fieldItem: TypeMetadata) => fieldItem.enabled)
                    ?.map((metadataFormItem: TypeMetadata) => {
                      if (metadataFormItem.dataType === 'STRING') {
                        return (
                          <Input
                            key={metadataFormItem.id}
                            name={metadataFormItem.id}
                            label={metadataFormItem.label}
                            disabled={
                              getMetaDataQueryRes.isLoading ||
                              !metadataFormItem.enabled
                            }
                          />
                        );
                      }
                      return null;
                    })
                ) : (
                  <>No Metadata Fields!!</>
                )}
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
                    disabled={getMetaDataQueryRes.isLoading}
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
                    disabled={getMetaDataQueryRes.isLoading}
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
