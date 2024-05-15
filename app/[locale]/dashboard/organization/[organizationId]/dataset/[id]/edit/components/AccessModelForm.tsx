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
  console.log(data);

  const [accessModelData, setAccessModelData] = useState({
    name: '',
    description: '',
    permission: '',
  });

  return (
    <div className=" rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
      <div className=" mb-6 flex flex-wrap justify-between gap-6">
        <div className="flex w-2/3  flex-wrap items-center gap-2">
          <Text>Access Type Name:</Text>
          <Select
            className=" w-2/3"
            labelHidden
            name={'Access Type Name'}
            options={[]}
            label={''}
          />
        </div>
        <Button
          onClick={(e) =>
            setAccessModelData({
              name: '',
              description: '',
              permission: '',
            })
          }
        >
          Add New Access Type
        </Button>
        <Button
          onClick={(e) => setQueryList(true)}
          kind="tertiary"
          className=" flex text-end"
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
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          <div className="text-center">
            <Button>Save Access Type</Button>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex  gap-6">
              <div className=" w-4/5">
                <TextField
                  value={accessModelData.name}
                  onChange={(e) => {
                    setAccessModelData((prevState) => ({
                      ...prevState,
                      name: e,
                    }));
                  }}
                  label="Access Type Name"
                  name="name"
                  required
                  helpText="To know about best practices for naming Resources go to our User Guide"
                />
              </div>
              <Select
                name={'permissions'}
                className=" w-1/6"
                options={[
                  {
                    label: 'Public',
                    value: 'PUBIC',
                  },
                  {
                    label: 'Protected',
                    value: 'PROTECTED',
                  },
                  {
                    label: 'Private',
                    value: 'PRIVATE',
                  },
                ]}
                label={'Permissions'}
                placeholder="Select"
                onChange={(e) => {
                  setAccessModelData((prevState) => ({
                    ...prevState,
                    permission: e,
                  }));
                }}
              />
            </div>
            <TextField
              value={accessModelData.description}
              onChange={(e) => {
                setAccessModelData((prevState) => ({
                  ...prevState,
                  description: e,
                }));
              }}
              label="Description"
              name="description"
              multiline={4}
            />
          </div>
          <div className=" flex flex-wrap items-center gap-5">
            <Select
              name={'permissions'}
              className=" w-4/5"
              options={
                data && data.datasetResources
                  ? data.datasetResources.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))
                  : []
              }
              label={'Select the Resources to be added to the Access Type'}
              placeholder="Select"
              onChange={(e) => {
                console.log(e);
              }}
              required
              helpText="Only Resources added will be part of this Access Type. After adding select the Fields and Rows to be included"
            />
            <div className="flex h-fit w-fit items-center gap-5">
              <Button kind="secondary">
                <span className="flex items-center gap-1">
                  <Text>Add</Text>
                  <Icon source={Icons.plus} size={24} />
                </span>
              </Button>
              <Button kind="secondary">
                <span className="flex items-center gap-1">
                  <Text>Select All</Text>
                  <Icon source={Icons.plus} size={24} />
                </span>
              </Button>
            </div>
          </div>
          <div>
            <Combobox
              name={''}
              list={[]}
              label={'Select Field of the resources'}
              displaySelected
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessModelForm;
