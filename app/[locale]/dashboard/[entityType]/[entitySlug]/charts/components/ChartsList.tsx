import React, { useEffect, useState } from 'react';
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
  setType: (type: string) => void;
  setChartId: (id: string | null) => void;
  setImageId: (id: string | null) => void;
}

interface ChartListEntry {
  __typename: string;
  name: string;
  id: string;
  chartType?: string;
  status?: string;
  dataset?: { title?: string; id?: string } | null;
  resource?: { name?: string } | null;
}

interface ChartTableRow {
  name: string;
  type: string;
  id: string;
  resource: string;
  dataset: string;
  typename: string;
  status: string;
}

interface ChartTableCellContext {
  row: {
    original: ChartTableRow;
  };
}

const getAllCharts = graphql(`
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

const deleteResourceChart = graphql(`
  mutation deleteResourceChart($chartId: UUID!) {
    deleteResourceChart(chartId: $chartId)
  }
`);

const deleteResourceChartImage = graphql(`
  mutation deleteResourceChartImage($resourceChartImageId: UUID!) {
    deleteResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);

const ChartsList: React.FC<ChartsListProps> = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const router = useRouter();

  const [editorView, setEditorView] = useState(false);

  const chartListRes = useQuery([`chartList`], () =>
    GraphQL(
      getAllCharts,
      params.entityType !== 'self'
        ? {
            [params.entityType]: params.entitySlug,
          }
        : {}
    )
  );

  const [filteredRows, setFilteredRows] = useState<ChartListEntry[]>([]);
  const [prevChartListData, setPrevChartListData] = useState(
    chartListRes.data?.getChartData
  );
  if (chartListRes.data?.getChartData !== prevChartListData) {
    setPrevChartListData(chartListRes.data?.getChartData);
    if (chartListRes.data?.getChartData) {
      setFilteredRows(chartListRes.data.getChartData);
    }
  }

  useEffect(() => {
    chartListRes.refetch();
  }, [chartListRes]);

  const deleteResourceChartmutation = useMutation(
    (data: { chartId: string }) =>
      GraphQL(
        deleteResourceChart,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        toast('Chart Deleted Successfully');
        chartListRes.refetch();
      },
      onError: (err: unknown) => {
        toast(`Received ${String(err)} while deleting chart `);
      },
    }
  );

  const deleteResourceChartImagemutation = useMutation(
    (data: { resourceChartImageId: string }) =>
      GraphQL(
        deleteResourceChartImage,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: () => {
        toast('ChartImage Deleted Successfully');
        chartListRes.refetch();
      },
      onError: (err: unknown) => {
        toast(`Received ${String(err)} while deleting chart `);
      },
    }
  );

  const handleChart = (row: ChartTableCellContext['row']) => {
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
        cell: ({ row }: ChartTableCellContext) => (
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
        cell: ({ row }: ChartTableCellContext) => (
          <div className="text-center">
            <IconButton
              size="medium"
              icon={Icons.delete}
              color="interactive"
              onClick={() => {
                if (row.original.typename === 'TypeResourceChart') {
                  deleteResourceChartmutation.mutate({
                    chartId: row.original.id,
                  });
                } else {
                  deleteResourceChartImagemutation.mutate({
                    resourceChartImageId: row.original.id,
                  });
                }
              }}
            >
              Delete
            </IconButton>
          </div>
        ),
      },
    ];
  };

  const generateTableData = (data: ChartListEntry[]) => {
    return data?.map((item) => ({
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
    const filtered = chartListRes.data?.getChartData.filter((row) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered || []);
  };

  return (
    <>
      {editorView ? (
        <ChartEditor setEditorView={setEditorView} />
      ) : chartListRes.isLoading || deleteResourceChartmutation.isLoading ? (
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
              <Button onClick={() => setEditorView(true)}>Add Chart</Button>
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
