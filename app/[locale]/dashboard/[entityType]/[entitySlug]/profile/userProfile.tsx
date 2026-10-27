'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import {
  SectorInfoDocument,
  UpdateUserInput,
  UserDataDocument,
} from '@/gql/generated/graphql';
import { IconArrowRight, IconKey, IconShieldCheck } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertDialog,
  Badge,
  Button,
  Icon,
  SectionCard,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import {
  BIO_MAX_LENGTH,
  ContributionCard,
  isProfileUrl,
  normalizeProfileUrl,
  ProfilePictureField,
  ProfileSaveButton,
  ProfileShell,
} from './profile-layout';

const updateUserMutation = graphql(`
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

const prettyField = (field: string) => {
  switch (field) {
    case 'github_profile':
      return 'GitHub URL';
    case 'linkedin_profile':
      return 'LinkedIn URL';
    case 'twitter_profile':
      return 'X URL';
    case 'profile_picture':
      return 'Profile picture';
    default:
      return field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

type SocialField = 'githubProfile' | 'linkedinProfile' | 'twitterProfile';
type FormErrors = Partial<
  Record<'firstName' | 'lastName' | SocialField, string>
>;

const UserProfile = () => {
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const { setUserDetails, userDetails } = useDashboardStore();
  const saved = userDetails?.me;

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    profilePicture: null as
      File | { url?: string | null; name?: string | null } | null,
    githubProfile: '',
    linkedinProfile: '',
    twitterProfile: '',
    location: '',
  };

  const [formData, setFormData] = React.useState(initialFormData);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [prevUserDetails, setPrevUserDetails] = React.useState<
    typeof userDetails | undefined
  >(undefined);

  if (userDetails !== prevUserDetails) {
    setPrevUserDetails(userDetails);
    if (userDetails?.me) {
      setFormData({
        firstName: userDetails.me.firstName ?? '',
        lastName: userDetails.me.lastName ?? '',
        email: userDetails.me.email ?? '',
        bio: userDetails.me.bio ?? '',
        profilePicture: userDetails.me.profilePicture ?? null,
        githubProfile: userDetails.me.githubProfile ?? '',
        linkedinProfile: userDetails.me.linkedinProfile ?? '',
        twitterProfile: userDetails.me.twitterProfile ?? '',
        location: userDetails.me.location ?? '',
      });
      setErrors({});
    }
  }

  const userId = saved?.id;
  const contributionQuery = useQuery(
    ['profile_contributions', userId],
    () =>
      GraphQL(
        UserDataDocument,
        { [params.entityType]: params.entitySlug },
        { userId: userId ?? '' }
      ),
    { enabled: Boolean(userId) }
  );
  const sectorQuery = useQuery(
    ['profile_sectors', userId],
    () =>
      GraphQL(
        SectorInfoDocument,
        { [params.entityType]: params.entitySlug },
        { userId: userId ?? '' }
      ),
    { enabled: Boolean(userId) }
  );

  const { mutate, isLoading } = useMutation(
    async (payload: { input: UpdateUserInput; picture: File | null }) => {
      const headers = { [params.entityType]: params.entitySlug };
      const saved = await GraphQL(updateUserMutation, headers, {
        input: payload.input,
      });
      if (!(payload.picture instanceof File)) {
        return { result: saved, pictureFailed: false };
      }

      try {
        const withPicture = await GraphQL(updateUserMutation, headers, {
          input: { profilePicture: payload.picture },
        });
        return { result: withPicture, pictureFailed: false };
      } catch {
        return { result: saved, pictureFailed: true };
      }
    },
    {
      onSuccess: ({ result, pictureFailed }) => {
        toast(
          pictureFailed
            ? 'Profile saved, but the picture could not be updated.'
            : 'User details updated successfully'
        );
        const updated = result.updateUser;
        setFormData({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          bio: updated.bio ?? '',
          profilePicture: updated.profilePicture ?? null,
          githubProfile: updated.githubProfile ?? '',
          linkedinProfile: updated.linkedinProfile ?? '',
          twitterProfile: updated.twitterProfile ?? '',
          location: updated.location ?? '',
        });
        setErrors({});
        setUserDetails({
          ...userDetails,
          me: updated,
        });
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : undefined;
        if (typeof message === 'string') {
          const tryField = (field: string) => {
            const match = message.match(
              new RegExp(`'${field}'\\s*:\\s*\\['([^']+)'\\]`)
            );
            if (match?.[1]) {
              toast.error(`${prettyField(field)}: ${match[1]}`);
            }
            return Boolean(match?.[1]);
          };

          const anyMatched =
            tryField('github_profile') ||
            tryField('linkedin_profile') ||
            tryField('twitter_profile') ||
            tryField('profile_picture') ||
            tryField('location');

          if (!anyMatched) {
            toast.error(`Error: ${message}`);
          }
          return;
        }

        toast.error('An unexpected error occurred.');
      },
    }
  );

  const hasUnsavedChanges = saved
    ? formData.firstName.trim() !== (saved.firstName ?? '') ||
      formData.lastName.trim() !== (saved.lastName ?? '') ||
      formData.location.trim() !== (saved.location ?? '') ||
      formData.bio.trim() !== (saved.bio ?? '') ||
      formData.githubProfile.trim() !== (saved.githubProfile ?? '') ||
      formData.linkedinProfile.trim() !== (saved.linkedinProfile ?? '') ||
      formData.twitterProfile.trim() !== (saved.twitterProfile ?? '') ||
      formData.profilePicture instanceof File
    : false;

  const resetForm = () => {
    if (!saved) return;
    setFormData({
      firstName: saved.firstName ?? '',
      lastName: saved.lastName ?? '',
      email: saved.email ?? '',
      bio: saved.bio ?? '',
      profilePicture: saved.profilePicture ?? null,
      githubProfile: saved.githubProfile ?? '',
      linkedinProfile: saved.linkedinProfile ?? '',
      twitterProfile: saved.twitterProfile ?? '',
      location: saved.location ?? '',
    });
    setErrors({});
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCancel = () => {
    if (!hasUnsavedChanges) {
      resetForm();
      return;
    }
    setDiscardOpen(true);
  };

  const handleSave = () => {
    const nextErrors: FormErrors = {};
    if (!formData.firstName.trim()) {
      nextErrors.firstName = 'Enter your first name.';
    }
    if (!formData.lastName.trim()) {
      nextErrors.lastName = 'Enter your last name.';
    }
    const githubProfile = normalizeProfileUrl(formData.githubProfile);
    const linkedinProfile = normalizeProfileUrl(formData.linkedinProfile);
    const twitterProfile = normalizeProfileUrl(formData.twitterProfile);
    if (githubProfile && !isProfileUrl(githubProfile)) {
      nextErrors.githubProfile = 'Enter a valid GitHub profile URL.';
    }
    if (linkedinProfile && !isProfileUrl(linkedinProfile)) {
      nextErrors.linkedinProfile = 'Enter a valid LinkedIn profile URL.';
    }
    if (twitterProfile && !isProfileUrl(twitterProfile)) {
      nextErrors.twitterProfile = 'Enter a valid X profile URL.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Check the highlighted profile fields.');
      return;
    }

    const inputData: UpdateUserInput = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      bio: formData.bio.trim(),
      email: formData.email,
      githubProfile,
      linkedinProfile,
      twitterProfile,
      location: formData.location.trim(),
    };

    mutate({
      input: inputData,
      picture:
        formData.profilePicture instanceof File
          ? formData.profilePicture
          : null,
    });
  };

  const openChangePassword = async () => {
    try {
      const response = await fetch('/api/auth/change-password');
      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        toast.error('Could not open the Keycloak password page.');
        return;
      }
      window.location.assign(data.url);
    } catch {
      toast.error('Could not open the Keycloak password page.');
    }
  };

  const areas = (sectorQuery.data?.userContributedSectors ?? []).map(
    (sector) => sector.name
  );

  return (
    <>
      <ProfileShell
        title="My Profile"
        subtitle="Manage your profile information and how you appear on CivicDataSpace."
        footer={
          <>
            <Button kind="tertiary" disabled={isLoading} onClick={handleCancel}>
              Cancel
            </Button>
            <ProfileSaveButton loading={isLoading} onClick={handleSave}>
              Save changes
            </ProfileSaveButton>
          </>
        }
      >
        <SectionCard
          title="Personal information"
          description="Basic information associated with your CivicDataSpace profile."
        >
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                name="firstName"
                label="First Name"
                requiredIndicator
                value={formData.firstName}
                error={errors.firstName}
                onChange={(value) => {
                  setFormData({ ...formData, firstName: value });
                  clearError('firstName');
                }}
              />
              <TextField
                name="lastName"
                label="Last Name"
                requiredIndicator
                value={formData.lastName}
                error={errors.lastName}
                onChange={(value) => {
                  setFormData({ ...formData, lastName: value });
                  clearError('lastName');
                }}
              />
            </div>
            <TextField
              name="email"
              label="Email"
              disabled
              value={formData.email}
              helpText="Email is linked to your account and cannot be changed here."
              onChange={() => undefined}
            />
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
            <div>
              <TextField
                name="bio"
                label="Bio"
                multiline={4}
                maxLength={BIO_MAX_LENGTH}
                helpText="Briefly describe your role, expertise or areas of interest."
                value={formData.bio}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    bio: value.slice(0, BIO_MAX_LENGTH),
                  })
                }
              />
              <Text
                as="p"
                variant="bodySm"
                color="subdued"
                alignment="end"
                className="mt-1"
              >
                {formData.bio.length} / {BIO_MAX_LENGTH}
              </Text>
            </div>
            <ProfilePictureField
              id="profile-picture"
              label="Profile picture"
              value={formData.profilePicture}
              onChange={(file) => {
                if (file !== null) {
                  setFormData({ ...formData, profilePicture: file });
                  return;
                }
                if (formData.profilePicture instanceof File) {
                  setFormData({
                    ...formData,
                    profilePicture: saved?.profilePicture ?? null,
                  });
                  return;
                }
                toast('Removing a saved profile picture isn’t available yet.');
              }}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Social profiles"
          description="Add links to your professional or social profiles."
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <TextField
              name="githubProfile"
              label="GitHub"
              type="url"
              placeholder="https://github.com/username"
              value={formData.githubProfile}
              error={errors.githubProfile}
              onChange={(value) => {
                setFormData({ ...formData, githubProfile: value });
                clearError('githubProfile');
              }}
            />
            <TextField
              name="linkedinProfile"
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinProfile}
              error={errors.linkedinProfile}
              onChange={(value) => {
                setFormData({ ...formData, linkedinProfile: value });
                clearError('linkedinProfile');
              }}
            />
            <TextField
              name="twitterProfile"
              label="X"
              type="url"
              placeholder="https://x.com/username"
              value={formData.twitterProfile}
              error={errors.twitterProfile}
              onChange={(value) => {
                setFormData({ ...formData, twitterProfile: value });
                clearError('twitterProfile');
              }}
            />
          </div>
        </SectionCard>

        <ContributionCard
          datasetCount={
            contributionQuery.data?.userById?.publishedDatasetsCount
          }
          useCaseCount={
            contributionQuery.data?.userById?.publishedUseCasesCount
          }
          areas={areas}
          loading={
            !userId || contributionQuery.isLoading || sectorQuery.isLoading
          }
          failed={contributionQuery.isError || sectorQuery.isError}
        />

        <SectionCard title="Account & security">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  Email
                </Text>
                <Text as="p" variant="bodyMd" color="subdued" truncate>
                  {formData.email || '—'}
                </Text>
              </div>
              <Text as="span" variant="bodySm" color="subdued">
                Account email
              </Text>
            </div>
            <div className="flex items-center justify-between gap-4 border-t-1 border-solid border-baseGraySlateSolid6 pt-4">
              <div className="flex items-center gap-2">
                <Icon source={IconShieldCheck} color="subdued" size={16} />
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Sign-in method
                  </Text>
                  <Text as="p" variant="bodyMd" color="subdued">
                    Keycloak
                  </Text>
                </div>
              </div>
              <Badge status="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between gap-4 border-t-1 border-solid border-baseGraySlateSolid6 pt-4">
              <div className="flex items-center gap-2">
                <Icon source={IconKey} color="subdued" size={16} />
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Password
                  </Text>
                  <Text as="p" variant="bodyMd" color="subdued">
                    ••••••••
                  </Text>
                </div>
              </div>
              <Button
                kind="tertiary"
                size="slim"
                onClick={openChangePassword}
                disabled
                icon={<IconArrowRight size={16} />}
              >
                Change password
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          className="!border-[var(--border-critical-subdued)]"
          title={
            <span className="text-[var(--text-critical)]">Danger zone</span>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Text as="p" variant="bodyMd" fontWeight="medium">
                Delete account
              </Text>
              <Text as="p" variant="bodyMd" color="subdued" className="mt-0.5">
                Permanently delete your CivicDataSpace account and account
                information.
              </Text>
            </div>
            <Button variant="critical" onClick={() => setDeleteOpen(true)}>
              Delete account
            </Button>
          </div>
        </SectionCard>
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Content
          title="Delete account"
          primaryAction={{ content: 'Close' }}
        >
          Permanently deleting your CivicDataSpace account isn’t available from
          this page yet.
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};

export default UserProfile;
