'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import {
  ApiOrganizationOrganizationTypesEnum,
  OrganizationDataDocument,
  OrganizationInfoDocument,
  OrganizationInputPartial,
} from '@/gql/generated/graphql';
import { useOrganizationTypes } from '@/hooks/useOrganizationTypes';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertDialog,
  Button,
  SectionCard,
  Select,
  TextField,
  toast,
} from 'opub-ui';

import { DashboardLogo, useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import {
  ContributionCard,
  ProfilePictureField,
  ProfileSaveButton,
  ProfileShell,
} from './profile-layout';

const organizationUpdateMutation = graphql(`
  mutation updateOrganization($input: OrganizationInputPartial!) {
    updateOrganization(input: $input) {
      __typename
      ... on TypeOrganization {
        id
        name
        logo {
          name
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

type FormErrors = Partial<Record<'name' | 'description' | 'logo', string>>;

const OrgProfile = () => {
  const params = useParams<{ entitySlug: string; entityType: string }>();
  const router = useRouter();
  const { setEntityDetails, entityDetails } = useDashboardStore();
  const { organizationTypes } = useOrganizationTypes();
  const saved = entityDetails?.organizations?.[0];

  const initialFormData = {
    name: '',
    contactEmail: '',
    organizationTypes: ApiOrganizationOrganizationTypesEnum.StateGovernment,
    homepage: '',
    description: '',
    logo: null as File | DashboardLogo | null,
    id: '',
    linkedinProfile: '',
    githubProfile: '',
    twitterProfile: '',
    location: '',
  };

  const [formData, setFormData] = React.useState(initialFormData);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [prevEntityDetails, setPrevEntityDetails] = React.useState<
    typeof entityDetails | undefined
  >(undefined);

  if (entityDetails !== prevEntityDetails) {
    setPrevEntityDetails(entityDetails);
    const org = entityDetails?.organizations?.[0];
    if (org) {
      setFormData({
        name: org.name,
        contactEmail: org.contactEmail ?? '',
        organizationTypes:
          typeof org.organizationTypes === 'string'
            ? (org.organizationTypes as ApiOrganizationOrganizationTypesEnum)
            : ApiOrganizationOrganizationTypesEnum.StateGovernment,
        homepage: org.homepage ?? '',
        description: org.description ?? '',
        logo: org.logo ?? null,
        id: org.id,
        linkedinProfile: org.linkedinProfile ?? '',
        githubProfile: org.githubProfile ?? '',
        twitterProfile: org.twitterProfile ?? '',
        location: org.location ?? '',
      });
      setErrors({});
    }
  }

  const organizationId = saved?.id;
  const contributionQuery = useQuery(
    ['org_profile_contributions', organizationId],
    () =>
      GraphQL(
        OrganizationDataDocument,
        { [params.entityType]: params.entitySlug },
        { id: organizationId ?? '' }
      ),
    { enabled: Boolean(organizationId) }
  );
  const sectorQuery = useQuery(
    ['org_profile_sectors', organizationId],
    () =>
      GraphQL(
        OrganizationInfoDocument,
        { [params.entityType]: params.entitySlug },
        { organizationId: organizationId ?? '' }
      ),
    { enabled: Boolean(organizationId) }
  );

  const { mutate, isLoading } = useMutation(
    (input: { input: OrganizationInputPartial }) =>
      GraphQL(
        organizationUpdateMutation,
        {
          [params.entityType]: params.entitySlug,
        },
        input
      ),
    {
      onSuccess: (res) => {
        toast('Organization updated successfully');
        if (res.updateOrganization.__typename !== 'TypeOrganization') {
          return;
        }
        const org = res.updateOrganization;
        setFormData({
          name: org.name,
          contactEmail: org.contactEmail ?? '',
          organizationTypes: org.organizationTypes,
          homepage: org.homepage,
          description: org.description,
          logo: org.logo ?? null,
          id: org.id,
          linkedinProfile: org.linkedinProfile ?? '',
          githubProfile: org.githubProfile ?? '',
          twitterProfile: org.twitterProfile ?? '',
          location: org.location ?? '',
        });
        setErrors({});
        setEntityDetails({
          organizations: [
            {
              id: org.id,
              name: org.name,
              contactEmail: org.contactEmail ?? '',
              organizationTypes: org.organizationTypes,
              homepage: org.homepage,
              description: org.description,
              logo: org.logo ?? null,
              linkedinProfile: org.linkedinProfile ?? '',
              githubProfile: org.githubProfile ?? '',
              twitterProfile: org.twitterProfile ?? '',
              location: org.location ?? '',
            },
          ],
        });
        if (org.slug && org.slug !== params.entitySlug) {
          router.replace(
            `/dashboard/${params.entityType}/${org.slug}/profile`
          );
        }
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      },
    }
  );

  const hasUnsavedChanges = saved
    ? formData.name.trim() !== saved.name ||
      formData.description.trim() !== (saved.description ?? '') ||
      formData.homepage.trim() !== (saved.homepage ?? '') ||
      formData.location.trim() !== (saved.location ?? '') ||
      formData.githubProfile.trim() !== (saved.githubProfile ?? '') ||
      formData.linkedinProfile.trim() !== (saved.linkedinProfile ?? '') ||
      formData.twitterProfile.trim() !== (saved.twitterProfile ?? '') ||
      formData.organizationTypes !==
        (typeof saved.organizationTypes === 'string'
          ? saved.organizationTypes
          : ApiOrganizationOrganizationTypesEnum.StateGovernment) ||
      formData.logo instanceof File
    : false;

  const resetForm = () => {
    if (!saved) return;
    setFormData({
      name: saved.name,
      contactEmail: saved.contactEmail ?? '',
      organizationTypes:
        typeof saved.organizationTypes === 'string'
          ? (saved.organizationTypes as ApiOrganizationOrganizationTypesEnum)
          : ApiOrganizationOrganizationTypesEnum.StateGovernment,
      homepage: saved.homepage ?? '',
      description: saved.description ?? '',
      logo: saved.logo ?? null,
      id: saved.id,
      linkedinProfile: saved.linkedinProfile ?? '',
      githubProfile: saved.githubProfile ?? '',
      twitterProfile: saved.twitterProfile ?? '',
      location: saved.location ?? '',
    });
    setErrors({});
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = () => {
    const nextErrors: FormErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Enter the organization name.';
    if (!formData.description.trim()) {
      nextErrors.description = 'Enter a description.';
    }
    if (!formData.logo) nextErrors.logo = 'Add an organization logo.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const inputData: OrganizationInputPartial = {
      name: formData.name.trim(),
      contactEmail: formData.contactEmail,
      organizationTypes: formData.organizationTypes,
      homepage: formData.homepage.trim(),
      description: formData.description.trim(),
      id: formData.id,
      linkedinProfile: formData.linkedinProfile.trim(),
      githubProfile: formData.githubProfile.trim(),
      twitterProfile: formData.twitterProfile.trim(),
      location: formData.location.trim(),
    };

    if (formData.logo instanceof File) {
      inputData.logo = formData.logo;
    }

    mutate({ input: inputData });
  };

  const areas = (sectorQuery.data?.organizationContributedSectors ?? []).map(
    (sector) => sector.name
  );

  return (
    <>
      <ProfileShell
        title="My Organization Profile"
        subtitle="Manage how this organization appears on CivicDataSpace."
        footer={
          <>
            <Button
              kind="tertiary"
              disabled={isLoading}
              onClick={() => {
                if (!hasUnsavedChanges) {
                  resetForm();
                  return;
                }
                setDiscardOpen(true);
              }}
            >
              Cancel
            </Button>
            <ProfileSaveButton loading={isLoading} onClick={handleSave}>
              Save changes
            </ProfileSaveButton>
          </>
        }
      >
        <SectionCard
          title="Organization details"
          description="Basic information associated with this organization."
        >
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                name="name"
                label="Name"
                requiredIndicator
                value={formData.name}
                error={errors.name}
                onChange={(value) => {
                  setFormData({ ...formData, name: value });
                  clearError('name');
                }}
              />
              <TextField
                name="email"
                label="Email"
                disabled
                value={formData.contactEmail}
                helpText="Email is linked to this organization and cannot be changed here."
                onChange={() => undefined}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Select
                name="organizationType"
                label="Organization Type"
                value={formData.organizationTypes || ''}
                options={organizationTypes}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    organizationTypes:
                      value as ApiOrganizationOrganizationTypesEnum,
                  })
                }
              />
              <TextField
                name="homepage"
                label="Homepage"
                type="url"
                value={formData.homepage}
                onChange={(value) =>
                  setFormData({ ...formData, homepage: value })
                }
              />
            </div>
            <TextField
              name="location"
              label="Location"
              placeholder="City, Country"
              value={formData.location}
              onChange={(value) =>
                setFormData({ ...formData, location: value })
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="About">
          <div className="flex flex-col gap-5">
            <TextField
              name="description"
              label="Description"
              requiredIndicator
              multiline={4}
              value={formData.description}
              error={errors.description}
              onChange={(value) => {
                setFormData({ ...formData, description: value });
                clearError('description');
              }}
            />
            <div>
              <ProfilePictureField
                id="organization-logo"
                label="Organization logo"
                value={formData.logo}
                onChange={(file) => {
                  if (file !== null) {
                    setFormData({ ...formData, logo: file });
                    clearError('logo');
                    return;
                  }
                  if (formData.logo instanceof File) {
                    setFormData({ ...formData, logo: saved?.logo ?? null });
                    return;
                  }
                  toast('Removing a saved logo isn’t available yet.');
                }}
              />
              {errors.logo ? (
                <p className="mt-1 text-sm text-[var(--text-critical)]">
                  {errors.logo}
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Social profiles"
          description="Add links to this organization's professional or social profiles."
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <TextField
              name="githubProfile"
              label="GitHub"
              type="url"
              placeholder="https://github.com/username"
              value={formData.githubProfile}
              onChange={(value) =>
                setFormData({ ...formData, githubProfile: value })
              }
            />
            <TextField
              name="linkedinProfile"
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinProfile}
              onChange={(value) =>
                setFormData({ ...formData, linkedinProfile: value })
              }
            />
            <TextField
              name="twitterProfile"
              label="X"
              type="url"
              placeholder="https://x.com/username"
              value={formData.twitterProfile}
              onChange={(value) =>
                setFormData({ ...formData, twitterProfile: value })
              }
            />
          </div>
        </SectionCard>

        <ContributionCard
          datasetCount={
            contributionQuery.data?.organization?.publishedDatasetsCount
          }
          useCaseCount={
            contributionQuery.data?.organization?.publishedUseCasesCount
          }
          areas={areas}
          loading={
            !organizationId ||
            contributionQuery.isLoading ||
            sectorQuery.isLoading
          }
          failed={contributionQuery.isError || sectorQuery.isError}
        />
      </ProfileShell>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialog.Content
          title="Unsaved changes"
          primaryAction={{
            content: 'Discard changes',
            destructive: true,
            onAction: () => resetForm(),
          }}
          secondaryActions={[{ content: 'Stay' }]}
        >
          You have unsaved changes. Are you sure you want to leave?
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};

export default OrgProfile;
