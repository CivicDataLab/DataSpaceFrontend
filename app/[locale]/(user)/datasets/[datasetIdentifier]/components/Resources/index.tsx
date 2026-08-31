'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import PdfPreview from '@/app/[locale]/(user)/components/PdfPreview';
import { graphql } from '@/gql';
import { DatasetResourcesQuery } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  Format,
  Icon,
  Spinner,
  Table,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import styles from './Resources.module.scss';
const datasetResourceQuery = graphql(`
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

interface ResourceSchemaField {
  fieldName: string;
  format: string;
  description?: string | null;
}

interface PreviewData {
  columns: string[];
  rows: unknown[][];
}

interface ResourceTableRow {
  original: {
    schema: ResourceSchemaField[];
    rowsLength: number | string;
    format: string;
    preview?: PreviewData | null;
    id: string;
  };
}

interface PreviewCell {
  getValue: () => unknown;
}

const Resources = () => {
  const params = useParams();

  const getResourceDetails = useQuery(
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
        cell: ({ row }: { row: ResourceTableRow }) => {
          return (
            <Dialog>
              <Dialog.Trigger>
                <Button
                  kind="tertiary"
                  className=" text-secondaryText underline"
                >
                  View All Columns
                </Button>
              </Dialog.Trigger>
              <Dialog.Content title={'All Columns'} limitHeight className={styles.dialogTableWrapper}>
                <Table
                  columns={[
                    {
                      accessorKey: 'name',
                      header: 'Name of the Field',
                    },
                    {
                      accessorKey: 'description',
                      header: 'Description',
                    },
                    {
                      accessorKey: 'format',
                      header: 'Format',
                    },
                  ]}
                  rows={row.original.schema.map((item) => ({
                    name: item.fieldName,
                    format: item.format,
                    description: item.description,
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
        cell: ({ row }: { row: ResourceTableRow }) => {
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
        cell: ({ row }: { row: ResourceTableRow }) => {
          const previewData = row.original.preview;

          // Generate columns dynamically from previewData.columns
          const previewColumns =
            previewData?.columns?.map((column: string) => ({
              accessorKey: column,
              header: column,
              cell: ({ cell }: { cell: PreviewCell }) => {
                const value = cell.getValue();
                return (
                  <span>{value !== null ? String(value) : 'N/A'}</span>
                );
              },
            })) || [];

          // Transform rows data to match column structure
          const previewRows =
            previewData?.rows?.map((row) => {
              const rowData: Record<string, unknown> = {};
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
                  disabled={row.original.format !== 'PDF' && !previewData}
                  className=" text-secondaryText underline"
                >
                  Preview
                </Button>
              </Dialog.Trigger>
              <Dialog.Content title={'Preview'} limitHeight large className={styles.dialogTableWrapper}>
                {row.original.format === 'PDF' ? (
                  <PdfPreview
                    url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${row.original.id}`}
                  />
                ) : (
                  previewData && (
                    <Table
                      columns={previewColumns}
                      hideFooter
                      rows={previewRows}
                    />
                  )
                )}
              </Dialog.Content>
            </Dialog>
          );
        },
      },
    ];
  };

  const generateTableData = (
    data: DatasetResourcesQuery['datasetResources'][number]
  ) => {
    return [
      {
        schema: data?.schema,
        rowsLength: data?.noOfEntries || 'Na',
        format: data?.fileDetails?.format || 'Na',
        size:
          Math.round((data?.fileDetails?.size ?? 0) / 1024).toFixed(2) + 'KB',
        preview: data?.previewData,
        id: data?.id,
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
        <div className=" flex flex-col gap-8 py-10">
          <div className="flex flex-col gap-1">
            <Text variant="headingXl">Files in this Dataset </Text>
            <Text variant="bodyLg">
              All files associated with this Dataset which can be downloaded{' '}
            </Text>
          </div>
          <div>
            {getResourceDetails.data?.datasetResources.map(
              (item, index: number) => (
                <div
                  key={index}
                  className="mt-5 flex flex-col gap-6 border-1 border-solid border-greyExtralight bg-surfaceDefault p-4 lg:mx-0 lg:p-6"
                >
                  <div>
                    <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 ">
                        {item.fileDetails?.format && (
                          <Format fileType={item.fileDetails?.format} />
                        )}
                        <Text variant="headingMd" className=" line-clamp-1">
                          {item.name}
                        </Text>
                      </div>
                      <div className="flex items-center gap-4">
                        <Link
                          href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${item.id}`}
                          target="_blank"
                          className="flex justify-center"
                        >
                          <Button kind="tertiary">
                            <div className="flex gap-1">
                              <Text
                                variant="bodyLg"
                                className=" text-primaryText"
                                fontWeight="semibold"
                              >
                                Download
                              </Text>
                              <Icon source={Icons.download} size={20} />
                            </div>
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div
                      className={`flex w-full flex-col py-5 ${styles.tableWrapper}`}
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
                    </div>
                  </div>
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

{
  /* <Accordion type="single" collapsible className="w-full">
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
</Accordion> */
}
