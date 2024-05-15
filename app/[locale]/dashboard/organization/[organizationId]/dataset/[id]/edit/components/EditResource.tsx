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
import { parseAsBoolean, parseAsString, useQueryState } from 'next-usequerystate';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Combobox,
  DataTable,
  Divider,
  DropZone,
  Icon,
  IconButton,
  Select,
  Text,
  TextField,
  toast
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

export const getReourceDoc = graphql(`
  query getResource {
    resource {
      id
      dataset {
        pk
      }
      type
      name
      description
    }
  }
`);

interface TListItem {
  label: string;
  value: string;
  description: string;
  dataset: any;
}

export const EditResource = ({
  uploadedFile,
  handleDropZoneDrop,
  file,
}: any) => {

  const {
    data,
    refetch,
  } = useQuery([`get_resources`], () => GraphQL(getReourceDoc), {
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

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

  const [resourceId, setResourceId] = useQueryState(
    'id',
    parseAsString.withDefault('')
  );
  
  const [listView, setListView] = useQueryState(
    'listView',
    parseAsBoolean.withDefault(false)
  );
  
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

  const ResourceList: TListItem[] =
    data?.resource
      .filter((item) => item.dataset?.pk === params.id)
      .map((item) => ({
        label: item.name,
        value: item.id,
        description: item.description,
        dataset: item.dataset?.pk,
      })) || [];

  const getResourceObject = (resourceId: string) => {
    return ResourceList.find((item) => item.value === resourceId);
  };

  const [resourceData, setResourceData] = React.useState({
    name: getResourceObject(resourceId)?.label ?? '',
    description: getResourceObject(resourceId)?.description || '',
  });

  const handleInputChange = (key: string, value: string) => {
    setResourceData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleResourceChange = (e: any) => {
    setResourceId(e, { shallow: false });
    setResourceData({
      name: getResourceObject(e)?.label ?? '',
      description: getResourceObject(resourceId)?.description ?? '',
    });
  };

  // const handleDropZoneDrop = React.useCallback(
  //   (_dropFiles: File[], acceptedFiles: File[]) => setFile(acceptedFiles[0]),
  //   []
  // );

  // const uploadedFile = ResourceList.length > 0 && (
  //   <div style={{ padding: '0' }}>
  //     <div className="flex flex-col gap-2">
  //       <div>{file.name} </div>
  //     </div>
  //   </div>
  // );

  const listViewFunction = () => {
    setResourceId('');
    setListView(true);
  };

  const saveResource = () => {
    mutate({
      fileResourceInput: {
        id: resourceId,
        description: resourceData.description,
        name: resourceData.name,
      },
    });
  };

  return (
    <div className=" bg-basePureWhite px-6 py-8">
      <div className="flex items-center gap-2">
        <Text>Resource Name :</Text>
        <div className=" w-3/6">
          <Select
            label="Resource List"
            labelHidden
            options={ResourceList}
            onChange={(e) => {
              handleResourceChange(e);
            }}
            name="Resource List"
          />
        </div>
        <Button className="mx-5">ADD NEW RESOURCE</Button>
        <Button
            className="w-1/6 justify-end"
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
        <div className="flex w-3/4 flex-col">
          <div className="mb-10 flex gap-6 ">
            <div className="w-2/3">
              <TextField
                value={resourceData.name}
                onChange={(text) => handleInputChange('name', text)}
                label="Resource Name"
                name="resourceName"
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
            value={resourceData.description}
            onChange={(text) => handleInputChange('description', text)}
            label="Resource Description"
            name="resourceDesc"
            multiline={4}
          />
        </div>
        <div className="w-1/4 items-stretch ">
          <div style={{ width: 250, height: 250 }}>
            {/* <DropZone
              name="file_upload"
              allowMultiple={false}
              onDrop={handleDropZoneDrop}
            >
              {uploadedFile}
              <DropZone.FileUpload />
            </DropZone> */}
          </div>
        </div>
      </div>
      <div className=" my-8 flex items-center gap-4 border-1 border-solid border-baseGraySlateSolid7 px-7 py-4 ">
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
      </div>
    </div>
  );
};
