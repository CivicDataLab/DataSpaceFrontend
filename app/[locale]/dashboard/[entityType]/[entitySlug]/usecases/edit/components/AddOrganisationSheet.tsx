'use client';

import { useEffect, useState } from 'react';
import { AddPartners } from '@/app/[locale]/dashboard/[entityType]/[entitySlug]/usecases/edit/[id]/contributors/query';
import { organizationCreationMutation } from '@/app/[locale]/dashboard/[entityType]/schema';
import {
  ApiOrganizationOrganizationTypesEnum,
  OrganizationInput,
} from '@/gql/generated/graphql';
import { useOrganizationTypes } from '@/hooks/useOrganizationTypes';
import { IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  DropZone,
  Icon,
  IconButton,
  Select,
  Sheet,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

const initialFormData = {
  name: '',
  description: '',
  logo: null as File | null,
  homepage: '',
  contactEmail: '',
  linkedinProfile: '',
  githubProfile: '',
  twitterProfile: '',
  location: '',
  organizationTypes: ApiOrganizationOrganizationTypesEnum.StateGovernment,
};

type AddOrganisationSheetProps = {
  open: boolean;
  onClose: () => void;
  useCaseId: string;
  ownerArgs: Record<string, string>;
  onAdded: () => void;
  onBusy?: (busy: boolean) => void;
};

export function AddOrganisationSheet({
  open,
  onClose,
  useCaseId,
  ownerArgs,
  onAdded,
  onBusy,
}: AddOrganisationSheetProps) {
  const { organizationTypes } = useOrganizationTypes();
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (open) return;
    setFormData(initialFormData);
  }, [open]);

  const { mutateAsync: createOrganisation, isLoading: creating } = useMutation(
    (input: OrganizationInput) =>
      GraphQL(organizationCreationMutation, {}, { input })
  );

  const { mutateAsync: addPartner, isLoading: adding } = useMutation(
    (organizationId: string) =>
      GraphQL(AddPartners, ownerArgs, {
        useCaseId,
        organizationId,
      })
  );

  const isSaving = creating || adding;

  useEffect(() => {
    onBusy?.(isSaving);
    return () => onBusy?.(false);
  }, [isSaving, onBusy]);

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = async () => {
    const formValidation = formData.name && formData.logo;

    if (!formValidation) {
      toast('Please fill all the required fields');
      return;
    }

    try {
      const res = await createOrganisation(formData);
      if (res.createOrganization.__typename !== 'TypeOrganization') {
        toast('Unable to create organisation');
        return;
      }

      await addPartner(res.createOrganization.id);
      toast('Organization created successfully');
      onAdded();
      onClose();
    } catch (error) {
      toast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (document.querySelector('[class*="Select-module_Popover"]')) {
            return;
          }
          handleClose();
        }
      }}
    >
      <Sheet.Content
        side="right"
        size="wide"
        title="Add New Organization"
        className="flex flex-col p-0"
      >
        <div className="flex items-start justify-between gap-4 border-b-1 border-solid border-baseGraySlateSolid6 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <Text
              variant="headingLg"
              as="h2"
              className="text-[var(--blue-primary-color)] "
            >
              Add New Organisation
            </Text>
            <Text variant="bodySm" color="subdued">
              Add an organisation to this Use Case.
            </Text>
          </div>
          <IconButton
            size="slim"
            icon={IconX}
            onClick={handleClose}
            disabled={isSaving}
          >
            Close
          </IconButton>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-1">
            <Text variant="bodyMd" fontWeight="medium" as="p">
              Logo{' '}
              <Text as="span" color="critical">
                *
              </Text>
            </Text>
            <Text variant="bodySm" color="subdued">
              Upload a logo for this organisation.
            </Text>
            <div className="mt-3">
              <DropZone
                name="Logo"
                label="Logo"
                labelHidden
                type="image"
                accept=".jpg,.jpeg,.png,.webp"
                allowMultiple={false}
                onDrop={(_files, accepted) => {
                  if (!accepted[0]) return;
                  setFormData({ ...formData, logo: accepted[0] });
                }}
              >
                <div className="flex flex-col items-center gap-3 bg-baseGraySlateSolid2 py-8">
                  <Icon source={Icons.dropzone} size={36} color="subdued" />
                  <Text fontWeight="medium">
                    Drag and drop a logo here, or click to browse.
                  </Text>
                  <Button
                    kind="secondary"
                    className="rounded-2 border-1 border-solid border-baseGraySlateSolid8 bg-white text-[var(--base-default)]"
                  >
                    Browse File
                  </Button>
                  <Text variant="bodySm" color="subdued">
                    {formData.logo
                      ? formData.logo.name
                      : 'JPG, PNG or WEBP. Max 20MB.'}
                  </Text>
                </div>
              </DropZone>
            </div>
          </div>
          <TextField
            label="Organization Name"
            required
            helpText={`Character limit: ${formData.name.length}/200`}
            name="name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
          />

          <TextField
            label="URL"
            name="homepage"
            value={formData.homepage}
            onChange={(value) =>
              setFormData({ ...formData, homepage: value })
            }
          />
          <Select
            label="Organisation Type"
            name="organizationType"
            required
            value={
              formData.organizationTypes ? formData.organizationTypes : ''
            }
            onChange={(value) =>
              setFormData({
                ...formData,
                organizationTypes:
                  value as ApiOrganizationOrganizationTypesEnum,
              })
            }
            options={organizationTypes}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t-1 border-solid border-baseGraySlateSolid6 px-6 py-4">
          <Button kind="tertiary" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            kind="primary"
            className="rounded-2 bg-[var(--blue-primary-color)] text-white hover:bg-[var(--blue-primary-text)]"
            onClick={() => void handleSave()}
            loading={isSaving}
          >
            Add Organisation
          </Button>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
