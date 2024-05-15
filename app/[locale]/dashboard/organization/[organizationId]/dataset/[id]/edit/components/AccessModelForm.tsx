import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  Divider,
  Icon,
  Select,
  Spinner,
  Text,
  TextField,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

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

const AccessModelForm: React.FC<AccessModelProps> = ({ setQueryList }) => {
  useEffect(() => {
    setQueryList(false);
  }, []);

  const params = useParams();
  const { data, isLoading } = useQuery([`resourcesList_${params.id}`], () =>
    GraphQL(datasetResourcesQuery, { datasetId: params.id })
  );

  const [accessModelData, setAccessModelData] = useState({
    name: '',
    description: '',
    permission: '',
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
  };

  const handleSelectAll = () => {
    const allResourceIds =
      data?.datasetResources.map((resource) => resource.id) || [];
    setSelectedResources(allResourceIds);
    setShowSelectAll(false);
  };

  console.log(selectedResources, data);

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
            setAccessModelData({ name: '', description: '', permission: '' })
          }
        >
          Add New Access Type
        </Button>
        {showSelectAll ? (
          <Button onClick={handleSelectAll} kind="tertiary">
            Select All
          </Button>
        ) : (
          <Button onClick={() => setShowSelectAll(true)} kind="tertiary">
            Show Select All
          </Button>
        )}
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
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          <div className="text-center">
            <Button>Save Access Type</Button>
          </div>
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
          <Select
            name={'permissions'}
            options={[
              { label: 'Public', value: 'PUBLIC' },
              { label: 'Protected', value: 'PROTECTED' },
              { label: 'Private', value: 'PRIVATE' },
            ]}
            label={'Permissions'}
            placeholder="Select"
            onChange={(e) =>
              setAccessModelData({ ...accessModelData, permission: e })
            }
          />
          <div className="flex flex-wrap items-center gap-5">
            <Select
              name={'permissions'}
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
          {selectedResources.map((resourceId, index) => (
            <div key={index} className="flex flex-wrap items-center gap-5">
              <Combobox
                name={''}
                list={[]}
                label={`Resource ${index + 1}`}
                displaySelected
              />
              <Button onClick={() => handleRemoveResource(resourceId)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessModelForm;
