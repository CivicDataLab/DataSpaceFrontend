'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchData } from '@/fetch';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Loading } from '@/components/loading';

const FetchCollaborativeDetails: any = graphql(`
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

const AssignCollaborativeUseCases: any = graphql(`
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

  const [data, setData] = useState<any[]>([]); // Ensure `data` is an array
  const [selectedRow, setSelectedRows] = useState<any[]>([]);

  const CollaborativeDetails: { data: any; isLoading: boolean; refetch: any } =
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
    fetchData('usecase', '?size=1000&page=1')
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
        AssignCollaborativeUseCases,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          collaborativeId: params.id,
          useCaseIds: Array.isArray(selectedRow)
            ? selectedRow.map((row: any) => String(row.id))
            : [],
        }
      ),
    {
      onSuccess: (data: any) => {
        toast('Use Cases Assigned Successfully');
        CollaborativeDetails.refetch();
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/collaboratives/edit/${params.id}/contributors`
        );
      },
      onError: (err: any) => {
        toast(`Received ${err} on use case assignment`);
      },
    }
  );

  return (
    <>
      {CollaborativeDetails?.data?.collaboratives[0]?.useCases?.length >= 0 &&
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
            rows={generateTableData(data)}
            defaultSelectedRows={formattedData(
              CollaborativeDetails?.data?.collaboratives[0]?.useCases
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

export default UseCases;
