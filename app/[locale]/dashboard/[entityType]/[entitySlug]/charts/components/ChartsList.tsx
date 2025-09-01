import { UUID } from 'crypto';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  DataTable,
  IconButton,
  SearchInput,
  Spinner,
  Text,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';
import ChartEditor from './ChartEditor';

interface ChartsListProps {
  setType: any;
  setChartId: any;
  setImageId: any;
}

const getAllCharts: any = graphql(`
  query ChartList {
    getChartData {
      __typename
      ... on TypeResourceChart {
        name
        id
        chartType
        dataset {
          title
          slug
          id
        }
        resource {
          name
          id
        }
      }
      ... on TypeResourceChartImage {
        name
        id
        dataset {
          title
          slug
          id
        }
        status
      }
    }
  }
`);

const deleteResourceChart: any = graphql(`
  mutation deleteResourceChart($chartId: UUID!) {
    deleteResourceChart(chartId: $chartId)
  }
`);

const deleteResourceChartImage: any = graphql(`
  mutation deleteResourceChartImage($resourceChartImageId: UUID!) {
    deleteResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);

// const AddResourceChartImage: any = graphql(`
//   mutation GenerateResourceChartImage($dataset: UUID!) {
//     addResourceChartImage(dataset: $dataset) {
//       __typename
//       ... on TypeResourceChartImage {
//         id
//         name
//       }
//     }
//   }
// `);

// const AddResourceChart: any = graphql(`
//   mutation GenerateResourceChart($resource: UUID!) {
//     addResourceChart(resource: $resource) {
//       __typename
//       ... on TypeResourceChart {
//         id
//         name
//       }
//     }
//   }
// `);

// const datasetResourceList: any = graphql(`
//   query all_resources($datasetId: UUID!) {
//     datasetResources(datasetId: $datasetId) {
//       id
//       type
//       name
//     }
//   }
// `);

const ChartsList: React.FC<ChartsListProps> = ({
  setType,
  setChartId,
  setImageId,
}) => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const router = useRouter();

  const [editorView, setEditorView] = useState(false);

  const chartListRes: {
    data: any;
    isPending: boolean;
    refetch: any;
    error: any;
    isError: boolean;
  } = useQuery({
    queryKey: [`chartList`],
    queryFn: () =>
    GraphQL(
      getAllCharts,
      params.entityType !== 'self' ? {
        [params.entityType]: params.entitySlug,
      } : {},
      []
    )
  });

  const [filteredRows, setFilteredRows] = useState<any[]>([]);

  useEffect(() => {
    chartListRes.refetch();
    if (chartListRes.data?.getChartData) {
      setFilteredRows(chartListRes.data.getChartData);
    }
  }, [chartListRes.data]);

  const deleteResourceChartmutation: { mutate: any; isPending: any } =
    useMutation( {
      mutationFn: (data: { chartId: UUID }) =>
        GraphQL(
          deleteResourceChart,
          {
            [params.entityType]: params.entitySlug,
          },
          data
        ),
        onSuccess: () => {
          toast('Chart Deleted Successfully');
          chartListRes.refetch();
        },
        onError: (err: any) => {
          toast(`Received ${err} while deleting chart `);
        },
      }
    );

  const deleteResourceChartImagemutation: { mutate: any; isPending: any } =
    useMutation( {
      mutationFn: (data: { resourceChartImageId: string }) =>
        GraphQL(
          deleteResourceChartImage,
          {
            [params.entityType]: params.entitySlug,
          },
          data
        ),
        onSuccess: () => {
          toast('ChartImage Deleted Successfully');
          chartListRes.refetch();
        },
        onError: (err: any) => {
          toast(`Received ${err} while deleting chart `);
        },
      }
    );

  // const resourceChartImageMutation: {
  //   mutate: any;
  //   isLoading: any;
  // } = useMutation(
  //   (data: { dataset: UUID }) =>
  //     GraphQL(
  //       AddResourceChartImage,
  //       {
  //         [params.entityType]: params.entitySlug,
  //       },
  //       data
  //     ),
  //   {
  //     onSuccess: (res: any) => {
  //       toast('Resource ChartImage Created Successfully');
  //       chartListRes.refetch();
  //       setType('img');
  //       setImageId(res.addResourceChartImage.id);

  //       // setImageId(res.id);
  //     },
  //     onError: (err: any) => {
  //       toast(`Received ${err} while deleting chart `);
  //     },
  //   }
  // );

  // AddResourceImage

  // const resourceList: { data: any } = useQuery([`charts_${params.id}`], () =>
  //   GraphQL(
  //     datasetResourceList,
  //     {
  //       [params.entityType]: params.entitySlug,
  //     },
  //     { datasetId: params.id }
  //   )
  // );

  // const resourceChart: {
  //   mutate: any;
  //   isLoading: any;
  // } = useMutation(
  //   (data: { resource: UUID }) =>
  //     GraphQL(
  //       AddResourceChart,
  //       {
  //         [params.entityType]: params.entitySlug,
  //       },
  //       data
  //     ),
  //   {
  //     onSuccess: (res: any) => {
  //       toast('Resource Chart Created Successfully');
  //       chartListRes.refetch();
  //       setType('visualize');
  //       setChartId(res.addResourceChart.id);

  //       // setImageId(res.id);
  //     },
  //     onError: (err: any) => {
  //       toast(`Received ${err} while deleting chart `);
  //     },
  //   }
  // );

  const handleChart = (row: any) => {
    if (row.original.typename === 'TypeResourceChart') {
      router.push(
        `/dashboard/${params.entityType}/${params.entitySlug}/charts/${row.original.id}?type=TypeResourceChart`
      );
    } else {
      router.push(
        `/dashboard/${params.entityType}/${params.entitySlug}/charts/${row.original.id}?type=TypeResourceChartImage`
      );
    }
  };

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'name',
        header: 'Name of Chart',
        cell: ({ row }: any) => (
          <div
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => handleChart(row)}
          >
            <span>{row.original.name}</span>
          </div>
        ),
      },

      {
        accessorKey: 'type',
        header: 'Chart type',
      },
      {
        accessorKey: 'dataset',
        header: 'Dataset',
      },
      {
        accessorKey: 'resource',
        header: 'Resource',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        header: 'DELETE',
        cell: ({ row }: any) => (
          <div className="text-center">
            <IconButton
              size="medium"
              icon={Icons.delete}
              color="interactive"
              onClick={() => {
                row.original.typename === 'TypeResourceChart'
                  ? deleteResourceChartmutation.mutate({
                      chartId: row.original.id,
                    })
                  : deleteResourceChartImagemutation.mutate({
                      resourceChartImageId: row.original.id,
                    });
              }}
            >
              Delete
            </IconButton>
          </div>
        ),
      },
    ];
  };

  const generateTableData = (data: any[]) => {
    return data?.map((item: any) => ({
      name: item.name,
      type: item.chartType
        ? toTitleCase(item.chartType.split('_').join(' ').toLowerCase())
        : 'Image',
      id: item.id,
      resource: item.resource?.name || '',
      dataset: item.dataset?.title || item.dataset?.id || '',
      typename: item.__typename,
      status: item.status || 'NA',
    }));
  };

  const handleSearchChange = (e: string) => {
    const searchTerm = e.toLowerCase();
    const filtered = chartListRes.data?.getChartData.filter((row: any) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered || []);
  };

  return (
    <>
      {editorView ? (
        <ChartEditor setEditorView={setEditorView} />
      ) : chartListRes.isPending || deleteResourceChartmutation.isPending ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : chartListRes.isError ? (
        <>Error</>
      ) : (
        <>
          <div className=" my-6 flex flex-wrap items-center justify-between gap-3 px-3 py-4">
            <Text>Showing Charts</Text>
            <SearchInput
              className="w-1/2 "
              placeholder="Search in charts"
              label="Search"
              name="Search"
              onChange={(e) => handleSearchChange(e)}
            />
            <div className="flex justify-end gap-3">
              <Button onClick={(e) => setEditorView(true)}>Add Chart</Button>
            </div>
          </div>
          {filteredRows.length > 0 ? (
            <DataTable
              columns={generateColumnData()}
              rows={generateTableData(filteredRows)}
              hideSelection
              truncate
              hideFooter
            />
          ) : (
            <>No records found</>
          )}
        </>
      )}
    </>
  );
};

export default ChartsList;
