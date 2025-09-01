'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, usePathname } from 'next/navigation';
import {
  ApiOrganizationOrganizationTypesEnum,
  OrganizationInput,
} from '@/gql/generated/graphql';
import { useOrganizationTypes } from '@/hooks/useOrganizationTypes';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DropZone,
  Icon,
  Select,
  Text,
  TextField,
  toast,
} from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import styles from './../components/styles.module.scss';
import { organizationCreationMutation } from './schema';

const Page = () => {
  const pathname = usePathname();
  const { organizationTypes } = useOrganizationTypes();

  const params = useParams<{ entityType: string }>();

  const { allEntityDetails, setAllEntityDetails } = useDashboardStore();

  const [isOpen, setIsOpen] = useState(false);

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
    organizationTypes: ApiOrganizationOrganizationTypesEnum.StateGovernment, // or whichever is most appropriate
  };

  const [formData, setFormData] = useState(initialFormData);

  const { mutate, isPending: editMutationLoading } = useMutation({
    mutationFn: (input: { input: OrganizationInput }) =>
      GraphQL(organizationCreationMutation, {}, input),
    onSuccess: (res: any) => {
        toast('Organization created successfully');
        // Optionally, reset form or perform other actions
        setIsOpen(false);
        setFormData(initialFormData);
        setAllEntityDetails({
          ...allEntityDetails,
          organizations: [
            ...(allEntityDetails?.organizations || []),
            {
              id: res.createOrganization.id,
              name: res.createOrganization.name,
              slug: res.createOrganization.slug,
              logo: res.createOrganization.logo,
              linkedinProfile: res.createOrganization.linkedinProfile,
              githubProfile: res.createOrganization.githubProfile,
              twitterProfile: res.createOrganization.twitterProfile,
              location: res.createOrganization.location,
            },
          ],
        });
      },
    onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
  });

  if (params.entityType !== 'organization') {
    return notFound();
  }
  const handleSave = () => {
    const formValidation =
      formData.name &&
      formData.description &&
      formData.logo &&
      formData.contactEmail;

    if (!formValidation) {
      toast('Please fill all the required fields');
      return;
    } else {
      mutate({ input: formData });
    }
  };
  return (
    <>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          {
            href: '/dashboard',
            label: 'User Dashboard',
          },
          {
            href: '#',
            label: pathname.includes('organization')
              ? 'My Organizations'
              : 'My Personal Datasets',
          },
        ]}
      />
      <div className="m-auto flex w-11/12  flex-col">
        {allEntityDetails?.organizations.length < 0 ||
        allEntityDetails === null ? (
          <Loading />
        ) : (
          <div className="container mb-40 ">
            <div className=" flex flex-col gap-6 py-6 lg:py-10">
              <Text variant="headingXl"> My Organization</Text>
            </div>

            <div className={cn(styles.Main)}>
              <div className="flex flex-wrap gap-6 md:gap-10 lg:gap-20">
                {allEntityDetails?.organizations?.map((entityItem: any) => {
                  return (
                    <div key={entityItem.name}>
                      <EntityCard entityItem={entityItem} params={params} />
                    </div>
                  );
                })}
                <Dialog>
                  <Dialog.Trigger onClick={() => setIsOpen(true)}>
                    <div className="flex h-72 w-56 flex-col items-center justify-center gap-3 rounded-2 bg-baseGraySlateSolid6 p-4">
                      <Icon source={Icons.plus} size={40} color="success" />
                      <Text alignment="center" variant="headingMd">
                        Add New Organization
                      </Text>
                    </div>
                  </Dialog.Trigger>
                  {isOpen && (
                    <Dialog.Content title={'Add New Organization'} limitHeight>
                      <>
                        <div className="mb-6 flex flex-col gap-4">
                          <Text>
                            By adding an Organization you become an Admin by
                            default. You can add other people as Admin or
                            Members.
                          </Text>
                          <Text>
                            You can add populate other details about the
                            Organization, such as Description, Social Media,
                            etc, after the Organization is added by going to
                            Profile & Settings.
                          </Text>
                        </div>
                        <div className="flex flex-col gap-6">
                          <div>
                            <TextField
                              label="Organization Name *"
                              helpText={`Character limit: ${formData?.name?.length}/200`}
                              name="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e })
                              }
                            />
                          </div>
                          <div>
                            <TextField
                              label="Description *"
                              multiline={4}
                              name="description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e })
                              }
                            />
                          </div>
                          <div>
                            <Select
                              label="Organization Type"
                              name="organizationType"
                              value={
                                formData.organizationTypes
                                  ? formData.organizationTypes
                                  : ''
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  organizationTypes:
                                    e as ApiOrganizationOrganizationTypesEnum,
                                })
                              }
                              options={organizationTypes}
                            />
                          </div>
                          <div>
                            <TextField
                              label="Homepage"
                              name="homepage"
                              value={formData.homepage}
                              onChange={(e) =>
                                setFormData({ ...formData, homepage: e })
                              }
                            />
                          </div>
                          <div>
                            <TextField
                              label="Contact Email *"
                              name="contactEmail"
                              type="email"
                              value={formData.contactEmail}
                              onChange={(e) =>
                                setFormData({ ...formData, contactEmail: e })
                              }
                            />
                          </div>
                          <DropZone
                            label={'Upload Logo *'}
                            onDrop={(e) =>
                              setFormData({ ...formData, logo: e[0] })
                            }
                            // onDrop={(e) => console.log(e)}
                            name={'Logo'}
                          >
                            <DropZone.FileUpload
                              actionTitle={formData.logo?.name}
                            />
                          </DropZone>
                          <TextField
                            label="Linkedin Profile"
                            name="linkedinProfile"
                            value={formData.linkedinProfile}
                            onChange={(e) =>
                              setFormData({ ...formData, linkedinProfile: e })
                            }
                          />
                          <TextField
                            label="Github Profile"
                            name="githubProfile"
                            value={formData.githubProfile}
                            onChange={(e) =>
                              setFormData({ ...formData, githubProfile: e })
                            }
                          />
                          <TextField
                            label="Twitter Profile"
                            name="twitterProfile"
                            value={formData.twitterProfile}
                            onChange={(e) =>
                              setFormData({ ...formData, twitterProfile: e })
                            }
                          />
                          <TextField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e })
                            }
                          />
                          <Button onClick={handleSave}>Save</Button>
                        </div>
                      </>
                    </Dialog.Content>
                  )}
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;

const EntityCard = ({ entityItem, params }: any) => {
  const [isImageValid, setIsImageValid] = useState(() => {
    return entityItem?.logo ? true : false;
  });

  return (
    <div
      key={entityItem.name}
      className="flex h-72 w-56 flex-col items-center gap-3 rounded-2 border-2 border-solid border-baseGraySlateSolid4 px-4 py-5 text-center"
    >
      <div className="flex h-full w-full items-center justify-center rounded-2">
        <Link
          href={`/dashboard/${params.entityType}/${entityItem?.slug}/dataset`}
          id={entityItem.slug}
        >
          <div className="border-var(--border-radius-5) rounded-2">
            {isImageValid ? (
              <Image
                height={160}
                width={160}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${entityItem?.logo.url}`}
                alt={`${entityItem.name} logo`}
                onError={() => {
                  setIsImageValid(false);
                }}
                className="object-contain"
              />
            ) : (
              <Image
                height={160}
                width={160}
                src={'/org.png'}
                alt={`fallback logo`}
                className="fill-current object-contain text-baseGraySlateSolid6"
              />
            )}
          </div>
        </Link>
      </div>
      <div>
        <Text variant="headingMd" className="text-center line-clamp-3" title={entityItem.name}>
          {entityItem.name}
        </Text>
      </div>
    </div>
  );
};
