import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  CreateFileResourceInput,
  SchemaUpdateInput,
  UpdateFileResourceInput,
} from '@/gql/generated/graphql';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from 'next-usequerystate';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Combobox,
  DataTable,
  Dialog,
  Divider,
  DropZone,
  Icon,
  IconButton,
  Select,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { createResourceFilesDoc } from './ResourceDropzone';
import { ResourceSchema, updateSchema } from './ResourceSchema';
import { ResourceMetadata } from './ResourceMetadata';

interface TListItem {
  label: string;
  value: string;
  description: string;
  dataset: any;
  fileDetails: any;
}

export const EditResource = ({ reload, data }: any) => {
  const params = useParams();

  const updateResourceDoc: any = graphql(`
    mutation updateFileResource($fileResourceInput: UpdateFileResourceInput!) {
      updateFileResource(fileResourceInput: $fileResourceInput) {
        __typename
        ... on TypeResource {
          id
          description
          name
        }
      }
    }
  `);

  const [resourceId, setResourceId] = useQueryState<any>('id', parseAsString);
  const [schema, setSchema] = React.useState([]);

  const { mutate, isLoading } = useMutation(
    (data: {
      fileResourceInput: UpdateFileResourceInput;
      isResetSchema: boolean;
    }) => GraphQL(updateResourceDoc, data),
    {
      onSuccess: (data, variables) => {
        toast('File changes saved', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
        if (variables.isResetSchema) {
          schemaMutation.mutate({
            resourceId: resourceId,
          });
        }
        reload();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const resetSchema: any = graphql(`
    mutation resetFileResourceSchema($resourceId: UUID!) {
      resetFileResourceSchema(resourceId: $resourceId) {
        ... on TypeResource {
          id
          schema {
            format
            description
            id
            fieldName
          }
        }
      }
    }
  `);

  const schemaMutation = useMutation(
    (data: { resourceId: string }) => GraphQL(resetSchema, data),
    {
      onSuccess: () => {
        schemaQuery.refetch();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const schemaQuery = useQuery<any>([`fetch_schema_${params.id}`], () =>
    GraphQL(fetchSchema, { datasetId: params.id })
  );

  const fetchSchema: any = graphql(`
    query datasetSchema($datasetId: UUID!) {
      datasetResources(datasetId: $datasetId) {
        schema {
          id
          fieldName
          format
          description
        }
        id
      }
    }
  `);

  const { mutate: modify } = useMutation(
    (data: { input: SchemaUpdateInput }) => GraphQL(updateSchema, data),
    {
      onSuccess: () => {
        schemaQuery.refetch();
        toast('Schema Updated Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const { mutate: transform } = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(createResourceFilesDoc, data),
    {
      onSuccess: (data: any) => {
        setResourceId(data.createFileResources[0].id);
        toast('Resource Added Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
        schemaQuery.refetch();
        reload();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const ResourceList: TListItem[] =
    data.map((item: any) => ({
      label: item.name,
      value: item.id,
      description: item.description,
      dataset: item.dataset?.pk,
      fileDetails: item.fileDetails,
    })) || [];

  const getResourceObject = (resourceId: string) => {
    return ResourceList.find((item) => item.value === resourceId);
  };

  const [resourceName, setResourceName] = React.useState(
    getResourceObject(resourceId)?.label
  );
  const [resourceDesc, setResourceDesc] = React.useState(
    getResourceObject(resourceId)?.description
  );

  const handleNameChange = (text: string) => {
    setResourceName(text);
  };
  const handleDescChange = (text: string) => {
    setResourceDesc(text);
  };

  React.useEffect(() => {
    setResourceName(getResourceObject(resourceId)?.label);
    setResourceDesc(getResourceObject(resourceId)?.description);

    //fix this later
  }, [JSON.stringify(ResourceList), resourceId]);

  const handleResourceChange = (e: any) => {
    setResourceId(e, { shallow: false });
    setResourceName(getResourceObject(e)?.label);
    setResourceDesc(getResourceObject(e)?.description);
  };

  const [file, setFile] = React.useState<File[]>([]);

  const dropZone = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      transform({
        fileResourceInput: {
          dataset: params.id,
          files: acceptedFiles,
        },
      });
      setFile((files) => [...files, ...acceptedFiles]);
    },
    []
  );

  const uploadedFile = file.length > 0 && (
    <div className="flex flex-col gap-2 p-4">
      {file.map((file, index) => {
        return <div key={index}>{file.name}</div>;
      })}
    </div>
  );


  const onDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      mutate({
        fileResourceInput: {
          id: resourceId,
          file: acceptedFiles[0],
        },
        isResetSchema: true,
      });
    },
    []
  );
  const fileInput = (
    <div className="flex">
      <Text className="break-all">
        {getResourceObject(resourceId)?.fileDetails.file.name.replace(
          'resources/',
          ''
        )}{' '}
      </Text>
    </div>
  );

  const listViewFunction = () => {
    setResourceId('');
  };

  const saveResource = () => {
    mutate({
      fileResourceInput: {
        id: resourceId,
        description: resourceDesc || '',
        name: resourceName || '',
      },
      isResetSchema: false,
    });
    if (schema.length > 0) {
      const updatedScheme = schema.map((item) => {
        const { fieldName, ...rest } = item as any;
        return rest;
      });
      modify({
        input: {
          resource: resourceId,
          updates: updatedScheme,
        },
      });
    }
  };

  return (
    <div className=" bg-basePureWhite px-6 py-8">
      <div className="flex items-center gap-6">
        <Text>Resource Name :</Text>
        <div className=" w-3/6">
          <Select
            label="Resource List"
            labelHidden
            options={ResourceList}
            value={getResourceObject(resourceId)?.value}
            onChange={(e) => {
              handleResourceChange(e);
            }}
            name="Resource List"
          />
        </div>
        <Dialog>
          <Dialog.Trigger>
            <Button className=" mx-5">ADD NEW RESOURCE</Button>
          </Dialog.Trigger>
          <Dialog.Content title={'Add New Resource'}>
            <DropZone name="file_upload" allowMultiple={true} onDrop={dropZone}>
              {uploadedFile}
              {file.length === 0 && <DropZone.FileUpload />}
            </DropZone>
          </Dialog.Content>
        </Dialog>
        <Button
          className=" w-1/5 justify-end"
          size="medium"
          kind="tertiary"
          variant="interactive"
          onClick={listViewFunction}
        >
          <div className="flex items-center gap-2">
            <Text color="interactive">
              Go back to <br />
              Resource List
            </Text>
            <Icon source={Icons.cross} color="interactive" />
          </div>
        </Button>
      </div>
      <Divider className="mb-8 mt-6" />
      <div className="flex justify-center">
        <Button className="w-1/3" loading={isLoading} onClick={saveResource}>
          SAVE RESOURCE
        </Button>
      </div>
      <div className="mt-8 flex items-stretch gap-10">
        <div className="flex w-4/5 flex-col">
          <div className="mb-10 flex gap-6 ">
            <div className="w-2/3">
              <TextField
                value={resourceName}
                onChange={(text) => handleNameChange(text)}
                label="Resource Name"
                name="a"
                required
                helpText="To know about best practices for naming Resources go to our User Guide"
              />
            </div>
            <div className="w-1/3">
              <Combobox
                name="geo_list"
                label="Data Standard Followed"
                placeholder="Search Locations"
                list={[
                  {
                    label: 'v3',
                    value: 'v3',
                  },
                ]}
                displaySelected
                required
                error="This field is required"
              />
            </div>
          </div>
          <TextField
            value={resourceDesc}
            onChange={(text) => handleDescChange(text)}
            label="Resource Description"
            name="resourceDesc"
            multiline={4}
          />
        </div>
        <div className="flex w-1/5 flex-col justify-between border-1 border-solid border-baseGraySlateSolid7 p-3 ">
          {fileInput}

          <DropZone
            name="file_upload"
            allowMultiple={false}
            onDrop={onDrop}
            className="w-full border-none bg-baseGraySlateSolid5"
            label="Change file for this resource"
          >
            <DropZone.FileUpload />
          </DropZone>
        </div>
      </div>
      {/* <div className=" my-8 flex items-center gap-4 border-1 border-solid border-baseGraySlateSolid7 px-7 py-4 ">
        <div className="flex w-1/6 items-center justify-center gap-1">
          <Checkbox name="checkbox" onChange={() => console.log('hi')}>
            Enabel Preview
          </Checkbox>
          <Icon source={Icons.info} />
        </div>

        <div className="h-[70px] w-[2px] bg-baseGraySlateSolid7"></div>

        <div className="flex items-center gap-5 px-8">
          <Text>
            Select Rows to be <br /> shown in the Preview
          </Text>
          <Combobox
            name="geo_list"
            label="From Row Number"
            placeholder="Search Locations"
            list={[
              {
                label:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
                value:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
              },
              {
                label:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
                value:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
              },
            ]}
            displaySelected
            required
            error="This field is required"
          />
          <Combobox
            name="to_row_number"
            label="To Row Number"  
            placeholder="Search Locations"
            list={[
              {
                label:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
                value:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
              },
              {
                label:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
                value:
                  'Temperature and Precipitation (2011) Shimla Himachal Pradesh.xls',
              },
            ]}
            displaySelected
            required
            error="This field is required"
          />
        </div>
        <div className="h-[70px] w-[2px] bg-baseGraySlateSolid7"></div>
        <div className="flex w-1/6 justify-center ">
          <Text>See Preview</Text>
        </div>
      </div>*/}
      <ResourceMetadata/>
      <div className="my-8">
        <div className="flex flex-wrap justify-between">
          <Text>Fields in the Resource</Text>
          <Button
            size="medium"
            kind="tertiary"
            variant="basic"
            onClick={() =>
              schemaMutation.mutate({
                resourceId: resourceId,
              })
            }
          >
            <div className="flex items-center gap-1">
              <Text>Reset Fields</Text>{' '}
              <Icon source={Icons.info} color="interactive" />
            </div>
          </Button>
        </div>
        <Text variant="headingXs" as="span" fontWeight="regular">
           The Field settings apply to the Resource on a master level and can not
           be changed in Access Models.
        </Text>
        {schemaQuery.isLoading || schemaMutation.isLoading ? (
          <div className=" mt-8 flex justify-center">
            <Spinner size={30} />
          </div>
        ) : resourceId && schemaQuery.data?.datasetResources?.filter(
            (item: any) => item.id === resourceId ).length > 0 ? (
               <ResourceSchema
                  setSchema={setSchema}
                  data={schemaQuery.data?.datasetResources?.filter(
                    (item: any) => item.id === resourceId)[0]?.schema}
                />
          ) : (
             <div className="my-8 flex justify-center"> Click on Reset Fields </div>
        )}
      </div>
    </div>
  );
};
