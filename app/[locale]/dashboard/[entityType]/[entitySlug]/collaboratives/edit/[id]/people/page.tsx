'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionCard, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  EntityRowPicker,
  type EntityRow,
} from '../../../../usecases/edit/components/EntityRowPicker';
import { errorMessage } from '../../collaborative-summary';
import { useCollaborativeEditStatus } from '../../context';
import styles from '../../edit.module.scss';
import {
  AddContributors,
  AddPartners,
  AddSupporters,
  FetchCollaborativeInfo,
  FetchUsers,
  OrgList,
  RemoveContributor,
  RemovePartners,
  RemoveSupporters,
} from '../contributors/query';

type Relationship = 'contributor' | 'partner' | 'supporter';

const RELATIONSHIPS: Array<{ label: string; value: Relationship }> = [
  { label: 'Contributor', value: 'contributor' },
  { label: 'Partner', value: 'partner' },
  { label: 'Supporter', value: 'supporter' },
];

function fileUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${url.replace('/code/files/', '')}`;
}

function rawId(id: string) {
  return id.replace(/^(user|org):/, '');
}

export default function PeoplePage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const queryClient = useQueryClient();
  const { setStatus } = useCollaborativeEditStatus();
  const ownerArgs = { [params.entityType]: params.entitySlug };
  const [userSearch, setUserSearch] = useState('');

  const collaborativeQuery = useQuery(
    [`fetch_collaborative_people_${params.id}`],
    () =>
      GraphQL(FetchCollaborativeInfo, ownerArgs, {
        filters: { id: params.id },
      }),
    { refetchOnMount: true }
  );
  const usersQuery = useQuery(
    [`collaborative_wizard_users`, userSearch],
    () =>
      GraphQL(FetchUsers, ownerArgs, {
        limit: 10,
        searchTerm: userSearch,
      }),
    { enabled: userSearch.trim().length > 0, keepPreviousData: true }
  );
  const orgsQuery = useQuery([`collaborative_wizard_orgs`], () =>
    GraphQL(OrgList, ownerArgs)
  );

  const refresh = () => {
    void collaborativeQuery.refetch();
    void queryClient.invalidateQueries({
      queryKey: [`collaborative_wizard_${params.id}`],
    });
  };

  const onError = (error: unknown) => {
    toast(errorMessage(error, 'Unable to update people right now.'));
  };

  const { mutate: addContributor, isLoading: addingContributor } = useMutation(
    (userId: string) =>
      GraphQL(AddContributors, ownerArgs, {
        collaborativeId: params.id,
        userId,
      }),
    { onSuccess: refresh, onError }
  );
  const { mutate: removeContributor, isLoading: removingContributor } =
    useMutation(
      (userId: string) =>
        GraphQL(RemoveContributor, ownerArgs, {
          collaborativeId: params.id,
          userId,
        }),
      { onSuccess: refresh, onError }
    );
  const { mutate: addPartner, isLoading: addingPartner } = useMutation(
    (organizationId: string) =>
      GraphQL(AddPartners, ownerArgs, {
        collaborativeId: params.id,
        organizationId,
      }),
    { onSuccess: refresh, onError }
  );
  const { mutate: removePartner, isLoading: removingPartner } = useMutation(
    (organizationId: string) =>
      GraphQL(RemovePartners, ownerArgs, {
        collaborativeId: params.id,
        organizationId,
      }),
    { onSuccess: refresh, onError }
  );
  const { mutate: addSupporter, isLoading: addingSupporter } = useMutation(
    (organizationId: string) =>
      GraphQL(AddSupporters, ownerArgs, {
        collaborativeId: params.id,
        organizationId,
      }),
    { onSuccess: refresh, onError }
  );
  const { mutate: removeSupporter, isLoading: removingSupporter } =
    useMutation(
      (organizationId: string) =>
        GraphQL(RemoveSupporters, ownerArgs, {
          collaborativeId: params.id,
          organizationId,
        }),
      { onSuccess: refresh, onError }
    );

  useEffect(() => {
    setStatus(
      addingContributor ||
        removingContributor ||
        addingPartner ||
        removingPartner ||
        addingSupporter ||
        removingSupporter
        ? 'loading'
        : 'success'
    );
  }, [
    addingContributor,
    removingContributor,
    addingPartner,
    removingPartner,
    addingSupporter,
    removingSupporter,
    setStatus,
  ]);

  if (collaborativeQuery.isLoading || orgsQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const collaborative = collaborativeQuery.data?.collaboratives?.[0];

  const partnerIds = new Set(
    collaborative?.partnerOrganizations?.map((item) => item.id) ?? []
  );
  const selected: EntityRow[] = [
    ...(collaborative?.contributors?.map((item) => ({
      id: `user:${item.id}`,
      kind: 'person' as const,
      role: 'contributor',
      title: item.fullName,
      subtitle: item.username,
      imageUrl: fileUrl(item.profilePicture?.url),
    })) ?? []),
    ...(collaborative?.partnerOrganizations?.map((item) => ({
      id: `org:${item.id}`,
      kind: 'org' as const,
      role: 'partner',
      title: item.name,
      subtitle: 'Registered organisation',
      imageUrl: fileUrl(item.logo?.url),
    })) ?? []),
    ...(collaborative?.supportingOrganizations
      ?.filter((item) => !partnerIds.has(item.id))
      .map((item) => ({
        id: `org:${item.id}`,
        kind: 'org' as const,
        role: 'supporter',
        title: item.name,
        subtitle: 'Registered organisation',
        imageUrl: fileUrl(item.logo?.url),
      })) ?? []),
  ];

  const selectedIds = new Set(selected.map((item) => item.id));
  const options: EntityRow[] = [
    ...(usersQuery.data?.searchUsers?.map((item) => ({
      id: `user:${item.id}`,
      kind: 'person' as const,
      role: 'contributor',
      title: item.fullName,
      subtitle: item.username,
      imageUrl: fileUrl(item.profilePicture?.url) || undefined,
    })) ?? []),
    ...(orgsQuery.data?.allOrganizations?.map((item) => ({
      id: `org:${item.id}`,
      kind: 'org' as const,
      role: 'partner',
      title: item.name,
      subtitle: 'Registered organisation',
      imageUrl: fileUrl(item.logo?.url) || undefined,
    })) ?? []),
  ].filter((item) => !selectedIds.has(item.id));

  const removeMember = (item: EntityRow) => {
    const id = rawId(item.id);
    if (item.role === 'partner') removePartner(id);
    else if (item.role === 'supporter') removeSupporter(id);
    else removeContributor(id);
  };

  const changeRole = (item: EntityRow, role: string) => {
    if (role === item.role) return;
    const id = rawId(item.id);
    if (item.kind === 'person') {
      toast('People are added as contributors.');
      return;
    }
    if (role === 'contributor') {
      toast('Organisations can be partners or supporters.');
      return;
    }
    const add = role === 'supporter' ? addSupporter : addPartner;
    if (item.role === 'partner') {
      removePartner(id, {
        onSuccess: () => add(id),
      });
      return;
    }
    if (item.role === 'supporter') {
      removeSupporter(id, {
        onSuccess: () => add(id),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 px-6">
      <SectionCard
        className={styles.overflowVisible}
        title="People & Organisations"
        description="Add the people and organisations involved in this Collaborative."
      >
        <EntityRowPicker
          variant="person"
          searchPlaceholder="+ Add People or Organisation"
          emptyTitle="People and organisations will appear here."
          emptyDescription="Search CivicDataSpace to add contributors, partners or supporters."
          options={options}
          selected={selected}
          isLoading={userSearch.trim().length > 0 && usersQuery.isFetching}
          onSearch={setUserSearch}
          roleOptionsFor={() => RELATIONSHIPS}
          onRoleChange={changeRole}
          onAdd={(item) => {
            const id = rawId(item.id);
            if (item.kind === 'org') addPartner(id);
            else addContributor(id);
          }}
          onRemove={(id) => {
            const item = selected.find((row) => row.id === id);
            if (item) removeMember(item);
          }}
        />
      </SectionCard>
    </div>
  );
}
