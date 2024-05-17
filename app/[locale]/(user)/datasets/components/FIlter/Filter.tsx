import React from 'react';
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
  options: Record<string, { label: string; value: string }[]>;
  setSelectedOptions: (category: string, values: string[]) => void;
  selectedOptions: Record<string, string[]>;
}

const Filter: React.FC<FilterProps> = ({
  setOpen,
  options,
  setSelectedOptions,
  selectedOptions,
}) => {
  return (
    <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid5 px-4 py-6">
      <div className="mb-5 flex justify-between">
        <div>
          <Text variant="headingMd">Filters</Text>
        </div>
        {setOpen && (
          <div className="align-center mr-2">
            <Button onClick={() => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {Object.entries(options).map(([category, data], index) => (
          <div key={index}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={category}>
                <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-baseIndigoSolid5 py-2 hover:no-underline">
                  <Text>{category}</Text>
                </AccordionTrigger>
                <AccordionContent
                  className="flex w-full flex-col px-3 pb-0 pt-2"
                  style={{
                    backgroundColor: 'var(--base-pure-white)',
                    outline: '1px solid var(--base-pure-white)',
                  }}
                >
                  <CheckboxGroup
                    name={category}
                    options={data}
                    title={undefined}
                    value={selectedOptions[category] || []}
                    onChange={(values) => {
                      setSelectedOptions(category, values as string[]);
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
