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
  setList: (list: boolean) => void;
  setAccessModelId: (id: string | null) => void;
  accessModelId: string | null;
}

interface SchemaField {
  id?: string | number;
  fieldName?: string;
  label?: string;
  value?: string;
}

interface ComboResource {
  label: string;
  value: string;
  schema?: SchemaField[];
}

interface AccessModelResource {
  resource: string;
  fields: number[];
}

interface AccessModelFormData {
  dataset: string;
  name: string;
  description: string;
  type: string;
  resources: AccessModelResource[];
  accessModelId: string;
}

interface ModelResourceField {
  id: string | number;
  fieldName: string;
}

interface ModelResource {
  resource: { id: string; name: string };
  fields: ModelResourceField[];
}

function mapDatasetResourcesToCombo(
  resources: Array<{
    name: string;
    id: string;
    schema?: SchemaField[] | null;
  }>
): ComboResource[] {
  return resources.map((field) => ({
    label: field.name,
    value: field.id,
    schema: field.schema ?? undefined,
  }));
}

function mapAccessModelToFormState(
  accessModel: object,
  accessModelId: string,
  datasetId: string
): {
  formData: AccessModelFormData;
  selectedResources: ComboResource[];
  selectedFields: ComboResource[];
} {
  const name =
    'name' in accessModel && typeof accessModel.name === 'string'
      ? accessModel.name
      : '';
  const description =
    'description' in accessModel && typeof accessModel.description === 'string'
      ? accessModel.description
      : '';
  const type =
    'type' in accessModel && typeof accessModel.type === 'string'
      ? accessModel.type
      : 'PUBLIC';
  const modelResources = getModelResources(accessModel);

  const selectedResources = modelResources.map((resource) => ({
    label: resource.resource.name,
    value: resource.resource.id,
    schema: resource.fields.map((field) => ({
      label: field.fieldName,
      value: String(field.id),
    })),
  }));

  return {
    formData: {
      dataset: datasetId,
      name: name ?? '',
      description: description ?? '',
      type: type ?? 'PUBLIC',
      accessModelId,
      resources: modelResources.map((resource) => ({
        resource: resource.resource.id,
        fields: resource.fields.map((field) => +field.id),
      })),
    },
    selectedResources,
    selectedFields: selectedResources.map((resource) => ({
      label: resource.label,
      value: resource.value,
      schema: (resource.schema ?? []).map((field) => ({
        id: field.value,
        fieldName: field.label,
      })),
    })),
  };
}

function getModelResources(accessModel: object): ModelResource[] {
  if (
    !('modelResources' in accessModel) ||
    !Array.isArray(accessModel.modelResources)
  ) {
    return [];
  }

  return accessModel.modelResources.flatMap((resource) => {
    if (typeof resource !== 'object' || resource === null) {
      return [];
    }
    if (!('resource' in resource) || !('fields' in resource)) {
      return [];
    }
    const nested = resource.resource;
    if (
      typeof nested !== 'object' ||
      nested === null ||
      !('id' in nested) ||
      !('name' in nested) ||
      !Array.isArray(resource.fields)
    ) {
      return [];
    }

    return [
      {
        resource: {
          id: String(nested.id),
          name: String(nested.name),
        },
        fields: resource.fields.flatMap((field: unknown) => {
          if (typeof field !== 'object' || field === null) {
            return [];
          }
          if (!('id' in field) || !('fieldName' in field)) {
            return [];
          }
          const fieldId = field.id;
          return [
            {
              id:
                typeof fieldId === 'string' || typeof fieldId === 'number'
                  ? fieldId
                  : String(fieldId),
              fieldName: String(field.fieldName),
            },
          ];
        }),
      },
    ];
  });
}

const datasetResourcesQuery = graphql(`
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

const accessModelListQuery = graphql(`
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

const editaccessModel = graphql(`
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

const getAccessModelDetails = graphql(`
  query accessModel($accessModelId: UUID!) {
    accessModel(accessModelId: $accessModelId) {
      resourceFields {
        fields
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
  const ACCESS_MODEL_SAVE_ERROR_TOAST_ID = 'dataset-access-model-save-error';
  const getErrorMessage = (err: unknown, fallback: string) =>
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string' &&
    err.message.trim()
      ? err.message.trim()
      : fallback;

  useEffect(() => {
    setList(false);
  }, [setList]);

  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const { data, isLoading } = useQuery(
    [`resourcesList_${params.id}`],
    () =>
      GraphQL(
        datasetResourcesQuery,
        {
          [params.entityType]: params.entitySlug,
        },
        { datasetId: params.id }
      )
  );

  const {
    data: accessModelList,
    refetch: accessModelListRefetch,
  } = useQuery(
    [`accessModelList_${params.id}`],
    () =>
      GraphQL(
        accessModelListQuery,
        {
          [params.entityType]: params.entitySlug,
        },
        { datasetId: params.id }
      )
  );
  const {
    data: accessModelDetails,
    refetch: accessModelDetailsRefetch,
  } = useQuery(
    [`accessModelDetails${params.id}`],
    () =>
      GraphQL(
        getAccessModelDetails,
        {
          [params.entityType]: params.entitySlug,
        },
        { accessModelId: accessModelId }
      )
  );

  const [accessModelData, setAccessModelData] = useState<AccessModelFormData>({
    dataset: params.id,
    name: '',
    description: '',
    type: 'PUBLIC',
    resources: [],
    accessModelId: '',
  });
  const [previousAccessModelData, setPreviousAccessModelData] =
    useState(accessModelData);

  const [selectedResources, setSelectedResources] = useState<ComboResource[]>(
    []
  );
  const [, setShowSelectAll] = useState(false);

  const [availableResources, setAvailableResources] = useState<ComboResource[]>(
    []
  );

  const [selectedFields, setSelectedFields] = useState<ComboResource[]>([]);
  const [prevDatasetResources, setPrevDatasetResources] = useState(data);
  if (data !== prevDatasetResources) {
    setPrevDatasetResources(data);
    if (data) {
      setAvailableResources(
        mapDatasetResourcesToCombo(data.datasetResources)
      );
    }
  }

  const [prevAccessModelDetails, setPrevAccessModelDetails] =
    useState(accessModelDetails);
  const [prevAccessModelId, setPrevAccessModelId] = useState(accessModelId);
  if (
    accessModelDetails !== prevAccessModelDetails ||
    accessModelId !== prevAccessModelId
  ) {
    setPrevAccessModelDetails(accessModelDetails);
    setPrevAccessModelId(accessModelId);
    if (accessModelDetails?.accessModel && accessModelId) {
      const mapped = mapAccessModelToFormState(
        accessModelDetails.accessModel,
        accessModelId,
        params.id
      );
      setAccessModelData(mapped.formData);
      setPreviousAccessModelData(mapped.formData);
      setSelectedResources(mapped.selectedResources);
      setSelectedFields(mapped.selectedFields);
    }
  }

  useEffect(() => {
    if (accessModelDetails && accessModelDetails.accessModel && accessModelId) {
      accessModelDetailsRefetch();
    }
  }, [accessModelDetails, accessModelId, accessModelDetailsRefetch]);

  const handleAddResource = (resourceDetails: ComboResource[]) => {
    setSelectedResources(resourceDetails);
    setAvailableResources(resourceDetails);
    setSelectedFields(resourceDetails);
    const newResources = resourceDetails.map((resource) => ({
      resource: resource.value,
      fields: (resource.schema ?? []).map((field) => +String(field.id ?? 0)),
    }));

    setAccessModelData((prevData) => ({
      ...prevData,
      resources: newResources,
    }));

    if (resourceDetails.length === 0) {
      setAccessModelData((prevData) => ({
        ...prevData,
        resources: [],
      }));
    } else {
      setAccessModelData((prevData) => ({
        ...prevData,
        resources: [...prevData.resources],
      }));
    }

    handleSave({ ...accessModelData, resources: newResources });
  };

  const handleRemoveResource = (resourceId: string) => {
    setSelectedResources((prevResources) =>
      prevResources.filter((resource) => resource.value !== resourceId)
    );

    setSelectedFields((prevFields) =>
      prevFields.filter((field) => field.value.split('.')[0] !== resourceId)
    );

    const updatedResources = accessModelData.resources.filter(
      (resource) => resource.resource !== resourceId
    );

    setAccessModelData((prevData) => ({
      ...prevData,
      resources: updatedResources,
    }));

    handleSave({ ...accessModelData, resources: updatedResources });
  };
  const handleSelectAll = () => {
    const allResources =
      data?.datasetResources.map((resource) => ({
        label: resource.name,
        value: resource.id,
        schema: resource.schema.map((field) => ({
          label: field.fieldName,
          value: field.id.toString(),
        })),
      })) || [];

    setSelectedFields(allResources);
    setSelectedResources(allResources);
    setShowSelectAll(false);

    const updatedResources = allResources.map((resource) => ({
      resource: resource.value,
      fields: resource.schema.map((option) => parseInt(option.value, 10)),
    }));

    const updatedData = {
      ...accessModelData,
      resources: updatedResources,
    };

    setAccessModelData(updatedData);
    handleSave(updatedData);
  };

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (variables: { accessModelInput: EditAccessModelInput }) =>
      GraphQL(
        editaccessModel,
        {
          [params.entityType]: params.entitySlug,
        },
        variables
      ),
    {
      onSuccess: (res) => {
        accessModelDetailsRefetch();
        accessModelListRefetch();
        const edited = res?.editAccessModel;
        if (edited && 'id' in edited) {
          setAccessModelId(edited.id);
        }
        setPreviousAccessModelData(accessModelData);
      },
      onError: (err: unknown) => {
        toast(
          `Error: ${getErrorMessage(err, 'Unable to save access model right now.')}`,
          { id: ACCESS_MODEL_SAVE_ERROR_TOAST_ID }
        );
      },
    }
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSave = (updatedData: AccessModelFormData) => {
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

  const handleChange = (field: string, value: string) => {
    const updatedData = { ...accessModelData, [field]: value };
    setAccessModelData(updatedData);
  };

  return (
    <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
        <Button
          onClick={() => {
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
            <div className=" flex flex-col gap-6 p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Text variant="bodyLg">Select Resource</Text>
                <div className="flex items-center gap-3">
                  <Button
                    className=" h-fit w-fit"
                    size="medium"
                    onClick={() => {
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
                (item, index) => (
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
            <div className="flex flex-wrap  gap-6">
              <div className="w-full lg:w-4/5">
                <TextField
                  value={accessModelData.name}
                  onChange={(e) => handleChange('name', e)}
                  onBlur={() => handleSave(accessModelData)}
                  label="Access Type Name"
                  name="name"
                  required
                  requiredIndicator={true}
                  helpText="To know about best practices for naming Resources go to our User Guide"
                />
              </div>
              <Select
                className="w-full lg:w-1/6"
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

          <div className="flex flex-wrap items-end gap-6">
            <div className={cn('w-full lg:w-3/4', styles.combobox)}>
              <Combobox
                label={'Select Fields of the Resource'}
                list={availableResources}
                selectedValue={selectedFields}
                placeholder={`${selectedResources.length} resources selected`}
                name={''}
                helpText={
                  'Only Resources added will be part of this Access Type. After adding select the Fields and Rows to be included'
                }
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleAddResource(value);
                  }
                }}
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
          {selectedResources?.map((resourceId, index) => {
            const selectedResource = data?.datasetResources.find(
              (resource) => resource.id === resourceId.value
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
