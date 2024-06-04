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
  handleSave: (updatedData: any) => void;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  selectedResource,
  handleRemoveResource,
  accessModelData,
  setAccessModelData,
  handleSave,
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
      value: field.id.toString(), // Ensure ID is a string for Combobox
    }));
    setOptions(initialOptions);

    const selectedResourceData = accessModelData.resources.find(
      (resource: any) => resource.resource === selectedResource.id
    );

    if (selectedResourceData) {
      const initialSelectedFields = selectedResourceData.fields
        .map((fieldId: any) => {
          const field = selectedResource.schema.find(
            (f: any) => f.id.toString() === fieldId.toString()
          );
          return field
            ? {
                label: field.fieldName,
                value: field.id.toString(), // Ensure ID is a string for Combobox
              }
            : null;
        })
        .filter((field: any) => field !== null); // Filter out null values
      setSelectedFields(initialSelectedFields);
      setSelectAllFields(
        initialSelectedFields.length === initialOptions.length
      );
    } else if (selectAllFields) {
      setSelectedFields(initialOptions);
      const updatedData = {
        ...accessModelData,
        resources: [
          ...accessModelData.resources.filter(
            (resource: any) => resource.resource !== selectedResource.id
          ),
          {
            resource: selectedResource.id,
            fields: initialOptions.map((option: any) =>
              parseInt(option.value, 10)
            ), // Convert to integer
          },
        ],
      };
      setAccessModelData(updatedData);
      handleSave(updatedData);
    }
  }, [
    selectedResource,
    accessModelData,
    selectAllFields,
    setAccessModelData,
    handleSave,
  ]);

  const handleFieldSelection = (selectedOptions: any) => {
    const updatedFields = selectedOptions.map((option: any) => ({
      label: option.label,
      value: option.value,
    }));

    setSelectedFields(updatedFields);

    const updatedData = {
      ...accessModelData,
      resources: [
        ...accessModelData.resources.filter(
          (resource: any) => resource.resource !== selectedResource.id
        ),
        {
          resource: selectedResource.id,
          fields: updatedFields.map((field: any) => parseInt(field.value, 10)), // Convert to integer
        },
      ],
    };

    setAccessModelData(updatedData);
    handleSave(updatedData);

    setSelectAllFields(updatedFields.length === options.length);
  };

  const handleSelectAllFields = () => {
    const updatedFields = selectAllFields ? [] : options;
    setSelectAllFields(!selectAllFields);
    setSelectedFields(updatedFields);

    const updatedData = {
      ...accessModelData,
      resources: [
        ...accessModelData.resources.filter(
          (resource: any) => resource.resource !== selectedResource.id
        ),
        {
          resource: selectedResource.id,
          fields: updatedFields.map((field: any) => parseInt(field.value, 10)), // Convert to integer
        },
      ],
    };

    setAccessModelData(updatedData);
    handleSave(updatedData);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Text>{selectedResource.name}</Text>
        <Button
          kind="tertiary"
          size="slim"
          onClick={() => handleRemoveResource(selectedResource.id)}
        >
          <span className="flex flex-col items-center justify-center gap-2">
            <Icon source={Icons.delete} size={18} color="highlight" />
          </span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-6 lg:px-8 ">
        <div className="flex w-full flex-col gap-4 2xl:w-3/5">
          <div className="relative mr-4 flex flex-wrap  items-center">
            <div className={cn('mt-1 w-full', styles.combobox)}>
              <Combobox
                displaySelected
                label="Select Fields of the Resource"
                list={options}
                selectedValue={selectedFields}
                name=""
                helpText="Use the dropdown to add specific fields"
                onChange={(e: any) => handleFieldSelection(e)}
              />
            </div>
            <div className="right-0 lg:absolute" style={{ top: '1px' }}>
              <Checkbox
                name="Select All Fields"
                checked={selectAllFields}
                onChange={handleSelectAllFields}
              >
                Select All
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="flex w-fit gap-6">
          <hr className="m-0" />
          <div className="flex w-fit flex-col items-center justify-center gap-1">
            <div className="flex w-full items-center justify-between gap-2">
              <Text>Select Rows of the Resource</Text>
              <Checkbox
                name="Select All Rows"
                defaultChecked={false}
                onChange={(e) => console.log(e)}
              >
                Select All
              </Checkbox>
            </div>
            <div className={cn('flex flex-wrap gap-6', styles.accessModelEdit)}>
              <TextField type="number" label="From Row Number" name="fromRow" />
              <TextField type="number" label="To Row Number" name="toRow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSelector;
