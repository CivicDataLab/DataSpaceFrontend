'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { fetchData } from '@/fetch';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RESOURCE_LABEL_PLURAL } from '@/lib/constants/resourceLabel';

const usecaseLinksQuery = graphql(`
  query useCasePublicationLinks($filters: UseCaseFilter) {
    useCases(filters: $filters) {
      id
      publications {
        id
        title
      }
    }
  }
`);

const collaborativeLinksQuery = graphql(`
  query collaborativePublicationLinks($filters: CollaborativeFilter) {
    collaboratives(filters: $filters) {
      id
      publications {
        id
        title
      }
    }
  }
`);

const updateUsecasePublications = graphql(`
  mutation updateUsecasePublications(
    $useCaseId: String!
    $publicationIds: [UUID!]!
  ) {
    updateUsecasePublications(
      useCaseId: $useCaseId
      publicationIds: $publicationIds
    ) {
      ... on TypeUseCase {
        id
      }
    }
  }
`);

const updateCollaborativePublications = graphql(`
  mutation updateCollaborativePublications(
    $collaborativeId: String!
    $publicationIds: [UUID!]!
  ) {
    updateCollaborativePublications(
      collaborativeId: $collaborativeId
      publicationIds: $publicationIds
    ) {
      ... on TypeCollaborative {
        id
      }
    }
  }
`);

type Row = { id: string; title: string };

/**
 * Lets a Use Case / Collaborative owner pull PUBLISHED Resources into their
 * work — like a public library. Only published resources are searchable here
 * (the backend won't attach a draft), and unlinking is just deselecting.
 */
export function PublicationLinkPicker({
  entityKind,
}: {
  entityKind: 'usecase' | 'collaborative';
}) {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const headers = { [params.entityType]: params.entitySlug };

  const [available, setAvailable] = React.useState<Row[]>([]);
  const [selected, setSelected] = React.useState<Row[]>([]);

  // Published resources are discoverable through the same REST search endpoint.
  React.useEffect(() => {
    fetchData('publication', '?size=1000&page=1')
      .then((res) => setAvailable(res.results ?? []))
      .catch((err) => console.error(err));
  }, []);

  const linksQuery = useQuery<Row[]>(
    ['publication_links', entityKind, params.id],
    async () => {
      if (entityKind === 'usecase') {
        const res = await GraphQL(usecaseLinksQuery, headers, {
          filters: { id: params.id },
        });
        return res.useCases?.[0]?.publications ?? [];
      }
      const res = await GraphQL(collaborativeLinksQuery, headers, {
        filters: { id: params.id },
      });
      return res.collaboratives?.[0]?.publications ?? [];
    }
  );

  const currentLinks: Row[] = linksQuery.data ?? [];

  const { mutate, isLoading: isSaving } = useMutation(
    async () => {
      const publicationIds = selected.map((row) => row.id);
      if (entityKind === 'usecase') {
        await GraphQL(updateUsecasePublications, headers, {
          useCaseId: params.id,
          publicationIds,
        });
      } else {
        await GraphQL(updateCollaborativePublications, headers, {
          collaborativeId: params.id,
          publicationIds,
        });
      }
    },
    {
      onSuccess: () => {
        toast(`${RESOURCE_LABEL_PLURAL} linked`);
        linksQuery.refetch();
      },
      onError: (err: unknown) =>
        toast(err instanceof Error ? err.message : 'Failed to link'),
    }
  );

  const columns = [{ accessorKey: 'title', header: 'Title' }];
  const rows = available.map((item) => ({ id: item.id, title: item.title }));

  if (linksQuery.isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text variant="headingSm">Link {RESOURCE_LABEL_PLURAL}</Text>
        <Button
          variant="interactive"
          loading={isSaving}
          onClick={() => mutate()}
        >
          Save linked {RESOURCE_LABEL_PLURAL.toLowerCase()}
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        defaultSelectedRows={currentLinks.map((p) => ({
          id: p.id,
          title: p.title,
        }))}
        onRowSelectionChange={(sel) =>
          setSelected(Array.isArray(sel) ? (sel as Row[]) : [])
        }
      />
    </div>
  );
}
