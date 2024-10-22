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
}
const chartDetailsQuery: any = graphql(`
  query chartsDetails($datasetId: UUID!) {
    chartsDetails(datasetId: $datasetId) {
      id
      name
      chartType
    }
  }
`);

const deleteResourceChart: any = graphql(`
  mutation deleteResourceChart($chartId: UUID!) {
    deleteResourceChart(chartId: $chartId)
  }
`);

const ChartsList: React.FC<ChartsListProps> = ({
  setType,
  type,
  setChartId,
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
    [`chartDetails_${params.id}`],
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
    if (data?.chartsDetails) {
      setFilteredRows(data.chartsDetails);
    }
  }, [data, type]);

  const { mutate, isLoading: deleteLoading } = useMutation(
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

  const handleChart = (row: any) => {
    setChartId(row.original.id);
    setType('visualize');
  };

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'name',
        header: 'Name of Access Type',
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
              onClick={() => mutate({ chartId: row.original.id })}
            >
              Delete
            </IconButton>
          </div>
        ),
      },
    ];
  };

  const generateTableData = (accessModel: any[]) => {
    return accessModel?.map((item: any) => ({
      name: item.name,
      type: toTitleCase(item.chartType.split('_').join(' ').toLowerCase()),
      id: item.id,
    }));
  };

  const handleSearchChange = (e: string) => {
    const searchTerm = e.toLowerCase();
    const filtered = data?.chartsDetails.filter((row: any) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered || []);
  };

  return (
    <>
      {' '}
      {!data || isLoading || deleteLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className=" my-6 flex flex-wrap items-center justify-between gap-3 px-3 py-4">
            <Text>Showing Access Types</Text>
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
              <Button onClick={(e) => setType('img')}>Add Image</Button>
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
