'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { AddRemoveUserToOrganizationInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, Icon, SearchInput, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import AddUser from './addUser';

const usersListDoc: any = graphql(`
  query userByOrg {
    userByOrganization {
      id
      fullName
      organizationMemberships {
        role {
          name
          id
        }
        createdAt
        updatedAt
      }
    }
  }
`);

const removeUserDoc: any = graphql(`
  mutation removeUserFromOrganization(
    $input: AddRemoveUserToOrganizationInput!
  ) {
    removeUserFromOrganization(input: $input) {
      success
      message
    }
  }
`);

const Admin = () => {
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const usersList: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_users_list_admin_members`],
    () =>
      GraphQL(
        usersListDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      )
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [refetch, setRefetch] = useState(false);

  const { mutate } = useMutation(
    (input: { input: AddRemoveUserToOrganizationInput }) =>
      GraphQL(
        removeUserDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        input
      ),
    {
      onSuccess: () => {
        toast('User removed successfully');
        usersList.refetch();
      },
      onError: () => {
        toast('Failed to remove user');
      },
    }
  );

  const table = {
    columns: [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      { accessorKey: 'role', header: 'Role' },
      { accessorKey: 'modified', header: 'Date Modified' },
      {
        accessorKey: 'edit',
        header: 'Edit',
        cell: ({ row }: any) => (
          <div className="">
            <Button
              onClick={() => {
                setSelectedUser({
                  id: row.original.id,
                  name: row.original.name,
                  role: {
                    id: row.original.roleId,
                    name: row.original.role,
                  },
                });
                setIsOpen(true);
                setIsEdit(true);
              }}
              kind="tertiary"
            >
              <Icon source={Icons.pencil} size={24} color="warning" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: 'delete',
        header: 'Delete',
        cell: ({ row }: any) => (
          <div className="">
            <Button
              onClick={() => {
                mutate({
                  input: {
                    userId: row.original.id,
                    roleId: row.original.roleId,
                  },
                });
              }}
              kind="tertiary"
            >
              <Icon source={Icons.delete} size={24} color="warning" />
            </Button>
          </div>
        ),
      },
    ],

    rows:
      usersList.data?.userByOrganization.map((item: any) => ({
        name: item.fullName,
        role: item.organizationMemberships[0]?.role?.name || 'N/A',
        roleId: item.organizationMemberships[0]?.role?.id || '',
        modified:
          formatDate(item.organizationMemberships[0]?.updatedAt) || 'N/A',
        id: item.id,
      })) || [],
  };

  useEffect(() => {
    const updatedRows =
      usersList.data?.userByOrganization.map((item: any) => ({
        name: item.fullName,
        role: item.organizationMemberships[0]?.role?.name || 'N/A',
        roleId: item.organizationMemberships[0]?.role?.id || '',
        modified:
          formatDate(item.organizationMemberships[0]?.updatedAt) || 'N/A',
        id: item.id,
      })) || [];

    setFilteredRows(updatedRows);
  }, [usersList.data]);

  const [filteredRows, setFilteredRows] = React.useState<any[]>(table.rows);
  const handleSearchChange = (e: string) => {
    const searchTerm = e.toLowerCase();
    const filtered = table.rows.filter((row: any) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered);
  };

  const filteredColumns = table.columns.filter(
    (column) => column.accessorKey !== 'id'
  );

  useEffect(() => {
    usersList.refetch();
    setRefetch(false);
  }, [refetch]);

  return (
    <div>
      <div className="my-4 flex flex-wrap items-center justify-between gap-4 px-4 lg:my-8 lg:flex-nowrap lg:gap-6">
        <Text>
          Showing {usersList.data?.userByOrganization?.length || 0} of{' '}
          {usersList.data?.userByOrganization?.length || 0} People
        </Text>
        <SearchInput
          className="w-full lg:w-1/2 "
          placeholder="Search for a person"
          label="Search"
          name="Search"
          onChange={(e) => handleSearchChange(e)}
        />
        <div>
          <Button
            onClick={() => {
              setSelectedUser({
                id: '',
                name: '',
                role: {
                  id: '',
                  name: '',
                },
              });
              setIsEdit(false);
              setIsOpen(true);
            }}
          >
            Add User
          </Button>
        </div>
        {isOpen && (
          <AddUser
            setIsOpen={setIsOpen}
            selectedUser={selectedUser}
            isOpen={isOpen}
            isEdit={isEdit}
            setRefetch={setRefetch}
          />
        )}
      </div>
      <div>
        {usersList.data?.userByOrganization?.length > 0 ? (
          <DataTable
            columns={filteredColumns}
            rows={filteredRows}
            hideSelection
            hideViewSelector
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default Admin;
