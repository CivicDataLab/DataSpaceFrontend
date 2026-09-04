import React, { useState } from 'react';
import { Button, Checkbox, Combobox, Icon, Text, TextField } from 'opub-ui';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import styles from '../edit.module.scss';

interface SchemaField {
  id: string | number;
  fieldName: string;
}

interface SelectedResource {
  id: string;
  name: string;
  schema: SchemaField[];
}

interface AccessModelResource {
  resource: string;
  fields: number[];
}

interface AccessModelData {
  dataset: string;
  name: string;
  description: string;
  type: string;
  resources: AccessModelResource[];
  accessModelId: string;
}

interface OptionItem {
  label: string;
  value: string;
}

interface ResourceSelectorProps {
  selectedResource: SelectedResource;
  handleRemoveResource: (resourceId: string) => void;
  accessModelData: AccessModelData;
  setAccessModelData: (data: AccessModelData) => void;
  handleSave: (updatedData: AccessModelData) => void;
}

function schemaToOptions(schema: SchemaField[]): OptionItem[] {
  return schema.map((field) => ({
    label: field.fieldName,
    value: field.id.toString(),
  }));
}

function fieldsToOptions(
  fieldIds: number[],
  schema: SchemaField[]
): OptionItem[] {
  return fieldIds.flatMap((fieldId) => {
    const field = schema.find(
      (schemaField) => schemaField.id.toString() === fieldId.toString()
    );
    return field
      ? [
          {
            label: field.fieldName,
            value: field.id.toString(),
          },
        ]
      : [];
  });
}

const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  selectedResource,
  handleRemoveResource,
  accessModelData,
  setAccessModelData,
  handleSave,
}) => {
  const [selectAllFields, setSelectAllFields] = useState(true);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedFields, setSelectedFields] = useState<OptionItem[]>([]);
  const [prevSelectedResource, setPrevSelectedResource] =
    useState(selectedResource);
  const [prevAccessModelResources, setPrevAccessModelResources] = useState(
    accessModelData.resources
  );
  if (
    selectedResource !== prevSelectedResource ||
    accessModelData.resources !== prevAccessModelResources
  ) {
    setPrevSelectedResource(selectedResource);
    setPrevAccessModelResources(accessModelData.resources);

    const initialOptions = schemaToOptions(selectedResource.schema);
    setOptions(initialOptions);

    const selectedResourceData = accessModelData.resources.find(
      (resource) => resource.resource === selectedResource.id
    );

    if (selectedResourceData) {
      const initialSelectedFields = fieldsToOptions(
        selectedResourceData.fields,
        selectedResource.schema
      );
      setSelectedFields(initialSelectedFields);
      setSelectAllFields(
        initialSelectedFields.length === initialOptions.length
      );
    } else if (selectAllFields) {
      setSelectedFields(initialOptions);
    }
  }

  const handleFieldSelection = (selectedOptions: OptionItem[]) => {
    const updatedFields = selectedOptions.map((option) => ({
      label: option.label,
      value: option.value,
    }));

    setSelectedFields(updatedFields);

    const updatedData = {
      ...accessModelData,
      resources: [
        ...accessModelData.resources.filter(
          (resource) => resource.resource !== selectedResource.id
        ),
        {
          resource: selectedResource.id,
          fields: updatedFields.map((field) => parseInt(field.value, 10)),
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
          (resource) => resource.resource !== selectedResource.id
        ),
        {
          resource: selectedResource.id,
          fields: updatedFields.map((field) => parseInt(field.value, 10)),
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
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleFieldSelection(value);
                  }
                }}
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
                onChange={(checked) => console.log(checked)}
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
