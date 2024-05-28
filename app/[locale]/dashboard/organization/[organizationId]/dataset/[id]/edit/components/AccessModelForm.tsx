import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { AccessTypes, EditAccessModelInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  Divider,
  Icon,
  Select,
  Sheet,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import styles from '../edit.module.scss';
import ResourceSelector from './ResourceSelector';

interface AccessModelProps {
  setList: any;
  setAccessModelId: any;
  accessModelId: any;
}

const datasetResourcesQuery: any = graphql(`
  query resources($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      type
      name
      description
      schema {
        id
        fieldName
      }
    }
  }
`);

const accessModelListQuery: any = graphql(`
  query accessModelResources($datasetId: UUID!) {
    accessModelResources(datasetId: $datasetId) {
      id
      name
      description
      type
      created
      modified
    }
  }
`);

const editaccessModel: any = graphql(`
  mutation editAccessModel($accessModelInput: EditAccessModelInput!) {
    editAccessModel(accessModelInput: $accessModelInput) {
      __typename
      ... on TypeAccessModel {
        id
        description
        name
        type
      }
    }
  }
`);

const getAccessModelDetails: any = graphql(`
  query accessModel($accessModelId: UUID!) {
    accessModel(accessModelId: $accessModelId) {
      modelResources {
        fields {
          id
          fieldName
        }
        resource {
          id
          name
        }
      }
      id
      name
      type
      description
      created
      modified
    }
  }
`);

const AccessModelForm: React.FC<AccessModelProps> = ({
  setList,
  setAccessModelId,
  accessModelId,
}) => {
  useEffect(() => {
    setList(false);
  }, []);

  const params = useParams();
  const { data, isLoading }: { data: any; isLoading: boolean } = useQuery(
    [`resourcesList_${params.id}`],
    () => GraphQL(datasetResourcesQuery, { datasetId: params.id })
  );

  const {
    data: accessModelList,
    isLoading: accessModelListLoading,
    refetch: accessModelListRefetch,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`accessModelList_${params.id}`],
    () => GraphQL(accessModelListQuery, { datasetId: params.id })
  );
  const {
    data: accessModelDetails,
    refetch: accessModelDetailsRefetch,
    isLoading: accessModelDetailsLoading,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`accessModelDetails${params.id}`],
    () => GraphQL(getAccessModelDetails, { accessModelId: accessModelId })
  );

  const [accessModelData, setAccessModelData] = useState({
    dataset: params.id,
    name: '',
    description: '',
    type: 'PUBLIC',
    resources: [],
    accessModelId: '',
  });
  const [previousAccessModelData, setPreviousAccessModelData] =
    useState(accessModelData);

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showSelectAll, setShowSelectAll] = useState(false);

  const [availableResources, setAvailableResources] = useState<
    { label: string; value: string; schema: [] }[]
  >([]);

  const [selectedFields, setSelectedFields] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (data) {
      setAvailableResources(
        data.datasetResources.map((field: any) => ({
          label: field.name,
          value: field.id,
          schema: field.schema,
        }))
      );
    }
  }, [data, selectedResources]);

  useEffect(() => {
    if (accessModelDetails && accessModelDetails.accessModel && accessModelId) {
      const { name, description, type, modelResources } =
        accessModelDetails.accessModel;

      accessModelDetailsRefetch();
      // Update accessModelData with the received data
      const newData = {
        dataset: params.id,
        name: name,
        description: description,
        type: type,
        accessModelId: accessModelId,
        resources: modelResources.map((resource: any) => ({
          resource: resource.resource.id,
          fields: resource.fields.map((field: any) => +field.id),
        })),
      };

      setAccessModelData(newData);
      setPreviousAccessModelData(newData);

      // Update selectedResources and selectedFields based on modelResources
      const selectedResourcesIds = modelResources.map((resource: any) => ({
        label: resource.resource.name,
        value: resource.resource.id,
        schema: resource.fields.map((field: any) => ({
          label: field.fieldName,
          value: field.id,
        })),
      }));

      setSelectedResources(selectedResourcesIds);

      const selectedFieldsIds = selectedResourcesIds.map((resource: any) => ({
        label: resource.label,
        value: resource.value,
        schema: resource.schema.map((field: any) => ({
          id: field.id,
          fieldName: field.fieldName,
        })),
      }));
      setSelectedFields(selectedFieldsIds);
    }
  }, [accessModelDetails, accessModelId]);

  const handleAddResource = (resourceDetails: any) => {
    setSelectedResources(resourceDetails);
    setAvailableResources(resourceDetails); // Filter out the selected resource
    setSelectedFields(resourceDetails);
    const newResources = resourceDetails.map((resource: any) => ({
      resource: resource.value,
      fields: resource.schema.map((field: any) => +field.id),
    }));

    setAccessModelData((prevData: any) => ({
      ...prevData,
      resources: newResources,
    }));

    if (resourceDetails.length === 0) {
      setAccessModelData((prevData: any) => ({
        ...prevData,
        resources: [],
      }));
    } else {
      setAccessModelData((prevData: any) => ({
        ...prevData,
        resources: [...prevData.resources],
      }));
    }

    handleSave({ ...accessModelData, resources: newResources });
  };

  const handleRemoveResource = (resourceId: any) => {
    // Filter out the selected resource from selectedResources
    setSelectedResources((prevResources) =>
      prevResources.filter((resource: any) => resource.value !== resourceId)
    );

    // Filter out the selected fields associated with the removed resource
    setSelectedFields((prevFields) =>
      prevFields.filter((field) => field.value.split('.')[0] !== resourceId)
    );

    // Remove the corresponding resource from accessModelData.resources
    const updatedResources = accessModelData.resources.filter(
      (resource: any) => resource.resource !== resourceId
    );

    setAccessModelData((prevData: any) => ({
      ...prevData,
      resources: updatedResources,
    }));

    handleSave({ ...accessModelData, resources: updatedResources });
  };
  const handleSelectAll = () => {
    const allResources =
      data?.datasetResources.map((resource: any) => ({
        label: resource.name,
        value: resource.id,
        schema: resource.schema.map((field: any) => ({
          label: field.fieldName,
          value: field.id.toString(), // Ensure ID is a string for Combobox
        })),
      })) || [];

    setSelectedFields(allResources);
    setSelectedResources(allResources);
    setShowSelectAll(false);

    const updatedResources = allResources.map((resource: any) => ({
      resource: resource.value,
      fields: resource.schema.map((option: any) => parseInt(option.value, 10)), // Convert to integer
    }));

    const updatedData = {
      ...accessModelData,
      resources: updatedResources,
    };

    setAccessModelData(updatedData);
    handleSave(updatedData);
  };

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (data: { accessModelInput: EditAccessModelInput }) =>
      GraphQL(editaccessModel, data),
    {
      onSuccess: (res: any) => {
        // toast('Access Model Saved');
        accessModelDetailsRefetch();
        accessModelListRefetch();
        setAccessModelId(res?.editAccessModel?.id);
        setPreviousAccessModelData(accessModelData);
      },
      onError: (err: any) => {
        toast(`Received ${err} during access model saving`);
      },
    }
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSave = (updatedData: any) => {
    if (
      JSON.stringify(updatedData) !== JSON.stringify(previousAccessModelData)
    ) {
      mutate({
        accessModelInput: {
          name: updatedData.name,
          dataset: params.id,
          description: updatedData.description,
          type: updatedData.type as AccessTypes,
          resources: updatedData.resources,
          accessModelId: accessModelId || null,
        },
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...accessModelData, [field]: value };
    setAccessModelData(updatedData);
  };

  return (
    <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
        <Button
          onClick={(e) => {
            setList(true);
            setAccessModelId('');
          }}
          kind="tertiary"
          className="flex text-start"
        >
          <span className="flex items-center gap-2">
            <Icon source={Icons.back} color="interactive" size={24} />
            <Text color="interactive">Access Model Listing</Text>
          </span>
        </Button>
        <Sheet open={isSheetOpen}>
          <Sheet.Trigger>
            <Button onClick={() => setIsSheetOpen(true)}>
              Select Access Type{' '}
            </Button>
          </Sheet.Trigger>
          <Sheet.Content side="bottom">
            <div className=" flex  flex-col gap-6 p-10">
              <div className="flex items-center justify-between">
                <Text variant="bodyLg">Select Resource</Text>
                <div className="flex items-center gap-3">
                  <Button
                    className=" h-fit w-fit"
                    size="medium"
                    onClick={(e) => {
                      setAccessModelData({
                        dataset: params.id,
                        name: '',
                        description: '',
                        type: '',
                        resources: [],
                        accessModelId: '',
                      });
                      setAccessModelId('');
                      setSelectedResources([]);
                      setAvailableResources([]);
                      setSelectedFields([]);

                      setIsSheetOpen(false);
                    }}
                  >
                    Add New Access Type
                  </Button>

                  <Button kind="tertiary" onClick={() => setIsSheetOpen(false)}>
                    <Icon source={Icons.cross} size={24} />
                  </Button>
                </div>
              </div>
              {accessModelList?.accessModelResources.map(
                (item: any, index: any) => (
                  <div
                    key={index}
                    className={`rounded-1 border-1 border-solid border-baseGraySlateSolid6 px-6 py-3 ${accessModelId === item.id ? ' bg-baseGraySlateSolid5' : ''}`}
                  >
                    <Button
                      kind={'tertiary'}
                      className="flex w-full justify-start"
                      disabled={accessModelId === item.id}
                      onClick={() => {
                        setAccessModelId(item.id);
                        setIsSheetOpen(false);
                      }}
                    >
                      {item.name}
                    </Button>
                  </div>
                )
              )}
            </div>
          </Sheet.Content>
        </Sheet>
      </div>
      <Divider />
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          <div className="flex justify-end gap-2">
            <Text color="highlight">Auto Save </Text>
            {editMutationLoading ? (
              <Spinner />
            ) : (
              <Icon source={Icons.checkmark} />
            )}
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex  gap-6">
              <div className=" w-4/5">
                <TextField
                  value={accessModelData.name}
                  onChange={(e) => handleChange('name', e)}
                  onBlur={() => handleSave(accessModelData)}
                  label="Access Type Name"
                  name="name"
                  required
                  helpText="To know about best practices for naming Resources go to our User Guide"
                />
              </div>
              <Select
                className=" w-1/6"
                name={'permissions'}
                options={[
                  { label: 'Public', value: 'PUBLIC' },
                  { label: 'Protected', value: 'PROTECTED' },
                  { label: 'Private', value: 'PRIVATE' },
                ]}
                label={'Permissions'}
                defaultValue={'PUBLIC'}
                value={accessModelData.type}
                placeholder="Select"
                onChange={(e) => handleChange('type', e)}
                onBlur={() => handleSave(accessModelData)}
              />
            </div>
            <TextField
              value={accessModelData.description}
              onChange={(e) => handleChange('description', e)}
              onBlur={() => handleSave(accessModelData)}
              label="Description"
              name="description"
              multiline={4}
            />
          </div>

          <div className="flex items-end gap-6">
            <div className={cn(' w-3/4', styles.combobox)}>
              <Combobox
                // displaySelected
                label={'Select Fields of the Resource'}
                list={availableResources}
                selectedValue={selectedFields}
                placeholder={`${selectedResources.length} resources selected`}
                name={''}
                helpText={
                  'Only Resources added will be part of this Access Type. After adding select the Fields and Rows to be included'
                }
                onChange={(e: any) => handleAddResource(e)}
              />
            </div>

            <div className="flex h-fit w-fit items-center gap-5">
              <Button
                onClick={handleSelectAll}
                kind="secondary"
                className="h-fit w-fit"
              >
                <span className="flex items-center gap-1">
                  <Text variant="bodySm">Add All Resources</Text>
                  <Icon source={Icons.plus} size={24} />
                </span>
              </Button>
            </div>
          </div>
          {selectedResources?.map((resourceId: any, index) => {
            const selectedResource = data?.datasetResources.find(
              (resource: any) => resource.id === resourceId.value
            );

            if (!selectedResource || !selectedResource.schema) {
              return null;
            }

            return (
              <ResourceSelector
                key={index}
                selectedResource={selectedResource}
                handleRemoveResource={handleRemoveResource}
                accessModelData={accessModelData}
                setAccessModelData={setAccessModelData}
                handleSave={handleSave}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccessModelForm;
