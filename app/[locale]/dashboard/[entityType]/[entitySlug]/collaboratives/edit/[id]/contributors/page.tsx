'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Button, Icon, Text, toast } from 'opub-ui';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { GraphQL } from '@/lib/api';
import { useEditStatus } from '../../context';
import CustomCombobox from '../../../../usecases/edit/[id]/contributors/CustomCombobox';
import EntitySection from './EntitySelection';
import {
  AddContributors,
  AddPartners,
  AddSupporters,
  FetchCollaborativeInfo,
  FetchUsers,
  OrgList,
  RemoveContributor,
  RemovePartners,
  RemoveSupporters,
} from './query';

const Details = () => {
  const params = useParams<{ entityType: string; entitySlug: string; id: string }>();
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    contributors: [] as { label: string; value: string }[],
    supporters: [] as { label: string; value: string }[],
    partners: [] as { label: string; value: string }[],
  });

  const Users: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_users`],
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
      enabled: searchValue.length > 0,
      keepPreviousData: true,
    }
  );

  const Organizations: { data: any; isLoading: boolean; refetch: any } =
    useQuery([`fetch_orgs`], () => GraphQL(OrgList, {
      [params.entityType]: params.entitySlug,
    }, []));


  const CollaborativeData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_collaborative_${params.id}`],
    () =>
      GraphQL(
        FetchCollaborativeInfo,
        {
          [params.entityType]: params.entitySlug,
        },
        {
          filters: {
            id: params.id,
          },
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      partners:
        CollaborativeData?.data?.collaboratives?.[0]?.partnerOrganizations?.map(
          (org: any) => ({
            label: org.name,
            value: org.id,
          })
        ) || [],
      supporters:
        CollaborativeData?.data?.collaboratives?.[0]?.supportingOrganizations?.map(
          (org: any) => ({
            label: org.name,
            value: org.id,
          })
        ) || [],
      contributors:
        CollaborativeData?.data?.collaboratives?.[0]?.contributors?.map((user: any) => ({
          label: user.fullName,
          value: user.id,
        })) || [],
    }));
  }, [CollaborativeData?.data]);

  const { mutate: addContributor, isLoading: addContributorLoading } =
    useMutation(
      (input: { collaborativeId: string; userId: string }) =>
        GraphQL(AddContributors, {
          [params.entityType]: params.entitySlug,
        }, input),
      {
        onSuccess: () => {
          toast('Contributor added successfully');
          CollaborativeData.refetch();
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  const { mutate: removeContributor, isLoading: removeContributorLoading } =
    useMutation(
      (input: { collaborativeId: string; userId: string }) =>
        GraphQL(RemoveContributor, {
          [params.entityType]: params.entitySlug,
        }, input),
      {
        onSuccess: () => {
          toast('Contributor removed successfully');
          CollaborativeData.refetch();
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  const { mutate: addSupporter, isLoading: addSupporterLoading } = useMutation(
    (input: { collaborativeId: string; organizationId: string }) =>
      GraphQL(AddSupporters, {
        [params.entityType]: params.entitySlug,
      }, input),
    {
      onSuccess: () => {
        toast('Supporter added successfully');
        CollaborativeData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: removeSupporter, isLoading: removeSupporterLoading } =
    useMutation(
      (input: { collaborativeId: string; organizationId: string }) =>
        GraphQL(RemoveSupporters, {
          [params.entityType]: params.entitySlug,
        }, input),
      {
        onSuccess: () => {
          toast('Supporter removed successfully');
          CollaborativeData.refetch();
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  const { mutate: addPartner, isLoading: addPartnerLoading } = useMutation(
    (input: { collaborativeId: string; organizationId: string }) =>
      GraphQL(AddPartners, {
        [params.entityType]: params.entitySlug,
      }, input),
    {
      onSuccess: () => {
        toast('Partner added successfully');
        CollaborativeData.refetch();
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: removePartner, isLoading: removePartnerLoading } =
    useMutation(
      (input: { collaborativeId: string; organizationId: string }) =>
        GraphQL(RemovePartners, {
          [params.entityType]: params.entitySlug,
        }, input),
      {
        onSuccess: () => {
          toast('Partner removed successfully');
          CollaborativeData.refetch();
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  useEffect(() => {
    Users.refetch();
  }, [searchValue]);

  const selectedContributors = formData.contributors;

  const options =
    Users?.data?.searchUsers?.map((user: any) => ({
      label: user.fullName,
      value: user.id,
    })) || [];

  const { setStatus } = useEditStatus();

  const loadingStates = [
    addContributorLoading,
    removeContributorLoading,
    addSupporterLoading,
    removeSupporterLoading,
    addPartnerLoading,
    removePartnerLoading,
  ];

  useEffect(() => {
    setStatus(loadingStates.some(Boolean) ? 'loading' : 'success');
  }, loadingStates);

  return (
    <div>
      {Users?.isLoading ||
      Organizations?.data?.allOrganizations?.length === 0 ? (
        <Loading />
      ) : (
        <div className=" flex flex-col gap-10">
          <div>
            <Text variant="headingMd">CONTRIBUTORS</Text>
            <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
              <div className="flex w-full flex-wrap  items-start gap-5  lg:flex-nowrap">
                <div className="w-full lg:w-2/6">
                  <Text>Add Contributors</Text>
                  <CustomCombobox
                    options={options}
                    selectedValue={selectedContributors}
                    onChange={(newValues: any) => {
                      const prevValues = formData.contributors.map(
                        (item) => item.value
                      );
                      const newlyAdded = newValues.find(
                        (item: any) => !prevValues.includes(item.value)
                      );

                      setFormData((prev) => ({
                        ...prev,
                        contributors: newValues,
                      }));

                      if (newlyAdded) {
                        addContributor({
                          collaborativeId: params.id,
                          userId: newlyAdded.value,
                        });
                      }
                      setSearchValue(''); // clear input
                    }}
                    placeholder="Add Contributors"
                    onInput={(value: any) => {
                      setSearchValue(value);
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 lg:mt-0">
                  {formData.contributors.map((item) => (
                    <div
                      key={item.value}
                      className="flex flex-col items-center gap-2"
                    >
                      <Image
                        src={
                          CollaborativeData.data.collaboratives[0]?.contributors?.find(
                            (contributor: any) => contributor.id === item.value
                          )?.profilePicture?.url
                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                                CollaborativeData.data.collaboratives[0]?.contributors?.find(
                                  (contributor: any) =>
                                    contributor.id === item.value
                                )?.profilePicture?.url
                              }`
                            : '/profile.png'
                        }
                        alt={item.label}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                      <Button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            contributors: prev.contributors.filter(
                              (contributor) => contributor.value !== item.value
                            ),
                          }));
                          removeContributor({
                            collaborativeId: params.id,
                            userId: item.value,
                          });
                        }}
                        kind="tertiary"
                      >
                        <div className="flex items-center gap-2 max-w-40 rounded-2 bg-greyExtralight p-2 ">
                          <Text>{item.label}</Text>
                          <Icon source={Icons.cross} size={18} />
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>{' '}
          </div>

          <EntitySection
            title="SUPPORTED BY"
            label="Add Supporters"
            placeholder="Add Supporters"
            data={CollaborativeData?.data?.collaboratives[0]?.supportingOrganizations}
            options={(Organizations?.data?.allOrganizations || [])?.map(
              (org: any) => ({
                label: org.name,
                value: org.id,
              })
            )}
            selectedValues={formData.supporters}
            onChange={(newValues: any) => {
              const prevValues = formData.supporters.map((item) => item.value);
              const newlyAdded = newValues.find(
                (item: any) => !prevValues.includes(item.value)
              );

              setFormData((prev) => ({ ...prev, supporters: newValues }));

              if (newlyAdded) {
                addSupporter({
                  collaborativeId: params.id,
                  organizationId: newlyAdded.value,
                });
              }
            }}
            onRemove={(item: any) => {
              setFormData((prev) => ({
                ...prev,
                supporters: prev.supporters.filter(
                  (s) => s.value !== item.value
                ),
              }));
              removeSupporter({
                collaborativeId: params.id,
                organizationId: item.value,
              });
            }}
          />

          <EntitySection
            title="PARTNERED BY"
            label="Add Partners"
            placeholder="Add Partners"
            data={CollaborativeData?.data?.collaboratives[0]?.partnerOrganizations}
            options={(Organizations?.data?.allOrganizations || [])?.map(
              (org: any) => ({
                label: org.name,
                value: org.id,
              })
            )}
            selectedValues={formData.partners}
            onChange={(newValues: any) => {
              const prevValues = formData.partners.map((item) => item.value);
              const newlyAdded = newValues.find(
                (item: any) => !prevValues.includes(item.value)
              );

              setFormData((prev) => ({ ...prev, partners: newValues }));

              if (newlyAdded) {
                addPartner({
                  collaborativeId: params.id,
                  organizationId: newlyAdded.value,
                });
              }
            }}
            onRemove={(item: any) => {
              setFormData((prev) => ({
                ...prev,
                partners: prev.partners.filter((s) => s.value !== item.value),
              }));
              removePartner({
                collaborativeId: params.id,
                organizationId: item.value,
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Details;
