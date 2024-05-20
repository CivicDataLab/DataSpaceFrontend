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
      accessorKey: 'resourceName',
      header: 'Resource Name',
    },
    {
      accessorKey: 'description',
      header: 'Resource description',
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
                rows={row.original.schema.map((field: any) => ({
                  name: field.fieldName,
                  format: field.format,
                }))}
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
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${row.original.download}`}
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

const generateTableData = (resources: any[]) => {
  return resources.map((item: any) => ({
    resourceName: item.resource.name,
    description: item.resource.description,
    download: item.resource.id,
    schema: item.fields,
  }));
};

const accessModelResourcesQuery = graphql(`
  query accessModelResource($datasetId: UUID!) {
    accessModelResources(datasetId: $datasetId) {
      modelResources {
        resource {
          name
          description
          id
        }
        fields {
          fieldName
          format
          id
        }
      }
      id
      name
      description
      type
      created
      modified
    }
  }
`);

const AccessModels = () => {
  const params = useParams();

  const { data, error, isLoading } = useQuery(
    [`accessmodel_${params.datasetIdentifier}`],
    () =>
      GraphQL(accessModelResourcesQuery, {
        datasetId: params.datasetIdentifier,
      })
  );

  return (
    <>
      {isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        data?.accessModelResources.map((item: any, index: any) => (
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
            <div className="align-center  flex flex-col justify-between gap-4 sm:flex-row lg:items-center">
              <CustomTags type={item.type.split('.').pop().toLowerCase()} />

              <Button
                className="h-fit w-fit"
                kind="secondary"
                onClick={() => {
                  item.modelResources.forEach((resource: any) => {
                    // Construct the download URL for each resource
                    const downloadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${resource.resource.id}`;
                    // Open the URL in a new tab
                    window.open(downloadUrl, '_blank');
                  });
                }}
              >
                Download All Resources
              </Button>
            </div>
            {item?.modelResources?.length > 0 && (
              <div className="flex">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className=" border-none">
                    <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 hover:no-underline">
                      <div className=" text-baseBlueSolid8  ">
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
                      <Table
                        columns={generateColumnData()}
                        rows={generateTableData(item.modelResources)}
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

export default AccessModels;
