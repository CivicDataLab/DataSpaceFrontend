'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Icon, Text, toast } from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { useEditStatus } from '../../context';
import CustomCombobox from './CustomCombobox';
import EntitySection from './EntitySelection';
import {
  AddContributors,
  AddPartners,
  AddSupporters,
  FetchUsecaseInfo,
  FetchUsers,
  RemoveContributor,
  RemovePartners,
  RemoveSupporters,
} from './query';

const Details = () => {
  const params = useParams<{ id: string }>();
  const { allEntityDetails } = useDashboardStore();
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
        {},
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

  const UseCaseData: { data: any; isLoading: boolean; refetch: any } = useQuery(
    [`fetch_usecase_${params.id}`],
    () =>
      GraphQL(
        FetchUsecaseInfo,
        {},
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
        UseCaseData?.data?.useCases?.[0]?.partnerOrganizations?.map(
          (org: any) => ({
            label: org.name,
            value: org.id,
          })
        ) || [],
      supporters:
        UseCaseData?.data?.useCases?.[0]?.supportingOrganizations?.map(
          (org: any) => ({
            label: org.name,
            value: org.id,
          })
        ) || [],
      contributors:
        UseCaseData?.data?.useCases?.[0]?.contributors?.map((user: any) => ({
          label: user.fullName,
          value: user.id,
        })) || [],
    }));
  }, [UseCaseData?.data]);

  const { mutate: addContributor, isLoading: addContributorLoading } =
    useMutation(
      (input: { useCaseId: string; userId: string }) =>
        GraphQL(AddContributors, {}, input),
      {
        onSuccess: (res: any) => {
          toast('Contributor added successfully');
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  const { mutate: removeContributor, isLoading: removeContributorLoading } =
    useMutation(
      (input: { useCaseId: string; userId: string }) =>
        GraphQL(RemoveContributor, {}, input),
      {
        onSuccess: (res: any) => {
          toast('Contributor removed successfully');
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  const { mutate: addSupporter, isLoading: addSupporterLoading } = useMutation(
    (input: { useCaseId: string; organizationId: string }) =>
      GraphQL(AddSupporters, {}, input),
    {
      onSuccess: (res: any) => {
        toast('Supporter added successfully');
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: removeSupporter, isLoading: removeSupporterLoading } =
    useMutation(
      (input: { useCaseId: string; organizationId: string }) =>
        GraphQL(RemoveSupporters, {}, input),
      {
        onSuccess: (res: any) => {
          toast('Supporter removed successfully');
        },
        onError: (error: any) => {
          toast(`Error: ${error.message}`);
        },
      }
    );

  const { mutate: addPartner, isLoading: addPartnerLoading } = useMutation(
    (input: { useCaseId: string; organizationId: string }) =>
      GraphQL(AddPartners, {}, input),
    {
      onSuccess: (res: any) => {
        toast('Partner added successfully');
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: removePartner, isLoading: removePartnerLoading } =
    useMutation(
      (input: { useCaseId: string; organizationId: string }) =>
        GraphQL(RemovePartners, {}, input),
      {
        onSuccess: (res: any) => {
          toast('Partner removed successfully');
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
      {Users?.isLoading || allEntityDetails?.organizations?.length === 0 ? (
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
                          useCaseId: params.id,
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
                    <div key={item.value} className='flex flex-col gap-2 items-center'>
                      <Image
                        src={
                          UseCaseData.data.useCases[0]?.contributors?.find(
                            (contributor: any) => contributor.id === item.value
                          )?.profilePicture?.url
                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                                UseCaseData.data.useCases[0]?.contributors?.find(
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
                            useCaseId: params.id,
                            userId: item.value,
                          });
                        }}
                        kind="tertiary"
                      >
                        <div className="flex items-center gap-2 rounded-2 p-2 bg-greyExtralight ">
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
            data={UseCaseData.data.useCases[0].supportingOrganizations}
            options={(allEntityDetails?.organizations || [])?.map(
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
                  useCaseId: params.id,
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
                useCaseId: params.id,
                organizationId: item.value,
              });
            }}
          />

          <EntitySection
            title="PARTNERED BY"
            label="Add Partners"
            placeholder="Add Partners"
            data={UseCaseData.data.useCases[0].partnerOrganizations}
            options={(allEntityDetails?.organizations || [])?.map(
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
                  useCaseId: params.id,
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
                useCaseId: params.id,
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

{
  /* <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
              <div className="flex w-full flex-col gap-5">
                <Combobox
                  displaySelected
                  name="contributors"
                  label="Add Contributors"
                  list={filteredOptions}
                  selectedValue={[]}
                  onChange={(value: any) => {
                    setFormData((prev) => ({
                      ...prev,
                      contributors: [...prev.contributors, ...value],
                    }));
                    setSearchValue(''); // clear input
                  }}
                  onInput={(value: any) => {
                    console.log(value);
                    setSearchValue(value);
                  }}
                  key={Users?.data?.searchUsers?.length}
                />
                <Text>
                  (Some Contributors have been preselected from added Datasets)
                </Text>
              </div>
            </div> */
}
{
  /* <Combobox
                  displaySelected
                  name="partners"
                  label="Add Partners"
                  list={
                    allEntityDetails?.organizations?.map((org: any) => ({
                      label: org.name,
                      value: org.name,
                    }))
                  }
                  selectedValue={formData.partners}
                  onChange={(value: any) => {
                    setFormData((prev) => ({
                      ...prev,
                      partners: value,
                    }));
                  }}
                /> */
}
