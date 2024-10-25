import { UUID } from 'crypto';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

interface ChartsListProps {
  setType: any;
  type: any;
  setChartId: any;
  setImageId: any;
}
const chartDetailsQuery: any = graphql(`
  query ChartDetails($datasetId: UUID!) {
    getChartData(datasetId: $datasetId) {
      __typename
      ... on TypeResourceChart {
        name
        id
        chartType
      }
      ... on TypeResourceChartImage {
        name
        id
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
  mutation deleteResourceChartImage($resourceChartImageId: String!) {
    deleteResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);

const AddResourceChartImage: any = graphql(`
  mutation GenerateResourceChartImage($dataset: UUID!) {
    addResourceChartImage(dataset: $dataset) {
      __typename
      ... on TypeResourceChartImage {
        id
        name
      }
    }
  }
`);

const ChartsList: React.FC<ChartsListProps> = ({
  setType,
  type,
  setChartId,
  setImageId,
}) => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const {
    data,
    isLoading,
    refetch,
  }: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`chartDetails_${params.id}`, type],
    () =>
      GraphQL(
        chartDetailsQuery,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          datasetId: params.id,
        }
      )
  );

  const [filteredRows, setFilteredRows] = useState<any[]>([]);

  useEffect(() => {
    refetch();
    if (data?.getChartData) {
      setFilteredRows(data.getChartData);
    }
  }, [data, type]);

  const deleteResourceChartmutation: { mutate: any; isLoading: any } =
    useMutation(
      (data: { chartId: UUID }) =>
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
          refetch();
        },
        onError: (err: any) => {
          toast(`Received ${err} while deleting chart `);
        },
      }
    );

  const deleteResourceChartImagemutation: { mutate: any; isLoading: any } =
    useMutation(
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
          refetch();
        },
        onError: (err: any) => {
          toast(`Received ${err} while deleting chart `);
        },
      }
    );

  const resourceChartImageMutation: {
    mutate: any;
    isLoading: any;
  } = useMutation(
    (data: { dataset: UUID }) =>
      GraphQL(
        AddResourceChartImage,
        {
          [params.entityType]: params.entitySlug,
        },
        data
      ),
    {
      onSuccess: (res: any) => {
        toast('Resource ChartImage Created Successfully');
        refetch();
        setType('img');
        setImageId(res.addResourceChartImage.id);

        // setImageId(res.id);
      },
      onError: (err: any) => {
        toast(`Received ${err} while deleting chart `);
      },
    }
  );

  const handleChart = (row: any) => {
    if (row.original.__typename === 'TypeResourceChart') {
      setChartId(row.original.id);
      setType('visualize');
    } else {
      setType('img');
      setImageId(row.original.id);
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
        header: 'DELETE',
        cell: ({ row }: any) => (
          <div className="text-center">
            <IconButton
              size="medium"
              icon={Icons.delete}
              color="interactive"
              onClick={() => {
                row.original.__typename === 'TypeResourceChart'
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
      typename: item.__typename,
    }));
  };

  const handleSearchChange = (e: string) => {
    const searchTerm = e.toLowerCase();
    const filtered = data?.getChartData.filter((row: any) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered || []);
  };

  return (
    <>
      {' '}
      {!data || isLoading || deleteResourceChartmutation.isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
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
            <div className="flex gap-3">
              <Button onClick={(e) => setType('visualize')}>
                Visualize Data
              </Button>
              <Button
                onClick={(e) =>
                  resourceChartImageMutation.mutate({ dataset: params.id })
                }
              >
                Add ChartImage
              </Button>
            </div>
          </div>
          <DataTable
            columns={generateColumnData()}
            rows={generateTableData(filteredRows)}
            hideSelection
            truncate
            hideFooter
          />
        </>
      )}
    </>
  );
};

export default ChartsList;
