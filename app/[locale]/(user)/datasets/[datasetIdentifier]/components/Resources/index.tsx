'use client';

import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Dialog,
  Format,
  Icon,
  Spinner,
  Table,
  Text,
} from 'opub-ui';

import { Icons } from '@/components/icons';
import { GraphQL } from '@/lib/api';

const datasetResourceQuery: any = graphql(`
  query datasetResources($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      created
      modified
      type
      name
      description
      previewData {
        columns
        rows
      }
      noOfEntries
      previewEnabled
      schema {
        fieldName
        id
        format
        description
      }
      fileDetails {
        format
        size
      }
    }
  }
`);

const Resources = () => {
  const params = useParams();

  const getResourceDetails: { data: any; isLoading: boolean } = useQuery(
    [`resources_${params.datasetIdentifier}`],
    () =>
      GraphQL(
        datasetResourceQuery,
        {
          // Entity Headers if present
        },
        { datasetId: params.datasetIdentifier }
      )
  );

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'schema',
        header: 'Columns',
        cell: ({ row }: any) => {
          return (
            <Dialog>
              <Dialog.Trigger>
                <Button
                  kind="tertiary"
                  className=" text-secondaryOrange underline"
                >
                  View All Columns
                </Button>
              </Dialog.Trigger>
              <Dialog.Content title={'All Columns'} limitHeight>
                <Table
                  columns={[
                    {
                      accessorKey: 'name',
                      header: 'Name of the Field',
                    },
                    {
                      accessorKey: 'format',
                      header: 'Format',
                    },
                  ]}
                  rows={row.original.schema.map((item: any) => ({
                    name: item.fieldName,
                    format: item.format,
                  }))}
                />
              </Dialog.Content>
            </Dialog>
          );
        },
      },
      {
        accessorKey: 'rowsLength',
        header: 'No.of Rows',
        cell: ({ row }: any) => {
          return (
            <p>
              {row.original.rowsLength === 0
                ? 'NA'
                : `${row.original.rowsLength}`}
            </p>
          );
        },
      },
      {
        accessorKey: 'format',
        header: 'Format',
      },
      {
        accessorKey: 'size',
        header: 'Size',
      },
      {
        accessorKey: 'preview',
        header: 'Preview',
        cell: ({ row }: any) => {
          const previewData = row.original.preview;

          // Generate columns dynamically from previewData.columns
          const previewColumns =
            previewData?.columns?.map((column: string) => ({
              accessorKey: column,
              header: column,
              cell: ({ cell }: any) => {
                const value = cell.getValue();
                return <span>{value !== null ? value.toString() : 'N/A'}</span>;
              },
            })) || [];

          // Transform rows data to match column structure
          const previewRows =
            previewData?.rows?.map((row: any[]) => {
              const rowData: Record<string, any> = {};
              previewData.columns.forEach((column: string, index: number) => {
                rowData[column] = row[index];
              });
              return rowData;
            }) || [];

          return (
            <Dialog>
              <Dialog.Trigger>
                <Button
                  kind="tertiary"
                  disabled={!previewData}
                  className=" text-secondaryOrange underline"
                >
                  Preview
                </Button>
              </Dialog.Trigger>
              <Dialog.Content title={'Preview'} limitHeight large>
                {previewData && (
                  <Table columns={previewColumns} rows={previewRows} />
                )}
              </Dialog.Content>
            </Dialog>
          );
        },
      },
    ];
  };

  const generateTableData = (data: any) => {
    return [
      {
        schema: data?.schema,
        rowsLength: data?.noOfEntries || 'Na',
        format: data?.fileDetails?.format || 'Na',
        size: Math.round(data?.fileDetails?.size / 1024).toFixed(2) + 'KB',
        preview: data?.previewData,
      },
    ];
  };
  return (
    <div>
      {getResourceDetails.isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : getResourceDetails.data &&
        getResourceDetails.data?.datasetResources?.length > 0 ? (
        <div className=" flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <Text variant="heading2xl">Files in this Dataset </Text>
            <Text variant="headingLg" fontWeight="regular">
              All files associated with this Dataset which can be downloaded{' '}
            </Text>
          </div>
          <div>
            {getResourceDetails.data?.datasetResources.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="mt-5 flex flex-col gap-6 border-1 border-solid border-greyExtralight bg-surfaceDefault p-6 lg:mx-0"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex w-full flex-col gap-4 ">
                      <div className=" flex items-center justify-between gap-2">
                        <Text variant="headingMd">{item.name}</Text>
                        {item.fileDetails?.format && (
                          <Format fileType={item.fileDetails?.format} />
                        )}
                      </div>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className=" border-none">
                      <div className="flex flex-wrap items-center justify-end gap-4">
                        <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 p-0 hover:no-underline">
                          <Text className=" text-secondaryOrange">
                            {' '}
                            View Details
                          </Text>
                        </AccordionTrigger>
                        <div>
                          <Link
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${item.id}`}
                            target="_blank"
                            className="flex justify-center"
                          >
                            <Button kind="tertiary">
                              <div className="flex gap-1">
                                <Text className=" text-secondaryOrange">
                                  {' '}
                                  Download
                                </Text>
                                <Icon source={Icons.download} size={20} />
                              </div>
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <AccordionContent
                        className="flex w-full flex-col py-5"
                        style={{
                          backgroundColor: 'var( --base-pure-white)',
                          outline: '1px solid var( --base-pure-white)',
                        }}
                      >
                        <Table
                          columns={generateColumnData()}
                          rows={generateTableData(item)}
                          hideFooter
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Resources;
