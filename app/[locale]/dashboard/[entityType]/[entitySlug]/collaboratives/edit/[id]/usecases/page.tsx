'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchData } from '@/fetch';
import { graphql } from '@/gql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DataTable, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Loading } from '@/components/loading';

interface SearchUseCase {
  id: string | number;
  title: string;
  modified?: string;
  sectors?: Array<{ name?: string } | string>;
}

interface AssignTableRow {
  id: string;
  title: string;
  category: string;
  modified: string;
}

// prettier-ignore
const FetchCollaborativeDetails = graphql(`
  query CollaborativeUseCaseDetails($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      title
      useCases {
        id
        title
        slug
        modified
        sectors {
          name
        }
      }
    }
  }
`);

// prettier-ignore
const AssignCollaborativeUseCases = graphql(`
  mutation assignCollaborativeUseCases($collaborativeId: String!, $useCaseIds: [String!]!) {
    updateCollaborativeUseCases(collaborativeId: $collaborativeId, useCaseIds: $useCaseIds) {
      ... on TypeCollaborative {
        id
        useCases {
          id
          title
        }
      }
    }
  }
`);

const UseCases = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const COLLAB_USECASES_TOAST_ID = 'collaboratives-usecases-toast';

  const [data, setData] = useState<SearchUseCase[]>([]);
  const [selectedRow, setSelectedRows] = useState<AssignTableRow[]>([]);

  const CollaborativeDetails =
    useQuery(
      [`Collaborative_UseCase_Details`, params.id],
      () =>
        GraphQL(
          FetchCollaborativeDetails,
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

  useEffect(() => {
    fetchData('usecase', '?size=1000&page=1')
      .then((res: { results: SearchUseCase[] }) => {
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

  const generateTableData = (list: SearchUseCase[]) => {
    return list.map((item) => {
      const sector = item.sectors?.[0];
      return {
        title: item.title,
        id: String(item.id),
        category: typeof sector === 'string' ? sector : sector?.name || 'N/A',
        modified: formatDate(item.modified ?? null) || '',
      };
    });
  };

  const rows = generateTableData(data);
  const assignedUseCaseIds = new Set(
    (CollaborativeDetails?.data?.collaboratives?.[0]?.useCases ?? []).map(
      (item) => String(item.id)
    )
  );
  const defaultSelectedRows = rows.filter((row) =>
    assignedUseCaseIds.has(row.id)
  );

  const { mutate } = useMutation(
    () =>
      GraphQL(
        AssignCollaborativeUseCases,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          collaborativeId: params.id,
          useCaseIds: Array.isArray(selectedRow)
            ? selectedRow.map((row) => String(row.id))
            : [],
        }
      ),
    {
      onSuccess: () => {
        toast('Use Cases Assigned Successfully', {
          id: COLLAB_USECASES_TOAST_ID,
        });
        queryClient.invalidateQueries({
          queryKey: [`Collaborative_UseCase_Details`, params.id],
        });
        queryClient.invalidateQueries({
          queryKey: [
            `fetch_CollaborativeDetails`,
            params.entityType,
            params.entitySlug,
            params.id,
          ],
        });
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/contributors`
        );
      },
      onError: (err: unknown) => {
        toast(`Received ${err} on use case assignment`, {
          id: COLLAB_USECASES_TOAST_ID,
        });
      },
    }
  );

  return (
    <>
      {((CollaborativeDetails?.data?.collaboratives?.[0]?.useCases?.length ?? -1) >= 0) &&
      data.length > 0 &&
      !CollaborativeDetails.isLoading ? (
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
            rows={rows}
            defaultSelectedRows={defaultSelectedRows}
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

export default UseCases;
