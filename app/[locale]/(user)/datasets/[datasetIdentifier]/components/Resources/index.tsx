import { table } from 'console';
import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Dialog,
  Spinner,
  Table,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import CustomTags from '@/components/CustomTags';
import ResourceTable from '../../../components/ResourceTable';

const generateColumnData = () => {
  return [
    {
      accessorKey: 'accessModelTitle',
      header: 'Access Modal Name',
    },
    {
      accessorKey: 'accessType',
      header: 'Access Type',
      cell: ({ row }: any) => {
        return (
          <CustomTags
            type={row?.original?.accessType?.split('.').pop().toLowerCase()}
            size={20}
            helpText={false}
          />
        );
      },
    },

    {
      accessorKey: 'accessModelDescription',
      header: 'Access Model Description',
    },

    // {
    //   accessorKey: 'fields',
    //   header: 'Fields',
    //   isModalTrigger: true,
    //   label: 'Preview',
    //   table: true,
    //   modalHeader: 'Fields',
    // },
    // {
    //   accessorKey: 'rows',
    //   header: 'Rows',
    // },
    // {
    //   accessorKey: 'count',
    //   header: 'Count',
    // },
    // {
    //   accessorKey: 'preview',
    //   header: 'Preview',
    //   isModalTrigger: true,
    //   label: 'Preview',
    //   table: true,
    //   modalHeader: 'Preview',
    // },
  ];
};

const generateTableData = (accessModelData: any[]) => {
  return accessModelData.map((accessModel: any) => ({
    accessType: accessModel.type,
    accessModelTitle: accessModel.name,
    accessModelDescription: accessModel.description,

    // fields: accessModel.fields,
    // rows: accessModel.rows,
    // count: accessModel.count,
    // preview: accessModel.preview,
  }));
};

const datasetResourceQuery = graphql(`
  query datasetResources($datasetId: UUID!) {
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

const Resources = () => {
  const params = useParams();

  const { data, isLoading } = useQuery(
    [`resources_${params.datasetIdentifier}`],
    () => GraphQL(datasetResourceQuery, { datasetId: params.datasetIdentifier })
  );

  return (
    <>
      {isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        data?.datasetResources?.map((item: any, index: any) => (
          <div
            key={index}
            className="my-4 flex flex-col gap-4 rounded-2 p-6 shadow-basicDeep"
          >
            <div className="mb-1 flex flex-wrap justify-between gap-1 lg:gap-0">
              <div className="p2-4 lg:w-2/5">
                <Text variant="headingMd">{item.name}</Text>
              </div>
              <div className="lg:w-3/5 lg:pl-4">
                <Text>{item.description}</Text>
              </div>
            </div>
            <div className="align-center flex flex-col justify-between gap-4 sm:flex-row">
              <Dialog>
                <Dialog.Trigger>
                  <Button className="h-fit w-fit" kind="secondary">
                    View Fields
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content title={'View Fields'}>
                  <Table
                    columns={[
                      {
                        accessorKey: 'title',
                        header: 'Title',
                      },
                      {
                        accessorKey: 'description',
                        header: 'Description',
                      },
                    ]}
                    rows={[
                      { title: 'Res 1', description: 'Desc 1' },
                      { title: 'Res 2', description: 'Desc 2' },
                    ]}
                    hideFooter={true}
                  />
                </Dialog.Content>
              </Dialog>
            </div>
            {item?.accessModels?.length > 0 && (
              <div className="flex">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 ">
                      <div className=" text-baseBlueSolid8 hover:no-underline ">
                        See Access Type
                      </div>
                    </AccordionTrigger>
                    <AccordionContent
                      className="flex w-full flex-col "
                      style={{
                        backgroundColor: 'var( --base-pure-white)',
                        outline: '1px solid var( --base-pure-white)',
                      }}
                    >
                      <ResourceTable
                        ColumnsData={generateColumnData()}
                        RowsData={generateTableData(item.accessModels)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
};

export default Resources;
