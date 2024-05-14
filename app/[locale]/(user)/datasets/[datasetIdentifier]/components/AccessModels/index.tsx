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
  Icon,
  Spinner,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import CustomTags from '@/components/CustomTags';
import { Icons } from '@/components/icons';
import ResourceTable from '../../../components/ResourceTable';

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

const generateTableData = (resources: any[]) => {
  return resources.map((item: any) => ({
    resourceName: item.resource.name,
    description: item.resource.description,
    download: item.resource.id,
    // fields: item.fields,
    // preview: item.preview,
    // rows: item.rows,
    // count: item.count,
  }));
};

const accessModelResourcesQuery = graphql(`
  query accessModelResources($datasetId: UUID!) {
    accessModelResources(datasetId: $datasetId) {
      modelResources {
        resource {
          name
          description
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

  console.log(data);

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
            <div className="align-center flex flex-col items-center justify-between gap-4 sm:flex-row">
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
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 ">
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
                      <ResourceTable
                        ColumnsData={generateColumnData()}
                        RowsData={generateTableData(item.modelResources)}
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
