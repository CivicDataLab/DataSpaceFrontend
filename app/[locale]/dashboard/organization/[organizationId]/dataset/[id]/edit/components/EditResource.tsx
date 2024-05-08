import React from 'react';
import Link from 'next/link';
import GraphqlTable from '@/app/[locale]/dashboard/components/GraphqlTable/graphqlTable';
import { IconTrash } from '@tabler/icons-react';
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
  Text,
  TextField,
} from 'opub-ui';

import { Icons } from '@/components/icons';

export const EditResource = ({
  uploadedFile,
  handleDropZoneDrop,
  file,
}: any) => {
  const fileUpload = file.length === 0 && <DropZone.FileUpload />;

  return (
    <div className=" bg-basePureWhite px-6 py-8">
      <div className="flex items-center gap-2">
        <Text>Resource Name :</Text>
        <div className=" w-3/6">
          <Combobox
            name="geo_list"
            label="Resource"
            labelHidden
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
        <Button className="mx-5">ADD NEW RESOURCE</Button>
        <Link href="/" className="flex w-1/6 items-center justify-end gap-2">
          <Text color="interactive">
            Go back to <br />
            Resource List
          </Text>
          <Icon source={Icons.cross} color="interactive" />
        </Link>
      </div>
      <Divider className="mb-8 mt-6" />
      <div className="flex justify-center">
        <Button className="w-1/3">SAVE RESOURCE</Button>
      </div>
      <div className="mt-8 flex items-stretch gap-10">
        <div className="flex w-3/4 flex-col">
          <div className="mb-10 flex gap-6 ">
            <div className="w-2/3">
              <TextField
                label="Resource Name"
                name="error"
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
          </div>
          <TextField
            defaultValue=""
            label="Description"
            multiline={4}
            name="multi-line"
          />
        </div>
        <div className="w-1/4 items-stretch ">
          <DropZone
            name="file_details"
            label="Change file for this Resource"
            onDrop={handleDropZoneDrop}
            className=" bg-basePureWhite"
          >
            {uploadedFile}
            {fileUpload}
          </DropZone>
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
    </div>
  );
};
