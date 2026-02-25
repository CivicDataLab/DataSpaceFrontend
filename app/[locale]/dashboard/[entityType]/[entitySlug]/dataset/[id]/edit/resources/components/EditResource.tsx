import { graphql } from '@/gql';
import {
  CreateFileResourceInput,
  SchemaUpdateInput,
  UpdateFileResourceInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import {
  Button,
  Checkbox,
  Combobox,
  Divider,
  DropZone,
  Text,
  TextField,
  toast,
} from 'opub-ui';
import React, { useEffect, useState } from 'react';

import { Loading } from '@/components/loading';
import { GraphQL } from '@/lib/api';
import PdfPreview from '../../../../../../../../(user)/components/PdfPreview';
import { useDatasetEditStatus } from '../../context';
import { TListItem } from '../page-layout';
import PreviewData from './PreviewData';
import {
  createResourceFilesDoc,
  updateResourceDoc,
  updateSchema,
} from './query';
import ResourceHeader from './ResourceHeader';
import { ResourceSchema } from './ResourceSchema';

interface EditProps {
  refetch: () => void;
  allResources: TListItem[];
  isPromptDataset?: boolean;
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
      promptDetails {
        promptFormat
        hasSystemPrompt
        hasExampleResponses
        avgPromptLength
        promptCount
      }
    }
  }
`);

// Mutation to update prompt resource metadata
const updatePromptResourceMutationDoc: any = graphql(`
  mutation UpdatePromptResource($updateInput: UpdatePromptResourceInput!) {
    updatePromptResource(updateInput: $updateInput) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
        nonFieldErrors
      }
      data {
        id
        promptDetails {
          promptFormat
          hasSystemPrompt
          hasExampleResponses
        }
      }
    }
  }
`);

const PROMPT_FORMAT_TEMPLATES: Record<
  string,
  { description: string; template: string }
> = {
  INSTRUCTION: {
    description: 'Single instruction with expected output format. Each row is one prompt.',
    template: `instruction,input,output
"Translate the following English text to Hindi","Hello, how are you?","नमस्ते, आप कैसे हैं?"
"Summarize the following text","Artificial Intelligence is transforming industries worldwide.","AI is changing industries globally."
"Convert this sentence to past tense","I am going to the store","I went to the store"`,
  },
  CHAT: {
    description:
      'Multi-turn conversation format. Each row contains a complete conversation with system, user, and assistant messages.',
    template: `system_prompt,user_message,assistant_response
"You are a helpful assistant.","What is the capital of India?","The capital of India is New Delhi."
"You are a math tutor.","What is 15 + 27?","15 + 27 equals 42."
"You are a language expert.","How do you say hello in Spanish?","In Spanish, hello is 'Hola'."`,
  },
  COMPLETION: {
    description: 'Text completion format with prompt and completion pairs. Each row is one prompt-completion pair.',
    template: `prompt,completion
"The capital of France is"," Paris, which is known for the Eiffel Tower."
"The largest ocean on Earth is"," the Pacific Ocean, covering more than 60 million square miles."
"The chemical symbol for gold is"," Au, derived from the Latin word aurum."`,
  },
  FEW_SHOT: {
    description: 'Examples followed by the actual task. Each row contains example pairs and the task.',
    template: `example_input_1,example_output_1,example_input_2,example_output_2,task_input,task_output
"happy","sad","big","small","hot","cold"
"up","down","left","right","forward","backward"
"day","night","sun","moon","light","dark"`,
  },
  CHAIN_OF_THOUGHT: {
    description: 'Step-by-step reasoning format. Each row shows question, reasoning steps, and answer.',
    template: `question,reasoning,answer
"If John has 5 apples and gives 2 to Mary, how many does he have?","John starts with 5 apples. He gives away 2 apples. 5 - 2 = 3.","John has 3 apples."
"A train travels 60 km in 1 hour. How far does it travel in 3 hours?","Speed is 60 km/hour. Distance = Speed × Time. Distance = 60 × 3 = 180 km.","The train travels 180 km."
"If 3 pencils cost $6, how much does 1 pencil cost?","Total cost is $6 for 3 pencils. Cost per pencil = $6 ÷ 3 = $2.","One pencil costs $2."`,
  },
  ZERO_SHOT: {
    description: 'Direct task without examples. Each row is one task-input-output triplet.',
    template: `task,input,output
"Classify the sentiment of the following text","I love this product! It works great.","positive"
"Identify the language","Bonjour, comment allez-vous?","French"
"Extract the main topic","The article discusses climate change and its impact on agriculture.","climate change"`,
  },
  OTHER: {
    description: 'Custom format - define your own columns. Each row is one prompt.',
    template: `custom_field_1,custom_field_2,custom_field_3
"value1","value2","value3"
"value4","value5","value6"
"value7","value8","value9"`,
  },
};

const PROMPT_FORMAT_OPTIONS = Object.keys(PROMPT_FORMAT_TEMPLATES).map(
  (key) => ({
    label: key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    value: key,
  })
);

export const EditResource = ({
  refetch,
  allResources,
  isPromptDataset = false,
}: EditProps) => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const [resourceId, setResourceId] = useQueryState<any>('id', parseAsString);
  const [schema, setSchema] = React.useState<any>([]);

  const resourceDetailsQuery = useQuery<any>(
    // Use a stable key when resourceId is empty/invalid
    resourceId && resourceId.trim()
      ? [`fetch_resource_details_${resourceId}`]
      : ['fetch_resource_details_disabled'],
    () => {
      if (!resourceId || !resourceId.trim()) {
        // Return a rejected promise or throw an error to prevent execution
        return Promise.reject(new Error('No resource ID provided'));
      }
      return GraphQL(
        resourceDetails,
        {
          [params.entityType]: params.entitySlug,
        },
        { resourceId: resourceId }
      );
    },
    {
      enabled: !!(resourceId && resourceId.trim()),
      // Prevent retries when there's no resourceId
      retry: false,
      // Don't refetch when resourceId is empty
      refetchOnWindowFocus: !!(resourceId && resourceId.trim()),
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
          [params.entityType]: params.entitySlug,
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
          [params.entityType]: params.entitySlug,
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
          [params.entityType]: params.entitySlug,
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

  // Prompt-specific state
  const [promptFormat, setPromptFormat] = useState<string | undefined>(
    undefined
  );
  const [hasSystemPrompt, setHasSystemPrompt] = useState(false);
  const [hasExampleResponses, setHasExampleResponses] = useState(false);


  // Mutation for updating prompt resource metadata
  const updatePromptResourceMutation = useMutation(
    (data: { updateInput: any }) =>
      GraphQL(
        updatePromptResourceMutationDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res: any) => {
        if (res.updatePromptResource?.success) {
          toast('Prompt file metadata updated!');
          resourceDetailsQuery.refetch();
        } else {
          toast(
            'Error: ' +
              (res.updatePromptResource?.errors?.nonFieldErrors?.[0] ||
                'Unknown error')
          );
        }
      },
      onError: (err: any) => {
        toast('Error: ' + err.message);
      },
    }
  );

  // Function to save prompt resource metadata
  const savePromptResourceMetadata = (updates: {
    promptFormat?: string;
    hasSystemPrompt?: boolean;
    hasExampleResponses?: boolean;
  }) => {
    const newPromptFormat =
      updates.promptFormat !== undefined ? updates.promptFormat : promptFormat;
    const newHasSystemPrompt =
      updates.hasSystemPrompt !== undefined
        ? updates.hasSystemPrompt
        : hasSystemPrompt;
    const newHasExampleResponses =
      updates.hasExampleResponses !== undefined
        ? updates.hasExampleResponses
        : hasExampleResponses;

    if (updates.promptFormat !== undefined)
      setPromptFormat(updates.promptFormat);
    if (updates.hasSystemPrompt !== undefined)
      setHasSystemPrompt(updates.hasSystemPrompt);
    if (updates.hasExampleResponses !== undefined)
      setHasExampleResponses(updates.hasExampleResponses);

    updatePromptResourceMutation.mutate({
      updateInput: {
        resource: resourceId,
        promptFormat: newPromptFormat,
        hasSystemPrompt: newHasSystemPrompt,
        hasExampleResponses: newHasExampleResponses,
      },
    });
  };

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
    // Initialize prompt-specific state from resource data
    if (isPromptDataset && ResourceData?.promptDetails) {
      setPromptFormat(ResourceData.promptDetails.promptFormat || undefined);
      setHasSystemPrompt(ResourceData.promptDetails.hasSystemPrompt || false);
      setHasExampleResponses(
        ResourceData.promptDetails.hasExampleResponses || false
      );
    }
  }, [resourceDetailsQuery.data, isPromptDataset]);

  useEffect(() => {
    const schemaData = resourceDetailsQuery.data?.resourceById?.schema;
    if (schemaData && Array.isArray(schemaData)) {
      setSchema(schemaData);
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
  }, [setStatus, updateResourceMutation.isLoading, updateSchemaMutation.isLoading]);

  const resourceFormat =
    resourceDetailsQuery.data?.resourceById.fileDetails.format?.toLowerCase();
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
                  helpText={`Character limit: ${resourceName?.length}/200`}
                  onBlur={saveResource}
                  multiline={2}
                  label={
                    isPromptDataset ? 'Prompt File Name' : 'Data File Name'
                  }
                  name="a"
                  required
                />
              </div>
              {isPromptDataset ? (
                <div className="flex flex-col gap-4">
                  <Combobox
                    name="promptFormat"
                    label="Prompt Format"
                    displaySelected
                    list={PROMPT_FORMAT_OPTIONS}
                    selectedValue={
                      promptFormat
                        ? promptFormat
                        : ''
                    }
                    onChange={(value: any) => {
                      // Handle both array and string values
                      let selectedValue: string | undefined;
                      if (Array.isArray(value)) {
                        selectedValue = value.length > 0 ? value[0]?.value : undefined;
                      } else {
                        selectedValue = value || undefined;
                      }
                      // Toggle: if same value selected, clear it
                      if (selectedValue === promptFormat) {
                        selectedValue = undefined;
                      }
                      setPromptFormat(selectedValue);
                      savePromptResourceMetadata({
                        promptFormat: selectedValue,
                      });
                    }}
                  />
                  <div className="flex gap-4">
                    <Checkbox
                      name="hasSystemPrompt"
                      checked={hasSystemPrompt}
                      onChange={(checked) => {
                        savePromptResourceMetadata({
                          hasSystemPrompt: Boolean(checked),
                        });
                      }}
                    >
                      Has System Prompt
                    </Checkbox>
                    <Checkbox
                      name="hasExampleResponses"
                      checked={hasExampleResponses}
                      onChange={(checked) => {
                        savePromptResourceMetadata({
                          hasExampleResponses: Boolean(checked),
                        });
                      }}
                    >
                      Has Example Responses
                    </Checkbox>
                  </div>
                  {promptFormat && PROMPT_FORMAT_TEMPLATES[promptFormat] && (
                    <div className="rounded-lg border bg-surfaceNeutralSubdued mt-4 border-borderSubdued p-4">
                      <Text variant="headingSm" as="h4" className="mb-2">
                        Expected Format Template
                      </Text>
                      <Text variant="bodySm" className="mb-3 text-textSubdued">
                        {PROMPT_FORMAT_TEMPLATES[promptFormat].description}
                      </Text>
                      <div className="overflow-x-auto rounded bg-surfaceNeutral p-3">
                        <table className="min-w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-borderSubdued">
                              {PROMPT_FORMAT_TEMPLATES[promptFormat].template
                                .split('\n')[0]
                                .split(',')
                                .map((header, idx) => (
                                  <th
                                    key={idx}
                                    className="px-3 py-2 text-left font-semibold bg-surfaceNeutralSubdued"
                                  >
                                    {header.trim()}
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {PROMPT_FORMAT_TEMPLATES[promptFormat].template
                              .split('\n')
                              .slice(1)
                              .map((row, rowIdx) => {
                                const cells = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
                                return (
                                  <tr
                                    key={rowIdx}
                                    className="border-b border-borderSubdued hover:bg-surfaceNeutralHovered"
                                  >
                                    {cells.map((cell, cellIdx) => (
                                      <td
                                        key={cellIdx}
                                        className="px-3 py-2 align-top"
                                      >
                                        {cell.replace(/^"|"$/g, '').trim()}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
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
              )}
            </div>
            <div className="flex  flex-col justify-between lg:w-1/4">
              <Text className="pb-1">
                {isPromptDataset
                  ? 'File associated with Prompt File'
                  : 'File associated with Data File'}
              </Text>
              <div className="  rounded-2 border-1 border-solid border-baseGraySlateSolid7 p-3 ">
                {fileInput}
                <div className="mt-4 lg:mt-8">
                  <DropZone
                    name="file_upload"
                    allowMultiple={false}
                    onDrop={onDrop}
                    className="h-40 w-full  border-none bg-baseGraySlateSolid5"
                    label={
                      isPromptDataset
                        ? 'Change file for this Prompt File'
                        : 'Change file for this Data File'
                    }
                  >
                    <DropZone.FileUpload />
                  </DropZone>
                </div>
              </div>
            </div>
          </div>

          {resourceFormat !== 'zip' && (
            <div className="mb-4 mt-8 flex items-center gap-8 align-middle">
              <Checkbox
                name={'previewEnabled'}
                checked={previewEnable}
                title={
                  resourceFormat === 'json' || resourceFormat === 'xml'
                    ? 'Preview is not available for this file format'
                    : ''
                }
                disabled={resourceFormat === 'json' || resourceFormat === 'xml'}
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
            (resourceFormat === 'pdf' ? (
              <PdfPreview url={pdfUrl} />
            ) : (
              previewData && <PreviewData previewData={previewData} />
            ))}

          {resourceFormat !== 'pdf' && resourceFormat !== 'zip' && (
            <div className="my-8">
              {/* <div className="flex flex-wrap justify-between">
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
              </div> */}
              <Text variant="headingXs" as="span" fontWeight="regular">
                The Field settings apply to the Resource on a master level and
                can not be changed in Access Models.
              </Text>

              <ResourceSchema
                setSchema={setSchema}
                data={schema}
                mutate={updateSchemaMutation.mutate}
                resourceId={resourceId}
              />
            </div>
          )}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};
