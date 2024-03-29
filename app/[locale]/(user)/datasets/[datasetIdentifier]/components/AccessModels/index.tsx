import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Text,
} from 'opub-ui';

import CustomTags from '@/components/CustomTags';

interface AccessModelProps {
  data: any;
}

const AccessModels: React.FC<AccessModelProps> = ({ data }) => {
  return (
    <>
      {data.map((item: any, index: any) => (
        <div
          key={index}
          className="my-4 flex flex-col gap-4 bg-actionSecondaryDisabled p-4"
        >
          <div className="mb-1 flex flex-wrap justify-between gap-1 lg:gap-0">
            <div className="p2-4 lg:w-2/5">
              <Text variant="headingMd">{item.title}</Text>
            </div>
            <div className="lg:w-3/5 lg:pl-4">
              <Text>{item.description}</Text>
            </div>
          </div>
          <div className="align-center flex flex-col justify-between gap-4 sm:flex-row">
            <CustomTags type={item.type} icon={true} />
            <Button className="h-fit w-fit" kind="secondary">
              Download
            </Button>
          </div>
          <div className="flex">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 ">
                  {/* <div className="w-3/4 text-justify">
                    <Button kind="secondary">Download</Button>
                  </div> */}
                  <div>See Resources</div>
                </AccordionTrigger>
                <AccordionContent
                  className="flex w-full flex-col p-5"
                  style={{
                    backgroundColor: 'var( --base-pure-white)',
                    outline: '1px solid var( --base-pure-white)',
                  }}
                >
                  {item.resource.map((item: any, index: any) => (
                    <div key={index}>
                      <Text>{item.title}</Text>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      ))}
    </>
  );
};

export default AccessModels;
