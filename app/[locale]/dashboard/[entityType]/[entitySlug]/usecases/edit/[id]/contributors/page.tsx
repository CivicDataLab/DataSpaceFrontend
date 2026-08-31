'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Icon, Text, toast } from 'opub-ui';

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
  OrgList,
  RemoveContributor,
  RemovePartners,
  RemoveSupporters,
} from './query';

const Details = () => {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const CONTRIBUTORS_ADD_SUCCESS_TOAST_ID = 'usecase-contributor-add-success';
  const CONTRIBUTORS_ADD_ERROR_TOAST_ID = 'usecase-contributor-add-error';
  const CONTRIBUTORS_REMOVE_SUCCESS_TOAST_ID =
    'usecase-contributor-remove-success';
  const CONTRIBUTORS_REMOVE_ERROR_TOAST_ID = 'usecase-contributor-remove-error';
  const SUPPORTER_ADD_SUCCESS_TOAST_ID = 'usecase-supporter-add-success';
  const SUPPORTER_ADD_ERROR_TOAST_ID = 'usecase-supporter-add-error';
  const SUPPORTER_REMOVE_SUCCESS_TOAST_ID = 'usecase-supporter-remove-success';
  const SUPPORTER_REMOVE_ERROR_TOAST_ID = 'usecase-supporter-remove-error';
  const PARTNER_ADD_SUCCESS_TOAST_ID = 'usecase-partner-add-success';
  const PARTNER_ADD_ERROR_TOAST_ID = 'usecase-partner-add-error';
  const PARTNER_REMOVE_SUCCESS_TOAST_ID = 'usecase-partner-remove-success';
  const PARTNER_REMOVE_ERROR_TOAST_ID = 'usecase-partner-remove-error';
  const getErrorMessage = (error: unknown, fallback: string) =>
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
      ? error.message.trim()
      : fallback;
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    contributors: [] as { label: string; value: string }[],
    supporters: [] as { label: string; value: string }[],
    partners: [] as { label: string; value: string }[],
  });

  const Users = useQuery(
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

  const Organizations =
    useQuery([`fetch_orgs`], () =>
      GraphQL(
        OrgList,
        {
          [params.entityType]: params.entitySlug,
        })
    );

  const UseCaseData = useQuery(
    [`fetch_usecase`, params.id, params.entityType, params.entitySlug],
    () =>
      GraphQL(
        FetchUsecaseInfo,
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

  const [prevUseCaseData, setPrevUseCaseData] = useState<
    typeof UseCaseData.data | undefined
  >(undefined);
  if (UseCaseData.data !== prevUseCaseData) {
    setPrevUseCaseData(UseCaseData.data);
    setFormData((prev) => ({
      ...prev,
      partners:
        UseCaseData?.data?.useCases?.[0]?.partnerOrganizations?.map(
          (org) => ({
            label: org.name,
            value: org.id,
          })
        ) || [],
      supporters:
        UseCaseData?.data?.useCases?.[0]?.supportingOrganizations?.map(
          (org) => ({
            label: org.name,
            value: org.id,
          })
        ) || [],
      contributors:
        UseCaseData?.data?.useCases?.[0]?.contributors?.map((user) => ({
          label: user.fullName,
          value: user.id,
        })) || [],
    }));
  }

  const queryClient = useQueryClient();
  const invalidateUseCaseQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [
        `fetch_usecase`,
        params.id,
        params.entityType,
        params.entitySlug,
      ],
    });
    queryClient.invalidateQueries({
      queryKey: [
        `fetch_UsecaseDetails`,
        params.id,
        params.entityType,
        params.entitySlug,
      ],
    });
  };

  const { mutate: addContributor, isLoading: addContributorLoading } =
    useMutation(
      (input: { useCaseId: string; userId: string }) =>
        GraphQL(
          AddContributors,
          {
            [params.entityType]: params.entitySlug,
          },
          input
        ),
      {
        onSuccess: () => {
          toast('Contributor added successfully', {
            id: CONTRIBUTORS_ADD_SUCCESS_TOAST_ID,
          });
          invalidateUseCaseQueries();
        },
        onError: (error: unknown) => {
          toast(
            `Error: ${getErrorMessage(error, 'Unable to add contributor right now. Please try again.')}`,
            { id: CONTRIBUTORS_ADD_ERROR_TOAST_ID }
          );
        },
      }
    );

  const { mutate: removeContributor, isLoading: removeContributorLoading } =
    useMutation(
      (input: { useCaseId: string; userId: string }) =>
        GraphQL(
          RemoveContributor,
          {
            [params.entityType]: params.entitySlug,
          },
          input
        ),
      {
        onSuccess: () => {
          toast('Contributor removed successfully', {
            id: CONTRIBUTORS_REMOVE_SUCCESS_TOAST_ID,
          });
          invalidateUseCaseQueries();
        },
        onError: (error: unknown) => {
          toast(
            `Error: ${getErrorMessage(error, 'Unable to remove contributor right now. Please try again.')}`,
            { id: CONTRIBUTORS_REMOVE_ERROR_TOAST_ID }
          );
        },
      }
    );

  const { mutate: addSupporter, isLoading: addSupporterLoading } = useMutation(
    (input: { useCaseId: string; organizationId: string }) =>
      GraphQL(
        AddSupporters,
        {
          [params.entityType]: params.entitySlug,
        },
        input
      ),
    {
      onSuccess: () => {
        toast('Supporter added successfully', {
          id: SUPPORTER_ADD_SUCCESS_TOAST_ID,
        });
        invalidateUseCaseQueries();
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to add supporter right now. Please try again.')}`,
          { id: SUPPORTER_ADD_ERROR_TOAST_ID }
        );
      },
    }
  );

  const { mutate: removeSupporter, isLoading: removeSupporterLoading } =
    useMutation(
      (input: { useCaseId: string; organizationId: string }) =>
        GraphQL(
          RemoveSupporters,
          {
            [params.entityType]: params.entitySlug,
          },
          input
        ),
      {
        onSuccess: () => {
          toast('Supporter removed successfully', {
            id: SUPPORTER_REMOVE_SUCCESS_TOAST_ID,
          });
          invalidateUseCaseQueries();
        },
        onError: (error: unknown) => {
          toast(
            `Error: ${getErrorMessage(error, 'Unable to remove supporter right now. Please try again.')}`,
            { id: SUPPORTER_REMOVE_ERROR_TOAST_ID }
          );
        },
      }
    );

  const { mutate: addPartner, isLoading: addPartnerLoading } = useMutation(
    (input: { useCaseId: string; organizationId: string }) =>
      GraphQL(
        AddPartners,
        {
          [params.entityType]: params.entitySlug,
        },
        input
      ),
    {
      onSuccess: () => {
        toast('Partner added successfully', {
          id: PARTNER_ADD_SUCCESS_TOAST_ID,
        });
        invalidateUseCaseQueries();
      },
      onError: (error: unknown) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to add partner right now. Please try again.')}`,
          { id: PARTNER_ADD_ERROR_TOAST_ID }
        );
      },
    }
  );

  const { mutate: removePartner, isLoading: removePartnerLoading } =
    useMutation(
      (input: { useCaseId: string; organizationId: string }) =>
        GraphQL(
          RemovePartners,
          {
            [params.entityType]: params.entitySlug,
          },
          input
        ),
      {
        onSuccess: () => {
          toast('Partner removed successfully', {
            id: PARTNER_REMOVE_SUCCESS_TOAST_ID,
          });
          invalidateUseCaseQueries();
        },
        onError: (error: unknown) => {
          toast(
            `Error: ${getErrorMessage(error, 'Unable to remove partner right now. Please try again.')}`,
            { id: PARTNER_REMOVE_ERROR_TOAST_ID }
          );
        },
      }
    );

  useEffect(() => {
    Users.refetch();
  }, [searchValue, Users]);

  const selectedContributors = formData.contributors;

  const options =
    Users?.data?.searchUsers?.map((user) => ({
      label: user.fullName,
      value: user.id,
    })) || [];

  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(
      [
        addContributorLoading,
        removeContributorLoading,
        addSupporterLoading,
        removeSupporterLoading,
        addPartnerLoading,
        removePartnerLoading,
      ].some(Boolean)
        ? 'loading'
        : 'success'
    );
  }, [
    addContributorLoading,
    removeContributorLoading,
    addSupporterLoading,
    removeSupporterLoading,
    addPartnerLoading,
    removePartnerLoading,
    setStatus,
  ]);

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
                    onChange={(newValues) => {
                      const prevValues = formData.contributors.map(
                        (item) => item.value
                      );
                      const newlyAdded = newValues.find(
                        (item) => !prevValues.includes(item.value)
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
                    onInput={(value: string) => {
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
                          UseCaseData.data?.useCases?.[0]?.contributors?.find(
                            (contributor) => contributor.id === item.value
                          )?.profilePicture?.url
                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                                UseCaseData.data?.useCases?.[0]?.contributors?.find(
                                  (contributor) =>
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
                        <div className="flex max-w-40 items-center gap-2 rounded-2 bg-greyExtralight p-2 ">
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
            data={UseCaseData?.data?.useCases[0]?.supportingOrganizations}
            options={(Organizations?.data?.allOrganizations || [])?.map(
              (org) => ({
                label: org.name,
                value: org.id,
              })
            )}
            selectedValues={formData.supporters}
            onChange={(newValues) => {
              const prevValues = formData.supporters.map((item) => item.value);
              const newlyAdded = newValues.find(
                (item) => !prevValues.includes(item.value)
              );

              setFormData((prev) => ({ ...prev, supporters: newValues }));

              if (newlyAdded) {
                addSupporter({
                  useCaseId: params.id,
                  organizationId: newlyAdded.value,
                });
              }
            }}
            onRemove={(item) => {
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
            data={UseCaseData?.data?.useCases[0]?.partnerOrganizations}
            options={(Organizations?.data?.allOrganizations || [])?.map(
              (org) => ({
                label: org.name,
                value: org.id,
              })
            )}
            selectedValues={formData.partners}
            onChange={(newValues) => {
              const prevValues = formData.partners.map((item) => item.value);
              const newlyAdded = newValues.find(
                (item) => !prevValues.includes(item.value)
              );

              setFormData((prev) => ({ ...prev, partners: newValues }));

              if (newlyAdded) {
                addPartner({
                  useCaseId: params.id,
                  organizationId: newlyAdded.value,
                });
              }
            }}
            onRemove={(item) => {
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
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      contributors: [...prev.contributors, ...value],
                    }));
                    setSearchValue(''); // clear input
                  }}
                  onInput={(value: string) => {
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
                    allEntityDetails?.organizations?.map((org) => ({
                      label: org.name,
                      value: org.name,
                    }))
                  }
                  selectedValue={formData.partners}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      partners: value,
                    }));
                  }}
                /> */
}
