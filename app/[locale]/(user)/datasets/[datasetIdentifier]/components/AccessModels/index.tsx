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
import ResourceTable from '../../../components/ResourceTable';

interface AccessModelProps {
  data: any;
}

const generateColumnData = () => {
  return [
    {
      accessorKey: 'resourceName',
      header: 'Resource Name',
    },

    {
      accessorKey: 'fields',
      header: 'Fields',
      isModalTrigger: true,
      label: 'Preview',
      table: true,
      modalHeader: 'Fields',
    },
    {
      accessorKey: 'rows',
      header: 'Rows',
    },
    {
      accessorKey: 'count',
      header: 'Count',
    },
    {
      accessorKey: 'preview',
      header: 'Preview',
      isModalTrigger: true,
      label: 'Preview',
      table: true,
      modalHeader: 'Preview',
    },
  ];
};

const generateTableData = (resource: any[]) => {
  return resource.map((item: any) => ({
    resourceName: item.resourceName,
    fields: item.fields,
    preview: item.preview,
    rows: item.rows,
    count: item.count,
  }));
};

const AccessModels: React.FC<AccessModelProps> = ({ data }) => {
  return (
    <>
      {data.map((item: any, index: any) => (
        <div
          key={index}
          className="my-4 flex flex-col gap-4 rounded-2 p-6 shadow-basicDeep"
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
            <CustomTags type={item.type} />
            <Button className="h-fit w-fit" kind="secondary">
              Download All Resources
            </Button>
          </div>
          <div className="flex">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 ">
                  {/* <div className="w-3/4 text-justify">
                    <Button kind="secondary">Download</Button>
                  </div> */}
                  <div className=" text-baseBlueSolid8 hover:no-underline ">
                    See Resources
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className="flex w-full flex-col p-5"
                  style={{
                    backgroundColor: 'var( --base-pure-white)',
                    outline: '1px solid var( --base-pure-white)',
                  }}
                >
                  {item.resource && item.resource.length > 0 && (
                    <ResourceTable
                      ColumnsData={generateColumnData()}
                      RowsData={generateTableData(item.resource)}
                    />
                  )}
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
