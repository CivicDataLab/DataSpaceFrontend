import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Combobox, Icon, Text, TextField } from 'opub-ui';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import styles from '../edit.module.scss';

interface ResourceSelectorProps {
  selectedResource: any;
  handleRemoveResource: (resourceId: string) => void;
  accessModelData: any;
  setAccessModelData: (data: any) => void;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  selectedResource,
  handleRemoveResource,
  accessModelData,
  setAccessModelData,
}) => {
  const [selectAllFields, setSelectAllFields] = useState(true);
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [selectedFields, setSelectedFields] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const initialOptions = selectedResource.schema.map((field: any) => ({
      label: field.fieldName,
      value: +field.id,
    }));
    setOptions(initialOptions);
    if (selectAllFields) {
      setSelectedFields(initialOptions);
      // Update accessModelData with all options selected
      setAccessModelData((prevData: any) => ({
        ...prevData,
        resources: [
          ...prevData.resources.filter(
            (resource: any) => resource.resource !== selectedResource.id
          ),
          {
            resource: selectedResource.id,
            fields: initialOptions.map((option: any) => option.value),
          },
        ],
      }));
    } else {
      // Update accessModelData to remove this resource
      setAccessModelData((prevData: any) => ({
        ...prevData,
        resources: prevData.resources.filter(
          (resource: any) => resource.resource !== selectedResource.id
        ),
      }));
    }
  }, [selectedResource.schema, selectAllFields]);

  const handleFieldSelection = (selectedOptions: []) => {
    setSelectedFields(
      selectedOptions.map((option: any) => ({
        label: option?.label || '',
        value: option?.value,
      }))
    );

    // Check if all options are selected
    const allOptionsSelected = selectedOptions.length === options.length;

    // Update accessModelData with the selected fields
    setAccessModelData((prevData: any) => ({
      ...prevData,
      resources: [
        ...prevData.resources.filter(
          (resource: any) => resource.resource !== selectedResource.id
        ),
        {
          resource: selectedResource.id,
          fields: selectedOptions.map((option: any) => option.value),
        },
      ],
    }));

    // Update selectAllFields state based on whether all options are selected or not
    setSelectAllFields(allOptionsSelected);
  };

  return (
    <div>
      <div className=" mb-4">
        <Text>{selectedResource.name}</Text>
      </div>
      <div className="flex flex-wrap justify-between gap-6 px-8">
        <div className="flex w-full flex-col gap-4 xl:w-3/5">
          <div className="relative mr-4 flex items-center">
            <div className="w-full">
              <Combobox
                displaySelected
                label={'Select Fields of the Resource'}
                list={options}
                selectedValue={selectedFields}
                name={''}
                helpText={'Use the dropdown to add specific fields'}
                onChange={(e: any) => handleFieldSelection(e)}
              />
            </div>
            <div className="absolute right-0 top-0 " style={{ top: '-4px' }}>
              <Checkbox
                name={'Select All Fields'}
                defaultChecked={true}
                checked={selectAllFields}
                onChange={() => setSelectAllFields(!selectAllFields)}
              >
                Select All
              </Checkbox>
            </div>
          </div>
        </div>
        <hr className=" m-0" />
        <div className="flex w-fit flex-col items-center justify-center gap-1">
          <div className="flex w-full items-center justify-between gap-2 ">
            <Text>Select Rows of the Resource</Text>
            <Checkbox
              name={'Select All Rows'}
              defaultChecked={false}
              onChange={(e) => console.log(e)}
            >
              Select All
            </Checkbox>
          </div>
          <div className={cn('flex  flex-wrap gap-6', styles.accessModelEdit)}>
            <TextField type="number" label="From Row Number" name="name" />
            <TextField type="number" label="From Row Number" name="name" />
          </div>
        </div>
        <hr className=" m-0" />
        <Button
          className="my-auto h-fit w-fit items-center"
          kind="tertiary"
          onClick={() => handleRemoveResource(selectedResource.id)}
        >
          <span className="flex flex-col items-center justify-center gap-2">
            <Icon source={Icons.delete} size={24} /> Remove <br /> Resource
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ResourceSelector;
