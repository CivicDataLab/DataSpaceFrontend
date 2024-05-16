import React, { useState } from 'react';
import { Button, Checkbox, Combobox, Text, TextField } from 'opub-ui';
import { boolean } from 'zod';

interface ResourceSelectorProps {
  selectedResource: any;
  handleRemoveResource: (resourceId: string) => void;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  selectedResource,
  handleRemoveResource,
}) => {
  const [selectAllFields, setSelectAllFields] = useState(true);
  const [selectAllRows, setSelectAllRows] = useState(true);

  const options = selectedResource.schema.map((field: any) => ({
    label: field.fieldName,
    value: field.id,
  }));

  return (
    <div className="flex flex-wrap gap-5">
      <div className="flex w-2/4 flex-col gap-4">
        <Text>{selectedResource.name}</Text>
        <div className="relative mr-4 flex items-center">
          <div className="w-full">
            <Combobox
              displaySelected
              label={'Select Fields of the Resource'}
              list={options}
              selectedValue={selectAllFields ? options : [options[1]]}
              name={''}
              helpText={'Use the dropdown to add specific fields'}
              onChange={(e) => console.log(e)}
            />
          </div>
          <div className="absolute right-0 top-0 pb-8">
            <Checkbox
              name={'Select All Fields'}
              defaultChecked={true}
              onChange={() => setSelectAllFields(!selectAllFields)}
            >
              Select All
            </Checkbox>
          </div>
        </div>
      </div>
      <hr />
      <div className="flex w-fit flex-col gap-1">
        <div className="flex gap-2 ">
          <Text>Select Rows of the Resource</Text>
          <Checkbox
            name={'Select All Rows'}
            defaultChecked={true}
            onChange={() => setSelectAllRows(!selectAllRows)}
          >
            Select All
          </Checkbox>
        </div>
        <div className="flex  flex-wrap gap-6 ">
          <TextField type="number" label="From Row Number" name="name" />
          <TextField type="number" label="From Row Number" name="name" />
        </div>
      </div>
      <hr />
      <Button
        className="my-auto h-fit w-fit"
        onClick={() => handleRemoveResource(selectedResource.id)}
      >
        Remove
      </Button>
    </div>
  );
};

export default ResourceSelector;
