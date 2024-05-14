'use client';

import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Table,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';

const resourcesSummary: any = graphql(`
  query resourcesSummary($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      created
      modified
      type
      name
      description
      accessModels {
        name
        description
        type
      }
    }
  }
`);

const Page = () => {
  const params = useParams();

  const { data: resdata, isLoading } = useQuery(
    [`resSummary_${params.datasetIdentifier}`],
    () => GraphQL(resourcesSummary, { datasetId: params.id })
  );

  console.log(resdata);

  const Summary = [
    {
      name: 'Resources',
      isTable: true,
      coloumnData: [
        {
          accessorKey: 'firstName',
          header: 'First Name',
        },
        {
          accessorKey: 'lastname',
          header: 'Last Name',
        },
        {
          accessorKey: 'age',
          header: 'Age',
        },
      ],
      rowData: [
        {
          age: 31,
          firstName: 'Mitchell',
          lastName: 'Ortiz',
        },
        {
          age: 4,
          firstName: 'Bailey',
          lastName: 'Hermiston',
        },
        {
          age: 34,
          firstName: 'Reilly',
          lastName: 'Emard',
        },
      ],
    },
    {
      name: 'Access Types',
      isTable: true,
      coloumnData: [
        {
          accessorKey: 'firstName',
          header: 'First Name',
        },
        {
          accessorKey: 'lastname',
          header: 'Last Name',
        },
        {
          accessorKey: 'age',
          header: 'Age',
        },
      ],
      rowData: [
        {
          age: 31,
          firstName: 'Mitchell',
          lastName: 'Ortiz',
        },
      ],
    },
    {
      name: 'Metadata',
      isTable: false,
    },
  ];
  return (
    <>
      <div className=" w-full py-6">
        <div className="flex items-center justify-center gap-2 p-4">
          <Text variant="bodyMd" className=" font-semi-bold">
            REVIEW DATASET DETAILS
          </Text>
          :
          <Text>
            Please check all the dataset details below before publishing
          </Text>
        </div>
        <div className=" flex flex-col gap-10 pt-6">
          {Summary.map((item: any, index) => (
            <Accordion type="single" collapsible key={index}>
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-baseBlueSolid3  p-4  ">
                  <div className="">
                    <Text className=" font-semi-bold">See {item.name}</Text>
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className="flex w-full flex-col "
                  style={{
                    backgroundColor: 'var( --base-pure-white)',
                    outline: '1px solid var( --base-pure-white)',
                  }}
                >
                  <div className=" py-4">
                    {item?.isTable && (
                      <Table
                        columns={item.coloumnData}
                        rows={item.rowData}
                        hideFooter
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </>
  );
};

export default Page;
