import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CreateFileResourceInput,
  SchemaUpdateInput,
  UpdateFileResourceInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'next-usequerystate';
import {
  Button,
  Checkbox,
  Combobox,
  Dialog,
  Divider,
  DropZone,
  Icon,
  Select,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { TListItem } from '../page-layout';
import {
  createResourceFilesDoc,
  fetchSchema,
  resetSchema,
  updateResourceDoc,
  updateSchema,
} from './query';
import { ResourceSchema } from './ResourceSchema';

interface EditProps {
  refetch: () => void;
  list: TListItem[];
}

export const EditResource = ({ refetch, list }: EditProps) => {
  const params = useParams();

  const [resourceId, setResourceId] = useQueryState<any>('id', parseAsString);
  const [schema, setSchema] = React.useState([]);

  const updateResourceMutation = useMutation(
    (data: {
      fileResourceInput: UpdateFileResourceInput;
      isResetSchema: boolean;
    }) =>
      GraphQL(
        updateResourceDoc,
        {
          // Entity Headers if present
        },
        data
      ),
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
        refetch();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const schemaMutation = useMutation(
    (data: { resourceId: string }) =>
      GraphQL(
        resetSchema,
        {
          // Entity Headers if present
        },
        data
      ),
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
    GraphQL(
      fetchSchema,
      {
        // Entity Headers if present
      },
      { datasetId: params.id }
    )
  );

  const updateSchemaMutation = useMutation(
    (data: { input: SchemaUpdateInput }) =>
      GraphQL(
        updateSchema,
        {
          // Entity Headers if present
        },
        data
      ),
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

  const createResourceMutation = useMutation(
    (data: { fileResourceInput: CreateFileResourceInput }) =>
      GraphQL(
        createResourceFilesDoc,
        {
          // Entity Headers if present
        },
        data
      ),
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
        refetch();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const getResourceObject = (resourceId: string) => {
    return list.find((item: TListItem) => item.value === resourceId);
  };

  const [resourceName, setResourceName] = React.useState(
    getResourceObject(resourceId)?.label
  );
  const [resourceDesc, setResourceDesc] = React.useState(
    getResourceObject(resourceId)?.description
  );
  const [previewEnable, setPreviewEnable] = useState(true);

  const [previewDetails, setPreviewDetails] = useState({
    startEntry: 0,
    endEntry: 0,
    isAllEntries: true,
  });

  React.useEffect(() => {
    setResourceName(getResourceObject(resourceId)?.label);
    setResourceDesc(getResourceObject(resourceId)?.description);
    setPreviewEnable(getResourceObject(resourceId)?.previewEnabled ?? true);
    setPreviewDetails({
      startEntry: getResourceObject(resourceId)?.previewDetails.startEntry ?? 0,
      endEntry: getResourceObject(resourceId)?.previewDetails.endEntry ?? 0,
      isAllEntries:
        getResourceObject(resourceId)?.previewDetails.isAllEntries ?? true,
    });

    //fix this later
  }, [JSON.stringify(list), resourceId]);

  const handleResourceChange = (e: any) => {
    setResourceId(e, { shallow: false });
    setResourceName(getResourceObject(e)?.label);
    setResourceDesc(getResourceObject(e)?.description);
  };

  const [file, setFile] = React.useState<File[]>([]);

  const dropZone = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      createResourceMutation.mutate({
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
      updateResourceMutation.mutate({
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
        {getResourceObject(resourceId)?.fileDetails?.file.name.replace(
          'resources/',
          ''
        )}{' '}
      </Text>
    </div>
  );

  const listViewFunction = () => {
    setResourceId('');
  };

  const handlePreviewDetailsChange = (
    field: string,
    value: string | boolean
  ) => {
    if (field === 'isAllEntries' && value) {
      setPreviewDetails({
        startEntry: 0,
        endEntry: 0,
        isAllEntries: true,
      });
    } else {
      setPreviewDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  const saveResource = () => {
    updateResourceMutation.mutate({
      fileResourceInput: {
        id: resourceId,
        description: resourceDesc || '',
        name: resourceName || '',
        previewEnabled: previewEnable,
        previewDetails: {
          startEntry: +previewDetails.startEntry || 0,
          endEntry: +previewDetails.endEntry || 0,
          isAllEntries: previewDetails.isAllEntries,
        },
      },
      isResetSchema: false,
    });
    if (schema.length > 0) {
      const updatedScheme = schema.map((item) => {
        const { fieldName, ...rest } = item as any;
        return rest;
      });
      updateSchemaMutation.mutate({
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
            options={list}
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
        <Button
          className="w-1/3"
          loading={updateResourceMutation.isLoading}
          onClick={saveResource}
        >
          SAVE RESOURCE
        </Button>
      </div>
      <div className="mt-8 flex items-stretch gap-10">
        <div className="flex w-4/5 flex-col">
          <div className="mb-10 flex gap-6 ">
            <div className="w-2/3">
              <TextField
                value={resourceName}
                onChange={(text) => setResourceName(text)}
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
            key={resourceId}
            value={resourceDesc}
            onChange={(text) => setResourceDesc(text)}
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
      <div className="my-8 flex items-center gap-8 align-middle">
        <Checkbox
          name={'previewEnabled'}
          checked={previewEnable}
          onChange={() => setPreviewEnable(!previewEnable)}
        >
          Preview Enabled
        </Checkbox>

        {previewEnable && (
          <>
            <Checkbox
              name={'isAllEntries'}
              checked={previewDetails.isAllEntries}
              onChange={() =>
                handlePreviewDetailsChange(
                  'isAllEntries',
                  !previewDetails.isAllEntries
                )
              }
            >
              Show all entries
            </Checkbox>
            {!previewDetails.isAllEntries && (
              <>
                <TextField
                  value={previewDetails.startEntry.toString()}
                  label="Start Entry"
                  name="startEntry"
                  onChange={(value) =>
                    handlePreviewDetailsChange('startEntry', value)
                  }
                  type="number"
                />
                <TextField
                  value={previewDetails.endEntry.toString()}
                  label="End Entry"
                  name="endEntry"
                  onChange={(value) =>
                    handlePreviewDetailsChange('endEntry', value)
                  }
                  type="number"
                />
              </>
            )}
          </>
        )}
      </div>
      <div className="my-4">
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
        ) : resourceId &&
          schemaQuery.data?.datasetResources?.filter(
            (item: any) => item.id === resourceId
          ).length > 0 ? (
          <ResourceSchema
            setSchema={setSchema}
            data={
              schemaQuery.data?.datasetResources?.filter(
                (item: any) => item.id === resourceId
              )[0]?.schema
            }
          />
        ) : (
          <div className="my-8 flex justify-center">
            {' '}
            Click on Reset Fields{' '}
          </div>
        )}
      </div>
    </div>
  );
};
