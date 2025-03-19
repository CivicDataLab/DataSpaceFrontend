'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  Tag,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';

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

  // Use an object to manage the expanded state for each resource individually
  const [showMore, setShowMore] = useState<{ [key: number]: boolean }>({});
  const [isDescriptionLong, setIsDescriptionLong] = useState<{
    [key: number]: boolean;
  }>({});

  const descriptionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Toggle showMore for a specific resource
  const toggleShowMore = (index: number) => {
    setShowMore((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Measure the height of the description and set the `isDescriptionLong` flag accordingly
  useEffect(() => {
    descriptionRefs.current.forEach((descriptionElement, index) => {
      if (descriptionElement) {
        const isLong =
          descriptionElement.scrollHeight > descriptionElement.clientHeight;
        setIsDescriptionLong((prevState) => ({
          ...prevState,
          [index]: isLong,
        }));
      }
    });
  }, [getResourceDetails.data]);

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'schema',
        header: 'Columns',
        cell: ({ row }: any) => {
          return (
            <Dialog>
              <Dialog.Trigger>
                <Button kind="tertiary">View All Columns</Button>
              </Dialog.Trigger>
              <Dialog.Content title={'Fields'} limitHeight>
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
                <Button kind="tertiary" disabled={!previewData}>
                  Preview
                </Button>
              </Dialog.Trigger>
              <Dialog.Content title={'Fields'} limitHeight large>
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
        rowsLength: data?.previewData?.rows?.length || 'Na',
        format: data?.fileDetails?.format || 'Na',
        size: Math.round(data?.fileDetails?.size / 1024).toFixed(2) + 'KB',
        preview: data?.previewData,
      },
    ];
  };

  return (
    <div className="w-full">
      {getResourceDetails.isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : getResourceDetails.data &&
        getResourceDetails.data?.datasetResources?.length > 0 ? (
        <>
          <Text variant="bodyLg" className="mx-6 lg:mx-0">
            Downloadable Resources
          </Text>
          <div>
            {getResourceDetails.data?.datasetResources.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="mx-6 mt-5 flex flex-col gap-6 bg-surfaceDefault p-6 lg:mx-0"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="gap flex flex-col lg:w-4/5">
                      <div className="item flex items-center gap-2">
                        <Text variant="headingMd">{item.name}</Text>
                        {item.fileDetails?.format && (
                          <Tag>{item.fileDetails?.format}</Tag>
                        )}
                      </div>
                      <div>
                        <Text>Updated:</Text>
                        <Text>{formatDate(item.modified)}</Text>
                      </div>
                    </div>
                    <div>
                      <Link
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${item.id}`}
                        target="_blank"
                        className="flex justify-center"
                      >
                        <Button>Download</Button>
                      </Link>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className=" border-none">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col lg:w-3/4">
                          <div
                            ref={(el) => (descriptionRefs.current[index] = el)}
                            className={!showMore[index] ? 'line-clamp-2' : ''}
                          >
                            <Text>{item.description}</Text>
                          </div>
                          {isDescriptionLong[index] && (
                            <Button
                              className="self-start p-2"
                              onClick={() => toggleShowMore(index)}
                              variant="interactive"
                              size="slim"
                              kind="tertiary"
                            >
                              {showMore[index] ? 'Show less' : 'Show more'}
                            </Button>
                          )}
                        </div>
                        <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 p-0 hover:no-underline">
                          View Details
                        </AccordionTrigger>
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
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default Resources;
