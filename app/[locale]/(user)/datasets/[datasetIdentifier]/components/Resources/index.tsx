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
  Icon,
  Spinner,
  Table,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import CustomTags from '@/components/CustomTags';
import { Icons } from '@/components/icons';

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
      accessorKey: 'schema',
      header: 'Fields',
      cell: ({ row }: any) => {
        return (
          <Dialog>
            <Dialog.Trigger>
              <Button
                kind="tertiary"
                disabled={row.original.schema.length === 0}
              >
                Fields
              </Button>
            </Dialog.Trigger>
            <Dialog.Content title={'Fields'} limitHeight>
              <Table
                columns={[
                  {
                    accessorKey: 'name',
                    header: 'Name',
                  },
                  {
                    accessorKey: 'format',
                    header: 'Format',
                  },
                ]}
                rows={row.original.schema.flatMap((item: any) =>
                  item.fields.map((field: any) => ({
                    name: field.fieldName,
                    format: field.format,
                  }))
                )}
                hideFooter
              />
            </Dialog.Content>
          </Dialog>
        );
      },
    },
    {
      accessorKey: 'download',
      header: 'Download',
      cell: ({ row }: any) => {
        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${row.original.resourceId}`}
            target="_blank"
            className=" flex justify-center"
          >
            <Icon source={Icons.download} size={20} />
          </Link>
        );
      },
    },
  ];
};

const generateTableData = (accessModelData: any[], id: any) => {
  return accessModelData.map((accessModel: any) => ({
    accessType: accessModel.type,
    accessModelTitle: accessModel.name,
    accessModelDescription: accessModel.description,
    resourceId: id,
    schema: accessModel.modelResources,
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
        modelResources {
          fields {
            format
            fieldName
            description
          }
        }
      }
      schema {
        fieldName
        id
        format
        description
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

            {item?.accessModels?.length > 0 && (
              <div className="flex">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className=" border-none">
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="align-center flex flex-col justify-between gap-4 sm:flex-row">
                        <Dialog>
                          <Dialog.Trigger>
                            <Button className="h-fit w-fit" kind="secondary">
                              View Fields
                            </Button>
                          </Dialog.Trigger>
                          <Dialog.Content title={'View Fields'} limitHeight>
                            <Table
                              columns={[
                                {
                                  accessorKey: 'name',
                                  header: 'Name',
                                },
                                {
                                  accessorKey: 'format',
                                  header: 'Format',
                                },
                                {
                                  accessorKey: 'description',
                                  header: 'Description',
                                },
                              ]}
                              rows={item.schema.map((item: any) => ({
                                name: item.fieldName,
                                format: item.format,
                                description: item.description,
                              }))}
                              hideFooter={true}
                            />
                          </Dialog.Content>
                        </Dialog>
                      </div>
                      <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 hover:no-underline  ">
                        <div className=" text-baseBlueSolid8 ">
                          See Access Type
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent
                      className="flex w-full flex-col "
                      style={{
                        backgroundColor: 'var( --base-pure-white)',
                        outline: '1px solid var( --base-pure-white)',
                      }}
                    >
                      <Table
                        columns={generateColumnData()}
                        rows={generateTableData(item.accessModels, item.id)}
                        hideFooter
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
