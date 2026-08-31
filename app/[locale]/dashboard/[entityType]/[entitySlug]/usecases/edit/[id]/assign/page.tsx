'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
import { graphql } from '@/gql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DataTable, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Loading } from '@/components/loading';

interface SearchDataset {
  id: string;
  title: string;
  modified?: string;
  sectors?: Array<{ name?: string }>;
}

interface AssignTableRow {
  id: string;
  title: string;
  category: string | { name?: string } | undefined;
  modified: string;
}

const FetchUseCaseDetails = graphql(`
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

const AssignUsecaseDatasets = graphql(`
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
  const USECASE_ASSIGN_SUCCESS_TOAST_ID = 'usecase-assign-datasets-success';
  const USECASE_ASSIGN_ERROR_TOAST_ID = 'usecase-assign-datasets-error';
  const getErrorMessage = (error: unknown, fallback: string) =>
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
      ? error.message.trim()
      : fallback;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [data, setData] = useState<SearchDataset[]>([]);
  const [selectedRow, setSelectedRows] = useState<AssignTableRow[]>([]);

  const UseCaseDetails =
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

  const formattedData = (
    datasets: Array<{
      id: string;
      title?: string | null;
      modified?: string | null;
      sectors?: Array<{ name?: string | null } | null> | null;
    }>
  ) =>
    datasets.map((item) => {
      return {
        title: item.title,
        id: item.id,
        category: item.sectors?.[0]?.name || 'N/A', // Safeguard in case of missing category
        modified: formatDate(item.modified ?? null) || '',
      };
    });

  useEffect(() => {
    fetchDatasets('?size=1000&page=1')
      .then((res: { results: SearchDataset[] }) => {
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

  const generateTableData = (list: SearchDataset[]) => {
    return list.map((item) => {
      return {
        title: item.title,
        id: item.id,
        category: item.sectors?.[0],
        modified: formatDate(item.modified ?? null) || '',
      };
    });
  };

  const { mutate } = useMutation(
    () =>
      GraphQL(
        AssignUsecaseDatasets,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          useCaseId: params.id,
          datasetIds: Array.isArray(selectedRow)
            ? selectedRow.map((row) => row.id)
            : [],
        }
      ),
    {
      onSuccess: () => {
        toast('Dataset Assigned Successfully', {
          id: USECASE_ASSIGN_SUCCESS_TOAST_ID,
        });
        UseCaseDetails.refetch();
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_UsecaseDetails`,
            params.id,
            params.entityType,
            params.entitySlug,
          ],
        });
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/dashboards`
        );
      },
      onError: (err: unknown) => {
        toast(
          `Error: ${getErrorMessage(err, 'Unable to assign datasets right now. Please try again.')}`,
          { id: USECASE_ASSIGN_ERROR_TOAST_ID }
        );
      },
    }
  );

  return (
    <>
      {((UseCaseDetails?.data?.useCases?.[0]?.datasets?.length ?? -1) >= 0) &&
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
              UseCaseDetails?.data?.useCases?.[0]?.datasets ?? []
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
