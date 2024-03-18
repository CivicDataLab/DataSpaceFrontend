import React from 'react';
import { CheckboxGroup, Text } from 'opub-ui';

const Filter = () => {
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
    <div className="flex flex-col">
      {filtersData.map((item, index) => (
        <div key={index}>
          <div
            className="px-3 py-1"
            style={{ backgroundColor: 'var(--base-gray-slate-solid-11)' }}
          >
            <Text variant="headingSm" color="onBgDefault">
              {item.title}
            </Text>
          </div>
          <div
            className="p-3"
            style={{ backgroundColor: 'var(--base-gray-slate-solid-4)' }}
          >
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
  );
};

export default Filter;
