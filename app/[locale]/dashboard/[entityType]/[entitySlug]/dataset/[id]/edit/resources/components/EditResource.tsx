import React, { useEffect, useState } from 'react';
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
  Sheet,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { useDatasetEditStatus } from '../../context';
import { TListItem } from '../page-layout';
import {
  createResourceFilesDoc,
  fetchSchema,
  resetSchema,
  updateResourceDoc,
  updateSchema,
} from './query';
import ResourceHeader from './ResourceHeader';
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
        toast(err.message || String(err));
        setFile([]);
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getResourceObject = (resourceId: string) => {
    return list.find((item: TListItem) => item.value === resourceId);
  };

  const [resourceName, setResourceName] = React.useState(
    getResourceObject(resourceId)?.label
  );

  const [previewEnable, setPreviewEnable] = useState(false);

  const [previewDetails, setPreviewDetails] = useState({
    startEntry: 0,
    endEntry: 0,
    isAllEntries: true,
  });

  React.useEffect(() => {
    setResourceName(getResourceObject(resourceId)?.label);
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
    refetch();
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
      setIsSheetOpen(false);
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

  console.log(previewEnable);

  const saveResource = () => {
    updateResourceMutation.mutate({
      fileResourceInput: {
        id: resourceId,
        name: resourceName || '',
        previewEnabled: true,
        previewDetails: {
          startEntry: 5,
          endEntry: 5,
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

  const { setStatus } = useDatasetEditStatus();

  useEffect(() => {
    setStatus(updateResourceMutation.isLoading ? 'loading' : 'success'); // update based on mutation state
  }, [updateResourceMutation.isLoading]);

  return (
    <div className=" rounded-4 border-2 border-solid border-greyExtralight px-6 py-8">
      <ResourceHeader
        listViewFunction={listViewFunction}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        dropZone={dropZone}
        uploadedFile={uploadedFile}
        file={file}
        list={list}
        resourceId={resourceId}
        handleResourceChange={handleResourceChange}
      />

      <Divider className="mb-8 mt-6" />

      <div className="mt-8 flex flex-wrap items-stretch gap-10 md:flex-nowrap lg:flex-nowrap">
        <div className="flex w-full flex-col gap-3 md:w-3/5 lg:w-4/5">
          <div>
            <TextField
              value={resourceName}
              onChange={(text) => setResourceName(text)}
              onBlur={saveResource}
              multiline={2}
              label="Data File Name"
              name="a"
              required
            />
          </div>
          <div>
            <Text className=" underline">
              Good practices for naming Data Files
            </Text>
            <div>
              <ol className="list-decimal pl-6">
                <li>Try to include as many keywords as possible in the name</li>
                <li>Mention the date or time period of the Data File</li>
                <li>Mention the geography if applicable</li>
                <li>
                  Follow a similar format for naming all Data Files in a Dataset
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div className="md:1/3 flex w-2/5 flex-col justify-between lg:w-1/4">
          <Text className="pb-1">File associated with Data File</Text>
          <div className="  rounded-2 border-1 border-solid border-baseGraySlateSolid7 p-3 ">
            {fileInput}
            <div className="mt-4 lg:mt-8">
              <DropZone
                name="file_upload"
                allowMultiple={false}
                onDrop={onDrop}
                className="h-40 w-full  border-none bg-baseGraySlateSolid5"
                label="Change file for this Data File"
              >
                <DropZone.FileUpload />
              </DropZone>
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 flex items-center gap-8 align-middle">
        <Checkbox
          name={'previewEnabled'}
          checked={previewEnable}
          onChange={() => {
            setPreviewEnable(previewEnable === false ? true : false);
            saveResource();
          }}
        >
          Preview Enabled
        </Checkbox>

        <Button kind="tertiary" disabled={!previewEnable}>
          See Preview
        </Button>

        {/* {previewEnable && (
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
        )} */}
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
