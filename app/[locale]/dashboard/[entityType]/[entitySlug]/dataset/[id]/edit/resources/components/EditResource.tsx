import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
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
  Divider,
  DropZone,
  Icon,
  Spinner,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { useDatasetEditStatus } from '../../context';
import { TListItem } from '../page-layout';
import PdfPreview from './PdfPreview';
import PreviewData from './PreviewData';
import {
  createResourceFilesDoc,
  resetSchema,
  updateResourceDoc,
  updateSchema,
} from './query';
import ResourceHeader from './ResourceHeader';
import { ResourceSchema } from './ResourceSchema';

interface EditProps {
  refetch: () => void;
  allResources: TListItem[];
}

const resourceDetails: any = graphql(`
  query resourceById($resourceId: UUID!) {
    resourceById(resourceId: $resourceId) {
      id
      dataset {
        pk
      }
      previewData {
        columns
        rows
      }
      previewDetails {
        endEntry
        isAllEntries
        startEntry
      }
      previewEnabled
      schema {
        id
        fieldName
        format
        description
      }
      type
      name
      description
      created
      fileDetails {
        id
        resource {
          pk
        }
        format
        file {
          name
          path
          url
        }
        size
        created
        modified
      }
    }
  }
`);

export const EditResource = ({ refetch, allResources }: EditProps) => {
  const params = useParams();

  const [resourceId, setResourceId] = useQueryState<any>('id', parseAsString);
  const [schema, setSchema] = React.useState([]);

  const resourceDetailsQuery = useQuery<any>(
    [`fetch_resource_details_${resourceId}`],
    () =>
      GraphQL(
        resourceDetails,
        {
          // Entity Headers if present
        },
        { resourceId: resourceId }
      ),
    {
      enabled: !!resourceId,
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
      onSuccess: (data: any) => {
        setSchema(data.resetFileResourceSchema.schema);
        refetch();
      },
      onError: (err: any) => {
        toast(err);
      },
    }
  );
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
        resourceDetailsQuery.refetch();
      },
      onError: (err: any) => {
        toast(err.message || String(err));
        setFile([]);
      },
    }
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
        toast('Schema Updated Successfully', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
      },
      onError: (err: any) => {
        toast('Error ::: ', err);
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
        //
        resourceDetailsQuery.refetch();
      },
      onError: (err: any) => {
        toast(err.message, {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
        setFile([]);
      },
    }
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [resourceName, setResourceName] = React.useState(
    resourceDetailsQuery.data?.resourceById.name
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewEnable, setPreviewEnable] = useState(false);

  const [previewDetails, setPreviewDetails] = useState({
    startEntry: 0,
    endEntry: 0,
    isAllEntries: false,
  });
  const [previewData, setPreviewData] = useState({
    rows: [],
    columns: [],
  });

  useEffect(() => {
    resourceDetailsQuery.refetch();
  }, []);

  React.useEffect(() => {
    const ResourceData = resourceDetailsQuery.data?.resourceById;
    setResourceName(ResourceData?.name);
    setPreviewEnable(ResourceData?.previewEnabled);
    setPreviewDetails({
      startEntry: ResourceData?.previewDetails?.startEntry ?? 0,
      endEntry: ResourceData?.previewDetails?.endEntry ?? 0,
      isAllEntries: ResourceData?.previewDetails?.isAllEntries ?? false,
    });
    setPreviewData({
      rows: ResourceData?.previewData?.rows,
      columns: ResourceData?.previewData?.columns,
    });
    setSchema(ResourceData?.schema);
    if (ResourceData?.schema?.length === 0) {
      schemaMutation.mutate({
        resourceId: resourceId,
      });
    }
  }, [resourceDetailsQuery.data]);

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
      updateResourceMutation.mutate(
        {
          fileResourceInput: {
            id: resourceId,
            file: acceptedFiles[0],
          },
          isResetSchema: true,
        },
        {
          onSuccess: () => {
            // Automatically trigger schema mutation after file upload
            schemaMutation.mutate(
              {
                resourceId: resourceId,
              },
              {
                onSuccess: () => {
                  toast('Schema updated successfully');
                },
              }
            );
            resourceDetailsQuery.refetch();
          },
        }
      );
    },
    [resourceId]
  );

  const fileInput = (
    <div className="flex">
      <Text className="break-all">
        {resourceDetailsQuery.data?.resourceById.fileDetails?.file.name.replace(
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
        isAllEntries: false,
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
        name: resourceName || '',
        previewEnabled: previewEnable,
        previewDetails: {
          startEntry: 1,
          endEntry: 5,
          isAllEntries: previewDetails.isAllEntries,
        },
      },
      isResetSchema: false,
    });
  };

  const { setStatus } = useDatasetEditStatus();

  useEffect(() => {
    setStatus(
      updateResourceMutation.isLoading || updateSchemaMutation.isLoading
        ? 'loading'
        : 'success'
    ); // update based on mutation state
  }, [updateResourceMutation.isLoading, updateSchemaMutation.isLoading]);

  const isPdf =
    resourceDetailsQuery.data?.resourceById.fileDetails.format?.toLowerCase() ===
    'pdf';

  const isZIP =
    resourceDetailsQuery.data?.resourceById.fileDetails.format?.toLowerCase() ===
    'zip';

  const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${resourceId}`;


  return (
    <div>
      {resourceDetailsQuery.data?.resourceById ? (
        <div className=" rounded-4 border-2 border-solid border-greyExtralight px-6 py-8">
          <ResourceHeader
            listViewFunction={listViewFunction}
            isSheetOpen={isSheetOpen}
            setIsSheetOpen={setIsSheetOpen}
            dropZone={dropZone}
            uploadedFile={uploadedFile}
            file={file}
            list={allResources}
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
                    <li>
                      Try to include as many keywords as possible in the name
                    </li>
                    <li>Mention the date or time period of the Data File</li>
                    <li>Mention the geography if applicable</li>
                    <li>
                      Follow a similar format for naming all Data Files in a
                      Dataset
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="flex  flex-col justify-between lg:w-1/4">
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

          {!isZIP && (
            <div className="mb-4 mt-8 flex items-center gap-8 align-middle">
              <Checkbox
                name={'previewEnabled'}
                checked={previewEnable}
                onChange={() => {
                  const newValue = !previewEnable;
                  setPreviewEnable(newValue);
                  updateResourceMutation.mutate({
                    fileResourceInput: {
                      id: resourceId,
                      name: resourceName || '',
                      previewEnabled: newValue, // use new value here
                      previewDetails: {
                        startEntry: 1,
                        endEntry: 5,
                        isAllEntries: previewDetails.isAllEntries,
                      },
                    },
                    isResetSchema: false,
                  });
                }}
              >
                Preview Enabled
              </Checkbox>
              <div>
                <Button
                  kind="tertiary"
                  disabled={!previewEnable}
                  onClick={() => {
                    setShowPreview(!showPreview);
                  }}
                >
                  {showPreview ? 'Hide Preview' : 'See Preview'}
                </Button>
              </div>
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
          )}
          {showPreview &&
            previewEnable &&
            (isPdf ? (
              <PdfPreview url={pdfUrl} />
            ) : (
              previewData && <PreviewData previewData={previewData} />
            ))}

          {!isPdf && !isZIP && (
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
                    <Text>Reset Formats</Text>{' '}
                    <Icon source={Icons.info} color="interactive" />
                  </div>
                </Button>
              </div>
              <Text variant="headingXs" as="span" fontWeight="regular">
                The Field settings apply to the Resource on a master level and
                can not be changed in Access Models.
              </Text>
              {schemaMutation.isLoading ? (
                <div className=" mt-8 flex justify-center">
                  <Spinner size={30} />
                </div>
              ) : resourceId && schema?.length > 0 ? (
                <ResourceSchema
                  setSchema={setSchema}
                  data={schema}
                  mutate={updateSchemaMutation.mutate}
                  resourceId={resourceId}
                />
              ) : (
                <div className="my-8 flex justify-center">
                  {' '}
                  Click on Reset Format{' '}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};
