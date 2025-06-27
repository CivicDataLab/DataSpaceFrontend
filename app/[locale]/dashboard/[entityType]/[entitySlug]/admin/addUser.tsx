'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  AddRemoveUserToOrganizationInput,
  AssignOrganizationRoleInput,
} from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Dialog, Label, Select, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { toTitleCase } from '@/lib/utils';
import { FetchUsers } from '../usecases/edit/[id]/contributors/query';

const addUserDoc: any = graphql(`
  mutation addUserToOrganization($input: AddRemoveUserToOrganizationInput!) {
    addUserToOrganization(input: $input) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          messages
        }
      }
      data {
        role {
          name
          id
        }
      }
    }
  }
`);
const allRolesDoc: any = graphql(`
  query AllRolesDoc {
    roles {
      id
      name
      description
    }
  }
`);

const updateUser: any = graphql(`
  mutation assignOrganizationRole($input: AssignOrganizationRoleInput!) {
    assignOrganizationRole(input: $input) {
      success
      message
    }
  }
`);

const AddUser = ({
  setIsOpen,
  selectedUser,
  isOpen,
  isEdit,
  setRefetch,
}: {
  setIsOpen: (isOpen: boolean) => void;
  selectedUser: any;
  isOpen: boolean;
  isEdit: boolean;
  setRefetch: (refetch: boolean) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const Users: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_users_list`],
    () =>
      GraphQL(
        FetchUsers,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          limit: 10,
          searchTerm: searchValue,
        }
      ),
    {
      enabled: searchValue?.length > 0,
      keepPreviousData: true,
    }
  );

  const RolesList: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_UseCaseData`],
    () =>
      GraphQL(
        allRolesDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      )
  );

  useEffect(() => {
    if (selectedUser) {
      setSearchValue(selectedUser.name || '');
      setFormData({
        userId: selectedUser.id || '',
        roleId: selectedUser.role?.id || '',
      });
    } else {
      setFormData({ userId: '', roleId: '' });
      setSearchValue('');
    }
  }, [selectedUser]);

  const { mutate, isLoading: addUserLoading } = useMutation(
    (input: { input: AddRemoveUserToOrganizationInput }) =>
      GraphQL(
        addUserDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        input
      ),
    {
      onSuccess: (data: any) => {
        if (data.addUserToOrganization.success) {
          toast('User added successfully');
          setIsOpen(false);
          setFormData({
            userId: '',
            roleId: '',
          });
          setRefetch(true);
        } else {
          toast(
            'Error: ' +
              (data.addUserToOrganization?.errors?.fieldErrors
                ? data.addUserToOrganization?.errors?.fieldErrors[0]
                    ?.messages[0]
                : data.addUserToOrganization?.errors?.nonFieldErrors[0])
          );
        }
      },
    }
  );

  const { mutate: updateMutate, isLoading: updateUserLoading } = useMutation(
    (input: { input: AssignOrganizationRoleInput }) =>
      GraphQL(
        updateUser,
        {
          [params.entityType]: params.entitySlug,
        },
        input
      ),
    {
      onSuccess: (res: any) => {
        toast('User updated successfully');
        setIsOpen(false);
        setFormData({
          userId: '',
          roleId: '',
        });
        setRefetch(true);
      },
      onError: (err: any) => {
        toast('Failed to update user');
      },
    }
  );

  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
  });
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredOptions = Users.data?.searchUsers;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData({
        userId: '',
        roleId: formData.roleId,
      });
    }
    setSearchValue(value);
    setIsDropdownOpen(true); // Keep dropdown open while typing
    Users.refetch(); // Refetch when search term changes
  };

  const handleSelectOption = (option: any) => {
    handleChange('userId', option.id);
    setSearchValue(option.fullName);
    setIsDropdownOpen(false); // Close dropdown
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {isOpen && (
          <Dialog.Content
            title={isEdit ? 'Edit Admin / Member' : 'Add Admin / Member'}
            className="h-72 overflow-y-auto"
          >
            <div className="m-auto mb-6 flex flex-col gap-6">
              <div className="relative w-full">
                <Label>Select User *</Label>
                <input
                  type="text"
                  id="combobox"
                  disabled={isEdit}
                  value={searchValue}
                  autoComplete="off"
                  onChange={handleInputChange}
                  className="border border-gray-100 placeholder:text-sm mt-1 block w-full px-3 py-1"
                  placeholder={'Select user'}
                />
                {isDropdownOpen && filteredOptions?.length > 0 && (
                  <div className="border border-gray-300 rounded-md shadow-lg  absolute left-0 right-0 z-1 mt-2 max-h-60 overflow-y-auto rounded-2 bg-white px-1 py-2 shadow-basicXl">
                    {filteredOptions.map((option: any) => (
                      <div
                        key={option.id}
                        className="cursor-pointer rounded-2 px-4 py-2 hover:bg-baseGraySlateSolid3"
                        onClick={() => handleSelectOption(option)}
                      >
                        {option.fullName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select
                name=""
                value={formData.roleId}
                placeholder="Select a role"
                onChange={(e) => handleChange('roleId', e)}
                options={RolesList.data?.roles
                  .filter((role: any) => role.name !== 'owner')
                  .map((role: any) => ({
                    label: toTitleCase(role.name),
                    value: role.id,
                  }))}
                label="Select a role *"
                helpText={RolesList.data?.roles
                  .filter((role: any) => role.id === formData.roleId)
                  .map((role: any) => role.description)}
              />
            </div>
            <div className="flex justify-center">
              <Button
                kind="primary"
                className="m-auto"
                disabled={!formData.userId || !formData.roleId}
                onClick={() => {
                  setIsOpen(false);
                  isEdit
                    ? updateMutate({ input: formData })
                    : mutate({ input: formData });
                }}
              >
                {isEdit ? 'Update' : 'Add'}
              </Button>
            </div>
          </Dialog.Content>
        )}
      </Dialog>
    </div>
  );
};

export default AddUser;
