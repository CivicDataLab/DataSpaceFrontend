import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Text,
} from 'opub-ui';

import ResourceTable from '../../../components/ResourceTable';

interface ResourceProps {
  data: any;
}

const generateColumnData = () => {
  return [
    {
      accessorKey: 'accessType',
      header: 'Access Type',
    },
    {
      accessorKey: 'accessModelTitle',
      header: 'Access Model Title',
    },
    {
      accessorKey: 'fields',
      header: 'Fields',
    },
    {
      accessorKey: 'rows',
      header: 'Rows',
    },
    {
      accessorKey: 'count',
      header: 'Count',
    },
    // Add more columns if needed
  ];
};

const generateTableData = (accessModelData: any[]) => {
  return accessModelData.map((accessModel: any) => ({
    accessType: accessModel.accessType,
    accessModelTitle: accessModel.accessModelTitle,
    fields: accessModel.fields,
    rows: accessModel.rows,
    count: accessModel.count,
    // Add more data from accessModel if needed
  }));
};

const Resources: React.FC<ResourceProps> = ({ data }) => {
  console.log(data);

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
            <Button className="h-fit w-fit" kind="secondary">
              Download
            </Button>
          </div>
          <div className="flex">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 ">
                  <div className=" text-baseBlueSolid8 hover:no-underline ">
                    See Access Type
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className="flex w-full flex-col p-5"
                  style={{
                    backgroundColor: 'var( --base-pure-white)',
                    outline: '1px solid var( --base-pure-white)',
                  }}
                >
                  {item.accessModelData && item.accessModelData.length > 0 && (
                    <ResourceTable
                      ColumnsData={generateColumnData()}
                      RowsData={generateTableData(item.accessModelData)}
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

export default Resources;
