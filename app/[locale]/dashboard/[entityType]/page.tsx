'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, usePathname } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Dialog, DropZone, Icon, Select, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import LoadingPage from '../loading';
import styles from './../components/styles.module.scss';
import { allOrganizationsListingDoc, organizationCreationMutation } from './schema';
import { ApiOrganizationOrganizationTypesEnum, OrganizationInput } from '@/gql/generated/graphql';


export const organizationTypes = [
  { label: 'State Government', value: ApiOrganizationOrganizationTypesEnum.StateGovernment },
  { label: 'Union Territory Government', value: ApiOrganizationOrganizationTypesEnum.UnionTerritoryGovernment },
  { label: 'Urban Local Body', value: ApiOrganizationOrganizationTypesEnum.UrbanLocalBody },
  { label: 'Academic Institution', value: ApiOrganizationOrganizationTypesEnum.AcademicInstitution },
  { label: 'Central Government', value: ApiOrganizationOrganizationTypesEnum.CentralGovernment },
  { label: 'Citizens Group', value: ApiOrganizationOrganizationTypesEnum.CitizensGroup },
  { label: 'Civil Society Organisation', value: ApiOrganizationOrganizationTypesEnum.CivilSocietyOrganisation },
  { label: 'Industry Body', value: ApiOrganizationOrganizationTypesEnum.IndustryBody },
  { label: 'Media Organisation', value: ApiOrganizationOrganizationTypesEnum.MediaOrganisation },
  { label: 'Open Data Technology Community', value: ApiOrganizationOrganizationTypesEnum.OpenDataTechnologyCommunity },
  { label: 'Private Company', value: ApiOrganizationOrganizationTypesEnum.PrivateCompany },
  { label: 'Public Sector Company', value: ApiOrganizationOrganizationTypesEnum.PublicSectorCompany },
  { label: 'Others', value: ApiOrganizationOrganizationTypesEnum.Others },
  { label: 'Startup', value: ApiOrganizationOrganizationTypesEnum.Startup },
  { label: 'Government', value: ApiOrganizationOrganizationTypesEnum.Government },
  { label: 'Corporations', value: ApiOrganizationOrganizationTypesEnum.Corporations },
  { label: 'NGO', value: ApiOrganizationOrganizationTypesEnum.Ngo }
];

const Page = () => {
  const pathname = usePathname();

  const params = useParams<{ entityType: string }>();

  const allEntitiesList: {
    data: any;
    isLoading: boolean;
    error: any;
    isError: boolean;
    refetch: any
  } = useQuery([`all_enitites_list_${params.entityType}`], () =>
    GraphQL(
      allOrganizationsListingDoc,
      {
        // Entity Headers if present
      },
      []
    )
  );



  const [isOpen, setIsOpen] = useState(false);

  const initialFormData = {
    name: '',
    description: '',
    logo: null as File | null,
    homepage: '',
    contactEmail: '',
    organizationTypes: ApiOrganizationOrganizationTypesEnum.StateGovernment, // or whichever is most appropriate
  };

  const [formData, setFormData] = useState(initialFormData);



  const { mutate, isLoading: editMutationLoading } = useMutation(
    (input: { input: OrganizationInput }) =>
      GraphQL(organizationCreationMutation, {}, input),
    {
      onSuccess: () => {
        toast('Organization created successfully');
        // Optionally, reset form or perform other actions
        setIsOpen(false);
        setFormData(initialFormData);

        allEntitiesList.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );
  

  if (params.entityType !== 'organization') {
    return notFound();
  }
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
        {allEntitiesList.isLoading ? (
          <LoadingPage />
        ) : (
          <div className="container mb-40 ">
            <div className=" flex flex-col gap-6 py-6 lg:py-10">
              <Text variant="headingXl"> My Organization</Text>
            </div>

            <div className={cn(styles.Main)}>
              <div className="flex flex-wrap gap-6 md:gap-10 lg:gap-24">
                {allEntitiesList?.data?.organizations?.map((entityItem: any) => {
                  return (
                    <div key={entityItem.name}>
                      <EntityCard entityItem={entityItem} params={params} />
                    </div>
                  );
                })}
                <Dialog >
                  <Dialog.Trigger onClick={() => setIsOpen(true)}>
                    <div className="flex h-72 w-56 flex-col items-center justify-center gap-3 rounded-2 bg-baseGraySlateSolid6 p-4">
                      <Icon source={Icons.plus} size={40} color="success" />
                      <Text alignment="center" variant="headingMd">
                        Add New Organization
                      </Text>
                    </div>
                  </Dialog.Trigger>
                 {isOpen && <Dialog.Content title={'Add New Organization'} limitHeight >
                    <>
                      <div className="mb-6 flex flex-col gap-4">
                        <Text>
                          By adding an Organization you become an Admin by
                          default. You can add other people as Admin or Members.
                        </Text>
                        <Text>
                          You can add populate other details about the
                          Organization, such as Description, Social Media, etc,
                          after the Organization is added by going to Profile &
                          Settings.
                        </Text>
                      </div>
                      <div className="flex flex-col gap-6">
                        <div>
                          <TextField
                            label="Organization Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e })
                            }
                          />
                        </div>
                        <div>
                          <TextField
                            label="Description"
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
                            value={formData.organizationTypes ? formData.organizationTypes : ''}
                            onChange={(e) =>
                              setFormData({ ...formData, organizationTypes: e as ApiOrganizationOrganizationTypesEnum })
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
                            label="Contact Email"
                            name="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) =>
                              setFormData({ ...formData, contactEmail: e })
                            }
                          />
                        </div>
                        <DropZone
                          label={'Upload Logo'}
                          onDrop={(e) => setFormData({...formData, logo: e[0]})}
                          // onDrop={(e) => console.log(e)}
                          name={'Logo'}
                        >
                          <DropZone.FileUpload actionTitle={formData.logo?.name} />
                        </DropZone>
                        <Button onClick={() => mutate({ input: formData })} >Save</Button>
                      </div>
                    </>
                  </Dialog.Content>}
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
                src={'/fallback.svg'}
                alt={`fallback logo`}
                className="fill-current object-contain text-baseGraySlateSolid6"
              />
            )}
          </div>
        </Link>
      </div>
      <div>
        <Text variant="headingMd" className="text-center">
          {entityItem.name}
        </Text>
      </div>
    </div>
  );
};
