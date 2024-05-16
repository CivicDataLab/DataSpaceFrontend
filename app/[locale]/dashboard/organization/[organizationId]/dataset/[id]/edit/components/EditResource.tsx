import React from 'react';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import GraphqlTable from '@/app/[locale]/dashboard/components/GraphqlTable/graphqlTable';
import { graphql } from '@/gql';
import {
  CreateFileResourceInput,
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
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { createResourceFilesDoc, getReourceDoc } from './DistributionList';

interface TListItem {
  label: string;
  value: string;
  description: string;
  dataset: any;
  fileDetails: any;
}

export const EditResource = ({ reload }: any) => {
  const { data, refetch } = useQuery(
    [`get_resources`],
    () => GraphQL(getReourceDoc),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

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

  const { mutate, isLoading } = useMutation(
    (data: { fileResourceInput: UpdateFileResourceInput }) =>
      GraphQL(updateResourceDoc, data),
    {
      onSuccess: () => {
        toast('File changes saved', {
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
        refetch();
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
        refetch();
        reload();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const table = {
    columns: [
      {
        accessorKey: 'field_key',
        header: 'FIELD KEY',
      },
      {
        accessorKey: 'display_name',
        header: 'DISPLAY NAME',
      },
      {
        accessorKey: 'description',
        header: 'DESCRIPTION',
      },
      {
        accessorKey: 'format',
        header: 'FORMAT',
      },
      {
        header: 'DELETE',
        cell: ({ row }: any) => (
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="interactive"
            onClick={(e) => console.log(row.original)}
          >
            Delete
          </IconButton>
        ),
      },
    ],
    rows: [
      {
        field_key: 'date',
        display_name: 'Date',
        description: 'Date on which measurements are taken',
        format: 'Date',
      },
      {
        field_key: 'date',
        display_name: 'Date',
        description: 'Date on which measurements are taken',
        format: 'Date',
      },
      {
        field_key: 'date',
        display_name: 'Date',
        description: 'Date on which measurements are taken',
        format: 'Date',
      },
    ],
  };

  const params = useParams();
  const router = useRouter();

  const ResourceList: TListItem[] =
    data?.resource
      .filter((item) => item.dataset?.pk === params.id)
      .map((item) => ({
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
   if(resourceId){
    setResourceName(getResourceObject(resourceId)?.label);
    setResourceDesc( getResourceObject(resourceId)?.description)
   }
  },[resourceId])

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

  const [resourceFile, setResourceFile] = React.useState<File>();

  const onDrop = React.useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) =>
      setResourceFile(acceptedFiles[0]),
    []
  );

  console.log(resourceFile, 'resourceFile');

  const fileInput = resourceFile ? (
    <div className="flex ">{resourceFile.name} </div>
  ) : (
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
    refetch()
    router.push(
      `/dashboard/organization/${params.organizationId}/dataset/${params.id}/edit/distribution`
    );
  };

  const saveResource = () => {
    mutate({
      fileResourceInput: {
        id: resourceId,
        description: resourceDesc ? resourceDesc :getResourceObject(resourceId)?.description,
        name: resourceName ? resourceName: getResourceObject(resourceId)?.label,
         file: resourceFile
      },
    });
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
          variant="basic"
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
      </div>
      <div className="flex justify-between">
        <Text>Fields in the Resource</Text>
        <div className="flex">
          <Link className="mx-4 flex items-center gap-1" href="/">
            <Text>Refetch Fields</Text>{' '}
            <Icon source={Icons.info} color="interactive" />
          </Link>
          <Link className="flex items-center gap-1" href="/">
            <Text> Reset Fields </Text>{' '}
            <Icon source={Icons.info} color="interactive" />
          </Link>
        </div>
      </div>
      <Text variant="headingXs" as="span" fontWeight="regular">
        The Field settings apply to the Resource on a master level and can not
        be changed in Access Models.
      </Text>
      <div className="mt-3">
        <DataTable
          columns={table.columns}
          rows={table.rows}
          hideFooter={true}
          defaultRowCount={10}
        />
      </div> */}
    </div>
  );
};
