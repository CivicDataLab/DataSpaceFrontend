'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { UpdateUserInput } from '@/gql/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import { Button, DropZone, Text, TextField, toast } from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';

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
        githubProfile
        linkedinProfile
        twitterProfile
        location
      }
    }
  }
`);

const UserProfile = () => {
  const params = useParams<{ entityType: string; entitySlug: string }>();

  const { setUserDetails, userDetails } = useDashboardStore();

  useEffect(() => {
    if (userDetails && userDetails?.me) {
      setFormData({
        firstName: userDetails?.me?.firstName,
        lastName: userDetails?.me?.lastName,
        email: userDetails?.me?.email,
        bio: userDetails?.me?.bio,
        profilePicture: userDetails?.me?.profilePicture,
        githubProfile: userDetails?.me?.githubProfile,
        linkedinProfile: userDetails?.me?.linkedinProfile,
        twitterProfile: userDetails?.me?.twitterProfile,
        location: userDetails?.me?.location,
      });
    }
  }, [userDetails]);

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profilePicture: null as File | null,
    githubProfile: '',
    linkedinProfile: '',
    twitterProfile: '',
    location: '',
  };

  const { mutate, isPending: editMutationLoading } = useMutation( {
    mutationFn: (input: { input: UpdateUserInput }) =>
      GraphQL(updateUserMutation, {
        [params.entityType]: params.entitySlug,
      }, input),
    onSuccess: (res: any) => {
      toast('User details updated successfully');
      setFormData({
        firstName: res?.updateUser?.firstName,
        lastName: res?.updateUser?.lastName,
        email: res?.updateUser?.email,
        bio: res?.updateUser?.bio,
        profilePicture: res?.updateUser?.profilePicture,
        githubProfile: res?.updateUser?.githubProfile,
        linkedinProfile: res?.updateUser?.linkedinProfile,
        twitterProfile: res?.updateUser?.twitterProfile,
        location: res?.updateUser?.location,
      });
      setUserDetails({
        ...userDetails,
        me: res.updateUser,
      });
    },
    onError: (error: any) => {
      toast(`Error: ${error.message}`);
    },
  });

  const [formData, setFormData] = React.useState(initialFormData);

  const handleSave = () => {
    // Create mutation input with only changed fields
    const formValidation =
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.bio &&
      formData.profilePicture;

    if (!formValidation) {
      toast('Please fill all the required fields');
      return;
    } else {
      const inputData: UpdateUserInput = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        email: formData.email,
        githubProfile: formData.githubProfile,
        linkedinProfile: formData.linkedinProfile,
        twitterProfile: formData.twitterProfile,
        location: formData.location,
      };

      // Only add logo if it has changed
      if (formData.profilePicture instanceof File) {
        inputData.profilePicture = formData.profilePicture;
      }
      mutate({ input: inputData });
    }
  };

  return (
    <div>
      <div>
        <Text variant="headingXl">My Profile</Text>
      </div>
      <div className=" mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 lg:flex-nowrap">
          <div className="flex w-full flex-col flex-wrap gap-4 lg:flex-nowrap">
            <div className="flex w-full flex-wrap gap-6 md:flex-nowrap lg:flex-nowrap">
              <div className="w-full">
                <TextField
                  label="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e })}
                />
              </div>
              <div className="w-full">
                <TextField
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e })}
                />
              </div>
            </div>

            <div className="w-full">
              <TextField
                label="Email *"
                disabled
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e })}
              />
            </div>
            <div className="w-full">
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e })}
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <TextField
              label="Github Profile"
              name="githubProfile"
              type="url"
              value={formData.githubProfile}
              onChange={(e) => setFormData({ ...formData, githubProfile: e })}
            />
            <TextField
              label="Linkedin Profile"
              name="linkedinProfile"
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({ ...formData, linkedinProfile: e })}
            />
            <TextField
              label="Twitter Profile"
              name="twitterProfile"
              type="url"
              value={formData.twitterProfile}
              onChange={(e) => setFormData({ ...formData, twitterProfile: e })}
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="w-full">
            <TextField
              label="Bio *"
              name="bio"
              multiline={6}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e })}
            />
          </div>
          <div className="w-full">
            <DropZone
              label={'Upload Profile Picture *'}
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

        <Button className="m-auto w-1/6" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
