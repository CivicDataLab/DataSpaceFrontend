import React from 'react';
import { Button, CheckboxGroup, Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

interface FilterProps {
  setOpen?: (isOpen: boolean) => void;
}

const Filter: React.FC<FilterProps> = ({ setOpen }) => {
  const filtersData = [
    {
      title: 'Organization',
      Options: [
        {
          label: 'Option1',
          value: 'Option1',
        },
        {
          label: 'Option2',
          value: 'Option2',
        },
        {
          label: 'Option3',
          value: 'Option3',
        },
      ],
    },
    {
      title: 'Sector',
      Options: [
        {
          label: 'Option1',
          value: 'Option1',
        },
        {
          label: 'Option2',
          value: 'Option2',
        },
        {
          label: 'Option3',
          value: 'Option3',
        },
      ],
    },
    {
      title: 'Category',
      Options: [
        {
          label: 'Option1',
          value: 'Option1',
        },
        {
          label: 'Option2',
          value: 'Option2',
        },
        {
          label: 'Option3',
          value: 'Option3',
        },
      ],
    },
  ];

  return (
    <>
      {setOpen && (
        <div className="flex justify-between">
          <div>
            <Text variant="headingMd">Filters</Text>
          </div>

          <div className="align-center mr-2">
            <Button onClick={(e) => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-col">
        {filtersData.map((item, index) => (
          <div key={index}>
            <div className="bg-borderOnBGSubdued px-3 py-1">
              <Text variant="headingSm" color="onBgDefault">
                {item.title}
              </Text>
            </div>
            <div className="bg-iconOnBGSubdued p-3">
              <CheckboxGroup
                name="checkbox"
                options={item.Options.map((Option) => ({
                  label: Option.label,
                  value: Option.value,
                }))}
                title={undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Filter;
