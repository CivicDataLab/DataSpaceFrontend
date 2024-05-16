import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { AccessModelInput, AccessTypes } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Divider,
  Icon,
  Select,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import ResourceSelector from './ResourceSelector';

interface AccessModelProps {
  setQueryList: any;
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

const createAccessModel: any = graphql(`
  mutation createAccessModel($accessModelInput: AccessModelInput!) {
    createAccessModel(accessModelInput: $accessModelInput) {
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

const AccessModelForm: React.FC<AccessModelProps> = ({ setQueryList }) => {
  useEffect(() => {
    setQueryList(false);
  }, []);

  const params = useParams();
  const { data, isLoading } = useQuery([`resourcesList_${params.id}`], () =>
    GraphQL(datasetResourcesQuery, { datasetId: params.id })
  );

  const [accessModelData, setAccessModelData] = useState({
    dataset: params.id,
    name: '',
    description: '',
    type: '',
    resources: [],
  });
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showSelectAll, setShowSelectAll] = useState(false);
  const [availableResources, setAvailableResources] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setAvailableResources(
        data.datasetResources.filter(
          (resource) => !selectedResources.includes(resource.id)
        )
      );
    }
  }, [data, selectedResources]);

  const [resId, setResId] = useState('');

  // Inside handleAddResource function
  const handleAddResource = (resourceId: string) => {
    if (resourceId !== '') {
      setSelectedResources((prev) => [...prev, resourceId]);
      setResId('');
      setAvailableResources((prev) =>
        prev.filter((item) => item.id !== resourceId)
      ); // Filter out the selected resource
    }
  };

  const handleRemoveResource = (resourceId: string) => {
    setSelectedResources((prev) => prev.filter((id) => id !== resourceId));
    setResId('');
    setAccessModelData((prevData: any) => ({
      ...prevData,
      resources: prevData.resources.filter(
        (resource: any) => resource.resource !== resourceId
      ),
    }));
  };

  const handleSelectAll = () => {
    const allResourceIds =
      data?.datasetResources.map((resource) => resource.id) || [];
    setSelectedResources(allResourceIds);
    setShowSelectAll(false);
  };

  const { mutate, isLoading: mutationLoading } = useMutation(
    (data: { accessModelInput: AccessModelInput }) =>
      GraphQL(createAccessModel, data),
    {
      onSuccess: () => {
        toast('Access Model Saved');
        setQueryList(true);
      },
      onError: (err: any) => {
        toast(`Received ${err} during access model saving`);
      },
    }
  );

  return (
    <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
      <div className="mb-6 flex flex-wrap justify-between gap-6">
        <div className="flex w-2/3 flex-wrap items-center gap-2">
          <Text>Access Type Name:</Text>
          <Select
            className="w-2/3"
            labelHidden
            name={'Access Type Name'}
            options={[]}
            label={''}
          />
        </div>
        <Button
          onClick={(e) =>
            setAccessModelData({
              dataset: params.id,
              name: '',
              description: '',
              type: '',
              resources: [],
            })
          }
        >
          Add New Access Type
        </Button>

        <Button
          onClick={(e) => setQueryList(true)}
          kind="tertiary"
          className="flex text-end"
        >
          <span className="flex items-center gap-2">
            <Text color="interactive">
              Go back to <br />
              Resource List
            </Text>
            <Icon source={Icons.cross} color="interactive" size={24} />
          </span>
        </Button>
      </div>
      <Divider />
      {isLoading || mutationLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          <div className="text-center">
            <Button
              onClick={() =>
                mutate({
                  accessModelInput: {
                    name: accessModelData.name,
                    resources: accessModelData.resources,
                    dataset: accessModelData.dataset,
                    description: accessModelData.description,
                    type: accessModelData.type as AccessTypes,
                  },
                })
              }
            >
              Save Access Type
            </Button>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex  gap-6">
              <div className=" w-4/5">
                <TextField
                  value={accessModelData.name}
                  onChange={(e) =>
                    setAccessModelData({ ...accessModelData, name: e })
                  }
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
                placeholder="Select"
                onChange={(e) =>
                  setAccessModelData({ ...accessModelData, type: e })
                }
              />
            </div>
            <TextField
              value={accessModelData.description}
              onChange={(e) =>
                setAccessModelData({
                  ...accessModelData,
                  description: e,
                })
              }
              label="Description"
              name="description"
              multiline={4}
            />
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Select
              name={'resourceSelection'}
              className="w-4/5"
              options={
                availableResources.length > 0
                  ? [
                      { label: 'Select', value: '' },
                      ...availableResources.map((item) => ({
                        label: item.name,
                        value: item.id,
                      })),
                    ]
                  : [{ label: 'Select', value: '' }] // Render only 'Select' when no resources are available
              }
              label={'Select the Resources to be added to the Access Type'}
              onChange={(e) => setResId(e)}
              required
              value={resId}
              helpText="Only Resources added will be part of this Access Type. After adding select the Fields and Rows to be included"
            />

            <div className="flex h-fit w-fit items-center gap-5">
              <Button onClick={() => handleAddResource(resId)} kind="secondary">
                <span className="flex items-center gap-1">
                  <Text>Add</Text>
                  <Icon source={Icons.plus} size={24} />
                </span>
              </Button>
              <Button onClick={handleSelectAll} kind="secondary">
                <span className="flex items-center gap-1">
                  <Text>Select All</Text>
                  <Icon source={Icons.plus} size={24} />
                </span>
              </Button>
            </div>
          </div>
          {selectedResources.map((resourceId, index) => {
            const selectedResource = data?.datasetResources.find(
              (resource) => resource.id === resourceId
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
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccessModelForm;
