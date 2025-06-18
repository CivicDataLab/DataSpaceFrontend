import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  ApiOrganizationOrganizationTypesEnum,
  OrganizationInputPartial,
} from '@/gql/generated/graphql';
import { useOrganizationTypes } from '@/hooks/useOrganizationTypes';
import { useMutation } from '@tanstack/react-query';
import { Button, DropZone, Select, Text, TextField, toast } from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';

const organizationUpdateMutation: any = graphql(`
  mutation updateOrganization($input: OrganizationInputPartial!) {
    updateOrganization(input: $input) {
      __typename
      ... on TypeOrganization {
        id
        name
        logo {
          name
          path
          url
        }
        linkedinProfile
        githubProfile
        twitterProfile
        location
        homepage
        organizationTypes
        contactEmail
        description
        slug
      }
    }
  }
`);

const OrgProfile = () => {
  const params = useParams<{ entitySlug: string; entityType: string }>();
  const router = useRouter();
  const { setEntityDetails, entityDetails } = useDashboardStore();

  const { organizationTypes } = useOrganizationTypes();

  useEffect(() => {
    if (entityDetails && entityDetails.organizations) {
      setFormData({
        name: entityDetails?.organizations[0].name,
        contactEmail: entityDetails?.organizations[0].contactEmail,
        organizationTypes: entityDetails?.organizations[0].organizationTypes,
        homepage: entityDetails?.organizations[0].homepage,
        description: entityDetails?.organizations[0].description,
        logo: entityDetails?.organizations[0].logo,
        id: entityDetails?.organizations[0].id,
        linkedinProfile: entityDetails?.organizations[0].linkedinProfile,
        githubProfile: entityDetails?.organizations[0].githubProfile,
        twitterProfile: entityDetails?.organizations[0].twitterProfile,
        location: entityDetails?.organizations[0].location,
      });
    }
  }, [entityDetails?.organizations]);

  const initialFormData = {
    name: '',
    contactEmail: '',
    organizationTypes: ApiOrganizationOrganizationTypesEnum.StateGovernment, // or whichever is most appropriate
    homepage: '',
    description: '',
    logo: null as File | null,
    id: '',
    linkedinProfile: '',
    githubProfile: '',
    twitterProfile: '',
    location: '',
  };

  const [formData, setFormData] = React.useState(initialFormData);

  const { mutate, isLoading: editMutationLoading } = useMutation(
    (input: { input: OrganizationInputPartial }) =>
      GraphQL(organizationUpdateMutation, {}, input),
    {
      onSuccess: (res: any) => {
        toast('Organization updated successfully');
        setFormData({
          name: res?.updateOrganization?.name,
          contactEmail: res?.updateOrganization?.contactEmail,
          organizationTypes: res?.updateOrganization?.organizationTypes,
          homepage: res?.updateOrganization?.homepage,
          description: res?.updateOrganization?.description,
          logo: res?.updateOrganization?.logo,
          id: res?.updateOrganization?.id,
          linkedinProfile: res?.updateOrganization?.linkedinProfile,
          githubProfile: res?.updateOrganization?.githubProfile,
          twitterProfile: res?.updateOrganization?.twitterProfile,
          location: res?.updateOrganization?.location,
        });
        setEntityDetails({
          organizations: [formData],
        });
        if (
          res?.updateOrganization?.slug &&
          res.updateOrganization.slug !== params.entitySlug
        ) {
          const newPath = `/dashboard/${params.entityType}/${res.updateOrganization.slug}/profile`;
          router.replace(newPath);
        }
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const handleSave = () => {
    const formValidation =
      formData.name &&
      formData.contactEmail &&
      formData.description &&
      formData.logo;

    if (!formValidation) {
      toast('Please fill all the required fields');
      return;
    } else {
      const inputData: OrganizationInputPartial = {
        name: formData.name,
        contactEmail: formData.contactEmail,
        organizationTypes: formData.organizationTypes,
        homepage: formData.homepage,
        description: formData.description,
        id: formData.id,
        linkedinProfile: formData.linkedinProfile,
        githubProfile: formData.githubProfile,
        twitterProfile: formData.twitterProfile,
        location: formData.location,
      };

      // Only add logo if it has changed
      if (formData.logo instanceof File) {
        inputData.logo = formData.logo;
      }

      mutate({ input: inputData });
    }
  };

  return (
    <div>
      <div>
        <Text variant="headingXl">My Organization Profile</Text>
      </div>
      <div className=" mt-6 flex flex-col  gap-6">
        <div className="flex flex-wrap gap-6  lg:flex-nowrap">
          <div className="w-full">
            <TextField
              label="Name *"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e })}
            />
          </div>

          <div className="w-full">
            <TextField
              label="Email *"
              name="email"
              disabled
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 lg:flex-nowrap">
          <div className="w-full">
            <Select
              label="Organization Type"
              name="organizationType"
              value={
                formData.organizationTypes ? formData.organizationTypes : ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organizationTypes: e as ApiOrganizationOrganizationTypesEnum,
                })
              }
              options={organizationTypes}
            />
          </div>
          <div className="w-full">
            <TextField
              label="Homepage"
              name="homepage"
              type="url"
              value={formData.homepage}
              onChange={(e) => setFormData({ ...formData, homepage: e })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6  lg:flex-nowrap">
          <div className="w-full">
            <TextField
              label="Linkedin Profile"
              type="url"
              name="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({ ...formData, linkedinProfile: e })}
            />
          </div>

          <div className="w-full">
            <TextField
              label="Github Profile"
              type="url"
              name="githubProfile"
              value={formData.githubProfile}
              onChange={(e) => setFormData({ ...formData, githubProfile: e })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6  lg:flex-nowrap">
          <div className="w-full">
            <TextField
              label="Twitter Profile"
              name="twitterProfile"
              type="url"
              value={formData.twitterProfile}
              onChange={(e) => setFormData({ ...formData, twitterProfile: e })}
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
        <div className="flex flex-wrap gap-6 lg:flex-nowrap">
          <div className="w-full">
            <TextField
              label="Description *"
              name="description"
              multiline={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e })}
            />
          </div>
          <div className="w-full">
            <DropZone
              label={'Upload Organization Logo *'}
              onDrop={(e) => setFormData({ ...formData, logo: e[0] })}
              name={'Logo'}
            >
              <DropZone.FileUpload
                actionTitle={
                  formData.logo
                    ? formData.logo.name.split('/').pop()
                    : 'Name of the logo'
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

export default OrgProfile;
