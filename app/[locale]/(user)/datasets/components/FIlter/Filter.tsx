import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  CheckboxGroup,
  Icon,
  Text,
} from 'opub-ui';

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
          label: 'Option21',
          value: 'Option21',
        },
        {
          label: 'Option22',
          value: 'Option22',
        },
        {
          label: 'Option23',
          value: 'Option23',
        },
      ],
    },
    {
      title: 'Category',
      Options: [
        {
          label: 'Option31',
          value: 'Option31',
        },
        {
          label: 'Option32',
          value: 'Option32',
        },
        {
          label: 'Option33',
          value: 'Option33',
        },
      ],
    },
  ];
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  return (
    <div className="rounded-2 border-2   border-solid border-baseGraySlateSolid5 px-4  py-6">
      <div className="mb-5 flex justify-between  ">
        <div>
          <Text variant="headingMd">Filters</Text>
        </div>
        {setOpen && (
          <div className="align-center mr-2">
            <Button onClick={(e) => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5  ">
        {filtersData.map((item, index) => (
          <div key={index}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={item.title}>
                <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-baseIndigoSolid5 py-2 hover:no-underline ">
                  <Text>{item.title}</Text>
                </AccordionTrigger>
                <AccordionContent
                  className="flex w-full flex-col px-3 pb-0 pt-2 "
                  style={{
                    backgroundColor: 'var( --base-pure-white)',
                    outline: '1px solid var( --base-pure-white)',
                  }}
                >
                  <CheckboxGroup
                    name="checkbox"
                    options={item.Options.map((Option) => ({
                      label: Option.label,
                      value: Option.value,
                    }))}
                    title={undefined}
                    value={selectedOptions}
                    onChange={(e) => {
                      setSelectedOptions(e), console.log(e);
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
