'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, DataTable, SearchInput, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Loading } from '@/components/loading';
import AddUser from './addUser';

const usersListDoc: any = graphql(`
  query userByOrganization {
    users {
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

const Admin = () => {
  const params = useParams();
  const usersList: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_users_list_admin_members`],
    () => GraphQL(usersListDoc, {}, [])
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const table = {
    columns: [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      { accessorKey: 'role', header: 'Role' },
      { accessorKey: 'created', header: 'Date Created' },
      { accessorKey: 'modified', header: 'Date Modified' },
      {
        accessorKey: 'edit',
        header: 'Edit',
        cell: ({ row }: any) => (
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
              setIsEdit(true)
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    rows:
      usersList.data?.users.map((item: any) => ({
        name: item.fullName,
        role: item.organizationMemberships[0]?.role?.name || 'N/A',
        roleId: item.organizationMemberships[0]?.role?.id || '',
        created:
          formatDate(item.organizationMemberships[0]?.createdAt) || 'N/A',
        modified:
          formatDate(item.organizationMemberships[0]?.updatedAt) || 'N/A',
        id: item.id,
      })) || [],
  };

  const [filteredRows, setFilteredRows] = React.useState<any[]>(table.rows);
  const handleSearchChange = (e: string) => {
    const searchTerm = e.toLowerCase();
    const filtered = table.rows.filter((row: any) =>
      row.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRows(filtered);
  };

  return (
    <div>
      <div className="my-4 lg:my-8 flex flex-wrap items-center justify-between gap-4 lg:gap-6 px-4 lg:flex-nowrap">
        <Text>Showing {usersList.data?.users?.length || 0} of {usersList.data?.users?.length || 0} People</Text>
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
              setIsEdit(false)
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
            title="Add User"
            isOpen={isOpen}
            refetchUsers={usersList.refetch()}
            isEdit={isEdit}
          />
        )}
      </div>
      <div>
        {usersList.data?.users?.length > 0 ? (
          <DataTable
            columns={table.columns}
            rows={table.rows}
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
