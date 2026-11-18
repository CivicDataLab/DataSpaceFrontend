'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { AddRemoveUserToOrganizationInput } from '@/gql/generated/graphql';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  DataTable,
  Tag,
  Text,
  toast,
  type ColumnFilterConfig,
  type DataTableRowAction,
  type FilterField,
} from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import { toTitleCase } from '@/lib/utils';
import styles from '../dataset/listing.module.scss';
import {
  EMPTY_CELL,
  errorMessage,
  formatUpdated,
  listingOwner,
  optionList,
  TABLE_PAGE_SIZE,
} from '../provider-flow/table-listing';
import AddUser, { allRolesDoc, type SelectedUser } from './addUser';

const usersListDoc = graphql(`
  query userByOrg {
    userByOrganization {
      id
      fullName
      email
      organizationMemberships {
        role {
          name
          id
        }
        createdAt
      }
    }
  }
`);

const removeUserDoc = graphql(`
  mutation removeUserFromOrganization(
    $input: AddRemoveUserToOrganizationInput!
  ) {
    removeUserFromOrganization(input: $input) {
      success
      message
    }
  }
`);

type MemberRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  joined: string;
};

type MemberCell = {
  row: { original: MemberRow };
};

const emptyMember: SelectedUser = {
  id: '',
  name: '',
  role: { id: '', name: '' },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function MemberName({ name }: { name: string }) {
  return (
    <span className="flex w-full min-w-0 items-center gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surfaceSubdued">
        <Text variant="bodySm" fontWeight="medium">
          {initials(name)}
        </Text>
      </span>
      <Text className="min-w-0 truncate" fontWeight="medium" title={name}>
        {name}
      </Text>
    </span>
  );
}

function memberSearchFilter(
  row: { getValue: (columnId: string) => unknown; original: MemberRow },
  columnId: string,
  filterValue: unknown
) {
  const fields = Array.isArray(filterValue) ? filterValue : [];
  if (fields.length === 0) return true;

  const name = String(row.getValue(columnId) ?? '').toLowerCase();
  const email = row.original.email.toLowerCase();

  return fields.every((field) => {
    if (!field || typeof field !== 'object' || !('value' in field)) return true;
    const value = String(field.value ?? '')
      .trim()
      .toLowerCase();
    if (!value) return true;
    return name.includes(value) || email.includes(value);
  });
}

const memberColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
    searchable: true,
    meta: { truncate: true },
    filterFn: memberSearchFilter,
    cell: ({ row }: MemberCell) => <MemberName name={row.original.name} />,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { optional: true, truncate: true },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { optional: true },
    cell: ({ row }: MemberCell) => (
      <Tag
        // key={item.id || `${item.label}-${index}`}
        // fillColor="#fb200"
        textColor="#000"
        borderRadius="20px"
      >
        {row.original.role}
      </Tag>
    ),
  },
  {
    accessorKey: 'joined',
    header: 'Date joined',
    meta: { optional: true },
    cell: ({ row }: MemberCell) => formatUpdated(row.original.joined),
  },
];

function hasActiveFilters(filters: FilterField[]) {
  return filters.some((filter) => filter.value.trim());
}

const Admin = () => {
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const ownerArgs = listingOwner(entityType, entitySlug);
  const currentUserId = useDashboardStore((state) => state.userDetails?.me?.id);

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser>(emptyMember);
  const [activeFilters, setActiveFilters] = useState<FilterField[]>([]);

  const membersQuery = useQuery(
    ['organization_members', entityType, entitySlug],
    () => GraphQL(usersListDoc, ownerArgs || {}),
    { enabled: ownerArgs !== null }
  );

  const rolesQuery = useQuery(
    ['organization_roles', entityType, entitySlug],
    () => GraphQL(allRolesDoc, ownerArgs || {}),
    { enabled: ownerArgs !== null }
  );

  const { mutate } = useMutation(
    (input: { input: AddRemoveUserToOrganizationInput }) =>
      GraphQL(removeUserDoc, ownerArgs || {}, input),
    {
      onSuccess: (result) => {
        if (!result.removeUserFromOrganization?.success) {
          toast(
            result.removeUserFromOrganization?.message ||
              'Failed to remove user'
          );
          return;
        }
        toast('User removed successfully');
        membersQuery.refetch();
      },
      onError: (error: unknown) => {
        toast(`Error: ${errorMessage(error)}`);
      },
    }
  );

  if (!ownerArgs || !entityType || !entitySlug) {
    return null;
  }

  const rows: MemberRow[] =
    membersQuery.data?.userByOrganization.map((item) => {
      const membership = item.organizationMemberships[0];
      const roleName = membership?.role?.name;
      return {
        id: item.id,
        name: item.fullName,
        email: item.email?.trim() || EMPTY_CELL,
        role: roleName ? toTitleCase(roleName) : EMPTY_CELL,
        roleId: membership?.role?.id || '',
        joined: membership?.createdAt || '',
      };
    }) ?? [];

  const roleFilter: ColumnFilterConfig[] = [
    {
      columnId: 'role',
      type: 'multiSelect',
      options: optionList(
        (rolesQuery.data?.roles ?? []).map((role) => ({
          label: toTitleCase(role.name),
          value: toTitleCase(role.name),
        }))
      ),
    },
  ];

  const openMember = (member: SelectedUser, editing: boolean) => {
    setSelectedUser(member);
    setIsEdit(editing);
    setIsOpen(true);
  };

  return (
    <div className={`flex h-full flex-col md:mt-5 lg:mt-2 ${styles.listing}`}>
      <DataTable
        columnContentTypes={memberColumns.map(() => 'text' as const)}
        columns={memberColumns}
        rows={rows}
        hideSelection
        style={{ borderRadius: '20px' }}
        title="Admin & Members"
        subtitle="Manage organisation members and their access."
        addLabel="Add Member"
        onAdd={() => openMember(emptyMember, false)}
        placeholder="Search members..."
        sortColumns={['name', 'email', 'role', 'joined']}
        filters={roleFilter}
        defaultRowCount={TABLE_PAGE_SIZE}
        labels={{
          empty: hasActiveFilters(activeFilters)
            ? 'No records match your filters'
            : 'No members yet',
        }}
        loading={membersQuery.isFetching}
        loadError={membersQuery.isError && !membersQuery.isFetching}
        onRetry={() => membersQuery.refetch()}
        onFiltersChange={setActiveFilters}
        getRowActions={(row: MemberRow) => {
          const actions: DataTableRowAction[] = [
            {
              key: 'edit',
              icon: IconPencil,
              label: `Edit ${row.name}`,
              onClick: () =>
                openMember(
                  {
                    id: row.id,
                    name: row.name,
                    role: { id: row.roleId, name: row.role },
                  },
                  true
                ),
            },
          ];

          if (row.id !== currentUserId) {
            actions.push({
              key: 'delete',
              icon: IconTrash,
              label: 'Remove member',
              destructive: true,
              onClick: () =>
                mutate({
                  input: {
                    userId: row.id,
                    roleId: row.roleId,
                  },
                }),
              alert: {
                title: 'Remove member?',
                children: `Removing "${row.name}" will revoke their access to this organisation.`,
              },
            });
          }

          return actions;
        }}
      />
      {isOpen ? (
        <AddUser
          setIsOpen={setIsOpen}
          selectedUser={selectedUser}
          isOpen={isOpen}
          isEdit={isEdit}
          setRefetch={() => {
            membersQuery.refetch();
          }}
        />
      ) : null}
    </div>
  );
};

export default Admin;
