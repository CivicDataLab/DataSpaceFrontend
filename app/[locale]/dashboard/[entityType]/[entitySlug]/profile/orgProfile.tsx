import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  ApiOrganizationOrganizationTypesEnum,
  OrganizationInputPartial,
} from '@/gql/generated/graphql';
import { useOrganizationTypes } from '@/hooks/useOrganizationTypes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DropZone, Select, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';

const OrgDetails: any = graphql(`
  query orgDetails($slug: String) {
    organizations(slug: $slug) {
      id
      name
      logo {
        name
        path
      }
      homepage
      organizationTypes
      contactEmail
      description
      slug
    }
  }
`);

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
  const params = useParams<{ entitySlug: string }>();

  const orgDetails: any = useQuery([`org_details_${params.entitySlug}`], () =>
    GraphQL(
      OrgDetails,
      {},
      {
        slug: params.entitySlug,
      }
    )
  );
  const { organizationTypes } = useOrganizationTypes();
  useEffect(() => {
    if (orgDetails.data) {
      setFormData({
        name: orgDetails.data?.organizations[0].name,
        contactEmail: orgDetails.data?.organizations[0].contactEmail,
        organizationTypes: orgDetails.data?.organizations[0].organizationTypes,
        homepage: orgDetails.data?.organizations[0].homepage,
        description: orgDetails.data?.organizations[0].description,
        logo: orgDetails.data?.organizations[0].logo,
        id: orgDetails.data?.organizations[0].id,
      });
    }
  }, [orgDetails.data]);

  const initialFormData = {
    name: '',
    contactEmail: '',
    organizationTypes: ApiOrganizationOrganizationTypesEnum.StateGovernment, // or whichever is most appropriate
    homepage: '',
    description: '',
    logo: null as File | null,
    id: '',
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
        });
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );
  const handleSave = () => {
    // Create mutation input with only changed fields
    const inputData: OrganizationInputPartial = {
      name: formData.name,
      contactEmail: formData.contactEmail,
      organizationTypes: formData.organizationTypes,
      homepage: formData.homepage,
      description: formData.description,
      id: formData.id,
    };

    // Only add logo if it has changed
    if (formData.logo instanceof File) {
      inputData.logo = formData.logo;
    }

    mutate({ input: inputData });
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e })}
            />
          </div>

          <div className="w-full">
            <TextField
              label="Email"
              name="email"
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
              value={formData.homepage}
              onChange={(e) => setFormData({ ...formData, homepage: e })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 lg:flex-nowrap">
          <div className="w-full">
            <TextField
              label="Description"
              name="description"
              multiline={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e })}
            />
          </div>
          <div className="w-full">
            <DropZone
              label={'Upload Organization Logo'}
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
