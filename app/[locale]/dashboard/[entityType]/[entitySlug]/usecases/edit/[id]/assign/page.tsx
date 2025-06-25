'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Loading } from '@/components/loading';

const FetchUseCaseDetails: any = graphql(`
  query UseCaseDetails($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      title
      datasets {
        id
        title
        modified
        sectors {
          name
        }
      }
    }
  }
`);

const AssignUsecaseDatasets: any = graphql(`
  mutation assignDatasets($useCaseId: String!, $datasetIds: [UUID!]!) {
    updateUsecaseDatasets(useCaseId: $useCaseId, datasetIds: $datasetIds) {
      ... on TypeUseCase {
        id
        datasets {
          id
          title
        }
      }
    }
  }
`);
const Assign = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]); // Ensure `data` is an array
  const [selectedRow, setSelectedRows] = useState<any[]>([]);

  const UseCaseDetails: { data: any; isLoading: boolean; refetch: any } =
    useQuery(
      [`UseCase_Details`, params.id],
      () =>
        GraphQL(
          FetchUseCaseDetails,
          {
            [params.entityType]: params.entitySlug,
          },
          {
            filters: {
              id: params.id,
            },
          }
        ),
      {
        refetchOnMount: true,
        refetchOnReconnect: true,
      }
    );

  const formattedData = (data: any) =>
    data.map((item: any) => {
      return {
        title: item.title,
        id: item.id,
        category: item.sectors[0]?.name || 'N/A', // Safeguard in case of missing category
        modified: formatDate(item.modified),
      };
    });

  useEffect(() => {
    fetchDatasets('?size=1000&page=1')
      .then((res) => {
        setData(res.results);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'category', header: 'Sector' },
    { accessorKey: 'modified', header: 'Last Modified' },
  ];

  const generateTableData = (list: Array<any>) => {
    return list.map((item) => {
      return {
        title: item.title,
        id: item.id,
        category: item.sectors[0],
        modified: formatDate(item.modified),
      };
    });
  };

  const { mutate, isLoading: mutationLoading } = useMutation(
    () =>
      GraphQL(
        AssignUsecaseDatasets,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          useCaseId: params.id,
          datasetIds: Array.isArray(selectedRow)
            ? selectedRow.map((row: any) => row.id)
            : [],
        }
      ),
    {
      onSuccess: (data: any) => {
        toast('Dataset Assigned Successfully');
        UseCaseDetails.refetch();
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/contributors`
        );
      },
      onError: (err: any) => {
        toast(`Received ${err} on dataset publish `);
      },
    }
  );

  return (
    <>
      {UseCaseDetails?.data?.useCases[0]?.datasets?.length >= 0 &&
      data.length > 0 &&
      !UseCaseDetails.isLoading ? (
        <>
          <div className="flex justify-between">
            <div>
              <Text>
                Selected {selectedRow.length} of {data.length}
              </Text>
            </div>
            <div className="mb-4 flex justify-end">
              <Button className="w-fit" onClick={() => mutate()}>
                Submit
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={generateTableData(data)}
            defaultSelectedRows={formattedData(
              UseCaseDetails?.data?.useCases[0]?.datasets
            )}
            onRowSelectionChange={(selected) => {
              setSelectedRows(Array.isArray(selected) ? selected : []); // Ensure selected is always an array
            }}
          />
        </>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Assign;
