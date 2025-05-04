'use client';

import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Icon,
  Text
} from 'opub-ui';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import CustomCombobox from './CustomCombobox';

const FetchUsers: any = graphql(`
  query searchUsers($limit: Int!, $searchTerm: String!) {
    searchUsers(limit: $limit, searchTerm: $searchTerm) {
      id
      fullName
      username
    }
  }
`);

const Details = () => {
  const { allEntityDetails } = useDashboardStore();
  const [searchValue, setSearchValue] = useState('');
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

  useEffect(() => {
    Users.refetch();
  }, [searchValue]);

  const [formData, setFormData] = useState({
    contributors: [] as { label: string; value: string }[],
    supporters: [] as { label: string; value: string }[],
    partners: [] as { label: string; value: string }[],
  });

  const selectedContributors = formData.contributors;

  const options =
    Users?.data?.searchUsers?.map((user: any) => ({
      label: user.fullName,
      value: user.fullName,
    })) || [];

  return (
    <div>
      {Users?.isLoading || allEntityDetails?.organizations?.length === 0 ? (
        <Loading />
      ) : (
        <div className=" flex flex-col gap-10">
          <div>
            <Text variant="headingMd">CONTRIBUTORS</Text>
            <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
              <div className="flex w-full items-end  flex-wrap gap-5  lg:flex-nowrap">
                <div className="w-full lg:w-2/6">
                  <Text>Add Contributors</Text>
                  <CustomCombobox
                    options={options}
                    selectedValue={selectedContributors}
                    onChange={(value: any) => {
                      setFormData((prev) => ({
                        ...prev,
                        contributors: [
                          ...prev.contributors,
                          ...value.filter(
                            (val: any) =>
                              !prev.contributors.some(
                                (existing) => existing.value === val.value
                              )
                          ),
                        ],
                      }));

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
                    <div key={item.value}>
                      <Button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            contributors: prev.contributors.filter(
                              (item) => item.value !== item.value
                            ),
                          }))
                        }
                        kind="tertiary"
                      >
                        <div className="flex items-center gap-2 rounded-2 p-2 ">
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
          <div>
            <Text variant="headingMd">SUPPORTED BY</Text>
            <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
              <div className="flex w-full items-end flex-wrap gap-5  lg:flex-nowrap">
                <div className="w-full lg:w-2/6">
                  <Text>Add Supporters</Text>
                  <CustomCombobox
                    options={(allEntityDetails?.organizations || [])?.map(
                      (org: any) => ({
                        label: org.name,
                        value: org.name,
                      })
                    )}
                    selectedValue={formData.supporters}
                    onChange={(value: any) => {
                      setFormData((prev) => ({
                        ...prev,
                        supporters: [
                          ...prev.supporters,
                          ...value.filter(
                            (val: any) =>
                              !prev.supporters.some(
                                (existing) => existing.value === val.value
                              )
                          ),
                        ],
                      }));
                    }}
                    placeholder="Add Supporters"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 lg:mt-0">
                  {formData.supporters.map((item) => (
                    <div key={item.value}>
                      <Button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            supporters: prev.supporters.filter(
                              (item) => item.value !== item.value
                            ),
                          }))
                        }
                        kind="tertiary"
                      >
                        <div className="flex items-center gap-2 rounded-2 p-2 ">
                          <Text>{item.label}</Text>
                          <Icon source={Icons.cross} size={18} />
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <Text variant="headingMd">PARTNERED BY</Text>
            <div className="mt-5 flex flex-wrap items-start gap-5 lg:flex-nowrap">
              <div className="flex w-full flex-wrap  items-end  gap-5  lg:flex-nowrap">
                <div className="w-full lg:w-2/6">
                  <Text>Add Partners</Text>
                  <CustomCombobox
                    options={(allEntityDetails?.organizations || [])?.map(
                      (org: any) => ({
                        label: org.name,
                        value: org.name,
                      })
                    )}
                    selectedValue={formData.partners}
                    onChange={(value: any) => {
                      setFormData((prev) => ({
                        ...prev,
                        partners: [
                          ...prev.partners,
                          ...value.filter(
                            (val: any) =>
                              !prev.partners.some(
                                (existing) => existing.value === val.value
                              )
                          ),
                        ],
                      }));
                    }}
                    placeholder="Add Partners"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 lg:mt-0">
                  {formData.partners.map((item) => (
                    <div key={item.value}>
                      <Button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            partners: prev.partners.filter(
                              (item) => item.value !== item.value
                            ),
                          }))
                        }
                        kind="tertiary"
                      >
                        <div className="flex items-center gap-2 rounded-2 p-2 ">
                          <Text>{item.label}</Text>
                          <Icon source={Icons.cross} size={18} />
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
