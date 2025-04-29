'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { UpdateUserInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DropZone, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';

const UserDetails: any = graphql(`
  query userDetails {
    me {
      bio
      email
      firstName
      lastName
      profilePicture {
        name
        path
        url
      }
      username
      id
      organizationMemberships {
        organization {
          name
          id
        }
        role {
          name
        }
      }
    }
  }
`);

const updateUserMutation: any = graphql(`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      __typename
      ... on TypeUser {
        id
        firstName
        lastName
        email
        bio
        profilePicture {
          name
          path
          url
        }
        username
      }
    }
  }
`);

const UserProfile = () => {
  const params = useParams<{ entitySlug: string }>();

  const userDetails: any = useQuery([`user_details_${params.entitySlug}`], () =>
    GraphQL(UserDetails, {}, [])
  );

  useEffect(() => {
    if (userDetails.data) {
      setFormData({
        firstName: userDetails.data?.me?.firstName,
        lastName: userDetails.data?.me?.lastName,
        email: userDetails.data?.me?.email,
        bio: userDetails.data?.me?.bio,
        profilePicture: userDetails.data?.me?.profilePicture,
      });
    }
  }, [userDetails.data]);

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profilePicture: null as File | null,
  };

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (input: { input: UpdateUserInput }) =>
      GraphQL(updateUserMutation, {}, input),
    {
      onSuccess: (res: any) => {
        toast('User details updated successfully');
        setFormData({
          firstName: res?.updateUser?.firstName,
          lastName: res?.updateUser?.lastName,
          email: res?.updateUser?.email,
          bio: res?.updateUser?.bio,
          profilePicture: res?.updateUser?.profilePicture,
        });
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const [formData, setFormData] = React.useState(initialFormData);


  const handleSave = () => {

    // Create mutation input with only changed fields
    const inputData: UpdateUserInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      email: formData.email,
    };

    // Only add logo if it has changed
    if (formData.profilePicture instanceof File) {
      inputData.profilePicture = formData.profilePicture;
    }
    mutate({ input: inputData });
  };

  return (
    <div>
      <div>
        <Text variant="headingXl">My Profile</Text>
      </div>
      <div className=" mt-6 flex flex-col  gap-6">
        <div className="flex flex-wrap gap-6 lg:flex-nowrap">
          <div className="flex w-full flex-col flex-wrap gap-4 lg:flex-nowrap">
            <div className="w-full">
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e })}
              />
            </div>
            <div className="w-full">
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e })}
              />
            </div>
            <div className="w-full">
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e })}
              />
            </div>
          </div>

          <div className="w-full">
            <DropZone
              label={'Upload Profile Picture'}
              onDrop={(e) => setFormData({ ...formData, profilePicture: e[0] })}
              name={'Profile Picture'}
            >
              <DropZone.FileUpload
                actionTitle={
                  formData.profilePicture
                    ? formData.profilePicture.name.split('/').pop()
                    : 'Name of the profile picture'
                }
              />
            </DropZone>
          </div>
        </div>
        <TextField
          label="Bio"
          name="bio"
          multiline={6}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e })}
        />
        <Button className="m-auto w-1/6" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
